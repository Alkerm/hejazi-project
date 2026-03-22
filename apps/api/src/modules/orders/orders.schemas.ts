import { z } from 'zod';

export const createOrderSchema = z.object({
  shippingAddress: z.object({
    line1: z.string().min(2).max(120),
    line2: z.string().max(120).optional().nullable(),
    city: z.string().min(2).max(80),
    country: z.string().min(2).max(80),
    postalCode: z.string().min(2).max(20),
  }),
  currency: z.string().default('SAR'),
});

export const orderIdSchema = z.object({
  id: z.string().min(1),
});

export const listMyOrdersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(10),
});
