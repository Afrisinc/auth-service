import { prisma } from '../database/prismaClient';

export class SidebarRepository {
  async create(data: any) {
    return prisma.sidebarItem.create({ data });
  }

  async findById(id: string) {
    return prisma.sidebarItem.findUnique({
      where: { id },
      include: {
        children: {
          orderBy: { order: 'asc' },
        },
        parent: true,
        roleSidebarItems: true,
      },
    });
  }

  async findAll(skip: number, take: number, parentId?: string | null) {
    const [items, total] = await Promise.all([
      prisma.sidebarItem.findMany({
        where: parentId !== undefined ? { parentId } : { parentId: null },
        skip,
        take,
        include: {
          children: {
            orderBy: { order: 'asc' },
          },
          parent: true,
          roleSidebarItems: true,
        },
        orderBy: { order: 'asc' },
      }),
      prisma.sidebarItem.count(parentId !== undefined ? { where: { parentId } } : { where: { parentId: null } }),
    ]);

    return {
      items,
      total,
      page: Math.floor(skip / take) + 1,
      pages: Math.ceil(total / take),
    };
  }

  async findAllFlat() {
    return prisma.sidebarItem.findMany({
      include: {
        children: {
          orderBy: { order: 'asc' },
        },
        parent: true,
      },
      orderBy: [{ parentId: 'asc' }, { order: 'asc' }],
    });
  }

  async update(id: string, data: any) {
    return prisma.sidebarItem.update({
      where: { id },
      data,
      include: {
        children: true,
        parent: true,
      },
    });
  }

  async delete(id: string) {
    return prisma.sidebarItem.delete({ where: { id } });
  }

  async findByIds(ids: string[]) {
    return prisma.sidebarItem.findMany({
      where: { id: { in: ids } },
      include: {
        children: true,
      },
    });
  }

  async bulkUpdateOrder(updates: Array<{ id: string; order: number }>) {
    return Promise.all(
      updates.map(update =>
        prisma.sidebarItem.update({
          where: { id: update.id },
          data: { order: update.order },
        })
      )
    );
  }

  async findActiveItems() {
    return prisma.sidebarItem.findMany({
      where: { isActive: true, parentId: null },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });
  }
}
