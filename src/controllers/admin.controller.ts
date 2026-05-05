import type { FastifyReply, FastifyRequest } from 'fastify';
import { AdminService } from '../services/admin.service';
import { ApiResponseHelper } from '../utils/apiResponse';
import { getErrorMessage } from '../utils/errorHandler';

const service = new AdminService();

// ========== ROLE HANDLERS ==========

export async function createRole(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { name, description } = req.body as { name: string; description?: string };

    if (!name || name.trim().length === 0) {
      return ApiResponseHelper.badRequest(reply, 'Role name is required');
    }

    const result = await service.createRole({ name: name.trim(), description });
    return ApiResponseHelper.created(reply, 'Role created successfully', result);
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    if (message === 'ROLE_ALREADY_EXISTS') {
      return ApiResponseHelper.badRequest(reply, 'Role with this name already exists');
    }
    return ApiResponseHelper.badRequest(reply, message);
  }
}

export async function getRole(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { roleId } = req.params as { roleId: string };

    const result = await service.getRole(roleId);
    return ApiResponseHelper.success(reply, 'Role retrieved successfully', result);
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    if (message === 'ROLE_NOT_FOUND') {
      return ApiResponseHelper.notFound(reply, 'Role not found');
    }
    return ApiResponseHelper.badRequest(reply, message);
  }
}

export async function getAllRoles(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { page = 1, limit = 10 } = req.query as { page?: number; limit?: number };

    const pageNum = Math.max(1, Math.min(page, 10000));
    const limitNum = Math.max(1, Math.min(limit, 100));

    const result = await service.getAllRoles(pageNum, limitNum);
    return ApiResponseHelper.success(reply, 'Roles retrieved successfully', result);
  } catch (err: unknown) {
    return ApiResponseHelper.badRequest(reply, getErrorMessage(err));
  }
}

export async function updateRole(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { roleId } = req.params as { roleId: string };
    const { name, description } = req.body as { name?: string; description?: string };

    if (name && name.trim().length === 0) {
      return ApiResponseHelper.badRequest(reply, 'Role name cannot be empty');
    }

    const result = await service.updateRole(roleId, { name: name?.trim(), description });
    return ApiResponseHelper.success(reply, 'Role updated successfully', result);
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    if (message === 'ROLE_NOT_FOUND') {
      return ApiResponseHelper.notFound(reply, 'Role not found');
    }
    if (message === 'ROLE_NAME_ALREADY_EXISTS') {
      return ApiResponseHelper.badRequest(reply, 'Role with this name already exists');
    }
    return ApiResponseHelper.badRequest(reply, message);
  }
}

export async function deleteRole(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { roleId } = req.params as { roleId: string };

    await service.deleteRole(roleId);
    return ApiResponseHelper.success(reply, 'Role deleted successfully', { id: roleId });
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    if (message === 'ROLE_NOT_FOUND') {
      return ApiResponseHelper.notFound(reply, 'Role not found');
    }
    if (message === 'ROLE_IN_USE') {
      return ApiResponseHelper.badRequest(reply, 'Cannot delete role that is assigned to users');
    }
    return ApiResponseHelper.badRequest(reply, message);
  }
}

// ========== ROLE PERMISSIONS HANDLERS ==========

export async function addPermissionToRole(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { roleId, permissionId } = req.params as { roleId: string; permissionId: string };

    const result = await service.addPermissionToRole(roleId, permissionId);
    return ApiResponseHelper.created(reply, 'Permission assigned to role successfully', result);
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    if (message === 'ROLE_NOT_FOUND') {
      return ApiResponseHelper.notFound(reply, 'Role not found');
    }
    if (message === 'PERMISSION_NOT_FOUND') {
      return ApiResponseHelper.notFound(reply, 'Permission not found');
    }
    if (message === 'PERMISSION_ALREADY_ASSIGNED') {
      return ApiResponseHelper.badRequest(reply, 'Permission already assigned to this role');
    }
    return ApiResponseHelper.badRequest(reply, message);
  }
}

export async function removePermissionFromRole(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { roleId, permissionId } = req.params as { roleId: string; permissionId: string };

    await service.removePermissionFromRole(roleId, permissionId);
    return ApiResponseHelper.success(reply, 'Permission removed from role successfully', {
      roleId,
      permissionId,
    });
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    if (message === 'ROLE_NOT_FOUND') {
      return ApiResponseHelper.notFound(reply, 'Role not found');
    }
    return ApiResponseHelper.badRequest(reply, message);
  }
}

export async function bulkAssignPermissionsToRole(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { roleId } = req.params as { roleId: string };
    const { permissionIds } = req.body as { permissionIds: string[] };

    if (!Array.isArray(permissionIds) || permissionIds.length === 0) {
      return ApiResponseHelper.badRequest(reply, 'permissionIds must be a non-empty array');
    }

    const result = await service.bulkAssignPermissionsToRole(roleId, permissionIds);
    return ApiResponseHelper.success(reply, 'Permissions assigned to role successfully', result);
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    if (message === 'ROLE_NOT_FOUND') {
      return ApiResponseHelper.notFound(reply, 'Role not found');
    }
    if (message === 'SOME_PERMISSIONS_NOT_FOUND') {
      return ApiResponseHelper.badRequest(reply, 'Some permissions not found');
    }
    return ApiResponseHelper.badRequest(reply, message);
  }
}

export async function getRolePermissions(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { roleId } = req.params as { roleId: string };

    const result = await service.getRolePermissions(roleId);
    return ApiResponseHelper.success(reply, 'Role permissions retrieved successfully', result);
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    if (message === 'ROLE_NOT_FOUND') {
      return ApiResponseHelper.notFound(reply, 'Role not found');
    }
    return ApiResponseHelper.badRequest(reply, message);
  }
}

// ========== PERMISSION HANDLERS ==========

export async function createPermission(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { name, description, category } = req.body as {
      name: string;
      description?: string;
      category?: string;
    };

    if (!name || name.trim().length === 0) {
      return ApiResponseHelper.badRequest(reply, 'Permission name is required');
    }

    const result = await service.createPermission({ name: name.trim(), description, category });
    return ApiResponseHelper.created(reply, 'Permission created successfully', result);
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    if (message === 'PERMISSION_ALREADY_EXISTS') {
      return ApiResponseHelper.badRequest(reply, 'Permission with this name already exists');
    }
    return ApiResponseHelper.badRequest(reply, message);
  }
}

export async function getPermission(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { permissionId } = req.params as { permissionId: string };

    const result = await service.getPermission(permissionId);
    return ApiResponseHelper.success(reply, 'Permission retrieved successfully', result);
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    if (message === 'PERMISSION_NOT_FOUND') {
      return ApiResponseHelper.notFound(reply, 'Permission not found');
    }
    return ApiResponseHelper.badRequest(reply, message);
  }
}

export async function getAllPermissions(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { page = 1, limit = 20, category } = req.query as {
      page?: number;
      limit?: number;
      category?: string;
    };

    const pageNum = Math.max(1, Math.min(page, 10000));
    const limitNum = Math.max(1, Math.min(limit, 100));

    const result = await service.getAllPermissions(pageNum, limitNum, category);
    return ApiResponseHelper.success(reply, 'Permissions retrieved successfully', result);
  } catch (err: unknown) {
    return ApiResponseHelper.badRequest(reply, getErrorMessage(err));
  }
}

export async function updatePermission(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { permissionId } = req.params as { permissionId: string };
    const { name, description, category } = req.body as {
      name?: string;
      description?: string;
      category?: string;
    };

    if (name && name.trim().length === 0) {
      return ApiResponseHelper.badRequest(reply, 'Permission name cannot be empty');
    }

    const result = await service.updatePermission(permissionId, {
      name: name?.trim(),
      description,
      category,
    });
    return ApiResponseHelper.success(reply, 'Permission updated successfully', result);
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    if (message === 'PERMISSION_NOT_FOUND') {
      return ApiResponseHelper.notFound(reply, 'Permission not found');
    }
    if (message === 'PERMISSION_NAME_ALREADY_EXISTS') {
      return ApiResponseHelper.badRequest(reply, 'Permission with this name already exists');
    }
    return ApiResponseHelper.badRequest(reply, message);
  }
}

export async function deletePermission(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { permissionId } = req.params as { permissionId: string };

    await service.deletePermission(permissionId);
    return ApiResponseHelper.success(reply, 'Permission deleted successfully', { id: permissionId });
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    if (message === 'PERMISSION_NOT_FOUND') {
      return ApiResponseHelper.notFound(reply, 'Permission not found');
    }
    if (message === 'PERMISSION_IN_USE') {
      return ApiResponseHelper.badRequest(reply, 'Cannot delete permission that is assigned to roles');
    }
    return ApiResponseHelper.badRequest(reply, message);
  }
}

// ========== SIDEBAR HANDLERS ==========

export async function createSidebarItem(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { label, icon, path, order, parentId } = req.body as {
      label: string;
      icon?: string;
      path?: string;
      order?: number;
      parentId?: string;
    };

    if (!label || label.trim().length === 0) {
      return ApiResponseHelper.badRequest(reply, 'Sidebar label is required');
    }

    const result = await service.createSidebarItem({ label: label.trim(), icon, path, order, parentId });
    return ApiResponseHelper.created(reply, 'Sidebar item created successfully', result);
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    if (message === 'PARENT_ITEM_NOT_FOUND') {
      return ApiResponseHelper.notFound(reply, 'Parent sidebar item not found');
    }
    return ApiResponseHelper.badRequest(reply, message);
  }
}

export async function getSidebarItem(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { itemId } = req.params as { itemId: string };

    const result = await service.getSidebarItem(itemId);
    return ApiResponseHelper.success(reply, 'Sidebar item retrieved successfully', result);
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    if (message === 'SIDEBAR_ITEM_NOT_FOUND') {
      return ApiResponseHelper.notFound(reply, 'Sidebar item not found');
    }
    return ApiResponseHelper.badRequest(reply, message);
  }
}

export async function getAllSidebarItems(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { page = 1, limit = 20, parentId } = req.query as {
      page?: number;
      limit?: number;
      parentId?: string;
    };

    const pageNum = Math.max(1, Math.min(page, 10000));
    const limitNum = Math.max(1, Math.min(limit, 100));

    const result = await service.getAllSidebarItems(pageNum, limitNum, parentId);
    return ApiResponseHelper.success(reply, 'Sidebar items retrieved successfully', result);
  } catch (err: unknown) {
    return ApiResponseHelper.badRequest(reply, getErrorMessage(err));
  }
}

export async function updateSidebarItem(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { itemId } = req.params as { itemId: string };
    const { label, icon, path, order, isActive, parentId } = req.body as {
      label?: string;
      icon?: string;
      path?: string;
      order?: number;
      isActive?: boolean;
      parentId?: string;
    };

    if (label && label.trim().length === 0) {
      return ApiResponseHelper.badRequest(reply, 'Sidebar label cannot be empty');
    }

    const result = await service.updateSidebarItem(itemId, {
      label: label?.trim(),
      icon,
      path,
      order,
      isActive,
      parentId,
    });
    return ApiResponseHelper.success(reply, 'Sidebar item updated successfully', result);
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    if (message === 'SIDEBAR_ITEM_NOT_FOUND') {
      return ApiResponseHelper.notFound(reply, 'Sidebar item not found');
    }
    if (message === 'PARENT_ITEM_NOT_FOUND') {
      return ApiResponseHelper.notFound(reply, 'Parent sidebar item not found');
    }
    return ApiResponseHelper.badRequest(reply, message);
  }
}

export async function deleteSidebarItem(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { itemId } = req.params as { itemId: string };

    await service.deleteSidebarItem(itemId);
    return ApiResponseHelper.success(reply, 'Sidebar item deleted successfully', { id: itemId });
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    if (message === 'SIDEBAR_ITEM_NOT_FOUND') {
      return ApiResponseHelper.notFound(reply, 'Sidebar item not found');
    }
    if (message === 'SIDEBAR_ITEM_HAS_CHILDREN') {
      return ApiResponseHelper.badRequest(reply, 'Cannot delete sidebar item with children');
    }
    return ApiResponseHelper.badRequest(reply, message);
  }
}

// ========== ROLE SIDEBAR ITEMS HANDLERS ==========

export async function addSidebarItemToRole(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { roleId, itemId } = req.params as { roleId: string; itemId: string };

    const result = await service.addSidebarItemToRole(roleId, itemId);
    return ApiResponseHelper.created(reply, 'Sidebar item assigned to role successfully', result);
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    if (message === 'ROLE_NOT_FOUND') {
      return ApiResponseHelper.notFound(reply, 'Role not found');
    }
    if (message === 'SIDEBAR_ITEM_NOT_FOUND') {
      return ApiResponseHelper.notFound(reply, 'Sidebar item not found');
    }
    if (message === 'SIDEBAR_ITEM_ALREADY_ASSIGNED') {
      return ApiResponseHelper.badRequest(reply, 'Sidebar item already assigned to this role');
    }
    return ApiResponseHelper.badRequest(reply, message);
  }
}

export async function removeSidebarItemFromRole(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { roleId, itemId } = req.params as { roleId: string; itemId: string };

    await service.removeSidebarItemFromRole(roleId, itemId);
    return ApiResponseHelper.success(reply, 'Sidebar item removed from role successfully', {
      roleId,
      itemId,
    });
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    if (message === 'ROLE_NOT_FOUND') {
      return ApiResponseHelper.notFound(reply, 'Role not found');
    }
    return ApiResponseHelper.badRequest(reply, message);
  }
}

export async function bulkAssignSidebarItemsToRole(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { roleId } = req.params as { roleId: string };
    const { sidebarItemIds } = req.body as { sidebarItemIds: string[] };

    if (!Array.isArray(sidebarItemIds) || sidebarItemIds.length === 0) {
      return ApiResponseHelper.badRequest(reply, 'sidebarItemIds must be a non-empty array');
    }

    const result = await service.bulkAssignSidebarItemsToRole(roleId, sidebarItemIds);
    return ApiResponseHelper.success(reply, 'Sidebar items assigned to role successfully', result);
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    if (message === 'ROLE_NOT_FOUND') {
      return ApiResponseHelper.notFound(reply, 'Role not found');
    }
    if (message === 'SOME_SIDEBAR_ITEMS_NOT_FOUND') {
      return ApiResponseHelper.badRequest(reply, 'Some sidebar items not found');
    }
    return ApiResponseHelper.badRequest(reply, message);
  }
}

export async function getRoleSidebarItems(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { roleId } = req.params as { roleId: string };

    const result = await service.getRoleSidebarItems(roleId);
    return ApiResponseHelper.success(reply, 'Role sidebar items retrieved successfully', result);
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    if (message === 'ROLE_NOT_FOUND') {
      return ApiResponseHelper.notFound(reply, 'Role not found');
    }
    return ApiResponseHelper.badRequest(reply, message);
  }
}
