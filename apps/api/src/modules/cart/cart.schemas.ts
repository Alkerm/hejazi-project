import { z } from 'zod';

export const addCartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().positive().max(100),
});

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().positive().max(100),
});

export const cartItemIdSchema = z.object({
  id: z.string().min(1),
});
