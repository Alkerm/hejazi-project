import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../prisma/client', () => ({
  prisma: {
    product: {
      findUnique: vi.fn(),
    },
    cartItem: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock('../../modules/cart/cart.repository', () => ({
  ensureCart: vi.fn(),
  getCartByUserId: vi.fn(),
  getCartItem: vi.fn(),
}));

import { prisma } from '../../prisma/client';
import { addCartItem, updateCartItem } from '../../modules/cart/cart.service';
import { ensureCart, getCartByUserId, getCartItem } from '../../modules/cart/cart.repository';

describe('cart.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('addCartItem rejects quantity above stock', async () => {
    vi.mocked(prisma.product.findUnique).mockResolvedValue({
      id: 'p1',
      isActive: true,
      stockQuantity: 2,
    } as never);

    await expect(addCartItem('u1', { productId: 'p1', quantity: 3 })).rejects.toMatchObject({
      code: 'INSUFFICIENT_STOCK',
    });
  });

  it('updateCartItem rejects item from another cart', async () => {
    vi.mocked(getCartItem).mockResolvedValue({ id: 'i1', cartId: 'cart-A', productId: 'p1' } as never);
    vi.mocked(ensureCart).mockResolvedValue({ id: 'cart-B' } as never);

    await expect(updateCartItem('u1', 'i1', 1)).rejects.toMatchObject({
      code: 'CART_ITEM_NOT_FOUND',
    });
  });

  it('addCartItem creates new line when valid and returns cart', async () => {
    vi.mocked(prisma.product.findUnique).mockResolvedValue({
      id: 'p1',
      isActive: true,
      stockQuantity: 10,
      price: 10,
    } as never);
    vi.mocked(ensureCart).mockResolvedValue({ id: 'cart-1' } as never);
    vi.mocked(prisma.cartItem.findUnique).mockResolvedValue(null);
    vi.mocked(getCartByUserId).mockResolvedValue({
      id: 'cart-1',
      items: [],
    } as never);

    const result = await addCartItem('u1', { productId: 'p1', quantity: 1 });

    expect(prisma.cartItem.create).toHaveBeenCalled();
    expect(result.summary.totalItems).toBe(0);
  });
});
