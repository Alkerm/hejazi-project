import { prisma } from '../../prisma/client';
import { CouponDiscountType } from '@prisma/client';

export interface CreateCouponInput {
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  expiresAt?: string;
  usageLimit?: number;
}

export class CouponsService {
  /**
   * Validate and calculate coupon discount against server subtotal
   */
  static async applyCoupon(code: string, subtotal: number) {
    const formattedCode = code.trim().toUpperCase();

    const coupon = await prisma.coupon.findUnique({
      where: { code: formattedCode },
    });

    if (!coupon || !coupon.isActive) {
      throw new Error('Invalid or inactive coupon code');
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      throw new Error('Coupon code has expired');
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      throw new Error('Coupon code usage limit reached');
    }

    const minAmount = coupon.minOrderAmount ? Number(coupon.minOrderAmount) : 0;
    if (subtotal < minAmount) {
      throw new Error(`Minimum order total of SAR ${minAmount} required for this coupon`);
    }

    let discountAmount = 0;
    const discountVal = Number(coupon.discountValue);

    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = (subtotal * discountVal) / 100;
      if (coupon.maxDiscountAmount) {
        discountAmount = Math.min(discountAmount, Number(coupon.maxDiscountAmount));
      }
    } else {
      discountAmount = Math.min(discountVal, subtotal);
    }

    discountAmount = Number(discountAmount.toFixed(2));

    return {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: discountVal,
      discountAmount,
      newSubtotal: Math.max(0, Number((subtotal - discountAmount).toFixed(2))),
    };
  }

  /**
   * Admin list all coupons
   */
  static async adminListCoupons() {
    return await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Admin create new coupon code
   */
  static async adminCreateCoupon(input: CreateCouponInput) {
    const formattedCode = input.code.trim().toUpperCase();

    const existing = await prisma.coupon.findUnique({
      where: { code: formattedCode },
    });
    if (existing) {
      throw new Error(`Coupon code "${formattedCode}" already exists`);
    }

    return await prisma.coupon.create({
      data: {
        code: formattedCode,
        discountType: input.discountType,
        discountValue: input.discountValue,
        minOrderAmount: input.minOrderAmount ?? null,
        maxDiscountAmount: input.maxDiscountAmount ?? null,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
        usageLimit: input.usageLimit ?? null,
        isActive: true,
      },
    });
  }

  /**
   * Admin toggle coupon status
   */
  static async adminToggleCoupon(id: string, isActive: boolean) {
    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new Error('Coupon not found');

    return await prisma.coupon.update({
      where: { id },
      data: { isActive },
    });
  }
}
