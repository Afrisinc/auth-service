import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';

export const generateToken = (userId: string, email: string) =>
  jwt.sign({ userId, email }, env.JWT_SECRET, { expiresIn: '7d' });

export const hashPassword = async (password: string) => bcrypt.hash(password, 10);
export const comparePassword = async (password: string, hash: string) => bcrypt.compare(password, hash);
export const generateResetToken = (userId: string, email: string) =>
  jwt.sign({ userId, email }, env.JWT_SECRET, { expiresIn: '1h' });
export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, env.JWT_SECRET) as {
      userId: string;
      email: string;
    };
  } catch {
    return null;
  }
};
