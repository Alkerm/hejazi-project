import { prisma } from '../../prisma/client';
import { AppError } from '../../utils/app-error';
import { toMoney } from '../../utils/money';
import { ensureCart, getCartByUserId, getCartItem } from './cart.repository';

const mapCart = (cart: Awaited<ReturnType<typeof getCartByUserId>>) => {
  if (!cart) {
    return {
      id: null,
      items: [],
      summary: { subtotal: 0, totalItems: 0 },
    };
  }

  const items = cart.items.map((item) => {
    const unitPrice = Number(item.product.price);
    const lineTotal = toMoney(unitPrice * item.quantity);

    return {
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        imageUrl: item.product.imageUrl,
        price: unitPrice,
        stockQuantity: item.product.stockQuantity,
        isActive: item.product.isActive,
      },
      lineTotal,
    };
  });

  const subtotal = toMoney(items.reduce((sum, item) => sum + item.lineTotal, 0));
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    id: cart.id,
    items,
    summary: {
      subtotal,
      totalItems,
    },
  };
};

export const fetchMyCart = async (userId: string) => {
  const cart = await getCartByUserId(userId);
  return mapCart(cart);
};

export const addCartItem = async (userId: string, payload: { productId: string; quantity: number }) => {
  const product = await prisma.product.findUnique({ where: { id: payload.productId } });
  if (!product || !product.isActive) {
    throw new AppError('Product unavailable', 404, 'PRODUCT_UNAVAILABLE');
  }

  if (payload.quantity > product.stockQuantity) {
    throw new AppError('Quantity exceeds stock', 400, 'INSUFFICIENT_STOCK');
  }

  const cart = await ensureCart(userId);

  const existing = await prisma.cartItem.findUnique({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId: payload.productId,
      },
    },
  });

  if (existing) {
    const nextQty = existing.quantity + payload.quantity;
    if (nextQty > product.stockQuantity) {
      throw new AppError('Quantity exceeds stock', 400, 'INSUFFICIENT_STOCK');
    }

    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: nextQty },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: payload.productId,
        quantity: payload.quantity,
      },
    });
  }

  return fetchMyCart(userId);
};

export const updateCartItem = async (userId: string, itemId: string, quantity: number) => {
  const item = await getCartItem(itemId);
  if (!item) {
    throw new AppError('Cart item not found', 404, 'CART_ITEM_NOT_FOUND');
  }

  const cart = await ensureCart(userId);
  if (item.cartId !== cart.id) {
    throw new AppError('Cart item not found', 404, 'CART_ITEM_NOT_FOUND');
  }

  const product = await prisma.product.findUnique({ where: { id: item.productId } });
  if (!product || !product.isActive) {
    throw new AppError('Product unavailable', 400, 'PRODUCT_UNAVAILABLE');
  }

  if (quantity > product.stockQuantity) {
    throw new AppError('Quantity exceeds stock', 400, 'INSUFFICIENT_STOCK');
  }

  await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity },
  });

  return fetchMyCart(userId);
};

export const removeCartItem = async (userId: string, itemId: string) => {
  const item = await getCartItem(itemId);
  if (!item) {
    throw new AppError('Cart item not found', 404, 'CART_ITEM_NOT_FOUND');
  }

  const cart = await ensureCart(userId);
  if (item.cartId !== cart.id) {
    throw new AppError('Cart item not found', 404, 'CART_ITEM_NOT_FOUND');
  }

  await prisma.cartItem.delete({ where: { id: itemId } });
  return fetchMyCart(userId);
};
