import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../modules/orders/orders.repository', () => ({
  getCartWithItems: vi.fn(),
  listOrdersByUser: vi.fn(),
  findOrderByUser: vi.fn(),
}));

vi.mock('../../prisma/client', () => ({
  prisma: {
    $transaction: vi.fn(),
  },
}));

import { createOrderFromCart } from '../../modules/orders/orders.service';
import { getCartWithItems } from '../../modules/orders/orders.repository';
import { prisma } from '../../prisma/client';

describe('orders.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects creating order when cart is empty', async () => {
    vi.mocked(getCartWithItems).mockResolvedValue({ id: 'cart-1', items: [] } as never);

    await expect(
      createOrderFromCart('user-1', {
        shippingAddress: {
          line1: 'line',
          city: 'city',
          country: 'country',
          postalCode: '12345',
        },
      }),
    ).rejects.toMatchObject({ code: 'CART_EMPTY' });
  });

  it('rejects when stock cannot be decremented safely', async () => {
    vi.mocked(getCartWithItems).mockResolvedValue({
      id: 'cart-1',
      items: [
        {
          productId: 'p1',
          quantity: 2,
          product: {
            isActive: true,
            name: 'Prod',
            price: 12,
          },
        },
      ],
    } as never);

    vi.mocked(prisma.$transaction).mockImplementation(async (arg: unknown) => {
      if (typeof arg === 'function') {
        const tx = {
          product: {
            updateMany: vi.fn().mockResolvedValue({ count: 0 }),
          },
        };
        return arg(tx);
      }
      return [];
    });

    await expect(
      createOrderFromCart('user-1', {
        shippingAddress: {
          line1: 'line',
          city: 'city',
          country: 'country',
          postalCode: '12345',
        },
      }),
    ).rejects.toMatchObject({ code: 'INSUFFICIENT_STOCK' });
  });
});
