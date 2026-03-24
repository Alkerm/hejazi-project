import { z } from 'zod';

export const registerSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(72),
  phone: z.string().min(6).max(20).optional(),
  marketingConsent: z.boolean().default(false),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
});
