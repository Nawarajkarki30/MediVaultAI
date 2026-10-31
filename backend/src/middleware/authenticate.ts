import { Request, Response, NextFunction } from 'express';
import { Role } from '@medivault/database';
import { authService } from '../services/auth.service';
import { SafeUser } from '../types/auth';
import { AppError } from '../utils/appError';

// Augment Express Request interface to include authenticated user
/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Express {
    interface Request {
      user?: SafeUser;
      sessionToken?: string;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

/**
 * Middleware that authenticates incoming requests using the HttpOnly session cookie
 * or Authorization: Bearer token header.
 */
export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let token = req.cookies?.medivault_session;

    // Optional Bearer token header fallback (e.g. for API/curl clients)
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError('Authentication required. Please log in.', 401);
    }

    const user = await authService.validateSession(token);
    req.user = user;
    req.sessionToken = token;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Role-Based Access Control (RBAC) guard.
 * Ensures the authenticated user possesses an approved role.
 */
export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError('Forbidden: You do not possess the required permissions for this action.', 403)
      );
    }

    next();
  };
}
