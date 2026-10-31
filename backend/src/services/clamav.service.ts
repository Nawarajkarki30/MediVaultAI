// backend/src/services/clamav.service.ts
// MediVault AI — ClamAV Antivirus TCP INSTREAM Client

import net from 'net';
import { env } from '../config/env';
import { AppError } from '../utils/appError';
import { logger } from '../utils/logger';

export interface ScanResult {
  isClean: boolean;
  virusName?: string;
}

export interface IClamAvService {
  scanBuffer(buffer: Buffer): Promise<ScanResult>;
  ping(): Promise<boolean>;
}

export class ClamAvService implements IClamAvService {
  private readonly host: string;
  private readonly port: number;
  private readonly timeoutMs: number;

  constructor(host?: string, port?: number, timeoutMs?: number) {
    this.host = host || env.CLAMAV_HOST;
    this.port = port || env.CLAMAV_PORT;
    this.timeoutMs = timeoutMs || env.CLAMAV_TIMEOUT_MS;
  }

  /**
   * Pings the ClamAV daemon to verify connectivity.
   */
  async ping(): Promise<boolean> {
    return new Promise((resolve) => {
      const socket = net.createConnection({ host: this.host, port: this.port });
      let response = '';

      socket.setTimeout(3000);

      socket.on('connect', () => {
        socket.write('PING\n');
      });

      socket.on('data', (chunk) => {
        response += chunk.toString();
      });

      socket.on('end', () => {
        resolve(response.trim() === 'PONG');
      });

      socket.on('error', () => {
        socket.destroy();
        resolve(false);
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve(false);
      });
    });
  }

  /**
   * Streams an in-memory buffer to ClamAV over TCP using the zINSTREAM protocol.
   * Enforces fail-closed behavior: If ClamAV is offline or times out, throws 503.
   */
  async scanBuffer(buffer: Buffer): Promise<ScanResult> {
    return new Promise((resolve, reject) => {
      const socket = net.createConnection({ host: this.host, port: this.port });
      let responseData = '';
      let finished = false;

      const timer = setTimeout(() => {
        if (!finished) {
          finished = true;
          socket.destroy();
          logger.error('ClamAV scan timed out', { timeoutMs: this.timeoutMs });
          reject(
            new AppError(
              'Malware scanning service timed out. Upload rejected (fail-closed).',
              503,
              'MALWARE_SCANNER_TIMEOUT'
            )
          );
        }
      }, this.timeoutMs);

      socket.on('connect', () => {
        // 1. Send zINSTREAM command with null terminator
        socket.write('zINSTREAM\0');

        // 2. Stream buffer in chunks (64 KB chunks)
        const CHUNK_SIZE = 64 * 1024;
        let offset = 0;

        while (offset < buffer.length) {
          const end = Math.min(offset + CHUNK_SIZE, buffer.length);
          const chunk = buffer.subarray(offset, end);
          const lengthHeader = Buffer.alloc(4);
          lengthHeader.writeUInt32BE(chunk.length, 0);

          socket.write(lengthHeader);
          socket.write(chunk);
          offset = end;
        }

        // 3. Send 4-byte 0 indicating stream termination
        const zeroTerminator = Buffer.alloc(4, 0);
        socket.write(zeroTerminator);
      });

      socket.on('data', (chunk) => {
        responseData += chunk.toString('utf8');
      });

      socket.on('end', () => {
        if (finished) return;
        finished = true;
        clearTimeout(timer);

        const trimmed = responseData.trim();
        // Response format: "stream: OK" or "stream: <virus_name> FOUND"
        if (trimmed.includes('OK')) {
          resolve({ isClean: true });
        } else if (trimmed.includes('FOUND')) {
          const match = trimmed.match(/stream:\s+(.+)\s+FOUND/);
          const virusName = match ? match[1] : 'Unknown-Signature';
          logger.warn('Malware detected in upload stream', { virusName });
          resolve({ isClean: false, virusName });
        } else {
          logger.error('Unexpected ClamAV response', { response: trimmed });
          reject(
            new AppError(
              'Malware scanner returned invalid response. Upload rejected (fail-closed).',
              503,
              'MALWARE_SCANNER_ERROR'
            )
          );
        }
      });

      socket.on('error', (err) => {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        socket.destroy();
        logger.error('Failed to connect to ClamAV daemon', { error: err.message, host: this.host, port: this.port });
        reject(
          new AppError(
            'Malware screening service is currently unavailable. Upload rejected (fail-closed).',
            503,
            'MALWARE_SCANNER_UNAVAILABLE'
          )
        );
      });
    });
  }
}

export const clamAvService = new ClamAvService();
