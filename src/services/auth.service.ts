import { UserRepository } from '../repositories/user.repository';
import { comparePassword, generateToken, generateResetToken, hashPassword, verifyToken } from '../utils/jwt';
import { env } from '../config/env';

const repo = new UserRepository();

export class AuthService {
  async register(data: any) {
    const existing = await repo.findByEmail(data.email);
    if (existing) {
      throw new Error('Email already exists');
    }

    const hashed = await hashPassword(data.password);
    const user = await repo.create({ ...data, password: hashed });
    const token = generateToken(user.id, user.email);

    return { user, token };
  }

  async login(data: any) {
    const user = await repo.findByEmail(data.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const valid = await comparePassword(data.password, user.password);
    if (!valid) {
      throw new Error('Invalid credentials');
    }

    // Update lastLogin timestamp
    await repo.updateLastLogin(user.id);

    const token = generateToken(user.id, user.email);
    return { user, token };
  }
  async forgotPassword(data: any) {
    const user = await repo.findByEmail(data.email);
    if (!user) {
      throw new Error('User not found');
    }
    let resetLink = null;
    let otp = null;
    if (data.source === 'webapp') {
      const resetToken = generateResetToken(user.id, user.email);
      resetLink = `${env.WEBAPP_URL}/reset-password?token=${resetToken}`;
    } else if (data.source === 'app') {
      otp = Math.floor(100000 + Math.random() * 900000).toString();
      // Save OTP with 10 minutes expiration
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await repo.saveOtp(user.id, otp, expiresAt);
    }
    return resetLink ? { resetLink } : { otp };
  }

  async resetPassword(data: any) {
    const { token, otp, email, newPassword } = data;
    let userId: string;

    if (token) {
      const userData = verifyToken(token);
      if (!userData) {
        throw new Error('Invalid or expired token');
      }
      userId = userData.userId;
    } else if (otp && email) {
      const user = await repo.verifyOtp(email, otp);
      if (!user) {
        throw new Error('Invalid or expired OTP');
      }
      userId = user.id;
      await repo.clearOtp(userId);
    } else {
      throw new Error('Either token or (otp + email) is required');
    }

    const hashed = await hashPassword(newPassword);
    await repo.updatePassword(userId, hashed);
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

    const user = await repo.findById(userData.userId);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      valid: true,
      userId: userData.userId,
      email: userData.email,
      user,
    };
  }
}
