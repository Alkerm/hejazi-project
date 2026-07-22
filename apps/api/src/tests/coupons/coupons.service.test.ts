import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../prisma/client', () => ({
  prisma: {
    coupon: {
      findUnique: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { CouponsService } from '../../modules/coupons/coupons.service';
import { prisma } from '../../prisma/client';

describe('CouponsService Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('applyCoupon calculates percentage discount correctly', async () => {
    vi.mocked(prisma.coupon.findUnique).mockResolvedValue({
      id: 'c1',
      code: 'HEJAZI20',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      minOrderAmount: 100,
      maxDiscountAmount: 50,
      isActive: true,
      usedCount: 0,
      usageLimit: 100,
    } as any);

    const result = await CouponsService.applyCoupon('hejazi20', 200);

    expect(result.discountAmount).toBe(40); // 20% of 200 = 40
    expect(result.newSubtotal).toBe(160);
  });

  it('applyCoupon enforces minimum order subtotal requirement', async () => {
    vi.mocked(prisma.coupon.findUnique).mockResolvedValue({
      id: 'c1',
      code: 'VIP50',
      discountType: 'FIXED_AMOUNT',
      discountValue: 50,
      minOrderAmount: 200,
      isActive: true,
      usedCount: 0,
    } as any);

    await expect(CouponsService.applyCoupon('VIP50', 100)).rejects.toThrow(
      'Minimum order total of SAR 200 required for this coupon'
    );
  });
});
