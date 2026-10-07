import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.config.js';
import { prisma } from '../shared/prisma.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

declare global {
  namespace Express {
    interface User extends AuthenticatedUser { }
  }
}

// Passport JWT Strategy configuration
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: ENV.JWT_SECRET,
    },
    async (payload, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: payload.id },
          select: { id: true, email: true, name: true, role: true },
        });
        if (user) {
          return done(null, user);
        }
        return done(null, false);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

// Express middleware for strictly protected routes
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // In development mode, permit default demo user if no token provided
    if (ENV.NODE_ENV === 'development') {
      req.user = {
        id: 'usr-demo-iyyanar',
        email: 'iyyanar@example.com',
        name: 'Iyyanar',
        role: 'user',
      };
      return next();
    }
    return res.status(401).json({
      success: false,
      message: 'Authentication required. No token provided.',
    });
  }

  const token = authHeader.split(' ')[1];

  // In development, handle all demo tokens
  if (ENV.NODE_ENV === 'development' && (token === 'demo-jwt-token' || token.startsWith('demo-jwt-token'))) {
    if (token === 'demo-jwt-token-admin') {
      req.user = {
        id: 'usr-demo-admin',
        email: 'admin@swapit.com',
        name: 'Iyyanar (Admin)',
        role: 'admin',
      };
    } else if (token === 'demo-jwt-token-seller') {
      req.user = {
        id: 'usr-demo-seller',
        email: 'seller@swapit.com',
        name: 'Karthik Raja (Seller)',
        role: 'seller',
      };
    } else if (token === 'demo-jwt-token-customer') {
      req.user = {
        id: 'usr-demo-customer',
        email: 'customer@swapit.com',
        name: 'Vignesh (Customer)',
        role: 'customer',
      };
    } else {
      req.user = {
        id: 'usr-demo-iyyanar',
        email: 'iyyanar@example.com',
        name: 'Iyyanar',
        role: 'user',
      };
    }
    return next();
  }

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as AuthenticatedUser;
    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload',
      });
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role || 'user',
    };

    return next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Access token has expired. Please refresh your token.',
        code: 'TOKEN_EXPIRED',
      });
    }

    // In dev mode, if token verification fails, allow fallback demo user
    if (ENV.NODE_ENV === 'development') {
      req.user = {
        id: 'usr-demo-iyyanar',
        email: 'iyyanar@example.com',
        name: 'Iyyanar',
        role: 'user',
      };
      return next();
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid or forged authentication token',
    });
  }
};

// Express middleware to protect Admin-only routes
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required before checking administrative privileges',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Administrative privileges required',
    });
  }

  return next();
};

// Express middleware for role-based access control (RBAC)
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: requires one of the following roles: [${allowedRoles.join(', ')}]`,
      });
    }

    return next();
  };
};

// Optional auth middleware (attaches user if valid token present)
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    if (ENV.NODE_ENV === 'development' && (token === 'demo-jwt-token' || token.startsWith('demo-jwt-token'))) {
      let demoId = 'usr-demo-iyyanar';
      let demoEmail = 'iyyanar@example.com';
      let demoName = 'Iyyanar';
      let demoRole = 'user';

      if (token === 'demo-jwt-token-admin') {
        demoId = 'usr-demo-admin';
        demoEmail = 'admin@swapit.com';
        demoName = 'Iyyanar (Admin)';
        demoRole = 'admin';
      } else if (token === 'demo-jwt-token-seller') {
        demoId = 'usr-demo-seller';
        demoEmail = 'seller@swapit.com';
        demoName = 'Karthik Raja (Seller)';
        demoRole = 'seller';
      } else if (token === 'demo-jwt-token-customer') {
        demoId = 'usr-demo-customer';
        demoEmail = 'customer@swapit.com';
        demoName = 'Vignesh (Customer)';
        demoRole = 'customer';
      }

      req.user = {
        id: demoId,
        email: demoEmail,
        name: demoName,
        role: demoRole,
      };
      return next();
    }

    try {
      const decoded = jwt.verify(token, ENV.JWT_SECRET) as AuthenticatedUser;
      if (decoded && decoded.id) {
        req.user = {
          id: decoded.id,
          email: decoded.email,
          name: decoded.name,
          role: decoded.role || 'user',
        };
      }
    } catch {
      // For optional auth, continue without req.user if verification fails
    }
  }
  return next();
};
