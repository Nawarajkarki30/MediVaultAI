// scripts/test-live-auth.ts
// MediVault AI — Live PostgreSQL Authentication Integration Test

import 'dotenv/config';
import request from 'supertest';
import { createApp } from '../backend/src/app';
import { prisma } from '@medivault/database';
import { EmailService } from '../backend/src/services/email.service';
import {
  setAuthRepository,
  PrismaAuthRepository,
} from '../backend/src/repositories/auth.repository';

async function runLiveTest() {
  console.log('===============================================================');
  console.log(' MEDIVAULT AI — LIVE POSTGRESQL AUTHENTICATION INTEGRATION TEST');
  console.log('===============================================================');

  // Ensure active repository is PrismaAuthRepository (PostgreSQL)
  setAuthRepository(new PrismaAuthRepository());

  const app = createApp();
  const testEmail = `patient.live.${Date.now()}@medivault.dev`;
  const testPassword = 'StrongPassword2026!#';
  const testFullName = 'Elena Rostova';

  try {
    // 0. Verify Database Connection
    console.log('\n[Step 0] Testing raw PostgreSQL connectivity...');
    const dbCheck = await prisma.$queryRaw`SELECT current_database(), version()`;
    console.log('✔ Connected to PostgreSQL successfully:', dbCheck);

    // 1. Patient Registration
    console.log(`\n[Step 1] Registering patient: ${testEmail}...`);
    const regRes = await request(app).post('/api/auth/register').send({
      fullName: testFullName,
      email: testEmail,
      password: testPassword,
      confirmPassword: testPassword,
      agreeToTerms: true,
    });

    if (regRes.status !== 201) {
      throw new Error(
        `Registration failed with status ${regRes.status}: ${JSON.stringify(regRes.body)}`
      );
    }
    console.log('✔ Registration API returned 201 Created');
    console.log('  Response SafeUser:', regRes.body.data.user);

    // Verify row in PostgreSQL
    const userInDb = await prisma.user.findUnique({
      where: { email: testEmail.toLowerCase() },
      include: { verificationTokens: true },
    });

    if (!userInDb) {
      throw new Error('User was not found in PostgreSQL "users" table!');
    }
    console.log('✔ User confirmed in PostgreSQL "users" table:');
    console.log(`  ID: ${userInDb.id}`);
    console.log(`  Role: ${userInDb.role}`);
    console.log(`  PasswordHash: ${userInDb.passwordHash.substring(0, 32)}... (Argon2id)`);
    console.log(`  EmailVerifiedAt: ${userInDb.emailVerifiedAt}`);

    // Verify verification token in PostgreSQL
    if (userInDb.verificationTokens.length === 0) {
      throw new Error('No verification token found in PostgreSQL "verification_tokens" table!');
    }
    const tokenRecord = userInDb.verificationTokens[0];
    console.log('✔ Verification token stored in PostgreSQL "verification_tokens" table:');
    console.log(`  TokenHash: ${tokenRecord.tokenHash.substring(0, 32)}... (SHA-256)`);
    console.log(`  ExpiresAt: ${tokenRecord.expiresAt}`);
    console.log(`  UsedAt: ${tokenRecord.usedAt}`);

    // 2. Unverified Login Attempt (Must be rejected)
    console.log('\n[Step 2] Attempting login before email verification...');
    const unverifiedLogin = await request(app).post('/api/auth/login').send({
      email: testEmail,
      password: testPassword,
    });

    if (unverifiedLogin.status !== 403) {
      throw new Error(`Expected 403 Forbidden for unverified email, got ${unverifiedLogin.status}`);
    }
    console.log('✔ Login before verification correctly rejected with HTTP 403 Forbidden');
    console.log(`  Message: "${unverifiedLogin.body.message}"`);

    // 3. Email Verification
    console.log('\n[Step 3] Verifying email address...');
    const queuedEmail = EmailService.findLatestEmail(testEmail);
    if (!queuedEmail) {
      throw new Error('Verification email was not found in email service outbox!');
    }

    const rawToken = queuedEmail.rawToken;
    console.log(`  Using raw verification token from outbox: ${rawToken}`);

    const verifyRes = await request(app).post('/api/auth/verify-email').send({ token: rawToken });

    if (verifyRes.status !== 200) {
      throw new Error(
        `Verification failed with status ${verifyRes.status}: ${JSON.stringify(verifyRes.body)}`
      );
    }
    console.log('✔ Verification API returned 200 OK');

    // Confirm updated state in PostgreSQL
    const verifiedUserInDb = await prisma.user.findUnique({
      where: { email: testEmail.toLowerCase() },
      include: { verificationTokens: true },
    });
    if (!verifiedUserInDb?.emailVerifiedAt) {
      throw new Error('User emailVerifiedAt is still null in PostgreSQL!');
    }
    if (!verifiedUserInDb.verificationTokens[0].usedAt) {
      throw new Error('Verification token usedAt was not set in PostgreSQL!');
    }
    console.log('✔ Confirmed in PostgreSQL: emailVerifiedAt is set and token is marked used');

    // 4. Login with Verified Credentials
    console.log('\n[Step 4] Logging in with verified credentials...');
    const loginRes = await request(app).post('/api/auth/login').send({
      email: testEmail,
      password: testPassword,
    });

    if (loginRes.status !== 200) {
      throw new Error(
        `Login failed with status ${loginRes.status}: ${JSON.stringify(loginRes.body)}`
      );
    }
    console.log('✔ Login API returned 200 OK');

    const setCookies = loginRes.headers['set-cookie'] as unknown as string[];
    const sessionCookie = setCookies.find((c: string) => c.startsWith('medivault_session='));
    if (!sessionCookie) {
      throw new Error('medivault_session HttpOnly cookie was not set in login response!');
    }
    console.log(`✔ Received HttpOnly session cookie: ${sessionCookie.split(';')[0]}; ...`);

    // Confirm session record in PostgreSQL
    const sessionsInDb = await prisma.session.findMany({
      where: { userId: verifiedUserInDb.id },
    });
    if (sessionsInDb.length === 0) {
      throw new Error('No session record found in PostgreSQL "sessions" table!');
    }
    const sessionRecord = sessionsInDb[0];
    console.log('✔ Session confirmed in PostgreSQL "sessions" table:');
    console.log(`  Session ID: ${sessionRecord.id}`);
    console.log(`  TokenHash: ${sessionRecord.tokenHash.substring(0, 32)}...`);
    console.log(`  ExpiresAt: ${sessionRecord.expiresAt}`);
    console.log(`  RevokedAt: ${sessionRecord.revokedAt}`);

    // 5. Session Persistence & /api/auth/me
    console.log('\n[Step 5] Testing session persistence via GET /api/auth/me...');
    const meRes = await request(app).get('/api/auth/me').set('Cookie', sessionCookie);

    if (meRes.status !== 200) {
      throw new Error(`GET /me failed with status ${meRes.status}: ${JSON.stringify(meRes.body)}`);
    }
    console.log('✔ GET /api/auth/me authenticated successfully from PostgreSQL session');
    console.log('  SafeUser retrieved:', meRes.body.data.user);

    // 6. Logout & Session Invalidation
    console.log('\n[Step 6] Logging out...');
    const logoutRes = await request(app).post('/api/auth/logout').set('Cookie', sessionCookie);

    if (logoutRes.status !== 200) {
      throw new Error(`Logout failed with status ${logoutRes.status}`);
    }
    console.log('✔ Logout API returned 200 OK');

    // Confirm session is revoked in PostgreSQL
    const revokedSession = await prisma.session.findUnique({
      where: { id: sessionRecord.id },
    });
    if (!revokedSession?.revokedAt) {
      throw new Error('Session record revokedAt was not updated in PostgreSQL!');
    }
    console.log(`✔ Confirmed in PostgreSQL: session revokedAt = ${revokedSession.revokedAt}`);

    // Replay revoked session cookie
    console.log('\n[Step 7] Replaying revoked session cookie...');
    const replayRes = await request(app).get('/api/auth/me').set('Cookie', sessionCookie);

    if (replayRes.status !== 401) {
      throw new Error(`Expected 401 Unauthorized for revoked session, got ${replayRes.status}`);
    }
    console.log('✔ Access with revoked session cookie successfully rejected (HTTP 401)');

    // 8. Clean up test patient record
    console.log('\n[Step 8] Cleaning up synthetic test record from PostgreSQL...');
    await prisma.user.delete({
      where: { id: verifiedUserInDb.id },
    });
    console.log('✔ Deleted synthetic user; cascades removed associated sessions and tokens');

    console.log('\n===============================================================');
    console.log(' 🎉 ALL LIVE POSTGRESQL AUTHENTICATION TESTS PASSED 100%!');
    console.log('===============================================================');
  } catch (err) {
    console.error('\n✖ LIVE POSTGRESQL TEST FAILED:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runLiveTest();
