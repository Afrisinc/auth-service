import type { FastifyInstance } from 'fastify';
import {
  createOrganization,
  getOrganization,
  getOrganizationProducts,
  addMember,
  removeMember,
  listMembers,
  updateOrganization,
  getAllOrganizations,
  deleteOrganization,
} from '../controllers/organization.controller';
import { createOrganizationProduct, updateOrganizationProduct } from '../controllers/product.controller';
import {
  CreateOrganizationRouteSchema,
  GetOrganizationRouteSchema,
  GetOrganizationProductsSchema,
  AddMemberRouteSchema,
  RemoveMemberRouteSchema,
  ListMembersRouteSchema,
  GetAllOrganizationsSchema,
  CreateOrganizationProductSchema,
  UpdateOrganizationProductSchema,
  DeleteOrganizationSchema,
} from '../schemas';
import { authGuard } from '../middlewares/authGuard';

export async function organizationRoutes(app: FastifyInstance) {
  // Create organization
  app.post(
    '/organizations',
    { schema: CreateOrganizationRouteSchema, onRequest: [authGuard] },
    createOrganization
  );

  // Get all organizations with pagination and search
  app.get(
    '/organizations',
    { schema: GetAllOrganizationsSchema, onRequest: [authGuard] },
    getAllOrganizations
  );

  // Get organization
  app.get(
    '/organizations/:organizationId',
    { schema: GetOrganizationRouteSchema, onRequest: [authGuard] },
    getOrganization
  );

  // Get organization products
  app.get(
    '/organizations/:organizationId/products',
    { schema: GetOrganizationProductsSchema, onRequest: [authGuard] },
    getOrganizationProducts
  );

  // Create product for organization
  app.post(
    '/organizations/:organizationId/products',
    { schema: CreateOrganizationProductSchema, onRequest: [authGuard] },
    createOrganizationProduct
  );

  // Update product for organization
  app.put(
    '/organizations/:organizationId/products/:productId',
    { schema: UpdateOrganizationProductSchema, onRequest: [authGuard] },
    updateOrganizationProduct
  );

  // Update organization
  app.put('/organizations/:organizationId', { onRequest: [authGuard] }, updateOrganization);

  // Add member to organization
  app.post(
    '/organizations/:organizationId/members',
    { schema: AddMemberRouteSchema, onRequest: [authGuard] },
    addMember
  );

  // Remove member from organization
  app.delete(
    '/organizations/:organizationId/members/:userId',
    { schema: RemoveMemberRouteSchema, onRequest: [authGuard] },
    removeMember
  );

  // List organization members
  app.get(
    '/organizations/:organizationId/members',
    { schema: ListMembersRouteSchema, onRequest: [authGuard] },
    listMembers
  );

  // Delete organization
  app.delete(
    '/organizations/:organizationId',
    { schema: DeleteOrganizationSchema, onRequest: [authGuard] },
    deleteOrganization
  );
}
