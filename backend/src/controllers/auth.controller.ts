import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { authService } from '../services/auth.service';
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../types/auth';
import { issueCsrfToken, clearCsrfToken } from '../middleware/csrf';

export const SESSION_COOKIE_NAME = 'medivault_session';

export class AuthController {
  /**
   * POST /api/auth/register
   * Create new PATIENT account.
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = registerSchema.parse(req.body);
      const result = await authService.register(validated);

      // Issue CSRF cookie alongside registration
      issueCsrfToken(req, res);

      res.status(201).json({
        success: true,
        message: result.message,
        data: {
          user: result.user,
          verificationLink: result.verificationLink,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/login
   * Authenticate patient and issue HttpOnly session cookie.
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = loginSchema.parse(req.body);
      const { sessionToken, user, expiresAt } = await authService.login(validated);

      // Set hardened HttpOnly cookie
      res.cookie(SESSION_COOKIE_NAME, sessionToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        expires: expiresAt,
      });

      // Update request context to bind fresh CSRF token to new session
      req.cookies = { ...req.cookies, [SESSION_COOKIE_NAME]: sessionToken };
      req.sessionToken = sessionToken;

      // Ensure fresh session-bound CSRF token is issued (rotating any previous guest token)
      const csrfToken = issueCsrfToken(req, res, true);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user,
          csrfToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/logout
   * Terminate active session and clear cookie.
   */
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.cookies?.[SESSION_COOKIE_NAME] || req.sessionToken;
      await authService.logout(token);

      res.clearCookie(SESSION_COOKIE_NAME, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });

      // Clear session-bound CSRF cookie
      clearCsrfToken(res);

      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/me
   * Return authenticated user profile.
   */
  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const csrfToken = issueCsrfToken(req, res);
      res.status(200).json({
        success: true,
        data: {
          user: req.user,
          csrfToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/verify-email
   * Validate token and mark email as verified.
   */
  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = verifyEmailSchema.parse(req.body);
      const result = await authService.verifyEmail(token);

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          user: result.user,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/resend-verification
   * Request a fresh verification link.
   */
  async resendVerification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = resendVerificationSchema.parse(req.body);
      const result = await authService.resendVerification(email);

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          verificationLink: result.verificationLink,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/forgot-password
   * Request password reset instructions.
   */
  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);
      const result = await authService.forgotPassword(email);

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          resetLink: result.resetLink,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/reset-password
   * Set new password with verified reset token.
   */
  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = resetPasswordSchema.parse(req.body);
      const result = await authService.resetPassword(validated);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/csrf
   * Issue CSRF token for single-page application initialization.
   */
  async getCsrf(req: Request, res: Response): Promise<void> {
    const csrfToken = issueCsrfToken(req, res);
    res.status(200).json({
      success: true,
      data: {
        csrfToken,
      },
    });
  }
}

export const authController = new AuthController();
