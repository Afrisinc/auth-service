import type { FastifyInstance } from 'fastify';
import {
  createOrganization,
  getOrganization,
  addMember,
  removeMember,
  listMembers,
  updateOrganization,
  getAllOrganizations,
} from '../controllers/organization.controller';
import {
  CreateOrganizationRouteSchema,
  GetOrganizationRouteSchema,
  AddMemberRouteSchema,
  RemoveMemberRouteSchema,
  ListMembersRouteSchema,
  GetAllOrganizationsSchema,
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
}
