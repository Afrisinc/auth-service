import { prisma } from '../database/prismaClient';

export class RoleRepository {
  async create(data: any) {
    return prisma.role.create({ data });
  }

  async findById(id: string) {
    return prisma.role.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
        roleSidebarItems: {
          include: {
            sidebarItem: {
              include: {
                children: true,
              },
            },
          },
        },
      },
    });
  }

  async findByName(name: string) {
    return prisma.role.findUnique({ where: { name } });
  }

  async findAll(skip: number, take: number) {
    const [roles, total] = await Promise.all([
      prisma.role.findMany({
        skip,
        take,
        include: {
          rolePermissions: true,
          roleSidebarItems: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.role.count(),
    ]);

    return { roles, total, page: Math.floor(skip / take) + 1, pages: Math.ceil(total / take) };
  }

  async update(id: string, data: any) {
    return prisma.role.update({
      where: { id },
      data,
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async delete(id: string) {
    return prisma.role.delete({ where: { id } });
  }

  async addPermission(roleId: string, permissionId: string) {
    return prisma.rolePermission.create({
      data: {
        role_id: roleId,
        permission_id: permissionId,
      },
    });
  }

  async removePermission(roleId: string, permissionId: string) {
    return prisma.rolePermission.deleteMany({
      where: {
        role_id: roleId,
        permission_id: permissionId,
      },
    });
  }

  async bulkAddPermissions(roleId: string, permissionIds: string[]) {
    return prisma.rolePermission.createMany({
      data: permissionIds.map(permId => ({
        role_id: roleId,
        permission_id: permId,
      })),
      skipDuplicates: true,
    });
  }

  async clearPermissions(roleId: string) {
    return prisma.rolePermission.deleteMany({
      where: { role_id: roleId },
    });
  }

  async getPermissions(roleId: string) {
    return prisma.rolePermission.findMany({
      where: { role_id: roleId },
      include: {
        permission: true,
      },
    });
  }

  async addSidebarItem(roleId: string, sidebarItemId: string) {
    return prisma.roleSidebarItem.create({
      data: {
        role_id: roleId,
        sidebar_item_id: sidebarItemId,
      },
    });
  }

  async removeSidebarItem(roleId: string, sidebarItemId: string) {
    return prisma.roleSidebarItem.deleteMany({
      where: {
        role_id: roleId,
        sidebar_item_id: sidebarItemId,
      },
    });
  }

  async bulkAddSidebarItems(roleId: string, sidebarItemIds: string[]) {
    return prisma.roleSidebarItem.createMany({
      data: sidebarItemIds.map(itemId => ({
        role_id: roleId,
        sidebar_item_id: itemId,
      })),
      skipDuplicates: true,
    });
  }

  async clearSidebarItems(roleId: string) {
    return prisma.roleSidebarItem.deleteMany({
      where: { role_id: roleId },
    });
  }

  async getSidebarItems(roleId: string) {
    return prisma.roleSidebarItem.findMany({
      where: { role_id: roleId },
      include: {
        sidebarItem: {
          include: {
            children: true,
          },
        },
      },
      orderBy: {
        sidebarItem: {
          order: 'asc',
        },
      },
    });
  }
}
