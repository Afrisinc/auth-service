import type { FastifyInstance } from 'fastify';
import {
  grantProductAccess,
  revokeProductAccess,
  getMemberProducts,
  getOrganizationProductAccess,
} from '../controllers/member-product-access.controller';
import {
  GrantProductAccessSchema,
  RevokeProductAccessSchema,
  GetMemberProductsSchema,
  GetOrganizationProductAccessSchema,
} from '../schemas/routes/member-product-access.schema';
import { authGuard } from '../middlewares/authGuard';

export async function memberProductAccessRoutes(app: FastifyInstance) {
  app.post(
    '/organizations/:organizationId/members/:userId/products',
    { schema: GrantProductAccessSchema, onRequest: [authGuard] },
    grantProductAccess
  );

  app.delete(
    '/organizations/:organizationId/members/:userId/products/:productCode',
    { schema: RevokeProductAccessSchema, onRequest: [authGuard] },
    revokeProductAccess
  );

  app.get(
    '/organizations/:organizationId/members/:userId/products',
    { schema: GetMemberProductsSchema, onRequest: [authGuard] },
    getMemberProducts
  );

  app.get(
    '/organizations/:organizationId/product-access',
    { schema: GetOrganizationProductAccessSchema, onRequest: [authGuard] },
    getOrganizationProductAccess
  );
}
