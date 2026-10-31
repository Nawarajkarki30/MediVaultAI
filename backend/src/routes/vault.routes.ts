// backend/src/routes/vault.routes.ts
// MediVault AI — Medical Vault Route Definitions

import { Router } from 'express';
import { Role } from '@medivault/database';
import { vaultController } from '../controllers/vault.controller';
import { authenticate, requireRole } from '../middleware/authenticate';
import { csrfProtection } from '../middleware/csrf';
import { requestTimeout } from '../middleware/requestTimeout';

const router = Router();

// Apply request timeout guard across all vault operations
router.use(requestTimeout());

// All medical vault routes strictly require an authenticated PATIENT session
router.use(authenticate);
router.use(requireRole(Role.PATIENT));

// Document upload (requires valid CSRF token on state change)
router.post('/upload', csrfProtection, (req, res, next) => vaultController.upload(req, res, next));

// Document listing and single metadata retrieval
router.get('/documents', (req, res, next) => vaultController.list(req, res, next));
router.get('/documents/:id', (req, res, next) => vaultController.getById(req, res, next));

// Secure attachment-only verified download
router.get('/documents/:id/download', (req, res, next) => vaultController.download(req, res, next));

// Metadata update and soft-deletion (require CSRF protection)
router.patch('/documents/:id', csrfProtection, (req, res, next) => vaultController.update(req, res, next));
router.delete('/documents/:id', csrfProtection, (req, res, next) => vaultController.delete(req, res, next));

export default router;
