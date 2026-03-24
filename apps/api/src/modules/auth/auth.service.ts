import { AppError } from '../../utils/app-error';
import { comparePassword, hashPassword } from '../../utils/password';
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
