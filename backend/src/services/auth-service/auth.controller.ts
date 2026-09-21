import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../../shared/prisma.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from './token.utils.js';

export const authController = {
  async signup(req: Request, res: Response) {
    try {
      const { email, password, name, phone, city } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({
          success: false,
          message: 'Email, password, and name are required',
        });
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists',
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          email: email.toLowerCase().trim(),
          password: passwordHash,
          name: name.trim(),
          phone: phone || null,
          location: city || 'Chennai',
          verified: true,
          role: 'user',
          memberSince: 'Just now',
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          location: true,
          memberSince: true,
          verified: true,
          role: true,
        },
      });

      const tokenPayload = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };

      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = await generateRefreshToken(user.id);

      return res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: {
          user,
          token: accessToken,
          refreshToken,
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error creating account',
      });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { emailOrPhone, password } = req.body;

      if (!emailOrPhone || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email/Phone and password are required',
        });
      }

      const identifier = emailOrPhone.trim().toLowerCase();
      const user = await prisma.user.findFirst({
        where: {
          OR: [{ email: identifier }, { phone: identifier }],
        },
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      const tokenPayload = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };

      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = await generateRefreshToken(user.id);

      return res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            location: user.location,
            avatarUrl: user.avatarUrl,
            memberSince: user.memberSince,
            verified: user.verified,
            role: user.role,
          },
          token: accessToken,
          refreshToken,
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error during login',
      });
    }
  },

  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token is required',
        });
      }

      const user = await verifyRefreshToken(refreshToken);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired refresh token',
        });
      }

      const newAccessToken = generateAccessToken({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });

      return res.json({
        success: true,
        data: {
          token: newAccessToken,
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error refreshing token',
      });
    }
  },

  async getMe(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          location: true,
          avatarUrl: true,
          memberSince: true,
          verified: true,
          role: true,
        },
      });

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      return res.json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Error fetching user profile',
      });
    }
  },

  async logout(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      if (refreshToken) {
        await prisma.refreshToken.updateMany({
          where: { token: refreshToken },
          data: { revoked: true },
        });
      }
      return res.json({
        success: true,
        message: 'Logged out successfully',
        data: null,
      });
    } catch {
      return res.json({ success: true, data: null });
    }
  },
};
