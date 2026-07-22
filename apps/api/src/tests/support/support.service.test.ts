import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../prisma/client', () => ({
  prisma: {
    supportTicket: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { SupportService } from '../../modules/support/support.service';
import { prisma } from '../../prisma/client';

describe('SupportService Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createTicket creates a new support inquiry', async () => {
    vi.mocked(prisma.supportTicket.create).mockResolvedValue({
      id: 't1',
      name: 'Nora',
      email: 'nora@example.com',
      subject: 'Allergy Question',
      message: 'Is this hair oil safe for sensitive scalps?',
      status: 'OPEN',
    } as any);

    const ticket = await SupportService.createTicket({
      name: 'Nora',
      email: 'nora@example.com',
      subject: 'Allergy Question',
      message: 'Is this hair oil safe for sensitive scalps?',
    });

    expect(prisma.supportTicket.create).toHaveBeenCalled();
    expect(ticket.id).toBe('t1');
  });

  it('adminUpdateTicketStatus updates ticket status and notes', async () => {
    vi.mocked(prisma.supportTicket.findUnique).mockResolvedValue({ id: 't1', status: 'OPEN' } as any);
    vi.mocked(prisma.supportTicket.update).mockResolvedValue({
      id: 't1',
      status: 'RESOLVED',
      adminNote: 'Answered via email',
    } as any);

    const result = await SupportService.adminUpdateTicketStatus('t1', 'RESOLVED' as any, 'Answered via email');
    expect(prisma.supportTicket.update).toHaveBeenCalledWith({
      where: { id: 't1' },
      data: { status: 'RESOLVED', adminNote: 'Answered via email' },
    });
    expect(result.status).toBe('RESOLVED');
  });
});
