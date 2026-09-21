import jwt from 'jsonwebtoken';
import { ENV } from '../../config/env.config.js';
import { prisma } from '../../shared/prisma.js';

export interface TokenPayload {
  id: string;
  email: string;
  name: string;
  role: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, ENV.JWT_SECRET, {
    expiresIn: '1h',
  });
};

export const generateRefreshToken = async (userId: string): Promise<string> => {
  const token = jwt.sign({ userId, timestamp: Date.now() }, ENV.REFRESH_TOKEN_SECRET, {
    expiresIn: '30d',
  });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  return token;
};

export const verifyRefreshToken = async (token: string) => {
  try {
    jwt.verify(token, ENV.REFRESH_TOKEN_SECRET);
    const stored = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      return null;
    }
    return stored.user;
  } catch {
    return null;
  }
};
