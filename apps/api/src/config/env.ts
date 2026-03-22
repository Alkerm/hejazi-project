import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

const parseBooleanEnv = (value: unknown) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }
  return value;
};

const loadEnvFile = () => {
  const candidates = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), 'apps/api/.env'),
  ];

  for (const filePath of candidates) {
    if (!fs.existsSync(filePath)) continue;

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const index = trimmed.indexOf('=');
      if (index < 1) continue;

      const key = trimmed.slice(0, index).trim();
      const value = trimmed.slice(index + 1).trim();
      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }

    break;
  }
};

loadEnvFile();

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(4000),
    DATABASE_URL: z.string().min(1),
    REDIS_URL: z.string().min(1).optional(),
    USE_IN_MEMORY_STORE: z.preprocess(parseBooleanEnv, z.boolean()).default(false),
    CORS_ORIGIN: z.string().min(1),
    COOKIE_NAME: z.string().default('cosmetics_sid'),
    COOKIE_DOMAIN: z.preprocess(
      (value) => {
        if (typeof value !== 'string') return value;
        const trimmed = value.trim();
        return trimmed.length === 0 ? undefined : trimmed;
      },
      z.string().optional(),
    ),
    COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),
    SESSION_TTL_SECONDS: z.coerce.number().int().positive().default(86400),
    SESSION_SECRET: z.string().min(16),
    BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(10).max(14).default(12),
    LOW_STOCK_THRESHOLD: z.coerce.number().int().positive().default(5),
    GLOBAL_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(150),
    AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(20),
    TRUST_PROXY: z.preprocess(parseBooleanEnv, z.boolean()).default(false),
  })
  .superRefine((data, ctx) => {
    if (!data.USE_IN_MEMORY_STORE && !data.REDIS_URL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'REDIS_URL is required unless USE_IN_MEMORY_STORE=true',
        path: ['REDIS_URL'],
      });
    }

    if (data.NODE_ENV === 'production' && data.USE_IN_MEMORY_STORE) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'USE_IN_MEMORY_STORE=true is not allowed in production',
        path: ['USE_IN_MEMORY_STORE'],
      });
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Invalid environment variables: ${parsed.error.message}`);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === 'production';

export const corsOrigins = env.CORS_ORIGIN.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

