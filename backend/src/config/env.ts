import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env from backend directory, fallback to root .env
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1000).max(65535))
    .default('5000'),
  API_PREFIX: z.string().default('/api'),
  ALLOWED_ORIGINS: z
    .string()
    .default(
      'http://localhost:5173,http://127.0.0.1:5173,http://localhost:4206,http://127.0.0.1:4206'
    )
    .transform((val) => val.split(',').map((origin) => origin.trim())),
  APP_URL: z.string().default('http://localhost:5173'),
  DATABASE_URL: z.string().optional(),
  SESSION_SECRET: z
    .string()
    .min(32, 'SESSION_SECRET must be at least 32 characters long')
    .default('medivault_dev_secret_key_needs_to_be_at_least_32_characters_long!'),
  SESSION_TTL_HOURS: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default('72'),
  VERIFICATION_TOKEN_TTL_HOURS: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default('24'),
  PASSWORD_RESET_TOKEN_TTL_HOURS: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default('1'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables configuration:', parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;
export type EnvConfig = z.infer<typeof envSchema>;
