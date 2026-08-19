import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../prisma/client', () => ({
  prisma: {
    user: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    order: {
      groupBy: vi.fn(),
      count: vi.fn(),
      aggregate: vi.fn(),
    },
    orderItem: {
      groupBy: vi.fn(),
    },
    adminAuditLog: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

import { getAdminCustomersOverview } from '../../modules/admin/admin.service';
import { prisma } from '../../prisma/client';

describe('Admin Customers Overview Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns overview metrics and customer directory without crashing', async () => {
    vi.mocked(prisma.order.groupBy).mockResolvedValue([
      { userId: 'u1', _sum: { total: 500 as any }, _count: { id: 3 } as any },
    ] as any);

    vi.mocked(prisma.user.findMany).mockResolvedValue([
      {
        id: 'u1',
        firstName: 'Ahmed',
        lastName: 'Al-Salem',
        email: 'ahmed@example.com',
        phone: '+966500000000',
        role: 'USER',
        marketingConsent: true,
        createdAt: new Date(),
        addresses: [{ city: 'Riyadh', country: 'Saudi Arabia', line1: 'King Fahd Rd' }],
        orders: [{ id: 'o1', total: 500 as any, paymentStatus: 'PAID' }],
      },
    ] as any);

    vi.mocked(prisma.user.count).mockResolvedValue(10);
    vi.mocked(prisma.$transaction).mockResolvedValue([
      [
        {
          id: 'u1',
          firstName: 'Ahmed',
          lastName: 'Al-Salem',
          email: 'ahmed@example.com',
          phone: '+966500000000',
          role: 'USER',
          marketingConsent: true,
          createdAt: new Date(),
          addresses: [{ city: 'Riyadh', country: 'Saudi Arabia', line1: 'King Fahd Rd' }],
          orders: [{ id: 'o1', total: 500 as any, paymentStatus: 'PAID' }],
        },
      ],
      1,
    ] as any);

    const result = await getAdminCustomersOverview({
      page: 1,
      pageSize: 15,
      role: 'USER',
    });

    expect(result).toBeDefined();
    expect(result.metrics).toBeDefined();
    expect(result.directory.items.length).toBe(1);
    expect(result.directory.items[0].email).toBe('ahmed@example.com');
  });
});
