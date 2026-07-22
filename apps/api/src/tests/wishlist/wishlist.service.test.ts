import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../prisma/client', () => ({
  prisma: {
    wishlist: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    wishlistItem: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    product: {
      findUnique: vi.fn(),
    },
  },
}));

import { WishlistService } from '../../modules/wishlist/wishlist.service';
import { prisma } from '../../prisma/client';

describe('WishlistService Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getUserWishlist creates new wishlist if none exists', async () => {
    vi.mocked(prisma.wishlist.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.wishlist.create).mockResolvedValue({
      id: 'w1',
      userId: 'u1',
      items: [],
    } as any);

    const wishlist = await WishlistService.getUserWishlist('u1');
    expect(prisma.wishlist.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: { userId: 'u1' } })
    );
    expect(wishlist.id).toBe('w1');
  });

  it('toggleWishlistItem removes item if already in wishlist', async () => {
    const mockWishlist = { id: 'w1', userId: 'u1', items: [{ id: 'wi1', productId: 'p1' }] };
    vi.mocked(prisma.wishlist.findUnique).mockResolvedValue(mockWishlist as any);
    vi.mocked(prisma.wishlistItem.findUnique).mockResolvedValue({ id: 'wi1', wishlistId: 'w1', productId: 'p1' } as any);

    const result = await WishlistService.toggleWishlistItem('u1', 'p1');
    expect(prisma.wishlistItem.delete).toHaveBeenCalledWith({ where: { id: 'wi1' } });
    expect(result.isWishlisted).toBe(false);
  });

  it('toggleWishlistItem adds item if not in wishlist', async () => {
    const mockWishlist = { id: 'w1', userId: 'u1', items: [] };
    vi.mocked(prisma.wishlist.findUnique).mockResolvedValue(mockWishlist as any);
    vi.mocked(prisma.wishlistItem.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.product.findUnique).mockResolvedValue({ id: 'p1', name: 'Hair Oil' } as any);

    const result = await WishlistService.toggleWishlistItem('u1', 'p1');
    expect(prisma.wishlistItem.create).toHaveBeenCalledWith({
      data: { wishlistId: 'w1', productId: 'p1' },
    });
    expect(result.isWishlisted).toBe(true);
  });
});
