import type { FastifyInstance } from 'fastify';
import {
  createRole,
  getRole,
  getAllRoles,
  updateRole,
  deleteRole,
  addPermissionToRole,
  removePermissionFromRole,
  bulkAssignPermissionsToRole,
  getRolePermissions,
  createPermission,
  getPermission,
  getAllPermissions,
  updatePermission,
  deletePermission,
  createSidebarItem,
  getSidebarItem,
  getAllSidebarItems,
  updateSidebarItem,
  deleteSidebarItem,
  addSidebarItemToRole,
  removeSidebarItemFromRole,
  bulkAssignSidebarItemsToRole,
  getRoleSidebarItems,
} from '../controllers/admin.controller';

export async function adminRoutes(app: FastifyInstance) {
  // ========== ROLE ROUTES ==========
  app.post('/api/admin/roles', createRole);
  app.get('/api/admin/roles', getAllRoles);
  app.get('/api/admin/roles/:roleId', getRole);
  app.put('/api/admin/roles/:roleId', updateRole);
  app.delete('/api/admin/roles/:roleId', deleteRole);

  // ========== ROLE PERMISSIONS ROUTES ==========
  app.get('/api/admin/roles/:roleId/permissions', getRolePermissions);
  app.post('/api/admin/roles/:roleId/permissions', bulkAssignPermissionsToRole);
  app.post('/api/admin/roles/:roleId/permissions/:permissionId', addPermissionToRole);
  app.delete('/api/admin/roles/:roleId/permissions/:permissionId', removePermissionFromRole);

  // ========== PERMISSION ROUTES ==========
  app.post('/api/admin/permissions', createPermission);
  app.get('/api/admin/permissions', getAllPermissions);
  app.get('/api/admin/permissions/:permissionId', getPermission);
  app.put('/api/admin/permissions/:permissionId', updatePermission);
  app.delete('/api/admin/permissions/:permissionId', deletePermission);

  // ========== SIDEBAR ROUTES ==========
  app.post('/api/admin/sidebar-items', createSidebarItem);
  app.get('/api/admin/sidebar-items', getAllSidebarItems);
  app.get('/api/admin/sidebar-items/:itemId', getSidebarItem);
  app.put('/api/admin/sidebar-items/:itemId', updateSidebarItem);
  app.delete('/api/admin/sidebar-items/:itemId', deleteSidebarItem);

  // ========== ROLE SIDEBAR ITEMS ROUTES ==========
  app.get('/api/admin/roles/:roleId/sidebar-items', getRoleSidebarItems);
  app.post('/api/admin/roles/:roleId/sidebar-items', bulkAssignSidebarItemsToRole);
  app.post('/api/admin/roles/:roleId/sidebar-items/:itemId', addSidebarItemToRole);
  app.delete('/api/admin/roles/:roleId/sidebar-items/:itemId', removeSidebarItemFromRole);
}
