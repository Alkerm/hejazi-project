import { z } from 'zod';

export const adminListProductsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(10),
  search: z.string().trim().min(1).max(120).optional(),
  categoryId: z.string().optional(),
  minStock: z.coerce.number().int().min(0).optional(),
  maxStock: z.coerce.number().int().min(0).optional(),
  isActive: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
});

export const adminProductUpsertSchema = z.object({
  name: z.string().min(2).max(120),
  arabicName: z.string().max(120).optional().nullable(),
  slug: z.string().min(2).max(140).optional(),
  description: z.string().min(5).max(2000),
  price: z.coerce.number().positive(),
  stockQuantity: z.coerce.number().int().min(0),
  sku: z.string().max(120).optional().nullable(),
  brand: z.string().max(120).optional().nullable(),
  ingredients: z.string().max(4000).optional().nullable(),
  warnings: z.string().max(4000).optional().nullable(),
  usageInstructions: z.string().max(4000).optional().nullable(),
  countryOfOrigin: z.string().max(120).optional().nullable(),
  manufacturer: z.string().max(160).optional().nullable(),
  importerResponsible: z.string().max(160).optional().nullable(),
  sfdaReference: z.string().max(160).optional().nullable(),
  batchNumberRequired: z.boolean().default(false),
  expiryDateRequired: z.boolean().default(false),
  productStatus: z.enum(['DRAFT', 'COMPLIANCE_REVIEW', 'APPROVED', 'INACTIVE']).default('DRAFT'),
  imageUrl: z.string().url(),
  isActive: z.boolean().default(true),
  categoryId: z.string().min(1),
});

export const adminProductIdSchema = z.object({
  id: z.string().min(1),
});

export const adminListOrdersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(10),
  status: z
    .enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
    .optional(),
});

export const adminOrderIdSchema = z.object({
  id: z.string().min(1),
});

export const adminUpdateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
});

export const adminLowStockQuerySchema = z.object({
  threshold: z.coerce.number().int().positive().max(100).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(10),
});

export const adminSalesQuerySchema = z.object({
  days: z.coerce.number().int().positive().max(365).default(30),
});

export const adminAuditLogsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(20),
});
