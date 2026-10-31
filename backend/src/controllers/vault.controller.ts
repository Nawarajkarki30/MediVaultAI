// backend/src/controllers/vault.controller.ts
// MediVault AI — Medical Vault Controller

import { Request, Response, NextFunction } from 'express';
import Busboy from 'busboy';
import { z } from 'zod';
import { DocumentCategory } from '@medivault/database';
import { vaultService } from '../services/vault.service';
import { env } from '../config/env';
import { AppError } from '../utils/appError';
import { getClientIp } from '../middleware/rateLimiter';

const updateDocumentSchema = z.object({
  title: z.string().min(1).max(150).optional(),
  category: z.nativeEnum(DocumentCategory).optional(),
  notes: z.string().max(2000).optional().nullable(),
  documentDate: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
    .optional()
    .nullable(),
});

const ALLOWED_FORM_FIELDS = new Set(['title', 'category', 'notes', 'documentDate']);

function getParamId(req: Request): string {
  const { id } = req.params;
  return Array.isArray(id) ? id[0] : id;
}

export class VaultController {
  /**
   * POST /api/vault/upload
   * Streams multipart upload into memory with strict resource limits, validates magic bytes,
   * screens with ClamAV, encrypts via envelope AES-256-GCM, and saves document record under
   * pessimistic quota lock. Supports coordinated cancellation and client disconnect handling.
   */
  async upload(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (req.abortSignal?.aborted) {
      return next(
        new AppError('Upload cancelled: request already aborted', 408, 'REQUEST_ABORTED')
      );
    }

    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('multipart/form-data')) {
      return next(
        new AppError(
          'Invalid content-type: multipart/form-data required',
          400,
          'INVALID_CONTENT_TYPE'
        )
      );
    }

    const fields: Record<string, string> = {};
    const chunks: Buffer[] = [];
    let originalFileName = '';
    let totalBytes = 0;
    let fileLimitExceeded = false;
    let fileFound = false;
    let multipleFilesDetected = false;
    let fieldViolationError: string | null = null;
    let isAborted = false;

    // Listen for coordinated cancellation or client disconnect
    const onAbort = () => {
      isAborted = true;
      chunks.length = 0; // Free chunks immediately
    };

    if (req.abortSignal) {
      req.abortSignal.addEventListener('abort', onAbort, { once: true });
    }

    try {
      const bb = Busboy({
        headers: req.headers,
        limits: {
          fileSize: env.MAX_FILE_SIZE_BYTES, // 10 MB
          files: 1,
          fields: 10,
          fieldNameSize: 50,
          fieldSize: 2048, // 2 KB max per text field
          parts: 15,
        },
      });

      bb.on('field', (name, val, info) => {
        if (!ALLOWED_FORM_FIELDS.has(name)) {
          fieldViolationError = `Unexpected form field: '${name}'. Permitted fields: ${Array.from(ALLOWED_FORM_FIELDS).join(', ')}`;
          return;
        }
        if (info.nameTruncated || info.valueTruncated) {
          fieldViolationError = `Form field '${name}' exceeds maximum allowed size`;
          return;
        }
        fields[name] = val;
      });

      bb.on('file', (_name, fileStream, info) => {
        if (fileFound) {
          multipleFilesDetected = true;
          fileStream.resume(); // Drain extraneous file
          return;
        }

        fileFound = true;
        originalFileName = info.filename || 'unnamed_document.bin';

        fileStream.on('data', (data: Buffer) => {
          if (isAborted) {
            fileStream.resume();
            return;
          }
          totalBytes += data.length;
          if (totalBytes > env.MAX_FILE_SIZE_BYTES) {
            fileLimitExceeded = true;
            fileStream.resume(); // Drain stream
            return;
          }
          chunks.push(data);
        });

        fileStream.on('limit', () => {
          fileLimitExceeded = true;
        });
      });

      bb.on('fieldsLimit', () => {
        fieldViolationError = 'Exceeded maximum permitted form fields (10)';
      });

      bb.on('partsLimit', () => {
        fieldViolationError = 'Exceeded maximum permitted multipart parts (15)';
      });

      bb.on('filesLimit', () => {
        multipleFilesDetected = true;
      });

      bb.on('error', (err) => {
        if (res.headersSent) return;
        next(
          new AppError(
            `Multipart parsing error: ${(err as Error).message}`,
            400,
            'MALFORMED_MULTIPART'
          )
        );
      });

      bb.on('close', async () => {
        if (req.abortSignal) {
          req.abortSignal.removeEventListener('abort', onAbort);
        }

        if (isAborted || req.abortSignal?.aborted) {
          chunks.length = 0;
          if (!res.headersSent) {
            return next(
              new AppError(
                'Upload cancelled: connection closed or timed out',
                408,
                'REQUEST_ABORTED'
              )
            );
          }
          return;
        }

        if (multipleFilesDetected) {
          chunks.length = 0;
          return next(
            new AppError(
              'Only one medical document may be uploaded per request',
              400,
              'TOO_MANY_FILES'
            )
          );
        }

        if (fieldViolationError) {
          chunks.length = 0;
          return next(new AppError(fieldViolationError, 400, 'INVALID_MULTIPART_FIELDS'));
        }

        if (fileLimitExceeded) {
          chunks.length = 0;
          return next(
            new AppError(
              `File exceeds maximum permitted size of ${Math.round(env.MAX_FILE_SIZE_BYTES / (1024 * 1024))} MB`,
              413,
              'FILE_TOO_LARGE'
            )
          );
        }

        if (!fileFound || chunks.length === 0) {
          return next(new AppError('No medical document file attached', 400, 'NO_FILE_ATTACHED'));
        }

        const fileBuffer = Buffer.concat(chunks);
        chunks.length = 0; // Release memory reference

        try {
          let parsedCategory: DocumentCategory | undefined = undefined;
          if (
            fields.category &&
            Object.values(DocumentCategory).includes(fields.category as DocumentCategory)
          ) {
            parsedCategory = fields.category as DocumentCategory;
          }

          let parsedDate: Date | undefined = undefined;
          if (fields.documentDate) {
            parsedDate = new Date(fields.documentDate);
            if (isNaN(parsedDate.getTime())) parsedDate = undefined;
          }

          const clientIp = getClientIp(req);

          const document = await vaultService.uploadDocument({
            ownerId: req.user!.id,
            fileBuffer,
            originalFileName,
            title: fields.title,
            category: parsedCategory,
            documentDate: parsedDate,
            notes: fields.notes,
            ipAddress: clientIp,
            userAgent: req.headers['user-agent'],
            signal: req.abortSignal,
          });

          if (res.headersSent) return;

          res.status(201).json({
            success: true,
            document,
          });
        } catch (uploadErr) {
          if (!res.headersSent) {
            next(uploadErr);
          }
        }
      });

      req.pipe(bb);
    } catch (err) {
      if (!res.headersSent) {
        next(err);
      }
    }
  }

  /**
   * GET /api/vault/documents
   * Lists active documents for the authenticated patient with storage quota stats.
   */
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        return next(new AppError('Authentication required', 401));
      }

      const categoryParam = req.query.category as string | undefined;
      let category: DocumentCategory | undefined = undefined;
      if (
        categoryParam &&
        Object.values(DocumentCategory).includes(categoryParam as DocumentCategory)
      ) {
        category = categoryParam as DocumentCategory;
      }

      const result = await vaultService.listDocuments(req.user.id, category);
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/vault/documents/:id
   * Retrieves single document metadata with BOLA defense (404 on unowned).
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        return next(new AppError('Authentication required', 401));
      }

      const document = await vaultService.getDocument(getParamId(req), req.user.id, {
        ipAddress: getClientIp(req),
        userAgent: req.headers['user-agent'],
      });

      res.status(200).json({
        success: true,
        document,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/vault/documents/:id/download
   * Secure attachment-only download with verify-before-release authenticated decryption.
   */
  async download(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        return next(new AppError('Authentication required', 401));
      }

      const { plaintextBuffer, originalFileName, mimeType } = await vaultService.downloadDocument(
        getParamId(req),
        req.user.id,
        {
          ipAddress: getClientIp(req),
          userAgent: req.headers['user-agent'],
        }
      );

      // Enforce safe attachment headers (no inline execution; no browser caching of PHI)
      res.setHeader('Content-Type', mimeType);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(originalFileName)}"`
      );
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Content-Length', plaintextBuffer.length);

      res.end(plaintextBuffer, () => {
        // Scrub plaintext buffer from memory once transmission completes
        plaintextBuffer.fill(0);
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/vault/documents/:id
   * Updates non-cryptographic document metadata.
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        return next(new AppError('Authentication required', 401));
      }

      const parsed = updateDocumentSchema.parse(req.body);
      const updates: {
        title?: string;
        category?: DocumentCategory;
        notes?: string;
        documentDate?: Date;
      } = {};

      if (parsed.title !== undefined) updates.title = parsed.title;
      if (parsed.category !== undefined) updates.category = parsed.category;
      if (parsed.notes !== undefined) updates.notes = parsed.notes || undefined;
      if (parsed.documentDate !== undefined) {
        updates.documentDate = parsed.documentDate ? new Date(parsed.documentDate) : undefined;
      }

      const document = await vaultService.updateDocument(getParamId(req), req.user.id, updates, {
        ipAddress: getClientIp(req),
        userAgent: req.headers['user-agent'],
      });

      res.status(200).json({
        success: true,
        document,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/vault/documents/:id
   * Soft-deletes document and moves physical blob to tombstone storage.
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        return next(new AppError('Authentication required', 401));
      }

      await vaultService.softDeleteDocument(getParamId(req), req.user.id, {
        ipAddress: getClientIp(req),
        userAgent: req.headers['user-agent'],
      });

      res.status(200).json({
        success: true,
        message: 'Document deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  }
}

export const vaultController = new VaultController();
