import 'fastify';
import { UserRole } from '@prisma/client';

declare module 'fastify' {
  interface FastifyRequest {
    auth?: {
      userId: string;
      role: UserRole;
      sessionId: string;
    };
  }
}
