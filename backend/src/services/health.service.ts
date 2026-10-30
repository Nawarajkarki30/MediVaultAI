import { HealthStatus } from '../types';
import { env } from '../config/env';

export class HealthService {
  public static getHealth(): HealthStatus {
    return {
      status: 'ok',
      service: 'medivault-backend',
      version: '0.1.0',
      uptimeSeconds: Math.floor(process.uptime()),
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
    };
  }
}
