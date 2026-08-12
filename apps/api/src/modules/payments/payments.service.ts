import { prisma } from '../../prisma/client';
import { PaymentStatus } from '@prisma/client';
import { PaymentMethodType } from './payments.types';

export interface CreatePaymentIntentInput {
  orderId: string;
  userId: string;
  paymentMethod: PaymentMethodType;
}

export interface WebhookCallbackInput {
  gateway: string;
  transactionId: string;
  orderId: string;
  amount: number;
  status: 'PAID' | 'FAILED';
  idempotencyKey?: string;
  rawResponse?: Record<string, unknown>;
}

export class PaymentsService {
  /**
   * Initialize or fetch payment intent for an active order
   */
  static async createPaymentIntent(input: CreatePaymentIntentInput) {
    const { orderId, userId, paymentMethod } = input;

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { items: true },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      throw new Error('Order is already paid');
    }

    // For Cash on Delivery (COD)
    if (paymentMethod === PaymentMethodType.COD) {
      const transaction = await prisma.paymentTransaction.create({
        data: {
          orderId: order.id,
          gateway: 'COD',
          amount: order.total,
          currency: order.currency,
          status: PaymentStatus.PENDING,
          rawResponse: { message: 'Cash on Delivery selected' },
        },
      });

      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentMethod: PaymentMethodType.COD,
          paymentMethodLabel: 'Cash on Delivery',
        },
      });

      return {
        paymentStatus: PaymentStatus.PENDING,
        paymentMethod: 'COD',
        transactionId: transaction.id,
        redirectUrl: null,
      };
    }

    // Online Gateways (Moyasar / Stripe / Tap)
    // Generate transaction intent
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const transaction = await prisma.paymentTransaction.create({
      data: {
        orderId: order.id,
        gateway: paymentMethod,
        transactionId,
        amount: order.total,
        currency: order.currency,
        status: PaymentStatus.PENDING,
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentMethod,
        paymentMethodLabel: paymentMethod.replace('_', ' '),
        paymentStatus: PaymentStatus.PENDING,
      },
    });

    return {
      paymentStatus: PaymentStatus.PENDING,
      paymentMethod,
      transactionId: transaction.id,
      gatewayReference: transactionId,
      // Checkout payment session payload
      clientSecret: `sec_${transactionId}`,
    };
  }

  /**
   * Process payment provider webhook callbacks idempotently
   */
  static async processWebhookCallback(input: WebhookCallbackInput) {
    const { gateway, transactionId, orderId, amount, status, idempotencyKey, rawResponse } = input;

    // Check idempotency if provided
    if (idempotencyKey) {
      const existingTx = await prisma.paymentTransaction.findUnique({
        where: { idempotencyKey },
      });
      if (existingTx && existingTx.status === PaymentStatus.PAID) {
        return { success: true, duplicate: true, transaction: existingTx };
      }
    }

    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId } });
      if (!order) {
        throw new Error(`Order ${orderId} not found`);
      }

      const targetPaymentStatus = status === 'PAID' ? PaymentStatus.PAID : PaymentStatus.FAILED;

      // Log/update payment transaction
      const transaction = await tx.paymentTransaction.create({
        data: {
          orderId,
          gateway,
          transactionId,
          idempotencyKey,
          amount,
          status: targetPaymentStatus,
          rawResponse: rawResponse as any,
        },
      });

      // Update Order Payment Status atomically
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: targetPaymentStatus,
          status: targetPaymentStatus === PaymentStatus.PAID ? 'CONFIRMED' : order.status,
        },
      });

      return { success: true, duplicate: false, transaction, order: updatedOrder };
    });
  }

  /**
   * Admin refund handler
   */
  static async refundPayment(orderId: string, adminUserId: string, reason?: string) {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId } });
      if (!order) throw new Error('Order not found');

      if (order.paymentStatus !== PaymentStatus.PAID) {
        throw new Error('Only paid orders can be refunded');
      }

      const refundNoteNumber = `REF-${Date.now()}`;

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: PaymentStatus.REFUNDED,
          status: 'CANCELLED',
          refundNoteNumber,
          refundIssuedAt: new Date(),
        },
      });

      await tx.paymentTransaction.create({
        data: {
          orderId,
          gateway: order.paymentMethod,
          amount: order.total,
          status: PaymentStatus.REFUNDED,
          rawResponse: { reason, refundedBy: adminUserId },
        },
      });

      await tx.adminAuditLog.create({
        data: {
          adminUserId,
          action: 'REFUND_PAYMENT',
          entityType: 'ORDER',
          entityId: orderId,
          metadata: { reason, refundNoteNumber, amount: order.total },
        },
      });

      return updatedOrder;
    });
  }
}
