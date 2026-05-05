import { RoleRepository } from '../repositories/role.repository';
import { PermissionRepository } from '../repositories/permission.repository';
import { SidebarRepository } from '../repositories/sidebar.repository';
import { prisma } from '../database/prismaClient';

const roleRepo = new RoleRepository();
const permissionRepo = new PermissionRepository();
const sidebarRepo = new SidebarRepository();

export class AdminService {
  // ========== ROLE MANAGEMENT ==========

  async createRole(data: { name: string; description?: string }) {
    const existing = await roleRepo.findByName(data.name);
    if (existing) {
      throw new Error('ROLE_ALREADY_EXISTS');
    }

    return roleRepo.create(data);
  }

  async getRole(roleId: string) {
    const role = await roleRepo.findById(roleId);
    if (!role) {
      throw new Error('ROLE_NOT_FOUND');
    }
    return role;
  }

  async getAllRoles(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    return roleRepo.findAll(skip, limit);
  }

  async updateRole(roleId: string, data: { name?: string; description?: string }) {
    const role = await roleRepo.findById(roleId);
    if (!role) {
      throw new Error('ROLE_NOT_FOUND');
    }

    if (data.name && data.name !== role.name) {
      const existing = await roleRepo.findByName(data.name);
      if (existing) {
        throw new Error('ROLE_NAME_ALREADY_EXISTS');
      }
    }

    return roleRepo.update(roleId, data);
  }

  async deleteRole(roleId: string) {
    const role = await roleRepo.findById(roleId);
    if (!role) {
      throw new Error('ROLE_NOT_FOUND');
    }

    // Check if role is assigned to any org members
    const assignedMembers = await prisma.organizationMember.count({
      where: { role_id: roleId },
    });
    if (assignedMembers > 0) {
      throw new Error('ROLE_IN_USE');
    }

    return roleRepo.delete(roleId);
  }

  // ========== ROLE PERMISSIONS ==========

  async addPermissionToRole(roleId: string, permissionId: string) {
    const role = await roleRepo.findById(roleId);
    if (!role) {
      throw new Error('ROLE_NOT_FOUND');
    }

    const permission = await permissionRepo.findById(permissionId);
    if (!permission) {
      throw new Error('PERMISSION_NOT_FOUND');
    }

    try {
      return await roleRepo.addPermission(roleId, permissionId);
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new Error('PERMISSION_ALREADY_ASSIGNED');
      }
      throw error;
    }
  }

  async removePermissionFromRole(roleId: string, permissionId: string) {
    const role = await roleRepo.findById(roleId);
    if (!role) {
      throw new Error('ROLE_NOT_FOUND');
    }

    return roleRepo.removePermission(roleId, permissionId);
  }

  async bulkAssignPermissionsToRole(roleId: string, permissionIds: string[]) {
    const role = await roleRepo.findById(roleId);
    if (!role) {
      throw new Error('ROLE_NOT_FOUND');
    }

    // Validate all permissions exist
    const permissions = await permissionRepo.findByIds(permissionIds);
    if (permissions.length !== permissionIds.length) {
      throw new Error('SOME_PERMISSIONS_NOT_FOUND');
    }

    // Clear existing and add new ones
    await roleRepo.clearPermissions(roleId);
    await roleRepo.bulkAddPermissions(roleId, permissionIds);

    return roleRepo.getPermissions(roleId);
  }

  async getRolePermissions(roleId: string) {
    const role = await roleRepo.findById(roleId);
    if (!role) {
      throw new Error('ROLE_NOT_FOUND');
    }

    return roleRepo.getPermissions(roleId);
  }

  // ========== PERMISSION MANAGEMENT ==========

  async createPermission(data: { name: string; description?: string; category?: string }) {
    const existing = await permissionRepo.findByName(data.name);
    if (existing) {
      throw new Error('PERMISSION_ALREADY_EXISTS');
    }

    return permissionRepo.create(data);
  }

  async getPermission(permissionId: string) {
    const permission = await permissionRepo.findById(permissionId);
    if (!permission) {
      throw new Error('PERMISSION_NOT_FOUND');
    }
    return permission;
  }

  async getAllPermissions(page: number = 1, limit: number = 20, category?: string) {
    const skip = (page - 1) * limit;
    return permissionRepo.findAll(skip, limit, category);
  }

  async getPermissionsByCategory(category: string) {
    return permissionRepo.findByCategory(category);
  }

  async updatePermission(permissionId: string, data: { name?: string; description?: string; category?: string }) {
    const permission = await permissionRepo.findById(permissionId);
    if (!permission) {
      throw new Error('PERMISSION_NOT_FOUND');
    }

    if (data.name && data.name !== permission.name) {
      const existing = await permissionRepo.findByName(data.name);
      if (existing) {
        throw new Error('PERMISSION_NAME_ALREADY_EXISTS');
      }
    }

    return permissionRepo.update(permissionId, data);
  }

  async deletePermission(permissionId: string) {
    const permission = await permissionRepo.findById(permissionId);
    if (!permission) {
      throw new Error('PERMISSION_NOT_FOUND');
    }

    if (permission.rolePermissions && permission.rolePermissions.length > 0) {
      throw new Error('PERMISSION_IN_USE');
    }

    return permissionRepo.delete(permissionId);
  }

  // ========== SIDEBAR MANAGEMENT ==========

  async createSidebarItem(data: {
    label: string;
    icon?: string;
    path?: string;
    order?: number;
    parentId?: string;
  }) {
    if (data.parentId) {
      const parent = await sidebarRepo.findById(data.parentId);
      if (!parent) {
        throw new Error('PARENT_ITEM_NOT_FOUND');
      }
    }

    return sidebarRepo.create({
      ...data,
      order: data.order ?? 0,
      isActive: true,
    });
  }

  async getSidebarItem(itemId: string) {
    const item = await sidebarRepo.findById(itemId);
    if (!item) {
      throw new Error('SIDEBAR_ITEM_NOT_FOUND');
    }
    return item;
  }

  async getAllSidebarItems(page: number = 1, limit: number = 20, parentId?: string | null) {
    const skip = (page - 1) * limit;
    return sidebarRepo.findAll(skip, limit, parentId);
  }

  async getAllSidebarItemsFlat() {
    return sidebarRepo.findAllFlat();
  }

  async updateSidebarItem(
    itemId: string,
    data: {
      label?: string;
      icon?: string;
      path?: string;
      order?: number;
      isActive?: boolean;
      parentId?: string;
    }
  ) {
    const item = await sidebarRepo.findById(itemId);
    if (!item) {
      throw new Error('SIDEBAR_ITEM_NOT_FOUND');
    }

    if (data.parentId && data.parentId !== item.parentId) {
      const parent = await sidebarRepo.findById(data.parentId);
      if (!parent) {
        throw new Error('PARENT_ITEM_NOT_FOUND');
      }
    }

    return sidebarRepo.update(itemId, data);
  }

  async deleteSidebarItem(itemId: string) {
    const item = await sidebarRepo.findById(itemId);
    if (!item) {
      throw new Error('SIDEBAR_ITEM_NOT_FOUND');
    }

    if (item.children && item.children.length > 0) {
      throw new Error('SIDEBAR_ITEM_HAS_CHILDREN');
    }

    return sidebarRepo.delete(itemId);
  }

  // ========== ROLE SIDEBAR ITEMS ==========

  async addSidebarItemToRole(roleId: string, sidebarItemId: string) {
    const role = await roleRepo.findById(roleId);
    if (!role) {
      throw new Error('ROLE_NOT_FOUND');
    }

    const item = await sidebarRepo.findById(sidebarItemId);
    if (!item) {
      throw new Error('SIDEBAR_ITEM_NOT_FOUND');
    }

    try {
      return await roleRepo.addSidebarItem(roleId, sidebarItemId);
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new Error('SIDEBAR_ITEM_ALREADY_ASSIGNED');
      }
      throw error;
    }
  }

  async removeSidebarItemFromRole(roleId: string, sidebarItemId: string) {
    const role = await roleRepo.findById(roleId);
    if (!role) {
      throw new Error('ROLE_NOT_FOUND');
    }

    return roleRepo.removeSidebarItem(roleId, sidebarItemId);
  }

  async bulkAssignSidebarItemsToRole(roleId: string, sidebarItemIds: string[]) {
    const role = await roleRepo.findById(roleId);
    if (!role) {
      throw new Error('ROLE_NOT_FOUND');
    }

    // Validate all sidebar items exist
    const items = await sidebarRepo.findByIds(sidebarItemIds);
    if (items.length !== sidebarItemIds.length) {
      throw new Error('SOME_SIDEBAR_ITEMS_NOT_FOUND');
    }

    // Clear existing and add new ones
    await roleRepo.clearSidebarItems(roleId);
    await roleRepo.bulkAddSidebarItems(roleId, sidebarItemIds);

    return roleRepo.getSidebarItems(roleId);
  }

  async getRoleSidebarItems(roleId: string) {
    const role = await roleRepo.findById(roleId);
    if (!role) {
      throw new Error('ROLE_NOT_FOUND');
    }

    return roleRepo.getSidebarItems(roleId);
  }
}
