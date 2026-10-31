import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/authenticate';
import {
  loginRateLimiter,
  registrationRateLimiter,
  tokenRequestRateLimiter,
} from '../middleware/rateLimiter';
import { csrfProtection } from '../middleware/csrf';

const router = Router();

// CSRF token retrieval endpoint
router.get('/csrf', authController.getCsrf);

// Public Authentication Endpoints with Rate Limiting
router.post('/register', registrationRateLimiter, authController.register);
router.post('/login', loginRateLimiter, authController.login);
router.post('/logout', authController.logout);

// Email Verification
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', tokenRequestRateLimiter, authController.resendVerification);

// Password Recovery
router.post('/forgot-password', tokenRequestRateLimiter, authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected Identity Verification
router.get('/me', authenticate, authController.getMe);

// Apply CSRF validation for state-changing routes when session cookie is used
router.use(csrfProtection);

export const authRouter = router;
