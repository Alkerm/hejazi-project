import { AppError } from '../../utils/app-error';
import { comparePassword, hashPassword } from '../../utils/password';
import { findUserAuthById, findUserByEmail, findUserById, updateProfile } from './users.repository';

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
