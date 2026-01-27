import type { FastifySwaggerUiOptions } from '@fastify/swagger-ui';

/**
 * Determine if app is in production
 */
const isProduction = process.env.NODE_ENV === 'production';

const getServerUrl = (): string => {
  if (isProduction) {
    return process.env.API_BASE_URL || 'https://api.afrisinc.com';
  }
  // Use localhost + port from env
  return `http://localhost:${process.env.PORT || 8091}`;
};

/**
 * Fastify Swagger Plugin Configuration (OpenAPI 3.0)
 * Generates OpenAPI specification for API documentation
 */
export const swaggerConfig = {
  mode: 'dynamic' as const,
  openapi: {
    openapi: '3.0.0',
    info: {
      title: 'Auth Service API Documentation',
      description:
        'Production-ready REST API built with Fastify, TypeScript, and Prisma ORM. ' +
        'Comprehensive e-commerce and chat functionality with JWT-based authentication.',
      version: '1.0.0',
      contact: {
        name: 'API Support',
        url: 'https://github.com/afrisinc/homexa-bn',
        email: 'support@homexa.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    // 🔑 Use relative URL only
    servers: [
      {
        url: getServerUrl(),
        description: isProduction ? 'Production Server' : 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http' as const,
          scheme: 'bearer' as const,
          bearerFormat: 'JWT',
          description:
            'JWT Bearer token for authentication. ' +
            'Include in the header: "Authorization: Bearer <token>"',
        },
      },
    },
    tags: [
      { name: 'health', description: 'Service Health & Status' },
      { name: 'auth', description: 'Authentication (Login, Register, Refresh)' },
      { name: 'users', description: 'User Management' },
      { name: 'categories', description: 'Category Management' },
      { name: 'products', description: 'Product Management' },
      { name: 'chat', description: 'Chat & Messaging' },
    ],
    externalDocs: {
      description: 'GitHub Repository',
      url: 'https://github.com/afrisinc/homexa-bn',
    },
  },
  hideUntagged: false,
};

/**
 * Fastify Swagger UI Plugin Configuration
 */
export const swaggerUiConfig: FastifySwaggerUiOptions = {
  routePrefix: '/docs',
  staticCSP: false, // Important to disable strict CSP
  uiConfig: {
    layout: 'BaseLayout',
    deepLinking: true,
    docExpansion: 'none',
    defaultModelExpandDepth: 2,
    filter: true,
    tryItOutEnabled: true,
    persistAuthorization: true,
    displayOperationId: false,
  },
  transformSpecificationClone: true,
};

/**
 * Content Security Policy for Swagger UI
 * Allows CDN + Cloudflare resources
 */
export const swaggerCspDirectives = {
  defaultSrc: ["'self'"],
  styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net', 'https://unpkg.com'],
  scriptSrc: [
    "'self'",
    "'unsafe-inline'",
    'https://cdn.jsdelivr.net',
    'https://unpkg.com',
    'https://static.cloudflareinsights.com', // optional for CF analytics
  ],
  imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
  fontSrc: ["'self'", 'data:', 'https:'],
  connectSrc: ["'self'", 'https:'],
  objectSrc: ["'none'"],
  frameSrc: ["'none'"],
  mediaSrc: ["'self'"],
  childSrc: ["'none'"],
};

/**
 * ReDoc Configuration (Optional)
 */
export const redocConfig = {
  routePrefix: '/redoc',
  uiConfig: {
    title: 'Auth Service API - ReDoc Documentation',
    specUrl: '/swagger/json',
    hideHostname: false,
    hideDownloadButton: false,
    expandDefaultServerVariables: true,
    sortEnumValuesAlphabetically: false,
    sortPropsAlphabetically: false,
    showExtensions: false,
    disableSearch: false,
    scrollYOffset: 0,
  },
};
