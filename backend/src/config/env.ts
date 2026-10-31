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
  CSRF_SECRET: z
    .string()
    .min(32, 'CSRF_SECRET must be at least 32 characters long')
    .default('medivault_dev_csrf_secret_key_needs_to_be_at_least_32_characters!'),
  TRUST_PROXY: z
    .string()
    .default('false')
    .transform((val) => {
      const lower = val.trim().toLowerCase();
      if (lower === 'true' || lower === '1') return true;
      if (lower === 'false' || lower === '0') return false;
      const num = parseInt(lower, 10);
      if (!isNaN(num)) return num;
      return lower;
    }),
  UPLOAD_RATE_LIMIT_USER_MAX: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number())
    .default('10'),
  UPLOAD_RATE_LIMIT_IP_MAX: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number())
    .default('30'),
  UPLOAD_RATE_LIMIT_WINDOW_MS: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number())
    .default('900000'), // 15 minutes
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
  VAULT_STORAGE_ROOT: z.string().default('./storage_vault'),
  VAULT_MASTER_KEY: z
    .string()
    .length(64, 'VAULT_MASTER_KEY must be a 64-character hex string (32 bytes)')
    .regex(/^[0-9a-fA-F]+$/, 'VAULT_MASTER_KEY must be hexadecimal')
    .default('d61eac7e0b0b6372dd0a5695a9b0f1d2ca043abc44daf82e46737d7ff6992c13'),
  CLAMAV_HOST: z.string().default('127.0.0.1'),
  CLAMAV_PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number())
    .default('3310'),
  CLAMAV_TIMEOUT_MS: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number())
    .default('10000'),
  MAX_FILE_SIZE_BYTES: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number())
    .default('10485760'),
  PATIENT_QUOTA_BYTES: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number())
    .default('104857600'),
  MAX_CONCURRENT_CRYPTO_OPS: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(20))
    .default('5'),
  UPLOAD_REQUEST_TIMEOUT_MS: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number())
    .default('30000'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables configuration:', parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;
export type EnvConfig = z.infer<typeof envSchema>;
