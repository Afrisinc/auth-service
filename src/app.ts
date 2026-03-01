import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import type { FastifyInstance } from 'fastify';
import Fastify from 'fastify';
import path from 'path';
import { getCorsConfig } from './config/cors';
import { swaggerConfig, swaggerCspDirectives, swaggerUiConfig } from './config/swagger';
import { errorHandler } from './middlewares/errorHandler';
import { registerRoutes } from './routes/index';
import { logger } from './utils/logger';
import rabbitPlugin from './plugins/rabbitPlugin';

/**
 * Creates and configures the Fastify application instance
 * Registers plugins, middlewares, error handlers, and routes
 */
const createApp = async (): Promise<FastifyInstance> => {
  const app = Fastify({
    logger: true,
    trustProxy: false,
    ajv: {
      customOptions: {
        removeAdditional: 'all',
        useDefaults: true,
        coerceTypes: true,
        strict: false,
      },
    },
  });

  try {
    // Register security & CORS plugins
    await app.register(fastifyCors, getCorsConfig());

    await app.register(fastifyHelmet, {
      contentSecurityPolicy: { directives: swaggerCspDirectives },
      hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
      frameguard: { action: 'deny' },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    });

    // Register file handling plugins
    await app.register(fastifyMultipart, {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    });

    await app.register(fastifyStatic, {
      root: path.resolve(process.cwd(), 'uploads'),
      prefix: '/uploads/',
    });

    // Register API documentation plugins
    await app.register(fastifySwagger, swaggerConfig);
    await app.register(fastifySwaggerUI, swaggerUiConfig);

    // Register message queue plugin
    await app.register(rabbitPlugin);

    // Set global error handler
    app.setErrorHandler(errorHandler);

    // Register application routes
    await registerRoutes(app);

    // Log successful initialization
    logger.info({ routes: app.printRoutes() }, 'Application initialized successfully');
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      'Error during application initialization'
    );
    throw error;
  }

  return app;
};

export { createApp };
