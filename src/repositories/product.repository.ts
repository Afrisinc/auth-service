import { prisma } from '../database/prismaClient';

export class ProductRepository {
  async create(data: any) {
    return prisma.product.create({ data });
  }

  async findById(id: string) {
    return prisma.product.findUnique({ where: { id } });
  }

  async findByCode(code: string) {
    return prisma.product.findUnique({ where: { code } });
  }

  async findMany(skip: number, take: number, where?: any) {
    return prisma.product.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async count(where?: any) {
    return prisma.product.count({ where });
  }

  async update(id: string, data: any) {
    return prisma.product.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.product.delete({ where: { id } });
  }

  async getAll() {
    return prisma.product.findMany({
      orderBy: { createdAt: 'asc' },
    });
  }
}
