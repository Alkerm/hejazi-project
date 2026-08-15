import crypto from 'node:crypto';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { UserRole } from '@prisma/client';
import { env, isProd } from '../../config/env';
import { redis } from '../../config/redis';

interface SessionPayload {
  userId: string;
  role: UserRole;
}

const key = (sessionId: string) => `sess:${sessionId}`;

export const createSession = async (payload: SessionPayload) => {
  const sessionId = crypto.randomBytes(32).toString('hex');
  await redis.setex(key(sessionId), env.SESSION_TTL_SECONDS, JSON.stringify(payload));
  return sessionId;
};

export const getSession = async (sessionId: string): Promise<SessionPayload | null> => {
  const raw = await redis.get(key(sessionId));
  if (!raw) return null;
  return JSON.parse(raw) as SessionPayload;
};

export const refreshSessionTtl = async (sessionId: string) => {
  await redis.expire(key(sessionId), env.SESSION_TTL_SECONDS);
};

export const deleteSession = async (sessionId: string) => {
  await redis.del(key(sessionId));
};

export const setAuthCookie = (reply: FastifyReply, sessionId: string) => {
  const isSubdomain = isProd || env.CORS_ORIGIN?.includes('halflink.sa');
  const domain = env.COOKIE_DOMAIN || (isSubdomain ? '.halflink.sa' : undefined);

  reply.setCookie(env.COOKIE_NAME, sessionId, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    signed: true,
    maxAge: env.SESSION_TTL_SECONDS,
    domain,
  });

  reply.setCookie(`${env.COOKIE_NAME}_hint`, '1', {
    path: '/',
    secure: true,
    sameSite: 'none',
    maxAge: env.SESSION_TTL_SECONDS,
    domain,
  });
};

export const clearAuthCookie = (reply: FastifyReply) => {
  const isSubdomain = isProd || env.CORS_ORIGIN?.includes('halflink.sa');
  const domain = env.COOKIE_DOMAIN || (isSubdomain ? '.halflink.sa' : undefined);

  reply.clearCookie(env.COOKIE_NAME, {
    path: '/',
    sameSite: 'none',
    secure: true,
    httpOnly: true,
    domain,
  });

  reply.clearCookie(`${env.COOKIE_NAME}_hint`, {
    path: '/',
    sameSite: 'none',
    secure: true,
    domain,
  });
};

export const getSignedCookieSessionId = (request: FastifyRequest): string | null => {
  // 1. Check Authorization Bearer header (100% immune to browser cross-domain cookie restrictions)
  const authHeader = request.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token) return token;
  }

  // 2. Check signed cookie
  const cookieValue = request.cookies[env.COOKIE_NAME];
  if (!cookieValue) return null;

  const unsigned = request.unsignCookie(cookieValue);
  if (unsigned.valid && unsigned.value) return unsigned.value;

  // 3. Fallback to raw cookie value if already unsigned
  return cookieValue;
};
