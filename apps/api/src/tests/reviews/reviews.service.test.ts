import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../prisma/client', () => ({
  prisma: {
    product: {
      findUnique: vi.fn(),
    },
    orderItem: {
      findFirst: vi.fn(),
    },
    review: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

import { ReviewsService } from '../../modules/reviews/reviews.service';
import { prisma } from '../../prisma/client';

describe('ReviewsService Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submitReview rejects invalid rating score', async () => {
    await expect(
      ReviewsService.submitReview({ userId: 'u1', productId: 'p1', rating: 6 })
    ).rejects.toThrow('Rating must be an integer between 1 and 5');
  });

  it('submitReview rejects unverified buyer who did not purchase product', async () => {
    vi.mocked(prisma.product.findUnique).mockResolvedValue({ id: 'p1', name: '4G Camera' } as any);
    vi.mocked(prisma.orderItem.findFirst).mockResolvedValue(null);

    await expect(
      ReviewsService.submitReview({ userId: 'u1', productId: 'p1', rating: 5 })
    ).rejects.toThrow('Only verified customers who have purchased this product can submit a review');
  });

  it('submitReview creates a new review for verified buyer', async () => {
    vi.mocked(prisma.product.findUnique).mockResolvedValue({ id: 'p1', name: '4G Solar Camera' } as any);
    vi.mocked(prisma.orderItem.findFirst).mockResolvedValue({ id: 'oi1', orderId: 'o1', productId: 'p1' } as any);
    vi.mocked(prisma.review.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.review.create).mockResolvedValue({
      id: 'r1',
      userId: 'u1',
      productId: 'p1',
      rating: 5,
      comment: 'Excellent solar power battery life!',
      isApproved: true,
    } as any);

    const review = await ReviewsService.submitReview({
      userId: 'u1',
      productId: 'p1',
      rating: 5,
      comment: 'Excellent solar power battery life!',
    });

    expect(prisma.review.create).toHaveBeenCalled();
    expect(review.rating).toBe(5);
  });

  it('getProductReviews calculates correct average rating and breakdown', async () => {
    const mockReviews = [
      { id: 'r1', rating: 5, comment: 'Great', user: { id: 'u1', firstName: 'Sara', lastName: 'A' } },
      { id: 'r2', rating: 3, comment: 'Okay', user: { id: 'u2', firstName: 'Ahmed', lastName: 'K' } },
    ];
    vi.mocked(prisma.review.findMany).mockResolvedValue(mockReviews as any);

    const data = await ReviewsService.getProductReviews('p1');
    expect(data.summary.totalReviews).toBe(2);
    expect(data.summary.averageRating).toBe(4);
    expect(data.summary.breakdown[5]).toBe(1);
    expect(data.summary.breakdown[3]).toBe(1);
  });
});
