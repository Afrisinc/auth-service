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

  async getEnrollmentStats() {
    const products = await prisma.product.findMany({
      orderBy: { name: 'asc' },
    });

    const stats = await Promise.all(
      products.map(async product => {
        const enrollments = await prisma.accountProduct.findMany({
          where: { product_id: product.id },
        });

        const activeCount = enrollments.filter(e => e.status === 'ACTIVE').length;
        const suspendedCount = enrollments.filter(e => e.status === 'SUSPENDED').length;

        const planCounts = {
          FREE: enrollments.filter(e => e.plan === 'FREE').length,
          PRO: enrollments.filter(e => e.plan === 'PRO').length,
          ENTERPRISE: enrollments.filter(e => e.plan === 'ENTERPRISE').length,
        };

        return {
          productId: product.id,
          productName: product.name,
          productCode: product.code,
          totalEnrollments: enrollments.length,
          active: activeCount,
          suspended: suspendedCount,
          plans: planCounts,
        };
      })
    );

    return stats.sort((a, b) => b.totalEnrollments - a.totalEnrollments);
  }

  async getProductAccountsEnrolled(productId: string, skip: number, take: number, status?: string) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return null;

    const where: any = { product_id: productId };
    if (status) {
      where.status = status;
    }

    const enrollments = await prisma.accountProduct.findMany({
      where,
      skip,
      take,
      include: {
        account: {
          include: {
            owner: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.accountProduct.count({ where });

    const accounts = enrollments.map(enrollment => ({
      id: enrollment.account.id,
      type: enrollment.account.type,
      owner_user_id: enrollment.account.owner_user_id,
      owner: enrollment.account.owner,
      enrollment: {
        enrollmentId: enrollment.id,
        status: enrollment.status,
        plan: enrollment.plan,
        enrolledAt: enrollment.createdAt,
      },
    }));

    return {
      product: {
        productId: product.id,
        productName: product.name,
        productCode: product.code,
      },
      accounts,
      pagination: {
        total,
      },
    };
  }
}
