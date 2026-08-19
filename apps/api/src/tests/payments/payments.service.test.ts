import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../prisma/client', () => ({
  prisma: {
    order: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    paymentTransaction: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
    adminAuditLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

import { PaymentsService } from '../../modules/payments/payments.service';
import { prisma } from '../../prisma/client';
import { PaymentStatus, PaymentMethodType } from '@prisma/client';

describe('PaymentsService Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should process webhook callback and update order payment status idempotently', async () => {
    const mockOrder = {
      id: 'ord_123',
      userId: 'usr_123',
      total: 150.0,
      currency: 'SAR',
      paymentStatus: PaymentStatus.PENDING,
      status: 'PENDING',
    };

    const mockTransaction = {
      id: 'tx_123',
      orderId: 'ord_123',
      gateway: 'MADA',
      amount: 150.0,
      status: PaymentStatus.PAID,
      idempotencyKey: 'key_123',
    };

    vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => {
      return cb({
        order: {
          findUnique: vi.fn().mockResolvedValue(mockOrder),
          update: vi.fn().mockResolvedValue({ ...mockOrder, paymentStatus: PaymentStatus.PAID, status: 'CONFIRMED' }),
        },
        paymentTransaction: {
          create: vi.fn().mockResolvedValue(mockTransaction),
        },
      });
    });

    const result = await PaymentsService.processWebhookCallback({
      gateway: 'MADA',
      transactionId: 'txn_mada_999',
      orderId: 'ord_123',
      amount: 150.0,
      status: 'PAID',
      idempotencyKey: 'key_123',
    });

    expect(result.success).toBe(true);
    expect(result.order.paymentStatus).toBe(PaymentStatus.PAID);
    expect(result.order.status).toBe('CONFIRMED');
  });

  it('should handle duplicate webhook callback idempotently', async () => {
    const existingTx = {
      id: 'tx_existing',
      orderId: 'ord_123',
      gateway: 'MADA',
      status: PaymentStatus.PAID,
      idempotencyKey: 'key_123',
    };

    vi.mocked(prisma.paymentTransaction.findUnique).mockResolvedValue(existingTx as any);

    const result = await PaymentsService.processWebhookCallback({
      gateway: 'MADA',
      transactionId: 'txn_mada_999',
      orderId: 'ord_123',
      amount: 150.0,
      status: 'PAID',
      idempotencyKey: 'key_123',
    });

    expect(result.success).toBe(true);
    expect(result.duplicate).toBe(true);
  });

  it('should verify client payment transaction and confirm order', async () => {
    const mockOrder = {
      id: 'ord_456',
      userId: 'usr_456',
      total: 299.0,
      currency: 'SAR',
      paymentStatus: PaymentStatus.PENDING,
      status: 'PENDING',
    };

    const mockTransaction = {
      id: 'tx_456',
      orderId: 'ord_456',
      gateway: 'MOYASAR_SANDBOX',
      amount: 299.0,
      status: PaymentStatus.PAID,
    };

    vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => {
      return cb({
        order: {
          findFirst: vi.fn().mockResolvedValue(mockOrder),
          update: vi.fn().mockResolvedValue({
            ...mockOrder,
            paymentStatus: PaymentStatus.PAID,
            status: 'CONFIRMED',
            paymentMethod: 'MADA',
            paymentMethodLabel: 'MADA',
            items: [],
          }),
        },
        paymentTransaction: {
          create: vi.fn().mockResolvedValue(mockTransaction),
        },
      });
    });

    const result = await PaymentsService.verifyPayment({
      orderId: 'ord_456',
      userId: 'usr_456',
      paymentMethod: PaymentMethodType.MADA,
      transactionId: 'txn_test_789',
      gateway: 'MOYASAR_SANDBOX',
      status: 'PAID',
    });

    expect(result.success).toBe(true);
    expect(result.order.paymentStatus).toBe(PaymentStatus.PAID);
    expect(result.order.status).toBe('CONFIRMED');
  });
});

