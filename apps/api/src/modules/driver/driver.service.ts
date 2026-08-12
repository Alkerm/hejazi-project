import { prisma } from '../../prisma/client';
import { AppError } from '../../utils/app-error';
import { hashPassword } from '../../utils/password';

export class DriverService {
  /**
   * Get all registered drivers (role = DRIVER)
   */
  static async getRegisteredDrivers() {
    return await prisma.user.findMany({
      where: { role: 'DRIVER' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        _count: {
          select: { driverOrders: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Admin creates a new driver account
   */
  static async createDriverAccount(payload: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }) {
    const emailLower = payload.email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email: emailLower } });
    if (existing) {
      throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');
    }

    const passwordHash = await hashPassword(payload.password);
    return await prisma.user.create({
      data: {
        firstName: payload.firstName.trim(),
        lastName: payload.lastName.trim(),
        email: emailLower,
        phone: payload.phone.trim(),
        passwordHash,
        role: 'DRIVER',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });
  }

  /**
   * Assign an order specifically to a registered driver
   */
  static async assignDriverToOrder(orderId: string, driverId: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');

    const driver = await prisma.user.findFirst({
      where: { id: driverId, role: 'DRIVER' },
    });
    if (!driver) throw new AppError('Registered driver not found', 404, 'DRIVER_NOT_FOUND');

    const driverFullName = `${driver.firstName} ${driver.lastName}`.trim();

    return await prisma.order.update({
      where: { id: orderId },
      data: {
        driverId: driver.id,
        driverName: driverFullName,
        driverPhone: driver.phone || null,
        assignedAt: new Date(),
        status: 'SHIPPED', // Out for delivery
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        driver: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        items: true,
      },
    });
  }

  /**
   * Get all delivery orders overview for Admin (Only orders ready for dispatch or beyond)
   */
  static async getDeliveryOverview() {
    return await prisma.order.findMany({
      where: {
        status: { in: ['PROCESSING', 'SHIPPED', 'DELIVERED'] },
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        driver: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get all orders ready for delivery pickup (unassigned & in Ready to Dispatch status)
   */
  static async getAvailableDeliveries() {
    return await prisma.order.findMany({
      where: {
        status: 'PROCESSING',
        driverId: null,
      },
      include: {
        user: { select: { firstName: true, lastName: true, email: true, phone: true } },
        items: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Get active deliveries assigned to a specific driver (by driverId or name/email)
   */
  static async getMyAssignedDeliveries(driverIdentifier: string) {
    return await prisma.order.findMany({
      where: {
        OR: [
          { driverId: driverIdentifier },
          { driverName: { contains: driverIdentifier, mode: 'insensitive' } },
        ],
        status: { in: ['PROCESSING', 'SHIPPED', 'DELIVERED'] },
      },
      include: {
        user: { select: { firstName: true, lastName: true, email: true, phone: true } },
        driver: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        items: true,
      },
      orderBy: { assignedAt: 'desc' },
    });
  }

  /**
   * Backward-compatible assign driver method by name
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
        status: 'SHIPPED',
      },
      include: { items: true },
    });
  }

  /**
   * Mark delivery completed & collect payment if COD
   */
  static async completeDelivery(orderId: string, driverName?: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');

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
