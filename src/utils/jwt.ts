import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';

// Base token issued on login
export const generateBaseToken = (userId: string, email: string, accountIds: string[]) =>
  jwt.sign(
    {
      sub: userId,
      email,
      account_ids: accountIds,
      type: 'base',
    },
    env.JWT_SECRET,
    { expiresIn: '7d' }
  );

// Product-scoped token issued when user selects a product
export const generateProductScopedToken = (
  userId: string,
  email: string,
  accountId: string,
  accountType: string,
  productCode: string,
  resourceId: string,
  role?: string
) =>
  jwt.sign(
    {
      sub: userId,
      email,
      account_id: accountId,
      account_type: accountType,
      product: productCode,
      resource_id: resourceId,
      role: role || 'member',
      type: 'product',
    },
    env.JWT_SECRET,
    { expiresIn: '7d' }
  );

// Password reset token
export const generateResetToken = (userId: string, email: string) =>
  jwt.sign({ userId, email }, env.JWT_SECRET, { expiresIn: '1h' });

// Password hashing
export const hashPassword = async (password: string) => bcrypt.hash(password, 10);

// Password comparison
export const comparePassword = async (password: string, hash: string) => bcrypt.compare(password, hash);

// Token verification
export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, env.JWT_SECRET) as {
      sub?: string;
      userId?: string;
      email: string;
      account_ids?: string[];
      account_id?: string;
      account_type?: string;
      product?: string;
      resource_id?: string;
      role?: string;
      type?: string;
    };
  } catch {
    return null;
  }
};
