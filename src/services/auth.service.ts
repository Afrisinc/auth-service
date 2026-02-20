import { UserRepository } from '../repositories/user.repository';
import { AccountRepository } from '../repositories/account.repository';
import {
  comparePassword,
  generateBaseToken,
  generateResetToken,
  hashPassword,
  verifyToken,
} from '../utils/jwt';
import { env } from '../config/env';
import { prisma } from '../database/prismaClient';

const userRepo = new UserRepository();
const accountRepo = new AccountRepository();

export class AuthService {
  async register(data: any) {
    const existing = await userRepo.findByEmail(data.email);
    if (existing) {
      throw new Error('Email already exists');
    }

    const hashed = await hashPassword(data.password);

    // Create user and individual account in transaction
    const result = await prisma.$transaction(async tx => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          password_hash: hashed,
          status: 'active',
        },
      });

      // Create individual account for the user
      const account = await tx.account.create({
        data: {
          type: 'INDIVIDUAL',
          owner_user_id: user.id,
        },
      });

      return { user, account };
    });

    const token = generateBaseToken(result.user.id, result.user.email, [result.account.id]);

    return {
      user_id: result.user.id,
      account_id: result.account.id,
      email: result.user.email,
      token,
    };
  }

  async login(data: any) {
    const user = await userRepo.findByEmail(data.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const valid = await comparePassword(data.password, user.password_hash);
    if (!valid) {
      throw new Error('Invalid credentials');
    }

    // Get all accounts owned by user
    const accounts = await accountRepo.findByUserId(user.id);
    const accountIds = accounts.map(a => a.id);

    const token = generateBaseToken(user.id, user.email, accountIds);

    return {
      user_id: user.id,
      email: user.email,
      account_ids: accountIds,
      token,
    };
  }
  async forgotPassword(data: any) {
    const user = await userRepo.findByEmail(data.email);
    if (!user) {
      throw new Error('User not found');
    }

    const resetToken = generateResetToken(user.id, user.email);
    const resetLink = `${env.WEBAPP_URL}/reset-password?token=${resetToken}`;

    return { resetLink };
  }

  async resetPassword(data: any) {
    const { token, newPassword } = data;

    if (!token) {
      throw new Error('Token is required');
    }

    const userData = verifyToken(token);
    if (!userData) {
      throw new Error('Invalid or expired token');
    }

    const userId = userData.userId || userData.sub;
    if (!userId) {
      throw new Error('Invalid token payload');
    }

    const hashed = await hashPassword(newPassword);
    await userRepo.updatePassword(userId, hashed);

    return { message: 'Password reset successfully' };
  }

  async verify(token: string) {
    if (!token) {
      throw new Error('Token is required');
    }

    const userData = verifyToken(token);
    if (!userData) {
      throw new Error('Invalid or expired token');
    }

    const userId = userData.sub || userData.userId;
    if (!userId) {
      throw new Error('Invalid token payload');
    }

    const user = await userRepo.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      valid: true,
      user_id: user.id,
      email: user.email,
      token_type: userData.type,
    };
  }
}
