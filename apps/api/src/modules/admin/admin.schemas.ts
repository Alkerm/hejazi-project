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
  arabicDescription: z.string().max(2000).optional().nullable(),
  price: z.coerce.number().positive(),
  costPrice: z.coerce.number().min(0).default(0),
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
  isActive: z.boolean().optional(),
  categoryId: z.string().min(1),
});

export const adminUpdateProductFinancialsSchema = z.object({
  costPrice: z.coerce.number().min(0).optional(),
  price: z.coerce.number().positive().optional(),
});

export const adminFinancialsQuerySchema = z.object({
  search: z.string().trim().optional(),
  categoryId: z.string().optional(),
  sortBy: z.enum(['profit', 'margin', 'revenue', 'stock', 'cost', 'price', 'name']).default('profit'),
});

export const adminProductIdSchema = z.object({
  id: z.string().min(1),
});

export const adminAdjustStockSchema = z.object({
  quantityToAdd: z.coerce.number().int().min(1).max(100000),
  costPrice: z.coerce.number().min(0).optional(),
  note: z.string().max(300).optional(),
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
  period: z.enum(['MONTH', 'YEAR', 'ALL_TIME', 'CUSTOM', 'DAYS']).default('MONTH').optional(),
  year: z.coerce.number().int().min(2020).max(2100).optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  days: z.coerce.number().int().positive().max(3650).optional(),
});

export const adminAuditLogsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(20),
});

export const adminCreateCategorySchema = z.object({
  name: z.string().min(2).max(120),
  arabicName: z.string().max(120).optional().nullable(),
  slug: z.string().min(2).max(140).optional(),
});

export const adminListCustomersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().trim().optional(),
  sortBy: z.enum(['spending', 'orders', 'newest', 'name']).default('spending'),
  role: z.enum(['USER', 'ADMIN', 'DRIVER']).optional(),
  marketingOnly: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
});

export const adminBroadcastEmailSchema = z.object({
  audience: z.enum(['ALL', 'MARKETING_ONLY', 'VIP_ONLY']),
  subject: z.string().min(3).max(180),
  title: z.string().min(2).max(180),
  message: z.string().min(5).max(10000),
  callToActionUrl: z.string().optional(),
  callToActionLabel: z.string().max(80).optional(),
});

