import type { FastifyInstance } from 'fastify';
import {
  getAccount,
  getUserAccounts,
  enrollProduct,
  switchProduct,
  getAccountProducts,
} from '../controllers/account.controller';
import {
  GetAccountRouteSchema,
  GetUserAccountsRouteSchema,
  EnrollProductRouteSchema,
  SwitchProductRouteSchema,
  GetAccountProductsRouteSchema,
} from '../schemas';
import { authGuard } from '../middlewares/authGuard';

export async function accountRoutes(app: FastifyInstance) {
  // Get user's accounts
  app.get('/accounts', { schema: GetUserAccountsRouteSchema, onRequest: [authGuard] }, getUserAccounts);

  // Get account details
  app.get('/accounts/:accountId', { schema: GetAccountRouteSchema, onRequest: [authGuard] }, getAccount);

  // Get account products
  app.get(
    '/accounts/:accountId/products',
    { schema: GetAccountProductsRouteSchema, onRequest: [authGuard] },
    getAccountProducts
  );

  // Enroll account in product
  app.post(
    '/accounts/:accountId/enroll-product',
    { schema: EnrollProductRouteSchema, onRequest: [authGuard] },
    enrollProduct
  );

  // Switch product (get product-scoped token)
  app.post(
    '/auth/switch-product',
    { schema: SwitchProductRouteSchema, onRequest: [authGuard] },
    switchProduct
  );
}
