import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { ReviewsService } from './reviews.service';

const submitReviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

const moderateSchema = z.object({
  isApproved: z.boolean(),
});

export const getProductReviewsHandler = async (
  req: FastifyRequest<{ Params: { productId: string } }>,
  reply: FastifyReply
) => {
  const { productId } = req.params;
  try {
    const data = await ReviewsService.getProductReviews(productId);
    return reply.send({ success: true, data });
  } catch (err: any) {
    return reply.status(500).send({ error: err.message || 'Failed to fetch reviews' });
  }
};

export const submitReviewHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  const userId = req.user?.id;
  if (!userId) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }

  const parseResult = submitReviewSchema.safeParse(req.body);
  if (!parseResult.success) {
    return reply.status(400).send({ error: 'Invalid request body', details: parseResult.error.format() });
  }

  try {
    const review = await ReviewsService.submitReview({
      ...parseResult.data,
      userId,
    });
    return reply.send({ success: true, data: review });
  } catch (err: any) {
    return reply.status(400).send({ error: err.message || 'Failed to submit review' });
  }
};

export const adminListReviewsHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  if (req.user?.role !== 'ADMIN') {
    return reply.status(403).send({ error: 'Forbidden' });
  }

  try {
    const data = await ReviewsService.adminListReviews();
    return reply.send({ success: true, data });
  } catch (err: any) {
    return reply.status(500).send({ error: err.message || 'Failed to list reviews' });
  }
};

export const adminModerateReviewHandler = async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  if (req.user?.role !== 'ADMIN') {
    return reply.status(403).send({ error: 'Forbidden' });
  }

  const { id: reviewId } = req.params;
  const parseResult = moderateSchema.safeParse(req.body);
  if (!parseResult.success) {
    return reply.status(400).send({ error: 'Invalid request body', details: parseResult.error.format() });
  }

  try {
    const review = await ReviewsService.adminModerateReview(reviewId, parseResult.data.isApproved);
    return reply.send({ success: true, data: review });
  } catch (err: any) {
    return reply.status(400).send({ error: err.message || 'Failed to moderate review' });
  }
};
