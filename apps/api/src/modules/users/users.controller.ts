import { FastifyReply, FastifyRequest } from 'fastify';
import { requireAuth } from '../../middleware/auth';
import { ok } from '../../utils/response';
import { updateProfileSchema } from './users.schemas';
import { getMyProfile, updateMyProfile, deleteMyProfile } from './users.service';
import { clearAuthCookie, deleteSession } from '../auth/session.service';

export const getMeProfileHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  await requireAuth(request, reply);
  const profile = await getMyProfile(request.auth!.userId);
  return ok(reply, profile);
};

export const updateMeProfileHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  await requireAuth(request, reply);
  const payload = updateProfileSchema.parse(request.body);
  const profile = await updateMyProfile(request.auth!.userId, payload);
  return ok(reply, profile);
};

export const deleteMeProfileHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  await requireAuth(request, reply);
  const userId = request.auth!.userId;
  const sessionId = request.auth!.sessionId;

  const result = await deleteMyProfile(userId);
  
  if (sessionId) {
    await deleteSession(sessionId);
  }
  clearAuthCookie(reply);

  return ok(reply, result);
};
