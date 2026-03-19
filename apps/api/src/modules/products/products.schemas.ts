import { z } from 'zod';

export const listProductsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(12),
  search: z.string().trim().min(1).max(120).optional(),
  category: z.string().trim().min(1).max(120).optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc', 'name_asc']).default('newest'),
});

export const productBySlugOrIdSchema = z.object({
  idOrSlug: z.string().min(1),
});
