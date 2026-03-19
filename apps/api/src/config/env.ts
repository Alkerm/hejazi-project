import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  CORS_ORIGIN: z.string().min(1),
  COOKIE_NAME: z.string().default('cosmetics_sid'),
  COOKIE_DOMAIN: z.string().optional(),
  COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),
  SESSION_TTL_SECONDS: z.coerce.number().int().positive().default(86400),
  SESSION_SECRET: z.string().min(16),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(10).max(14).default(12),
  LOW_STOCK_THRESHOLD: z.coerce.number().int().positive().default(5),
  GLOBAL_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(150),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(20),
  TRUST_PROXY: z.coerce.boolean().default(true),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Invalid environment variables: ${parsed.error.message}`);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === 'production';

export const corsOrigins = env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean);
