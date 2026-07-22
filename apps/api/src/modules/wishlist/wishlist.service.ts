import { prisma } from '../../prisma/client';

export class WishlistService {
  /**
   * Fetch customer wishlist with full product details
   */
  static async getUserWishlist(userId: string) {
    let wishlist = await prisma.wishlist.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });
    }

    return wishlist;
  }

  /**
   * Toggle product in user's wishlist (Add if absent, remove if present)
   */
  static async toggleWishlistItem(userId: string, productId: string) {
    // Ensure user has a wishlist record
    const wishlist = await this.getUserWishlist(userId);

    const existingItem = await prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId,
        },
      },
    });

    if (existingItem) {
      // Remove from wishlist
      await prisma.wishlistItem.delete({
        where: { id: existingItem.id },
      });
      const updatedWishlist = await this.getUserWishlist(userId);
      return { isWishlisted: false, wishlist: updatedWishlist };
    } else {
      // Ensure product exists
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });
      if (!product) {
        throw new Error('Product not found');
      }

      // Add to wishlist
      await prisma.wishlistItem.create({
        data: {
          wishlistId: wishlist.id,
          productId,
        },
      });
      const updatedWishlist = await this.getUserWishlist(userId);
      return { isWishlisted: true, wishlist: updatedWishlist };
    }
  }
}
