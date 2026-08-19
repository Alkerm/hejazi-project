import { z } from 'zod';

export const policySlugParamSchema = z.object({
  slug: z.string().min(1),
});

export const updatePolicySchema = z.object({
  titleEn: z.string().min(2, 'Title in English is required'),
  titleAr: z.string().min(2, 'العنوان بالعربية مطلوب'),
  summaryEn: z.string().optional().nullable(),
  summaryAr: z.string().optional().nullable(),
  contentEn: z.string().min(5, 'Content in English is required'),
  contentAr: z.string().min(5, 'محتوى السياسة بالعربية مطلوب'),
});

export type UpdatePolicyInput = z.infer<typeof updatePolicySchema>;
