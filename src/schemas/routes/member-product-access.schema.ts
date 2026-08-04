import { ErrorResponseSchema } from '../responses/common.schema';

export const GrantProductAccessSchema = {
  tags: ['member-product-access'],
  summary: 'Grant product access to organization member',
  description: 'Admin grants a specific product access to an organization member',
  params: {
    type: 'object',
    properties: {
      organizationId: { type: 'string', description: 'Organization ID', default: 'afrisinc-org-id' },
      userId: { type: 'string', description: 'User ID to grant access to' },
    },
    required: ['organizationId', 'userId'],
  },
  body: {
    type: 'object',
    properties: {
      product_code: { type: 'string', description: 'Product code to grant access to', default: 'notify' },
      role_id: { type: 'string', description: 'Role ID for product access (optional)' },
    },
    required: ['product_code'],
  },
  security: [{ bearerAuth: [] }],
  response: {
    201: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        resp_msg: { type: 'string', example: 'Product access granted successfully' },
        resp_code: { type: 'number', example: 1001 },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            organization_id: { type: 'string' },
            user_id: { type: 'string' },
            product_code: { type: 'string' },
            role_id: { type: 'string', nullable: true },
            granted_by: { type: 'string' },
          },
        },
      },
    },
    400: ErrorResponseSchema,
    401: ErrorResponseSchema,
    404: ErrorResponseSchema,
  },
} as const;

export const RevokeProductAccessSchema = {
  tags: ['member-product-access'],
  summary: 'Revoke product access from organization member',
  description: 'Admin revokes a specific product access from an organization member',
  params: {
    type: 'object',
    properties: {
      organizationId: { type: 'string', description: 'Organization ID', default: 'afrisinc-org-id' },
      userId: { type: 'string', description: 'User ID to revoke access from' },
      productCode: { type: 'string', description: 'Product code to revoke', default: 'notify' },
    },
    required: ['organizationId', 'userId', 'productCode'],
  },
  security: [{ bearerAuth: [] }],
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        resp_msg: { type: 'string', example: 'Product access revoked successfully' },
        resp_code: { type: 'number', example: 1000 },
        data: {
          type: 'object',
          properties: {
            organization_id: { type: 'string' },
            user_id: { type: 'string' },
            product_code: { type: 'string' },
            revoked: { type: 'boolean', example: true },
          },
        },
      },
    },
    400: ErrorResponseSchema,
    401: ErrorResponseSchema,
    404: ErrorResponseSchema,
  },
} as const;

export const GetMemberProductsSchema = {
  tags: ['member-product-access'],
  summary: 'Get member assigned products',
  description: 'Get all products a member has been granted access to in an organization',
  params: {
    type: 'object',
    properties: {
      organizationId: { type: 'string', description: 'Organization ID', default: 'afrisinc-org-id' },
      userId: { type: 'string', description: 'User ID' },
    },
    required: ['organizationId', 'userId'],
  },
  security: [{ bearerAuth: [] }],
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        resp_msg: { type: 'string', example: 'Member products retrieved successfully' },
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
                  organization_id: { type: 'string' },
                  user_id: { type: 'string' },
                  product_id: { type: 'string' },
                  role_id: { type: 'string', nullable: true },
                  product: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                      code: { type: 'string' },
                    },
                  },
                  role: {
                    type: 'object',
                    nullable: true,
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                    },
                  },
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

export const GetOrganizationProductAccessSchema = {
  tags: ['member-product-access'],
  summary: 'Get all product access in organization',
  description: 'Get all member product access assignments in an organization',
  params: {
    type: 'object',
    properties: {
      organizationId: { type: 'string', description: 'Organization ID', default: 'afrisinc-org-id' },
    },
    required: ['organizationId'],
  },
  security: [{ bearerAuth: [] }],
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        resp_msg: { type: 'string', example: 'Organization product access retrieved successfully' },
        resp_code: { type: 'number', example: 1000 },
        data: {
          type: 'object',
          properties: {
            access: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  organization_id: { type: 'string' },
                  user_id: { type: 'string' },
                  product_id: { type: 'string' },
                  role_id: { type: 'string', nullable: true },
                  product: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                      code: { type: 'string' },
                    },
                  },
                  role: {
                    type: 'object',
                    nullable: true,
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                    },
                  },
                  user: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      email: { type: 'string' },
                      firstName: { type: 'string' },
                      lastName: { type: 'string' },
                    },
                  },
                  grantedByUser: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      email: { type: 'string' },
                      firstName: { type: 'string' },
                      lastName: { type: 'string' },
                    },
                  },
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
