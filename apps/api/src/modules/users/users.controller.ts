import { FastifyReply, FastifyRequest } from 'fastify';
import { requireAuth } from '../../middleware/auth';
import { ok } from '../../utils/response';
import { updateProfileSchema } from './users.schemas';
import { getMyProfile, updateMyProfile } from './users.service';

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
