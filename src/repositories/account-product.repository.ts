import { prisma } from '../database/prismaClient';

export class AccountProductRepository {
  async create(data: any, txn: any = null) {
    const client = txn || prisma;
    return client.accountProduct.create({ data });
  }

  async findById(id: string) {
    return prisma.accountProduct.findUnique({ where: { id } });
  }

  async findByAccountAndProduct(accountId: string, productId: string) {
    return prisma.accountProduct.findUnique({
      where: {
        account_id_product_id: {
          account_id: accountId,
          product_id: productId,
        },
      },
    });
  }

  async findByAccountAndProductCode(accountId: string, productCode: string) {
    return prisma.accountProduct.findFirst({
      where: {
        account_id: accountId,
        product: {
          code: productCode,
        },
      },
      include: {
        product: true,
      },
    });
  }

  async findByAccountId(accountId: string) {
    return prisma.accountProduct.findMany({
      where: {
        account_id: accountId,
      },
      include: {
        product: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByProductCode(productCode: string) {
    return prisma.accountProduct.findMany({
      where: {
        product: {
          code: productCode,
        },
      },
      include: {
        account: true,
        product: true,
      },
    });
  }

  async findMany(skip: number, take: number, where?: any) {
    return prisma.accountProduct.findMany({
      where,
      skip,
      take,
      include: {
        account: true,
        product: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async count(where?: any) {
    return prisma.accountProduct.count({ where });
  }

  async update(id: string, data: any, txn: any = null) {
    const client = txn || prisma;
    return client.accountProduct.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.accountProduct.delete({ where: { id } });
  }

  async validateAccountEnrolledInProduct(accountId: string, productCode: string) {
    const enrollment = await prisma.accountProduct.findFirst({
      where: {
        account_id: accountId,
        product: {
          code: productCode,
        },
        status: 'ACTIVE',
      },
    });
    return enrollment !== null;
  }
}
