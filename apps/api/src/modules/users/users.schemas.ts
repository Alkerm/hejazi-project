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
  email: z.string().email().optional(),
  phone: z.string().min(6).max(20).nullable().optional(),
  marketingConsent: z.boolean().optional(),
  currentPassword: z.string().min(8).max(72).optional(),
  newPassword: z.string().min(8).max(72).optional(),
  address: optionalAddressSchema,
})
  .superRefine((data, ctx) => {
    const changingSensitive = Boolean(data.email || data.newPassword);
    if (changingSensitive && !data.currentPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Current password is required to change email or password',
        path: ['currentPassword'],
      });
    }
  });
