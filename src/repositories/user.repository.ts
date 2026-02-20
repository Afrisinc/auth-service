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
      data: { password_hash: newPassword },
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
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async count(where?: any) {
    return prisma.user.count({ where });
  }

  async updateUser(id: string, data: any) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        status: true,
        createdAt: true,
      },
    });
  }

  async getUserWithAccounts(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        accounts: true,
      },
    });
  }
}
