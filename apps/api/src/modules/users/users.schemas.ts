import { z } from 'zod';

const optionalAddressSchema = z
  .object({
    line1: z.string().min(2).max(120),
    line2: z.string().max(120).optional().nullable(),
    city: z.string().min(2).max(80),
    country: z.string().min(2).max(80),
    postalCode: z.string().min(2).max(20),
  })
  .nullable()
  .optional();

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  phone: z.string().min(6).max(20).nullable().optional(),
  address: optionalAddressSchema,
});
