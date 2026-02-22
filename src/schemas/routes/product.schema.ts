import { ErrorResponseSchema } from '../responses/common.schema';

export const GetProductEnrollmentsSchema = {
  tags: ['products'],
  summary: 'Get all products with enrollment statistics',
  description:
    'Retrieve all products with enrollment counts by status (ACTIVE, SUSPENDED) and plan (FREE, PRO, ENTERPRISE)',
  security: [{ bearerAuth: [] }],
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        resp_msg: { type: 'string', example: 'Products enrollments retrieved successfully' },
        resp_code: { type: 'integer', example: 1000 },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              productId: { type: 'string' },
              productName: { type: 'string' },
              productCode: { type: 'string' },
              totalEnrollments: { type: 'integer' },
              active: { type: 'integer' },
              suspended: { type: 'integer' },
              plans: {
                type: 'object',
                properties: {
                  FREE: { type: 'integer' },
                  PRO: { type: 'integer' },
                  ENTERPRISE: { type: 'integer' },
                },
              },
            },
          },
        },
      },
    },
    400: ErrorResponseSchema,
    401: ErrorResponseSchema,
  },
} as const;

const PaginationSchema = {
  type: 'object',
  properties: {
    page: {
      type: 'integer',
      minimum: 1,
      description: 'Current page number (1-indexed)',
    },
    limit: {
      type: 'integer',
      minimum: 1,
      maximum: 100,
      description: 'Number of items per page',
    },
    totalItems: {
      type: 'integer',
      description: 'Total number of items',
    },
    totalPages: {
      type: 'integer',
      description: 'Total number of pages',
    },
    hasNext: {
      type: 'boolean',
      description: 'Whether there is a next page',
    },
    hasPrev: {
      type: 'boolean',
      description: 'Whether there is a previous page',
    },
  },
} as const;

export const GetProductAccountsSchema = {
  tags: ['products'],
  summary: 'Get accounts enrolled in a specific product',
  description: 'Retrieve all accounts enrolled in a product with owner details and enrollment information',
  params: {
    type: 'object',
    properties: {
      productId: {
        type: 'string',
        description: 'Product ID',
      },
    },
    required: ['productId'],
  },
  querystring: {
    type: 'object',
    properties: {
      page: {
        type: 'integer',
        minimum: 1,
        default: 1,
        description: 'Page number (default: 1)',
      },
      limit: {
        type: 'integer',
        minimum: 1,
        maximum: 100,
        default: 50,
        description: 'Items per page (default: 50, max: 100)',
      },
      status: {
        type: 'string',
        enum: ['ACTIVE', 'SUSPENDED', 'PENDING'],
        description: 'Filter by enrollment status',
      },
    },
  },
  security: [{ bearerAuth: [] }],
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        resp_msg: { type: 'string', example: 'Product accounts retrieved successfully' },
        resp_code: { type: 'integer', example: 1000 },
        data: {
          type: 'object',
          properties: {
            product: {
              type: 'object',
              properties: {
                productId: { type: 'string' },
                productName: { type: 'string' },
                productCode: { type: 'string' },
              },
            },
            accounts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  type: { type: 'string', enum: ['INDIVIDUAL', 'ORGANIZATION'] },
                  owner_user_id: { type: 'string' },
                  owner: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      email: { type: 'string' },
                      firstName: { type: 'string', nullable: true },
                      lastName: { type: 'string', nullable: true },
                    },
                  },
                  enrollment: {
                    type: 'object',
                    properties: {
                      enrollmentId: { type: 'string' },
                      status: { type: 'string', enum: ['ACTIVE', 'SUSPENDED', 'PENDING'] },
                      plan: { type: 'string', enum: ['FREE', 'PRO', 'ENTERPRISE'] },
                      enrolledAt: { type: 'string', format: 'date-time' },
                    },
                  },
                },
              },
            },
            pagination: PaginationSchema,
          },
        },
      },
    },
    400: ErrorResponseSchema,
    401: ErrorResponseSchema,
    404: ErrorResponseSchema,
  },
} as const;

export const CreateProductSchema = {
  tags: ['products'],
  summary: 'Create a new product',
  description: 'Create a new product with name, code, and optional description',
  body: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Product name',
      },
      code: {
        type: 'string',
        description: 'Product code (short identifier, must be unique)',
      },
      description: {
        type: 'string',
        description: 'Product description (optional)',
        nullable: true,
      },
    },
    required: ['name', 'code'],
  },
  security: [{ bearerAuth: [] }],
  response: {
    201: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        resp_msg: { type: 'string', example: 'Product created successfully' },
        resp_code: { type: 'integer', example: 1001 },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            code: { type: 'string' },
            description: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    400: ErrorResponseSchema,
    401: ErrorResponseSchema,
  },
} as const;
