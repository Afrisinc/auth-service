export const CreatePartnerSchema = {
  tags: ['partners'],
  summary: 'Create a new partner',
  description: 'Create a new partner for an organization to manage their products',
  params: {
    type: 'object',
    properties: {
      organizationId: { type: 'string', description: 'Organization ID', default: 'org-id-here' },
    },
    required: ['organizationId'],
  },
  body: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Partner name', default: 'Test Partner' },
      email: { type: 'string', format: 'email', description: 'Partner email' },
      phone: { type: 'string', description: 'Partner phone number' },
      location: { type: 'string', description: 'Partner location' },
      description: { type: 'string', description: 'Partner description' },
    },
    required: ['name'],
  },
  security: [{ bearerAuth: [] }],
  response: {
    201: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        resp_msg: { type: 'string', example: 'Partner created successfully' },
        resp_code: { type: 'number', example: 1000 },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            location: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'string', example: 'ACTIVE' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' },
          },
        },
      },
    },
  },
} as const;

export const GetPartnerSchema = {
  tags: ['partners'],
  summary: 'Get partner by ID',
  description: 'Retrieve a partner with their associated products',
  params: {
    type: 'object',
    properties: {
      organizationId: { type: 'string', description: 'Organization ID', default: 'org-id-here' },
      partnerId: { type: 'string', description: 'Partner ID', default: 'partner-id-here' },
    },
    required: ['organizationId', 'partnerId'],
  },
  security: [{ bearerAuth: [] }],
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        resp_msg: { type: 'string', example: 'Partner retrieved successfully' },
        resp_code: { type: 'number', example: 1000 },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            location: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'string' },
            products: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  code: { type: 'string' },
                  status: { type: 'string' },
                },
              },
            },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' },
          },
        },
      },
    },
  },
} as const;

export const GetAllPartnersSchema = {
  tags: ['partners'],
  summary: 'Get all partners',
  description: 'Retrieve all partners in an organization with pagination and search support',
  params: {
    type: 'object',
    properties: {
      organizationId: { type: 'string', description: 'Organization ID', default: 'org-id-here' },
    },
    required: ['organizationId'],
  },
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'number', description: 'Page number', default: 1 },
      limit: { type: 'number', description: 'Items per page', default: 10 },
      search: { type: 'string', description: 'Search by name, email, or location' },
    },
  },
  security: [{ bearerAuth: [] }],
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        resp_msg: { type: 'string', example: 'Partners retrieved successfully' },
        resp_code: { type: 'number', example: 1000 },
        data: {
          type: 'object',
          properties: {
            partners: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  email: { type: 'string' },
                  phone: { type: 'string' },
                  location: { type: 'string' },
                  description: { type: 'string' },
                  status: { type: 'string' },
                  createdAt: { type: 'string' },
                  updatedAt: { type: 'string' },
                },
              },
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'number' },
                limit: { type: 'number' },
                total: { type: 'number' },
                totalPages: { type: 'number' },
                hasNext: { type: 'boolean' },
                hasPrev: { type: 'boolean' },
              },
            },
          },
        },
      },
    },
  },
} as const;

export const UpdatePartnerSchema = {
  tags: ['partners'],
  summary: 'Update partner',
  description: 'Update partner information',
  params: {
    type: 'object',
    properties: {
      organizationId: { type: 'string', description: 'Organization ID', default: 'org-id-here' },
      partnerId: { type: 'string', description: 'Partner ID', default: 'partner-id-here' },
    },
    required: ['organizationId', 'partnerId'],
  },
  body: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Partner name' },
      email: { type: 'string', format: 'email', description: 'Partner email' },
      phone: { type: 'string', description: 'Partner phone number' },
      location: { type: 'string', description: 'Partner location' },
      description: { type: 'string', description: 'Partner description' },
      status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'] },
    },
  },
  security: [{ bearerAuth: [] }],
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        resp_msg: { type: 'string', example: 'Partner updated successfully' },
        resp_code: { type: 'number', example: 1000 },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            location: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'string' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' },
          },
        },
      },
    },
  },
} as const;

export const DeletePartnerSchema = {
  tags: ['partners'],
  summary: 'Delete partner',
  description: 'Delete a partner and all associated partner products',
  params: {
    type: 'object',
    properties: {
      organizationId: { type: 'string', description: 'Organization ID', default: 'org-id-here' },
      partnerId: { type: 'string', description: 'Partner ID', default: 'partner-id-here' },
    },
    required: ['organizationId', 'partnerId'],
  },
  security: [{ bearerAuth: [] }],
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        resp_msg: { type: 'string', example: 'Partner deleted successfully' },
        resp_code: { type: 'number', example: 1000 },
        data: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
          },
        },
      },
    },
  },
} as const;

export const GetPartnerProductsSchema = {
  tags: ['partners'],
  summary: 'Get partner products',
  description: 'Retrieve all products managed by a partner',
  params: {
    type: 'object',
    properties: {
      organizationId: { type: 'string', description: 'Organization ID', default: 'org-id-here' },
      partnerId: { type: 'string', description: 'Partner ID', default: 'partner-id-here' },
    },
    required: ['organizationId', 'partnerId'],
  },
  security: [{ bearerAuth: [] }],
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        resp_msg: { type: 'string', example: 'Partner products retrieved successfully' },
        resp_code: { type: 'number', example: 1000 },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              code: { type: 'string' },
              status: { type: 'string' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
            },
          },
        },
      },
    },
  },
} as const;
