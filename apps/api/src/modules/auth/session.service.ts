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
  reply.setCookie(env.COOKIE_NAME, sessionId, {
    path: '/',
    httpOnly: true,
    secure: isProd || env.COOKIE_SAME_SITE === 'none',
    sameSite: env.COOKIE_SAME_SITE,
    signed: true,
    maxAge: env.SESSION_TTL_SECONDS,
    domain: env.COOKIE_DOMAIN,
  });
};

export const clearAuthCookie = (reply: FastifyReply) => {
  reply.clearCookie(env.COOKIE_NAME, {
    path: '/',
    domain: env.COOKIE_DOMAIN,
  });
};

export const getSignedCookieSessionId = (request: FastifyRequest): string | null => {
  const cookieValue = request.cookies[env.COOKIE_NAME];
  if (!cookieValue) return null;

  const unsigned = request.unsignCookie(cookieValue);
  if (!unsigned.valid) return null;
  return unsigned.value;
};
