import { FastifyReply, FastifyRequest } from 'fastify';
import { requireAdmin } from '../../middleware/auth';
import { ok } from '../../utils/response';
import { policySlugParamSchema, updatePolicySchema } from './policies.schemas';
import {
  getStorePoliciesService,
  getStorePolicyBySlugService,
  updateStorePolicyService,
  resetStorePolicyToDefaultService,
} from './policies.service';

export const listPoliciesHandler = async (_request: FastifyRequest, reply: FastifyReply) => {
  const data = await getStorePoliciesService();
  return ok(reply, data);
};

export const getPolicyBySlugHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const { slug } = policySlugParamSchema.parse(request.params);
  const data = await getStorePolicyBySlugService(slug);
  return ok(reply, data);
};

export const adminUpdatePolicyHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  await requireAdmin(request, reply);
  const { slug } = policySlugParamSchema.parse(request.params);
  const payload = updatePolicySchema.parse(request.body);
  const data = await updateStorePolicyService(request.auth!.userId, slug, payload);
  return ok(reply, data);
};

export const adminResetPolicyHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  await requireAdmin(request, reply);
  const { slug } = policySlugParamSchema.parse(request.params);
  const data = await resetStorePolicyToDefaultService(request.auth!.userId, slug);
  return ok(reply, data);
};
