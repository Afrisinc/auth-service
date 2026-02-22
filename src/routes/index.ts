import { HealthRouteSchema } from '@/schemas';
import type { FastifyInstance } from 'fastify';
import { authRoutes } from './auth.routes';
import { userRoutes } from './user.routes';
import { organizationRoutes } from './organization.routes';
import { accountRoutes } from './account.routes';
import { platformRoutes } from './platform.routes';
import { productRoutes } from './product.routes';
import { securityRoutes } from './security.routes';

export async function registerRoutes(app: FastifyInstance) {
  app.get(
    '/health',
    {
      schema: HealthRouteSchema,
    },
    async () => {
      return { status: 'ok', message: 'Server is running' };
    }
  );

  app.register(authRoutes);
  app.register(userRoutes);
  app.register(organizationRoutes);
  app.register(accountRoutes);
  app.register(platformRoutes);
  app.register(productRoutes);
  app.register(securityRoutes);
}
