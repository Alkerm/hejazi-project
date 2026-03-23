import { prisma } from '../../prisma/client';

export const findUserByEmail = (email: string) =>
  prisma.user.findUnique({
    where: { email },
  });

export const findUserById = (id: string) =>
  prisma.user.findUnique({
    where: { id },
    include: {
      addresses: {
        where: { isDefault: true },
        take: 1,
      },
    },
  });

export const findUserAuthById = (id: string) =>
  prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      passwordHash: true,
    },
  });

export const createUser = (payload: {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  phone?: string;
  role?: 'USER' | 'ADMIN';
}) =>
  prisma.user.create({
    data: {
      ...payload,
      cart: {
        create: {},
      },
    },
  });

export const updateProfile = async (
  userId: string,
  payload: {
    firstName: string;
    lastName: string;
    email?: string;
    passwordHash?: string;
    phone?: string | null;
    address: {
      line1: string;
      line2?: string | null;
      city: string;
      country: string;
      postalCode: string;
    } | null;
  },
) => {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id: userId },
      data: {
        firstName: payload.firstName,
        lastName: payload.lastName,
        ...(payload.email ? { email: payload.email } : {}),
        ...(payload.passwordHash ? { passwordHash: payload.passwordHash } : {}),
        phone: payload.phone,
      },
    });

    if (payload.address) {
      const existingDefault = await tx.address.findFirst({
        where: { userId, isDefault: true },
      });

      if (existingDefault) {
        await tx.address.update({
          where: { id: existingDefault.id },
          data: {
            line1: payload.address.line1,
            line2: payload.address.line2,
            city: payload.address.city,
            country: payload.address.country,
            postalCode: payload.address.postalCode,
          },
        });
      } else {
        await tx.address.create({
          data: {
            userId,
            isDefault: true,
            line1: payload.address.line1,
            line2: payload.address.line2,
            city: payload.address.city,
            country: payload.address.country,
            postalCode: payload.address.postalCode,
          },
        });
      }
    }

    const profile = await tx.user.findUniqueOrThrow({
      where: { id: user.id },
      include: {
        addresses: {
          where: { isDefault: true },
          take: 1,
        },
      },
    });

    return profile;
  });
};
