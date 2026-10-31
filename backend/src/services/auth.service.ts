import { Role, User } from '@medivault/database';
import { env } from '../config/env';
import { IAuthRepository, getAuthRepository } from '../repositories/auth.repository';
import { RegisterInput, LoginInput, SafeUser, ResetPasswordInput } from '../types/auth';
import { hashPassword, verifyPassword, generateSecureToken, hashToken } from '../utils/security';
import { emailService } from './email.service';
import { AppError } from '../utils/appError';
import { logger } from '../utils/logger';

export class AuthService {
  private getRepository(): IAuthRepository {
    return getAuthRepository();
  }

  /**
   * Transform a database user entity into a safe public DTO.
   * Strips passwordHash and internal credentials.
   */
  static toSafeUser(user: User): SafeUser {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerifiedAt !== null,
      emailVerifiedAt: user.emailVerifiedAt ? user.emailVerifiedAt.toISOString() : null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  /**
   * Register a new patient account.
   * Strictly creates accounts with Role.PATIENT.
   */
  async register(input: RegisterInput): Promise<{
    user: SafeUser;
    verificationLink?: string;
    message: string;
  }> {
    const repository = this.getRepository();
    const existing = await repository.findUserByEmail(input.email);

    if (existing) {
      // Do not disclose sensitive internal account details
      throw new AppError('An account with this email address already exists. Please log in.', 409);
    }

    // Hash password with Argon2id
    const passwordHash = await hashPassword(input.password);

    // Persist new user with strictly enforced PATIENT role
    const user = await repository.createUser({
      fullName: input.fullName,
      email: input.email,
      passwordHash,
      role: Role.PATIENT,
      emailVerifiedAt: null,
    });

    // Create time-limited verification token
    const rawToken = generateSecureToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + env.VERIFICATION_TOKEN_TTL_HOURS * 3600 * 1000);

    await repository.createVerificationToken({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    // Queue verification email
    const verificationLink = await emailService.sendVerificationEmail(
      user.email,
      user.fullName,
      rawToken
    );

    logger.info(`[AuthService] Registered new patient: ${user.email} (ID: ${user.id})`);

    return {
      user: AuthService.toSafeUser(user),
      verificationLink: env.NODE_ENV !== 'production' ? verificationLink : undefined,
      message: 'Registration successful. Please verify your email before logging in.',
    };
  }

  /**
   * Authenticate user with email and password, creating an active session.
   */
  async login(input: LoginInput): Promise<{
    sessionToken: string;
    user: SafeUser;
    expiresAt: Date;
  }> {
    const repository = this.getRepository();
    const user = await repository.findUserByEmail(input.email);

    if (!user) {
      // Generic error message to prevent account enumeration
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await verifyPassword(user.passwordHash, input.password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    // Enforce email verification restriction
    if (!user.emailVerifiedAt) {
      throw new AppError(
        'Your email address has not been verified yet. Please check your inbox or request a new verification link.',
        403,
        'EMAIL_NOT_VERIFIED'
      );
    }

    // Generate secure session token
    const rawSessionToken = generateSecureToken();
    const tokenHash = hashToken(rawSessionToken);
    const expiresAt = new Date(Date.now() + env.SESSION_TTL_HOURS * 3600 * 1000);

    await repository.createSession({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    logger.info(`[AuthService] User logged in: ${user.email} (Role: ${user.role})`);

    return {
      sessionToken: rawSessionToken,
      user: AuthService.toSafeUser(user),
      expiresAt,
    };
  }

  /**
   * Terminate active session.
   */
  async logout(rawSessionToken?: string): Promise<void> {
    if (!rawSessionToken) return;

    const repository = this.getRepository();
    const tokenHash = hashToken(rawSessionToken);
    const session = await repository.findSessionByTokenHash(tokenHash);

    if (session && !session.revokedAt) {
      await repository.revokeSession(session.id);
      logger.info(`[AuthService] Revoked session for user ID: ${session.userId}`);
    }
  }

  /**
   * Restore and authenticate session from token.
   */
  async validateSession(rawSessionToken: string): Promise<SafeUser> {
    const repository = this.getRepository();
    const tokenHash = hashToken(rawSessionToken);
    const session = await repository.findSessionByTokenHash(tokenHash);

    if (!session || session.revokedAt) {
      throw new AppError('Session is invalid or has been revoked', 401);
    }

    if (new Date() > session.expiresAt) {
      throw new AppError('Session has expired. Please log in again.', 401);
    }

    // Touch lastUsedAt asynchronously
    repository.updateSessionLastUsed(session.id).catch(() => {});

    return AuthService.toSafeUser(session.user);
  }

  /**
   * Verify email using raw token.
   */
  async verifyEmail(rawToken: string): Promise<{ message: string; user: SafeUser }> {
    const repository = this.getRepository();
    const tokenHash = hashToken(rawToken);
    const record = await repository.findVerificationToken(tokenHash);

    if (!record) {
      throw new AppError('Invalid verification link.', 400);
    }

    if (record.usedAt) {
      throw new AppError('This verification link has already been used.', 400);
    }

    if (new Date() > record.expiresAt) {
      throw new AppError('This verification link has expired. Please request a new one.', 400);
    }

    await repository.markVerificationTokenUsed(record.id);
    const updatedUser = await repository.updateUser(record.userId, {
      emailVerifiedAt: new Date(),
    });

    logger.info(`[AuthService] Email verified for user: ${updatedUser.email}`);

    return {
      message: 'Email verified successfully. You may now log in to MediVault AI.',
      user: AuthService.toSafeUser(updatedUser),
    };
  }

  /**
   * Resend email verification link with rate limit protection.
   */
  async resendVerification(email: string): Promise<{ message: string; verificationLink?: string }> {
    const repository = this.getRepository();
    const user = await repository.findUserByEmail(email);

    // Generic response if not found or already verified to prevent enumeration
    if (!user || user.emailVerifiedAt) {
      return {
        message:
          'If an unverified account exists for this email, a verification link has been sent.',
      };
    }

    const rawToken = generateSecureToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + env.VERIFICATION_TOKEN_TTL_HOURS * 3600 * 1000);

    await repository.createVerificationToken({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    const verificationLink = await emailService.sendVerificationEmail(
      user.email,
      user.fullName,
      rawToken
    );

    return {
      message: 'A new verification link has been sent to your email address.',
      verificationLink: env.NODE_ENV !== 'production' ? verificationLink : undefined,
    };
  }

  /**
   * Request password reset token.
   */
  async forgotPassword(email: string): Promise<{ message: string; resetLink?: string }> {
    const repository = this.getRepository();
    const user = await repository.findUserByEmail(email);

    // Constant-time-like generic return to prevent account enumeration
    if (!user) {
      return {
        message:
          'If an account exists with this email address, password reset instructions have been sent.',
      };
    }

    const rawToken = generateSecureToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + env.PASSWORD_RESET_TOKEN_TTL_HOURS * 3600 * 1000);

    await repository.createPasswordResetToken({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    const resetLink = await emailService.sendPasswordResetEmail(
      user.email,
      user.fullName,
      rawToken
    );

    return {
      message:
        'If an account exists with this email address, password reset instructions have been sent.',
      resetLink: env.NODE_ENV !== 'production' ? resetLink : undefined,
    };
  }

  /**
   * Reset user password using token.
   */
  async resetPassword(input: ResetPasswordInput): Promise<{ message: string }> {
    const repository = this.getRepository();
    const tokenHash = hashToken(input.token);
    const record = await repository.findPasswordResetToken(tokenHash);

    if (!record) {
      throw new AppError('Invalid password reset link.', 400);
    }

    if (record.usedAt) {
      throw new AppError('This password reset link has already been used.', 400);
    }

    if (new Date() > record.expiresAt) {
      throw new AppError('This password reset link has expired. Please request a new one.', 400);
    }

    const newPasswordHash = await hashPassword(input.password);

    await repository.updateUser(record.userId, {
      passwordHash: newPasswordHash,
    });

    await repository.markPasswordResetTokenUsed(record.id);

    // Revoke all existing sessions for security
    await repository.revokeAllUserSessions(record.userId);

    logger.info(`[AuthService] Password reset successfully for user ID: ${record.userId}`);

    return {
      message: 'Password reset successful. You may now log in with your new credentials.',
    };
  }
}

export const authService = new AuthService();
