import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role, User } from '../types.js';
import { users } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-token-key-2026-enterprise-hr';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ error: 'Access token missing or invalid' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const foundUser = users.find((u) => u.id === decoded.id || u.email === decoded.email);
    
    if (!foundUser) {
      return res.status(401).json({ error: 'User no longer exists' });
    }

    req.user = foundUser;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

export function requireRoles(roles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Requires one of roles: [${roles.join(', ')}]. Your role is ${req.user.role}.`,
      });
    }

    next();
  };
}
