import { prisma } from '../../prisma/client';
import { TicketStatus } from '@prisma/client';

export interface CreateTicketInput {
  userId?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
}

export class SupportService {
  /**
   * Submit a new customer support ticket
   */
  static async createTicket(input: CreateTicketInput) {
    const { userId, name, email, subject, message } = input;

    if (!name || !email || !subject || !message) {
      throw new Error('All contact fields (name, email, subject, message) are required');
    }

    return await prisma.supportTicket.create({
      data: {
        userId: userId || null,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject.trim(),
        message: message.trim(),
        status: 'OPEN',
      },
    });
  }

  /**
   * Admin list all support tickets
   */
  static async adminListTickets() {
    return await prisma.supportTicket.findMany({
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Admin update support ticket status & add resolution notes
   */
  static async adminUpdateTicketStatus(id: string, status: TicketStatus, adminNote?: string) {
    const ticket = await prisma.supportTicket.findUnique({ where: { id } });
    if (!ticket) throw new Error('Support ticket not found');

    return await prisma.supportTicket.update({
      where: { id },
      data: {
        status,
        adminNote: adminNote ?? ticket.adminNote,
      },
    });
  }
}
