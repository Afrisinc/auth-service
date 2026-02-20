import { ErrorResponseSchema } from '../responses/common.schema';

export const CreateOrganizationRouteSchema = {
  tags: ['organizations'],
  summary: 'Create a new organization',
  description: 'Create a new organization with name, legal name, country, and optional tax ID',
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
