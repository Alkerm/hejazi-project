import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('../../modules/users/users.repository', () => ({
  findUserByEmail: vi.fn(),
  findUserById: vi.fn(),
  createUser: vi.fn(),
}));

vi.mock('../../utils/password', () => ({
  comparePassword: vi.fn(),
  hashPassword: vi.fn(),
}));

vi.mock('../../modules/auth/session.service', () => ({
  createSession: vi.fn(),
  deleteSession: vi.fn(),
}));

import { registerUser, loginUser } from '../../modules/auth/auth.service';
import { findUserByEmail, createUser } from '../../modules/users/users.repository';
import { comparePassword, hashPassword } from '../../utils/password';
import { createSession } from '../../modules/auth/session.service';

describe('auth.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registerUser throws when email exists', async () => {
    vi.mocked(findUserByEmail).mockResolvedValue({ id: 'u1' } as never);

    await expect(
      registerUser({
        firstName: 'A',
        lastName: 'B',
        email: 'a@b.com',
        password: 'Passw0rd!123',
      }),
    ).rejects.toMatchObject({ code: 'EMAIL_EXISTS' });
  });

  it('registerUser creates user and session', async () => {
    vi.mocked(findUserByEmail).mockResolvedValue(null);
    vi.mocked(hashPassword).mockResolvedValue('hashed-pass');
    vi.mocked(createUser).mockResolvedValue({ id: 'u1', role: 'USER' } as never);
    vi.mocked(createSession).mockResolvedValue('sess-1');

    const result = await registerUser({
      firstName: 'A',
      lastName: 'B',
      email: 'a@b.com',
      password: 'Passw0rd!123',
    });

    expect(result.sessionId).toBe('sess-1');
    expect(createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        role: 'USER',
      }),
    );
  });

  it('loginUser rejects invalid credentials', async () => {
    vi.mocked(findUserByEmail).mockResolvedValue({ id: 'u1', passwordHash: 'h', role: 'USER' } as never);
    vi.mocked(comparePassword).mockResolvedValue(false);

    await expect(loginUser({ email: 'a@b.com', password: 'wrong' })).rejects.toMatchObject({
      code: 'INVALID_CREDENTIALS',
    });
  });

  it('loginUser returns session for valid credentials', async () => {
    vi.mocked(findUserByEmail).mockResolvedValue({
      id: 'u1',
      passwordHash: 'h',
      role: 'ADMIN',
    } as never);
    vi.mocked(comparePassword).mockResolvedValue(true);
    vi.mocked(createSession).mockResolvedValue('sess-admin');

    const result = await loginUser({ email: 'admin@x.com', password: 'Passw0rd!123' });

    expect(result.sessionId).toBe('sess-admin');
    expect(createSession).toHaveBeenCalledWith({ userId: 'u1', role: 'ADMIN' });
  });
});
