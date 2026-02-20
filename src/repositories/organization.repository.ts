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
          select: {
            id: true,
            user_id: true,
            role: true,
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

  async addMember(organizationId: string, userId: string, role: string) {
    return prisma.organizationMember.create({
      data: {
        organization_id: organizationId,
        user_id: userId,
        role,
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
}
