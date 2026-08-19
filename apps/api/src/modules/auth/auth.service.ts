import { AppError } from '../../utils/app-error';
import { comparePassword, hashPassword } from '../../utils/password';
import { generateSecureToken } from '../../utils/generators';
import { createUser, findUserByEmail, findUserById } from '../users/users.repository';
import { createSession, deleteSession } from './session.service';

export const registerUser = async (payload: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  marketingConsent: boolean;
}) => {
  const existing = await findUserByEmail(payload.email.toLowerCase());
  if (existing) {
    throw new AppError('Email already in use', 409, 'EMAIL_EXISTS');
  }

  const user = await createUser({
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email.toLowerCase(),
    phone: payload.phone,
    marketingConsent: payload.marketingConsent,
    passwordHash: await hashPassword(payload.password),
    role: 'USER',
  });

  const sessionId = await createSession({
    userId: user.id,
    role: user.role,
  });

  return { user, sessionId };
};

export const loginUser = async (payload: { email: string; password: string }) => {
  const user = await findUserByEmail(payload.email.toLowerCase());
  if (!user) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  const isValid = await comparePassword(payload.password, user.passwordHash);
  if (!isValid) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  const sessionId = await createSession({
    userId: user.id,
    role: user.role,
  });

  return { user, sessionId };
};

export const logoutUser = async (sessionId: string) => {
  await deleteSession(sessionId);
};

export const getCurrentUser = async (userId: string) => {
  const user = await findUserById(userId);
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  return user;
};

export const requestPasswordReset = async (email: string) => {
  const user = await findUserByEmail(email.toLowerCase());
  if (!user) {
    // Return true without leaking user existence for security
    return { success: true, message: 'If email exists, reset instructions have been sent.' };
  }

  const token = generateSecureToken('rst', 32);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  const { prisma } = await import('../../prisma/client');
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token,
      expiresAt,
    },
  });

  return {
    success: true,
    message: 'If email exists, reset instructions have been sent.',
    token, // Provided for local development & testing simulation
  };
};

export const resetPassword = async (token: string, newPassword: string) => {
  const { prisma } = await import('../../prisma/client');

  const resetRecord = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!resetRecord || resetRecord.expiresAt < new Date()) {
    throw new AppError('Invalid or expired password reset token', 400, 'INVALID_TOKEN');
  }

  const newHash = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: resetRecord.userId },
    data: { passwordHash: newHash },
  });

  await prisma.passwordResetToken.delete({
    where: { id: resetRecord.id },
  });

  return { success: true };
};
