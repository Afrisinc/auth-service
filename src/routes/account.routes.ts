import type { FastifyInstance } from 'fastify';
import {
  getAccount,
  getUserAccounts,
  getUserAccountsById,
  enrollProduct,
  removeProduct,
  switchProduct,
  getAccountProducts,
  getAllAccounts,
} from '../controllers/account.controller';
import {
  GetAccountRouteSchema,
  GetUserAccountsRouteSchema,
  EnrollProductRouteSchema,
  RemoveProductRouteSchema,
  SwitchProductRouteSchema,
  GetAccountProductsRouteSchema,
  GetAllAccountsSchema,
} from '../schemas';
import { authGuard } from '../middlewares/authGuard';

export async function accountRoutes(app: FastifyInstance) {
  // Get user's accounts
  app.get('/accounts', { schema: GetUserAccountsRouteSchema, onRequest: [authGuard] }, getUserAccounts);

  // Get all accounts with pagination and search
  app.get('/accounts/all', { schema: GetAllAccountsSchema, onRequest: [authGuard] }, getAllAccounts);

  // Get user's accounts by user_id
  app.get(
    '/accounts/user/:userId',
    { schema: GetUserAccountsRouteSchema, onRequest: [authGuard] },
    getUserAccountsById
  );

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

  // Remove product from account
  app.delete(
    '/accounts/:accountId/products/:productCode',
    { schema: RemoveProductRouteSchema, onRequest: [authGuard] },
    removeProduct
  );

  // Switch product (get product-scoped token)
  app.post(
    '/auth/switch-product',
    { schema: SwitchProductRouteSchema, onRequest: [authGuard] },
    switchProduct
  );
}
