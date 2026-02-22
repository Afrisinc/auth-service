import { UserEntitySchema } from '../entities/user.schema';
import { ErrorResponseSchema } from '../responses/common.schema';

export const CreateOrganizationRouteSchema = {
  tags: ['organizations'],
  summary: 'Create a new organization',
  description:
    'Create a new organization with name, legal name, country, and optional tax ID, email, phone, and location',
  body: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Organization name',
      },
      legal_name: {
        type: 'string',
        description: 'Legal name of organization',
      },
      country: {
        type: 'string',
        description: 'Country of organization',
      },
      tax_id: {
        type: 'string',
        description: 'Tax ID (optional)',
      },
      org_email: {
        type: 'string',
        format: 'email',
        description: 'Organization email address (optional)',
      },
      org_phone: {
        type: 'string',
        description: 'Organization phone number (optional)',
      },
      location: {
        type: 'string',
        description: 'Organization location/address (optional)',
      },
    },
    required: ['name'],
  },
  security: [{ bearerAuth: [] }],
  response: {
    201: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        resp_msg: { type: 'string', example: 'Organization created successfully' },
        resp_code: { type: 'number', example: 1001 },
        data: {
          type: 'object',
          properties: {
            organization_id: { type: 'string' },
            account_id: { type: 'string' },
            name: { type: 'string' },
            legal_name: { type: 'string', nullable: true },
            country: { type: 'string', nullable: true },
            tax_id: { type: 'string', nullable: true },
            org_email: { type: 'string', nullable: true },
            org_phone: { type: 'string', nullable: true },
            location: { type: 'string', nullable: true },
          },
        },
      },
    },
    400: ErrorResponseSchema,
    401: ErrorResponseSchema,
  },
} as const;

export const GetOrganizationRouteSchema = {
  tags: ['organizations'],
  summary: 'Get organization details',
  description: 'Retrieve organization information and members',
  params: {
    type: 'object',
    properties: {
      organizationId: {
        type: 'string',
        description: 'Organization ID',
      },
    },
    required: ['organizationId'],
  },
  security: [{ bearerAuth: [] }],
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        resp_msg: { type: 'string', example: 'Organization retrieved successfully' },
        resp_code: { type: 'number', example: 1000 },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            legal_name: { type: 'string', nullable: true },
            country: { type: 'string', nullable: true },
            tax_id: { type: 'string', nullable: true },
            org_email: { type: 'string', nullable: true },
            org_phone: { type: 'string', nullable: true },
            location: { type: 'string', nullable: true },
            members: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  organization_id: { type: 'string' },
                  user_id: { type: 'string' },
                  role: { type: 'string', enum: ['OWNER', 'ADMIN', 'MEMBER'] },
                  user: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      email: { type: 'string' },
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

export const AddMemberRouteSchema = {
  tags: ['organizations'],
  summary: 'Add member to organization',
  description: 'Add a user as a member of the organization with specified role',
  params: {
    type: 'object',
    properties: {
      organizationId: {
        type: 'string',
        description: 'Organization ID',
      },
    },
    required: ['organizationId'],
  },
  body: {
    type: 'object',
    properties: {
      user_id: {
        type: 'string',
        description: 'User ID to add',
      },
      role: {
        type: 'string',
        enum: ['OWNER', 'ADMIN', 'MEMBER'],
        description: 'Member role',
      },
    },
    required: ['user_id', 'role'],
  },
  security: [{ bearerAuth: [] }],
  response: {
    201: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        resp_msg: { type: 'string', example: 'Member added successfully' },
        resp_code: { type: 'number', example: 1001 },
        data: {
          type: 'object',
          properties: {
            member_id: { type: 'string' },
            organization_id: { type: 'string' },
            user_id: { type: 'string' },
            role: { type: 'string', enum: ['OWNER', 'ADMIN', 'MEMBER'] },
          },
        },
      },
    },
    400: ErrorResponseSchema,
    401: ErrorResponseSchema,
  },
} as const;

export const RemoveMemberRouteSchema = {
  tags: ['organizations'],
  summary: 'Remove member from organization',
  description: 'Remove a user from organization',
  params: {
    type: 'object',
    properties: {
      organizationId: {
        type: 'string',
        description: 'Organization ID',
      },
      userId: {
        type: 'string',
        description: 'User ID to remove',
      },
    },
    required: ['organizationId', 'userId'],
  },
  security: [{ bearerAuth: [] }],
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        resp_msg: { type: 'string', example: 'Member removed successfully' },
        resp_code: { type: 'number', example: 1000 },
        data: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
    400: ErrorResponseSchema,
    401: ErrorResponseSchema,
  },
} as const;

export const ListMembersRouteSchema = {
  tags: ['organizations'],
  summary: 'List organization members',
  description: 'Get all members of an organization',
  params: {
    type: 'object',
    properties: {
      organizationId: {
        type: 'string',
        description: 'Organization ID',
      },
    },
    required: ['organizationId'],
  },
  security: [{ bearerAuth: [] }],
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        resp_msg: { type: 'string', example: 'Members retrieved successfully' },
        resp_code: { type: 'number', example: 1000 },
        data: {
          type: 'object',
          properties: {
            members: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  organization_id: { type: 'string' },
                  user_id: { type: 'string' },
                  role: { type: 'string', enum: ['OWNER', 'ADMIN', 'MEMBER'] },
                  email: UserEntitySchema.properties.email,
                  firstName: UserEntitySchema.properties.firstName,
                  lastName: UserEntitySchema.properties.lastName,
                  phone: UserEntitySchema.properties.phone,
                  status: UserEntitySchema.properties.status,
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

export const GetAllOrganizationsSchema = {
  tags: ['organizations'],
  summary: 'Get all organizations with pagination and search',
  description:
    'Retrieve a paginated list of organizations with optional search filtering and status filtering. Requires authentication.',
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
        description: 'Search term to filter organizations by name, legal name, or email',
      },
      status: {
        type: 'string',
        description: 'Filter organizations by status',
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        resp_msg: { type: 'string', example: 'Organizations retrieved successfully' },
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
                  name: { type: 'string' },
                  legal_name: { type: 'string', nullable: true },
                  country: { type: 'string', nullable: true },
                  tax_id: { type: 'string', nullable: true },
                  org_email: { type: 'string', nullable: true },
                  org_phone: { type: 'string', nullable: true },
                  location: { type: 'string', nullable: true },
                  status: { type: 'string', nullable: true },
                  createdAt: { type: 'string' },
                  updatedAt: { type: 'string' },
                  members: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        user_id: { type: 'string' },
                        role: { type: 'string', enum: ['OWNER', 'ADMIN', 'MEMBER'] },
                        user: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            email: { type: 'string' },
                            firstName: { type: 'string', nullable: true },
                            lastName: { type: 'string', nullable: true },
                          },
                        },
                      },
                    },
                  },
                },
              },
              description: 'Array of organization objects',
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
