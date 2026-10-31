import { env } from '../config/env';
import { logger } from '../utils/logger';

export interface DevEmailMessage {
  id: string;
  to: string;
  subject: string;
  type: 'VERIFICATION' | 'PASSWORD_RESET';
  actionUrl: string;
  rawToken: string;
  sentAt: Date;
}

// In-memory development/test outbox
const devOutbox: DevEmailMessage[] = [];

export class EmailService {
  /**
   * Send a verification email to a newly registered user.
   */
  async sendVerificationEmail(to: string, fullName: string, rawToken: string): Promise<string> {
    const actionUrl = `${env.APP_URL}/auth/verify-email?token=${rawToken}`;
    const id = `mail-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const message: DevEmailMessage = {
      id,
      to,
      subject: 'Verify your MediVault AI account',
      type: 'VERIFICATION',
      actionUrl,
      rawToken,
      sentAt: new Date(),
    };

    devOutbox.push(message);

    // Keep outbox bounded
    if (devOutbox.length > 100) {
      devOutbox.shift();
    }

    logger.info(`[EmailService] Verification email queued for ${to} (Name: ${fullName})`);
    return actionUrl;
  }

  /**
   * Send a password reset email.
   */
  async sendPasswordResetEmail(to: string, fullName: string, rawToken: string): Promise<string> {
    const actionUrl = `${env.APP_URL}/auth/reset-password?token=${rawToken}`;
    const id = `mail-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const message: DevEmailMessage = {
      id,
      to,
      subject: 'Reset your MediVault AI password',
      type: 'PASSWORD_RESET',
      actionUrl,
      rawToken,
      sentAt: new Date(),
    };

    devOutbox.push(message);

    if (devOutbox.length > 100) {
      devOutbox.shift();
    }

    logger.info(`[EmailService] Password reset email queued for ${to} (Name: ${fullName})`);
    return actionUrl;
  }

  /**
   * Test/Dev helper: inspect the outbox.
   */
  static getOutbox(): readonly DevEmailMessage[] {
    return devOutbox;
  }

  /**
   * Test/Dev helper: find the latest email sent to an address.
   */
  static findLatestEmail(to: string): DevEmailMessage | undefined {
    return devOutbox
      .slice()
      .reverse()
      .find((m) => m.to.toLowerCase() === to.toLowerCase());
  }

  /**
   * Test/Dev helper: clear outbox.
   */
  static clearOutbox(): void {
    devOutbox.length = 0;
  }
}

export const emailService = new EmailService();
