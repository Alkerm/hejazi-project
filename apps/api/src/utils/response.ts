import { FastifyReply } from 'fastify';

export const ok = <T>(reply: FastifyReply, data: T, statusCode = 200) => {
  return reply.status(statusCode).send({
    success: true,
    data,
  });
};
