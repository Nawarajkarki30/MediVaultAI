import { Router } from 'express';
import { healthRoutes } from './health.routes';
import { authRouter } from './auth.routes';

const router = Router();

// System health verification route
router.use('/health', healthRoutes);

// Authentication & Identity routes (Phase 2A)
router.use('/auth', authRouter);

export const apiRouter = router;
