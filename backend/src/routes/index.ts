import { Router } from 'express';
import { healthRoutes } from './health.routes';

const router = Router();

// Root API health verification route
router.use('/health', healthRoutes);

export const apiRouter = router;
