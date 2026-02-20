import { prisma } from '../database/prismaClient';

export class AccountRepository {
  async create(data: any) {
    return prisma.account.create({ data });
  }

  async findById(id: string) {
    return prisma.account.findUnique({ where: { id } });
  }

  async findByIdWithProducts(id: string) {
    return prisma.account.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async findByUserAndType(userId: string, type: string) {
    return prisma.account.findFirst({
      where: {
        owner_user_id: userId,
        type,
      },
    });
  }

  async findByUserId(userId: string) {
    return prisma.account.findMany({
      where: {
        owner_user_id: userId,
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async findByOrganizationId(organizationId: string) {
    return prisma.account.findMany({
      where: {
        organization_id: organizationId,
      },
    });
  }

  async findMany(skip: number, take: number, where?: any) {
    return prisma.account.findMany({
      where,
      skip,
      take,
      include: {
        owner: {
          select: {
            id: true,
            email: true,
          },
        },
        products: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async count(where?: any) {
    return prisma.account.count({ where });
  }

  async update(id: string, data: any) {
    return prisma.account.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.account.delete({ where: { id } });
  }

  async getUserAccounts(userId: string) {
    return prisma.account.findMany({
      where: {
        owner_user_id: userId,
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async validateUserOwnsAccount(userId: string, accountId: string) {
    const account = await prisma.account.findUnique({
      where: { id: accountId },
    });
    return account?.owner_user_id === userId;
  }
}
