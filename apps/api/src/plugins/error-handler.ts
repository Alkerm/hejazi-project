import { FastifyInstance } from 'fastify';
import { ZodError } from 'zod';
import { AppError } from '../utils/app-error';

export const registerErrorHandler = (app: FastifyInstance) => {
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          requestId: request.id,
          details: error.flatten(),
        },
      });
    }

    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          requestId: request.id,
        },
      });
    }

    request.log.error(error);

    return reply.status(500).send({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Something went wrong',
        requestId: request.id,
      },
    });
  });
};
