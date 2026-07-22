import { FastifyReply, FastifyRequest } from 'fastify';
import { ok } from '../../utils/response';
import { loginSchema, registerSchema } from './auth.schemas';
import { getCurrentUser, loginUser, logoutUser, registerUser, requestPasswordReset, resetPassword } from './auth.service';
import { clearAuthCookie, getSignedCookieSessionId, setAuthCookie } from './session.service';
import { requireAuth } from '../../middleware/auth';

const publicUser = (user: {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  marketingConsent: boolean;
  role: 'USER' | 'ADMIN';
}) => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  phone: user.phone,
  marketingConsent: user.marketingConsent,
  role: user.role,
});

export const registerHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const payload = registerSchema.parse(request.body);
  const { user, sessionId } = await registerUser(payload);
  setAuthCookie(reply, sessionId);
  return ok(reply, publicUser(user), 201);
};

export const loginHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const payload = loginSchema.parse(request.body);
  const { user, sessionId } = await loginUser(payload);
  setAuthCookie(reply, sessionId);
  return ok(reply, publicUser(user));
};

export const logoutHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const sessionId = getSignedCookieSessionId(request);
  if (sessionId) {
    await logoutUser(sessionId);
  }
  clearAuthCookie(reply);
  return ok(reply, { loggedOut: true });
};

export const meHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  await requireAuth(request, reply);
  const user = await getCurrentUser(request.auth!.userId);

  return ok(reply, {
    ...publicUser(user),
    defaultAddress: user.addresses[0] ?? null,
  });
};

export const forgotPasswordHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const body = request.body as { email?: string };
  if (!body?.email) {
    return reply.status(400).send({ error: 'Email is required' });
  }

  const result = await requestPasswordReset(body.email);
  return ok(reply, result);
};

export const resetPasswordHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const body = request.body as { token?: string; newPassword?: string };
  if (!body?.token || !body?.newPassword || body.newPassword.length < 6) {
    return reply.status(400).send({ error: 'Valid token and new password (min 6 chars) are required' });
  }

  const result = await resetPassword(body.token, body.newPassword);
  return ok(reply, result);
};
