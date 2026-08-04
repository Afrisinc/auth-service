import { prisma } from '../database/prismaClient';

export class MemberProductAccessRepository {
  async create(data: {
    organization_id: string;
    user_id: string;
    product_id: string;
    role_id?: string;
    granted_by: string;
  }) {
    return prisma.memberProductAccess.create({ data });
  }

  async findById(id: string) {
    return prisma.memberProductAccess.findUnique({
      where: { id },
      include: { product: true, user: true },
    });
  }

  async findByOrgUserProduct(organizationId: string, userId: string, productId: string) {
    return prisma.memberProductAccess.findUnique({
      where: {
        organization_id_user_id_product_id: {
          organization_id: organizationId,
          user_id: userId,
          product_id: productId,
        },
      },
    });
  }

  async findByOrgAndUser(organizationId: string, userId: string) {
    return prisma.memberProductAccess.findMany({
      where: {
        organization_id: organizationId,
        user_id: userId,
      },
      include: {
        product: true,
        role: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByUserAcrossOrgs(userId: string) {
    return prisma.memberProductAccess.findMany({
      where: { user_id: userId },
      include: {
        product: true,
        organization: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByOrganization(organizationId: string) {
    return prisma.memberProductAccess.findMany({
      where: { organization_id: organizationId },
      include: {
        product: true,
        role: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        grantedByUser: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async delete(id: string) {
    return prisma.memberProductAccess.delete({ where: { id } });
  }

  async deleteByOrgUserProduct(organizationId: string, userId: string, productId: string) {
    return prisma.memberProductAccess.delete({
      where: {
        organization_id_user_id_product_id: {
          organization_id: organizationId,
          user_id: userId,
          product_id: productId,
        },
      },
    });
  }

  async getAccessibleProductIds(userId: string, organizationIds: string[]) {
    const accesses = await prisma.memberProductAccess.findMany({
      where: {
        user_id: userId,
        organization_id: { in: organizationIds },
      },
      select: {
        product_id: true,
        organization_id: true,
      },
    });
    return accesses;
  }
}
