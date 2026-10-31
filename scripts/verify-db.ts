// scripts/verify-db.ts
// MediVault AI — Database Connection Verification Script

import 'dotenv/config';
import { PrismaClient } from '@medivault/database';

async function main() {
  console.log('--- MediVault AI Database Verification ---');
  console.log('Testing connection to PostgreSQL with Prisma Client...');
  const prisma = new PrismaClient();

  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1 as connected`;
    const duration = Date.now() - start;
    console.log(`✔ PostgreSQL Connection SUCCESSFUL (${duration}ms)`);

    const health = await prisma.systemHealth.findFirst();
    console.log(
      '✔ SystemHealth record query:',
      health ? 'Found' : 'No records yet (clean database)'
    );
    process.exit(0);
  } catch (error) {
    const err = error as Error;
    console.error('✖ PostgreSQL Connection FAILED:');
    console.error(err.message);
    console.log('\n[Remediation]');
    console.log('1. Launch Docker Desktop on Windows.');
    console.log('2. Run: npm run docker:db:up (or docker compose up -d)');
    console.log('3. Run: npm run prisma:migrate');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
