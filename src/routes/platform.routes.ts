import type { FastifyInstance } from 'fastify';
import {
  getAnalyticsOverview,
  getAnalyticsUsers,
  getAnalyticsAccounts,
  getAnalyticsProducts,
  getAnalyticsGrowth,
} from '../modules/platform/platform.controller';
import {
  AnalyticsOverviewSchema,
  AnalyticsUsersSchema,
  AnalyticsAccountsSchema,
  AnalyticsProductsSchema,
  AnalyticsGrowthSchema,
} from '../schemas/routes/analytics.schema';
import { authGuard } from '../middlewares/authGuard';
import { platformAdminGuard } from '../modules/platform/platformAdminGuard';

export async function platformRoutes(app: FastifyInstance) {
  // All platform analytics routes require authentication and platform_admin role
  const platformMiddleware = [authGuard, platformAdminGuard];

  // GET /platform/analytics/overview
  app.get(
    '/platform/analytics/overview',
    { schema: AnalyticsOverviewSchema, onRequest: platformMiddleware },
    getAnalyticsOverview
  );

  // GET /platform/analytics/users
  app.get(
    '/platform/analytics/users',
    { schema: AnalyticsUsersSchema, onRequest: platformMiddleware },
    getAnalyticsUsers
  );

  // GET /platform/analytics/accounts
  app.get(
    '/platform/analytics/accounts',
    { schema: AnalyticsAccountsSchema, onRequest: platformMiddleware },
    getAnalyticsAccounts
  );

  // GET /platform/analytics/products
  app.get(
    '/platform/analytics/products',
    { schema: AnalyticsProductsSchema, onRequest: platformMiddleware },
    getAnalyticsProducts
  );

  // GET /platform/analytics/growth
  app.get(
    '/platform/analytics/growth',
    { schema: AnalyticsGrowthSchema, onRequest: platformMiddleware },
    getAnalyticsGrowth
  );
}
