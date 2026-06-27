import { prisma } from '../database/prismaClient';

export class PermissionRepository {
  async create(data: any) {
    return prisma.permission.create({ data });
  }

  async findById(id: string) {
    return prisma.permission.findUnique({
      where: { id },
      include: {
        rolePermissions: true,
      },
    });
  }

  async findByName(name: string) {
    return prisma.permission.findUnique({ where: { name } });
  }

  async findAll(skip: number, take: number, category?: string) {
    const [permissions, total] = await Promise.all([
      prisma.permission.findMany({
        where: category ? { category } : undefined,
        skip,
        take,
        include: {
          rolePermissions: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.permission.count(category ? { where: { category } } : undefined),
    ]);

    return {
      permissions,
      total,
      page: Math.floor(skip / take) + 1,
      pages: Math.ceil(total / take),
    };
  }

  async findByCategory(category: string) {
    return prisma.permission.findMany({
      where: { category },
      include: {
        rolePermissions: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async update(id: string, data: any) {
    return prisma.permission.update({
      where: { id },
      data,
      include: {
        rolePermissions: true,
      },
    });
  }

  async delete(id: string) {
    return prisma.permission.delete({ where: { id } });
  }

  async findByIds(ids: string[]) {
    return prisma.permission.findMany({
      where: { id: { in: ids } },
    });
  }
}
