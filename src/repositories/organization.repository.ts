import { prisma } from '../database/prismaClient';

export class OrganizationRepository {
  async create(data: any) {
    return prisma.organization.create({ data });
  }

  async findById(id: string) {
    return prisma.organization.findUnique({ where: { id } });
  }

  async findByIdWithMembers(id: string) {
    return prisma.organization.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                status: true,
              },
            },
          },
        },
      },
    });
  }

  async findMany(skip: number, take: number, where?: any) {
    return prisma.organization.findMany({
      where,
      skip,
      take,
      include: {
        members: {
          include: {
            role: true,
            user: {
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
  }

  async count(where?: any) {
    return prisma.organization.count({ where });
  }

  async update(id: string, data: any) {
    return prisma.organization.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.organization.delete({ where: { id } });
  }

  async addMember(organizationId: string, userId: string, roleId: string) {
    return prisma.organizationMember.create({
      data: {
        organization_id: organizationId,
        user_id: userId,
        role_id: roleId,
      },
    });
  }

  async removeMember(organizationId: string, userId: string) {
    return prisma.organizationMember.deleteMany({
      where: {
        organization_id: organizationId,
        user_id: userId,
      },
    });
  }

  async getMember(organizationId: string, userId: string) {
    return prisma.organizationMember.findUnique({
      where: {
        organization_id_user_id: {
          organization_id: organizationId,
          user_id: userId,
        },
      },
    });
  }

  async getMemberWithRole(organizationId: string, userId: string) {
    return prisma.organizationMember.findUnique({
      where: {
        organization_id_user_id: {
          organization_id: organizationId,
          user_id: userId,
        },
      },
      include: { role: true },
    });
  }

  async userExists(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });
    return user;
  }

  async userHasSuperAdminRole(organizationId: string, userId: string) {
    const member = await prisma.organizationMember.findUnique({
      where: {
        organization_id_user_id: {
          organization_id: organizationId,
          user_id: userId,
        },
      },
      include: { role: true },
    });

    return member?.role?.name === 'SUPER_ADMIN';
  }

  async getOrganizationAccountWithProducts(organizationId: string) {
    return prisma.account.findFirst({
      where: { organization_id: organizationId },
      include: {
        products: {
          include: {
            product: {
              include: {
                partner: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    location: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }
}
