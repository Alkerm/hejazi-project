import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { WishlistService } from './wishlist.service';

const toggleWishlistSchema = z.object({
  productId: z.string().min(1),
});

export const getWishlistHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  const userId = req.user?.id;
  if (!userId) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }

  try {
    const wishlist = await WishlistService.getUserWishlist(userId);
    return reply.send({ success: true, data: wishlist });
  } catch (err: any) {
    return reply.status(500).send({ error: err.message || 'Failed to fetch wishlist' });
  }
};

export const toggleWishlistHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  const userId = req.user?.id;
  if (!userId) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }

  const parseResult = toggleWishlistSchema.safeParse(req.body);
  if (!parseResult.success) {
    return reply.status(400).send({ error: 'Invalid request body', details: parseResult.error.format() });
  }

  try {
    const result = await WishlistService.toggleWishlistItem(userId, parseResult.data.productId);
    return reply.send({ success: true, data: result });
  } catch (err: any) {
    return reply.status(400).send({ error: err.message || 'Failed to toggle wishlist item' });
  }
};
