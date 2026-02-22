import { ErrorResponseSchema } from '../responses/common.schema';

export const GetAccountRouteSchema = {
  tags: ['accounts'],
  summary: 'Get account details',
  description: 'Retrieve account information and enrolled products',
  params: {
    type: 'object',
    properties: {
      accountId: {
        type: 'string',
        description: 'Account ID',
      },
    },
    required: ['accountId'],
  },
  security: [{ bearerAuth: [] }],
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        resp_msg: { type: 'string', example: 'Account retrieved successfully' },
        resp_code: { type: 'number', example: 1000 },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            type: { type: 'string', enum: ['INDIVIDUAL', 'ORGANIZATION'] },
            owner_user_id: { type: 'string' },
            organization_id: { type: 'string', nullable: true },
            products: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  account_id: { type: 'string' },
                  product_id: { type: 'string' },
                  status: { type: 'string', enum: ['PROVISIONING', 'ACTIVE', 'SUSPENDED'] },
                  plan: { type: 'string', enum: ['FREE', 'PRO', 'ENTERPRISE'] },
                  external_resource_id: { type: 'string', nullable: true },
                  product: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                      code: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    401: ErrorResponseSchema,
    404: ErrorResponseSchema,
  },
} as const;

export const GetUserAccountsRouteSchema = {
  tags: ['accounts'],
  summary: 'Get user accounts',
  description: 'Retrieve all accounts belonging to the authenticated user',
  security: [{ bearerAuth: [] }],
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        resp_msg: { type: 'string', example: 'Accounts retrieved successfully' },
        resp_code: { type: 'number', example: 1000 },
        data: {
          type: 'object',
          properties: {
            accounts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  type: { type: 'string', enum: ['INDIVIDUAL', 'ORGANIZATION'] },
                  owner_user_id: { type: 'string' },
                  organization_id: { type: 'string', nullable: true },
                  products: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        account_id: { type: 'string' },
                        product_id: { type: 'string' },
                        status: { type: 'string', enum: ['ACTIVE', 'SUSPENDED'] },
                        plan: { type: 'string', enum: ['FREE', 'PRO', 'ENTERPRISE'] },
                        product: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            name: { type: 'string' },
                            code: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    401: ErrorResponseSchema,
  },
} as const;

export const EnrollProductRouteSchema = {
  tags: ['products'],
  summary: 'Enroll account in product',
  description: 'Register an account for a specific product with a chosen plan',
  params: {
    type: 'object',
    properties: {
      accountId: {
        type: 'string',
        description: 'Account ID',
      },
    },
    required: ['accountId'],
  },
  body: {
    type: 'object',
    properties: {
      product_code: {
        type: 'string',
        description: 'Product code (e.g. notify, media, billing)',
      },
      plan: {
        type: 'string',
        enum: ['FREE', 'PRO', 'ENTERPRISE'],
        description: 'Subscription plan (default: FREE)',
      },
    },
    required: ['product_code'],
  },
  security: [{ bearerAuth: [] }],
  response: {
    201: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        resp_msg: { type: 'string', example: 'Product enrollment successful' },
        resp_code: { type: 'number', example: 1001 },
        data: {
          type: 'object',
          properties: {
            enrollment_id: { type: 'string' },
            product_code: { type: 'string' },
            account_id: { type: 'string' },
            plan: { type: 'string', enum: ['FREE', 'PRO', 'ENTERPRISE'] },
            status: { type: 'string', enum: ['PROVISIONING', 'ACTIVE', 'SUSPENDED'] },
          },
        },
      },
    },
    400: ErrorResponseSchema,
    401: ErrorResponseSchema,
  },
} as const;

export const SwitchProductRouteSchema = {
  tags: ['auth'],
  summary: 'Switch to product context',
  description: 'Get a product-scoped token for accessing a specific product',
  body: {
    type: 'object',
    properties: {
      account_id: {
        type: 'string',
        description: 'Account ID',
      },
      product_code: {
        type: 'string',
        description: 'Product code to switch to',
      },
    },
    required: ['account_id', 'product_code'],
  },
  security: [{ bearerAuth: [] }],
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        resp_msg: { type: 'string', example: 'Product switched successfully' },
        resp_code: { type: 'number', example: 1000 },
        data: {
          type: 'object',
          properties: {
            account_id: { type: 'string' },
            product: { type: 'string' },
            account_type: { type: 'string', enum: ['INDIVIDUAL', 'ORGANIZATION'] },
            token: { type: 'string', description: 'Product-scoped JWT token' },
          },
        },
      },
    },
    400: ErrorResponseSchema,
    401: ErrorResponseSchema,
  },
} as const;

export const GetAccountProductsRouteSchema = {
  tags: ['products'],
  summary: 'Get account enrolled products',
  description: 'Retrieve all products the account is enrolled in',
  params: {
    type: 'object',
    properties: {
      accountId: {
        type: 'string',
        description: 'Account ID',
      },
    },
    required: ['accountId'],
  },
  security: [{ bearerAuth: [] }],
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        resp_msg: { type: 'string', example: 'Products retrieved successfully' },
        resp_code: { type: 'number', example: 1000 },
        data: {
          type: 'object',
          properties: {
            products: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  account_id: { type: 'string' },
                  product_id: { type: 'string' },
                  status: { type: 'string', enum: ['PROVISIONING', 'ACTIVE', 'SUSPENDED'] },
                  plan: { type: 'string', enum: ['FREE', 'PRO', 'ENTERPRISE'] },
                  external_resource_id: { type: 'string', nullable: true },
                  product: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                      code: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
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

export const GetAllAccountsSchema = {
  tags: ['accounts'],
  summary: 'Get all accounts with pagination and search',
  description:
    'Retrieve a paginated list of accounts with optional search filtering and type filtering. Requires authentication.',
  security: [{ bearerAuth: [] }],
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
        default: 10,
        description: 'Items per page (default: 10, max: 100)',
      },
      search: {
        type: 'string',
        description: 'Search term to filter accounts by ID or owner email',
      },
      type: {
        type: 'string',
        enum: ['INDIVIDUAL', 'ORGANIZATION'],
        description: 'Filter accounts by type',
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        resp_msg: { type: 'string', example: 'Accounts retrieved successfully' },
        resp_code: { type: 'integer', example: 1000 },
        data: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  type: { type: 'string', enum: ['INDIVIDUAL', 'ORGANIZATION'] },
                  owner_user_id: { type: 'string' },
                  organization_id: { type: 'string', nullable: true },
                  createdAt: { type: 'string' },
                  updatedAt: { type: 'string' },
                  owner: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      email: { type: 'string' },
                      firstName: { type: 'string', nullable: true },
                      lastName: { type: 'string', nullable: true },
                    },
                  },
                  products: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        account_id: { type: 'string' },
                        product_id: { type: 'string' },
                        status: { type: 'string', enum: ['PROVISIONING', 'ACTIVE', 'SUSPENDED'] },
                        plan: { type: 'string', enum: ['FREE', 'PRO', 'ENTERPRISE'] },
                        product: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            name: { type: 'string' },
                            code: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                },
              },
              description: 'Array of account objects',
            },
            pagination: PaginationSchema,
          },
        },
      },
    },
    400: ErrorResponseSchema,
    401: ErrorResponseSchema,
  },
} as const;
