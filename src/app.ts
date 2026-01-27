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
    // Register CORS plugin for cross-origin requests
    logger.debug({}, 'Registering CORS plugin');
    const corsConfig = getCorsConfig();
    await app.register(fastifyCors, corsConfig);

    // Register Multipart for file uploads
    logger.debug({}, 'Registering Multipart plugin for file uploads');
    await app.register(fastifyMultipart, {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    });

    // ESM-compatible __dirname
    // Register static file serving for uploads directory (use process.cwd() for absolute path)
    logger.debug({}, 'Registering static file serving for uploads directory');
    await app.register(fastifyStatic, {
      root: path.resolve(process.cwd(), 'uploads'),
      prefix: '/uploads/',
    });

    // Register Helmet for security headers
    logger.debug({}, 'Registering Helmet security plugin');
    await app.register(fastifyHelmet, {
      contentSecurityPolicy: {
        directives: swaggerCspDirectives,
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      frameguard: {
        action: 'deny',
      },
      referrerPolicy: {
        policy: 'strict-origin-when-cross-origin',
      },
    });

    // Register Swagger documentation plugin
    logger.debug({}, 'Registering Swagger documentation plugin');
    await app.register(fastifySwagger, swaggerConfig);

    // Register Swagger UI plugin
    logger.debug({}, 'Registering Swagger UI plugin');
    await app.register(fastifySwaggerUI, swaggerUiConfig);

    // Set global error handler
    app.setErrorHandler(errorHandler);

    // Register all application routes
    logger.debug({}, 'Registering application routes');
    await registerRoutes(app);

    // Post-registration hooks
    logger.info(
      {
        routes: app.printRoutes(),
      },
      'Application routes registered successfully'
    );
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
