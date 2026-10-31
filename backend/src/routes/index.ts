import { Router } from 'express';
import { healthRoutes } from './health.routes';
import { authRouter } from './auth.routes';
import vaultRouter from './vault.routes';

const router = Router();

// System health verification route
router.use('/health', healthRoutes);

// Authentication & Identity routes (Phase 2A)
router.use('/auth', authRouter);

// Medical Vault routes (Phase 2C.3)
router.use('/vault', vaultRouter);

export const apiRouter = router;
