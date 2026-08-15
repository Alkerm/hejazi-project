import 'fastify';
import { UserRole } from '@prisma/client';

declare module 'fastify' {
  interface FastifyRequest {
    user?: any;
    auth?: {
      userId: string;
      role: UserRole;
      sessionId: string;
    };
  }
}
