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

  async findOrganizationById(organizationId: string) {
    return prisma.organization.findUnique({ where: { id: organizationId } });
  }

  async findPartnerByIdAndOrg(partnerId: string, organizationId: string) {
    const partner = await prisma.partner.findUnique({
      where: { id: partnerId },
    });
    return partner?.organization_id === organizationId ? partner : null;
  }

  async findOrganizationAccount(organizationId: string) {
    return prisma.account.findFirst({
      where: {
        organization_id: organizationId,
        type: 'ORGANIZATION',
      },
    });
  }

  async createEnrollment(data: { account_id: string; product_id: string; status: string; plan: string }) {
    return prisma.accountProduct.create({
      data: {
        account_id: data.account_id,
        product_id: data.product_id,
        status: data.status as any,
        plan: data.plan as any,
      },
    });
  }

  async findEnrollment(accountId: string, productId: string) {
    return prisma.accountProduct.findUnique({
      where: {
        account_id_product_id: {
          account_id: accountId,
          product_id: productId,
        },
      },
    });
  }

  async updateEnrollment(enrollmentId: string, data: any) {
    return prisma.accountProduct.update({
      where: { id: enrollmentId },
      data,
      include: {
        product: true,
        account: true,
      },
    });
  }

  async findByCodeWithCallbacks(code: string) {
    return prisma.product.findUnique({
      where: { code },
      select: {
        id: true,
        code: true,
        name: true,
        baseUrl: true,
        allowedCallbacks: true,
      },
    });
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
    if (!product) {
      return null;
    }

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

  async getUserAssignedProducts(userId: string) {
    const ownedAccounts = await prisma.account.findMany({
      where: { owner_user_id: userId },
      select: { id: true, type: true, organization_id: true },
    });

    const memberships = await prisma.organizationMember.findMany({
      where: { user_id: userId },
      include: { role: true },
    });

    const organizationIds = memberships.map(m => m.organization_id);

    const superAdminOrgIds = new Set(
      memberships.filter(m => m.role?.name === 'SUPER_ADMIN').map(m => m.organization_id)
    );

    const orgAccounts = await prisma.account.findMany({
      where: { organization_id: { in: organizationIds } },
      select: { id: true, type: true, organization_id: true },
    });

    const memberProductAccess = await prisma.memberProductAccess.findMany({
      where: {
        user_id: userId,
        organization_id: { in: organizationIds },
      },
      select: { product_id: true, organization_id: true },
    });

    const accessibleOrgProducts = new Map<string, Set<string>>();
    for (const access of memberProductAccess) {
      if (!accessibleOrgProducts.has(access.organization_id)) {
        accessibleOrgProducts.set(access.organization_id, new Set());
      }
      accessibleOrgProducts.get(access.organization_id)!.add(access.product_id);
    }

    const individualAccountIds = ownedAccounts.filter(a => a.type === 'INDIVIDUAL').map(a => a.id);

    const individualEnrollments = await prisma.accountProduct.findMany({
      where: { account_id: { in: individualAccountIds } },
      include: {
        product: {
          include: {
            partner: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        account: { select: { id: true, type: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const allOrgAccountIds = [...ownedAccounts, ...orgAccounts]
      .filter(a => a.type === 'ORGANIZATION')
      .map(a => a.id);

    const orgEnrollments = await prisma.accountProduct.findMany({
      where: { account_id: { in: allOrgAccountIds } },
      include: {
        product: {
          include: {
            partner: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        account: { select: { id: true, type: true, organization_id: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const filteredOrgEnrollments = orgEnrollments.filter(enrollment => {
      const orgId = enrollment.account.organization_id;
      if (!orgId) {
        return false;
      }

      if (superAdminOrgIds.has(orgId)) {
        return true;
      }

      const accessSet = accessibleOrgProducts.get(orgId);
      if (!accessSet || accessSet.size === 0) {
        return false;
      }
      return accessSet.has(enrollment.product_id);
    });

    const allEnrollments = [...individualEnrollments, ...filteredOrgEnrollments];

    return allEnrollments.map(enrollment => ({
      id: enrollment.product.id,
      name: enrollment.product.name,
      code: enrollment.product.code,
      description: enrollment.product.description,
      status: enrollment.product.status,
      baseUrl: enrollment.product.baseUrl,
      partner: enrollment.product.partner,
      enrollment: {
        enrollmentId: enrollment.id,
        accountId: enrollment.account.id,
        accountType: enrollment.account.type,
        status: enrollment.status,
        plan: enrollment.plan,
        enrolledAt: enrollment.createdAt,
      },
    }));
  }
}
