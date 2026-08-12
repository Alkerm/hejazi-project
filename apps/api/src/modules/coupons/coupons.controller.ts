import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { CouponsService } from './coupons.service';
import { CouponDiscountType } from '@prisma/client';
import { requireAdmin } from '../../middleware/auth';

const applyCouponSchema = z.object({
  code: z.string().min(1),
  subtotal: z.number().positive(),
});

const createCouponSchema = z.object({
  code: z.string().min(2),
  discountType: z.nativeEnum(CouponDiscountType),
  discountValue: z.number().positive(),
  minOrderAmount: z.number().nullable().optional(),
  maxDiscountAmount: z.number().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
  usageLimit: z.number().int().positive().nullable().optional(),
});

const toggleSchema = z.object({
  isActive: z.boolean(),
});

export const applyCouponHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  const parseResult = applyCouponSchema.safeParse(req.body);
  if (!parseResult.success) {
    return reply.status(400).send({ error: 'Invalid request body', details: parseResult.error.format() });
  }

  try {
    const result = await CouponsService.applyCoupon(parseResult.data.code, parseResult.data.subtotal);
    return reply.send({ success: true, data: result });
  } catch (err: any) {
    return reply.status(400).send({ error: err.message || 'Failed to apply coupon' });
  }
};

export const adminListCouponsHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  await requireAdmin(req, reply);

  try {
    const data = await CouponsService.adminListCoupons();
    return reply.send({ success: true, data });
  } catch (err: any) {
    return reply.status(500).send({ error: err.message || 'Failed to list coupons' });
  }
};

export const adminCreateCouponHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  await requireAdmin(req, reply);

  const parseResult = createCouponSchema.safeParse(req.body);
  if (!parseResult.success) {
    return reply.status(400).send({ error: 'Invalid request body', details: parseResult.error.format() });
  }

  try {
    const coupon = await CouponsService.adminCreateCoupon(parseResult.data);
    return reply.send({ success: true, data: coupon });
  } catch (err: any) {
    return reply.status(400).send({ error: err.message || 'Failed to create coupon' });
  }
};

export const adminToggleCouponHandler = async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  await requireAdmin(req, reply);

  const { id } = req.params;
  const parseResult = toggleSchema.safeParse(req.body);
  if (!parseResult.success) {
    return reply.status(400).send({ error: 'Invalid request body', details: parseResult.error.format() });
  }

  try {
    const coupon = await CouponsService.adminToggleCoupon(id, parseResult.data.isActive);
    return reply.send({ success: true, data: coupon });
  } catch (err: any) {
    return reply.status(400).send({ error: err.message || 'Failed to update coupon status' });
  }
};
