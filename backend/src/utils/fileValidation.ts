// backend/src/utils/fileValidation.ts
// MediVault AI — File Signature (Magic Byte) & Filename Validation

import path from 'path';
import { AppError } from './appError';

export interface ValidatedFileMeta {
  mimeType: 'application/pdf' | 'image/png' | 'image/jpeg';
  extension: '.pdf' | '.png' | '.jpg' | '.jpeg';
  sanitizedFileName: string;
}

const PDF_MAGIC = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d]); // %PDF-
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const JPEG_MAGIC = Buffer.from([0xff, 0xd8, 0xff]);

/**
 * Sanitizes original filenames to prevent path traversal, control character injection,
 * and unsafe character execution.
 */
export function sanitizeFileName(originalName: string): string {
  if (!originalName) return 'unnamed_document.bin';

  // Strip path traversal attempts and base name only
  const baseName = path.basename(originalName).replace(/\0/g, '');

  // Split name and ext
  const ext = path.extname(baseName);
  const nameWithoutExt = path.basename(baseName, ext);

  // Allow only alphanumeric, hyphen, underscore
  const cleanName = nameWithoutExt.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 80);
  const cleanExt = ext.toLowerCase().replace(/[^a-z0-9.]/g, '');

  return `${cleanName || 'document'}${cleanExt}`;
}

/**
 * Validates file signature (magic bytes) against unencrypted buffer and verifies
 * that the filename extension strictly matches the detected binary format.
 */
export function validateFileSignature(
  buffer: Buffer,
  originalFileName: string
): ValidatedFileMeta {
  if (!buffer || buffer.length < 8) {
    throw new AppError(
      'Invalid file payload: Insufficient bytes to determine file signature',
      400,
      'INVALID_FILE_SIGNATURE'
    );
  }

  const rawExt = path.extname(originalFileName).toLowerCase();
  let detectedMime: 'application/pdf' | 'image/png' | 'image/jpeg' | null = null;
  let canonicalExt: '.pdf' | '.png' | '.jpg' | '.jpeg' | null = null;

  if (buffer.subarray(0, PDF_MAGIC.length).equals(PDF_MAGIC)) {
    detectedMime = 'application/pdf';
    canonicalExt = '.pdf';
  } else if (buffer.subarray(0, PNG_MAGIC.length).equals(PNG_MAGIC)) {
    detectedMime = 'image/png';
    canonicalExt = '.png';
  } else if (buffer.subarray(0, JPEG_MAGIC.length).equals(JPEG_MAGIC)) {
    detectedMime = 'image/jpeg';
    canonicalExt = rawExt === '.jpeg' ? '.jpeg' : '.jpg';
  }

  if (!detectedMime || !canonicalExt) {
    throw new AppError(
      'Unsupported file type: Only PDF, PNG, and JPEG documents are permitted',
      415,
      'UNSUPPORTED_MEDIA_TYPE'
    );
  }

  // Cross-verify filename extension matches magic bytes
  if (
    detectedMime === 'application/pdf' &&
    rawExt !== '.pdf'
  ) {
    throw new AppError(
      'File extension does not match binary content (expected .pdf)',
      400,
      'EXTENSION_MISMATCH'
    );
  }

  if (
    detectedMime === 'image/png' &&
    rawExt !== '.png'
  ) {
    throw new AppError(
      'File extension does not match binary content (expected .png)',
      400,
      'EXTENSION_MISMATCH'
    );
  }

  if (
    detectedMime === 'image/jpeg' &&
    rawExt !== '.jpg' &&
    rawExt !== '.jpeg'
  ) {
    throw new AppError(
      'File extension does not match binary content (expected .jpg or .jpeg)',
      400,
      'EXTENSION_MISMATCH'
    );
  }

  const sanitized = sanitizeFileName(originalFileName);

  return {
    mimeType: detectedMime,
    extension: canonicalExt,
    sanitizedFileName: sanitized,
  };
}
