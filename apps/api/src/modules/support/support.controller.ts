import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { SupportService } from './support.service';
import { TicketStatus } from '@prisma/client';

const createTicketSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(3),
  message: z.string().min(5),
});

const updateTicketSchema = z.object({
  status: z.nativeEnum(TicketStatus),
  adminNote: z.string().optional(),
});

export const createTicketHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  const userId = req.user?.id;
  const parseResult = createTicketSchema.safeParse(req.body);

  if (!parseResult.success) {
    return reply.status(400).send({ error: 'Invalid request body', details: parseResult.error.format() });
  }

  try {
    const ticket = await SupportService.createTicket({
      ...parseResult.data,
      userId,
    });
    return reply.send({ success: true, data: ticket });
  } catch (err: any) {
    return reply.status(400).send({ error: err.message || 'Failed to submit support ticket' });
  }
};

export const adminListTicketsHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  if (req.user?.role !== 'ADMIN') {
    return reply.status(403).send({ error: 'Forbidden' });
  }

  try {
    const data = await SupportService.adminListTickets();
    return reply.send({ success: true, data });
  } catch (err: any) {
    return reply.status(500).send({ error: err.message || 'Failed to list support tickets' });
  }
};

export const adminUpdateTicketHandler = async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  if (req.user?.role !== 'ADMIN') {
    return reply.status(403).send({ error: 'Forbidden' });
  }

  const { id } = req.params;
  const parseResult = updateTicketSchema.safeParse(req.body);

  if (!parseResult.success) {
    return reply.status(400).send({ error: 'Invalid request body', details: parseResult.error.format() });
  }

  try {
    const ticket = await SupportService.adminUpdateTicketStatus(
      id,
      parseResult.data.status,
      parseResult.data.adminNote
    );
    return reply.send({ success: true, data: ticket });
  } catch (err: any) {
    return reply.status(400).send({ error: err.message || 'Failed to update ticket status' });
  }
};
