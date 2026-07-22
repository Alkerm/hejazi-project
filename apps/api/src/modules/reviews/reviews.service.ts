import { prisma } from '../../prisma/client';

export interface SubmitReviewInput {
  userId: string;
  productId: string;
  rating: number;
  comment?: string;
}

export class ReviewsService {
  /**
   * Submit a customer review (auto-approves if no moderation queue enabled, or defaults to pending approval)
   */
  static async submitReview(input: SubmitReviewInput) {
    const { userId, productId, rating, comment } = input;

    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be an integer between 1 and 5');
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new Error('Product not found');
    }

    // Optional: Check if user already reviewed
    const existingReview = await prisma.review.findFirst({
      where: { userId, productId },
    });

    if (existingReview) {
      // Update existing review
      return await prisma.review.update({
        where: { id: existingReview.id },
        data: {
          rating,
          comment,
          isApproved: true, // Default auto-approve for streamlined demo
        },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      });
    }

    return await prisma.review.create({
      data: {
        userId,
        productId,
        rating,
        comment,
        isApproved: true,
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });
  }

  /**
   * Get approved reviews & average rating score for a product
   */
  static async getProductReviews(productId: string) {
    const reviews = await prisma.review.findMany({
      where: {
        productId,
        isApproved: true,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1))
        : 0;

    const breakdown = {
      5: reviews.filter((r) => r.rating === 5).length,
      4: reviews.filter((r) => r.rating === 4).length,
      3: reviews.filter((r) => r.rating === 3).length,
      2: reviews.filter((r) => r.rating === 2).length,
      1: reviews.filter((r) => r.rating === 1).length,
    };

    return {
      reviews,
      summary: {
        totalReviews,
        averageRating,
        breakdown,
      },
    };
  }

  /**
   * Admin list all reviews for moderation
   */
  static async adminListReviews() {
    return await prisma.review.findMany({
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        product: { select: { id: true, name: true, slug: true, imageUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Admin approve or unapprove review
   */
  static async adminModerateReview(reviewId: string, isApproved: boolean) {
    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new Error('Review not found');

    return await prisma.review.update({
      where: { id: reviewId },
      data: { isApproved },
    });
  }
}
