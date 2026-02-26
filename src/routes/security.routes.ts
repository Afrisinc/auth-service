import type { FastifyInstance } from 'fastify';
import { getSecurityOverview, getLoginEvents } from '../controllers/security.controller';
import { GetSecurityOverviewSchema, GetLoginEventsSchema } from '../schemas/routes/security.schema';
import { authGuard } from '../middlewares/authGuard';

export async function securityRoutes(app: FastifyInstance) {
  // Get security overview with failed logins, top IPs, and suspicious activity
  app.get(
    '/platform/security/overview',
    { schema: GetSecurityOverviewSchema, onRequest: [authGuard] },
    getSecurityOverview
  );
  app.get(
    '/platform/security/loginevents',
    { schema: GetLoginEventsSchema, onRequest: [authGuard] },
    getLoginEvents
  );
}
