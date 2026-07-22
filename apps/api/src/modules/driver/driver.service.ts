import { prisma } from '../../prisma/client';
import { AppError } from '../../utils/app-error';

export class DriverService {
  /**
   * Get all orders ready for delivery pickup (status = PROCESSING or CONFIRMED)
   */
  static async getAvailableDeliveries() {
    return await prisma.order.findMany({
      where: {
        status: { in: ['CONFIRMED', 'PROCESSING'] },
        driverName: null,
      },
      include: {
        user: { select: { firstName: true, lastName: true, email: true, phone: true } },
        items: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Get active deliveries assigned to a specific driver
   */
  static async getMyAssignedDeliveries(driverName: string) {
    return await prisma.order.findMany({
      where: {
        driverName,
        status: { in: ['PROCESSING', 'SHIPPED'] },
      },
      include: {
        user: { select: { firstName: true, lastName: true, email: true, phone: true } },
        items: true,
      },
      orderBy: { assignedAt: 'desc' },
    });
  }

  /**
   * Claim / Assign order to a driver
   */
  static async assignDriver(orderId: string, driverName: string, driverPhone?: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');

    return await prisma.order.update({
      where: { id: orderId },
      data: {
        driverName: driverName.trim(),
        driverPhone: driverPhone ? driverPhone.trim() : null,
        assignedAt: new Date(),
        status: 'SHIPPED', // Out for Delivery
      },
      include: { items: true },
    });
  }

  /**
   * Mark delivery completed & collect payment if COD
   */
  static async completeDelivery(orderId: string, driverName: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');

    const isCod = order.paymentMethod === 'COD' || order.paymentStatus === 'UNPAID';

    return await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'DELIVERED',
        paymentStatus: 'PAID',
        deliveredAt: new Date(),
      },
      include: { items: true },
    });
  }
}
