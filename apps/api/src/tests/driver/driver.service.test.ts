import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../prisma/client', () => ({
  prisma: {
    order: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { DriverService } from '../../modules/driver/driver.service';
import { prisma } from '../../prisma/client';

describe('DriverService Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('assignDriver assigns driver and sets status to SHIPPED', async () => {
    vi.mocked(prisma.order.findUnique).mockResolvedValue({ id: 'ord-1' } as any);
    vi.mocked(prisma.order.update).mockResolvedValue({
      id: 'ord-1',
      driverName: 'Sami',
      status: 'SHIPPED',
    } as any);

    const order = await DriverService.assignDriver('ord-1', 'Sami', '0501234567');
    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: 'ord-1' },
      data: expect.objectContaining({
        driverName: 'Sami',
        driverPhone: '0501234567',
        status: 'SHIPPED',
      }),
      include: { items: true },
    });
    expect(order.driverName).toBe('Sami');
  });

  it('completeDelivery updates order to DELIVERED and payment to PAID', async () => {
    vi.mocked(prisma.order.findUnique).mockResolvedValue({ id: 'ord-1', paymentMethod: 'COD' } as any);
    vi.mocked(prisma.order.update).mockResolvedValue({
      id: 'ord-1',
      status: 'DELIVERED',
      paymentStatus: 'PAID',
    } as any);

    const result = await DriverService.completeDelivery('ord-1', 'Sami');
    expect(result.status).toBe('DELIVERED');
    expect(result.paymentStatus).toBe('PAID');
  });
});
