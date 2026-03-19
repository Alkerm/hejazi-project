import { FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from '../utils/app-error';
import { getSignedCookieSessionId, getSession, refreshSessionTtl } from '../modules/auth/session.service';

export const requireAuth = async (request: FastifyRequest, _reply: FastifyReply) => {
  const sessionId = getSignedCookieSessionId(request);
  if (!sessionId) {
    throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
  }

  const session = await getSession(sessionId);
  if (!session) {
    throw new AppError('Session expired', 401, 'SESSION_EXPIRED');
  }

  await refreshSessionTtl(sessionId);

  request.auth = {
    userId: session.userId,
    role: session.role,
    sessionId,
  };
};

export const requireAdmin = async (request: FastifyRequest, _reply: FastifyReply) => {
  await requireAuth(request, _reply);

  if (request.auth?.role !== 'ADMIN') {
    throw new AppError('Admin access required', 403, 'FORBIDDEN');
  }
};
