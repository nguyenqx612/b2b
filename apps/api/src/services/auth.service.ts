import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '@b2b/db';
import type { RegisterInput, LoginInput, AuthTokenPayload } from '@b2b/shared';

// 10 rounds ≈ 50ms (fast enough for dev/prod UX, still brute-force resistant)
// Bump to 12 only if compliance requires it — adds ~150ms per login with no security gain at scale
const SALT_ROUNDS = Number(process.env.BCRYPT_ROUNDS ?? 10);
const JWT_EXPIRY = '7d';

function signToken(payload: Omit<AuthTokenPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, process.env.API_JWT_SECRET!, { expiresIn: JWT_EXPIRY });
}

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw Object.assign(new Error('Email already registered'), { status: 409 });

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      role: input.role,
      companyName: input.companyName,
      companyAddress: input.companyAddress,
      taxId: input.taxId,
    },
    select: { id: true, email: true, role: true, companyName: true, createdAt: true },
  });

  const token = signToken({ sub: user.id, email: user.email, role: user.role });
  return { user, token };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !user.isActive) {
    throw Object.assign(new Error('Invalid credentials'), { status: 401 });
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) throw Object.assign(new Error('Invalid credentials'), { status: 401 });

  const token = signToken({ sub: user.id, email: user.email, role: user.role });
  const { passwordHash: _, ...safeUser } = user;
  return { user: safeUser, token };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { id: true, email: true, role: true, companyName: true, companyAddress: true, taxId: true, createdAt: true },
  });
  return user;
}
