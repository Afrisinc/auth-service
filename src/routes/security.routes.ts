import type { FastifyInstance } from 'fastify';
import { getSecurityOverview } from '../controllers/security.controller';
import { GetSecurityOverviewSchema } from '../schemas/routes/security.schema';
import { authGuard } from '../middlewares/authGuard';

export async function securityRoutes(app: FastifyInstance) {
  // Get security overview with failed logins, top IPs, and suspicious activity
  app.get(
    '/platform/security/overview',
    { schema: GetSecurityOverviewSchema, onRequest: [authGuard] },
    getSecurityOverview
  );
}
