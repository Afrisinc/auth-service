import { prisma } from '../database/prismaClient';

export class PartnerRepository {
  async create(data: {
    organization_id: string;
    name: string;
    email?: string;
    phone?: string;
    location?: string;
    description?: string;
  }) {
    return prisma.partner.create({
      data,
    });
  }

  async findById(id: string) {
    return prisma.partner.findUnique({
      where: { id },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            code: true,
            status: true,
          },
        },
      },
    });
  }

  async findByOrgAndName(organizationId: string, name: string) {
    return prisma.partner.findUnique({
      where: {
        organization_id_name: {
          organization_id: organizationId,
          name,
        },
      },
    });
  }

  async findMany(organizationId: string, skip: number, take: number, search?: string) {
    const where: any = { organization_id: organizationId };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { location: { contains: search, mode: 'insensitive' as const } },
      ];
    }

    const [partners, total] = await Promise.all([
      prisma.partner.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.partner.count({ where }),
    ]);

    return { partners, total };
  }

  async update(id: string, data: any) {
    return prisma.partner.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.partner.delete({
      where: { id },
    });
  }

  async getPartnerProducts(partnerId: string) {
    return prisma.product.findMany({
      where: { partner_id: partnerId },
      select: {
        id: true,
        name: true,
        code: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
