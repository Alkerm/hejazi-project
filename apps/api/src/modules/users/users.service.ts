import { AppError } from '../../utils/app-error';
import { comparePassword, hashPassword } from '../../utils/password';
import { findUserAuthById, findUserByEmail, findUserById, updateProfile } from './users.repository';
import { prisma } from '../../prisma/client';

const mapProfile = (user: Awaited<ReturnType<typeof findUserById>>) => {
  if (!user) return null;
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    marketingConsent: user.marketingConsent,
    role: user.role,
    defaultAddress: user.addresses[0] ?? null,
  };
};

export const getMyProfile = async (userId: string) => {
  const user = await findUserById(userId);
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }
  return mapProfile(user);
};

export const updateMyProfile = async (
  userId: string,
  payload: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string | null;
    marketingConsent?: boolean;
    currentPassword?: string;
    newPassword?: string;
    address?: {
      line1: string;
      line2?: string | null;
      city: string;
      country: string;
      postalCode: string;
    } | null;
  },
) => {
  let passwordHash: string | undefined;
  let normalizedEmail: string | undefined;

  if (payload.email || payload.newPassword) {
    const authUser = await findUserAuthById(userId);
    if (!authUser) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const isCurrentPasswordValid = payload.currentPassword
      ? await comparePassword(payload.currentPassword, authUser.passwordHash)
      : false;

    if (!isCurrentPasswordValid) {
      throw new AppError('Current password is invalid', 401, 'INVALID_CURRENT_PASSWORD');
    }

    if (payload.email) {
      normalizedEmail = payload.email.toLowerCase();
      const existing = await findUserByEmail(normalizedEmail);
      if (existing && existing.id !== userId) {
        throw new AppError('Email already in use', 409, 'EMAIL_EXISTS');
      }
    }

    if (payload.newPassword) {
      passwordHash = await hashPassword(payload.newPassword);
    }
  }

  const profile = await updateProfile(userId, {
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: normalizedEmail,
    passwordHash,
    phone: payload.phone,
    marketingConsent: payload.marketingConsent,
    address: payload.address ?? null,
  });

  return mapProfile(profile)!;
};

export const deleteMyProfile = async (userId: string) => {
  const user = await findUserById(userId);
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  // Check for active in-flight orders
  const activeOrders = await prisma.order.findMany({
    where: {
      userId,
      status: {
        in: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY'],
      },
    },
  });

  if (activeOrders.length > 0) {
    throw new AppError(
      'Cannot delete account with active in-progress orders. Please wait for delivery or cancel them first.',
      400,
      'ACTIVE_ORDERS_EXIST',
    );
  }

  // Check if past orders exist (ZATCA invoice record retention requirement)
  const totalOrders = await prisma.order.count({
    where: { userId },
  });

  await prisma.$transaction(async (tx) => {
    // Delete ancillary records
    await tx.cart.deleteMany({ where: { userId } });
    await tx.address.deleteMany({ where: { userId } });
    await tx.wishlist.deleteMany({ where: { userId } });
    await tx.passwordResetToken.deleteMany({ where: { userId } });

    if (totalOrders > 0) {
      // Anonymize user to comply with PDPL Right to Erasure while keeping tax invoice integrity
      await tx.user.update({
        where: { id: userId },
        data: {
          firstName: 'Deleted',
          lastName: 'User',
          email: `deleted-${userId}-${Date.now()}@anonymized.local`,
          passwordHash: 'DELETED_ACCOUNT',
          phone: null,
          marketingConsent: false,
        },
      });
    } else {
      // No order history: completely delete user row
      await tx.user.delete({
        where: { id: userId },
      });
    }
  });

  return { success: true, message: 'Account deleted and personal data erased successfully' };
};
