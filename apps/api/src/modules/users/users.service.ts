import { AppError } from '../../utils/app-error';
import { findUserById, updateProfile } from './users.repository';

const mapProfile = (user: Awaited<ReturnType<typeof findUserById>>) => {
  if (!user) return null;
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
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
    phone?: string | null;
    address?: {
      line1: string;
      line2?: string | null;
      city: string;
      country: string;
      postalCode: string;
    } | null;
  },
) => {
  const profile = await updateProfile(userId, {
    firstName: payload.firstName,
    lastName: payload.lastName,
    phone: payload.phone,
    address: payload.address ?? null,
  });

  return mapProfile(profile)!;
};
