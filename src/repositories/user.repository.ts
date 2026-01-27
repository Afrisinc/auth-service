import { prisma } from '../database/prismaClient';

export class UserRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async create(data: any) {
    return prisma.user.create({ data });
  }

  async updatePassword(userId: string, newPassword: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { password: newPassword },
    });
  }

  async saveOtp(userId: string, otp: string, expiresAt: Date) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        resetPasswordOtp: otp,
        otpExpiresAt: expiresAt,
      },
    });
  }

  async verifyOtp(email: string, otp: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.resetPasswordOtp || !user.otpExpiresAt) {
      return null;
    }
    if (user.resetPasswordOtp !== otp) {
      return null;
    }
    if (user.otpExpiresAt < new Date()) {
      return null;
    }
    return user;
  }

  async clearOtp(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        resetPasswordOtp: null,
        otpExpiresAt: null,
      },
    });
  }
  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  async findMany(skip: number, take: number, where?: any) {
    return prisma.user.findMany({
      where,
      skip,
      take,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        companyName: true,
        tin: true,
        role: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async count(where?: any) {
    return prisma.user.count({ where });
  }

  async createUserWithSelect(data: any) {
    return prisma.user.create({
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async updateUser(id: string, data: any) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        createdAt: true,
      },
    });
  }

  async updateLastLogin(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { lastLogin: new Date() },
    });
  }
}
