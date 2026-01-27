import { UpdateUserRequestSchema, CreateUserRequestSchema, UserParamsSchema } from '../requests/user.schema';
import { UserPublicSchema } from '../entities/user.schema';
import { SuccessResponseSchema, ErrorResponseSchema } from '../responses/common.schema';

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

export const GetAllUsersSchema = {
  tags: ['users'],
  summary: 'Get all users with pagination and search',
  description: 'Retrieve a paginated list of users with optional search filtering',
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
        description: 'Search term to filter users by firstName, lastName, email, or phone',
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        resp_msg: { type: 'string', example: 'Users retrieved successfully' },
        resp_code: { type: 'integer', example: 1000 },
        data: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: UserPublicSchema,
              description: 'Array of user objects',
            },
            pagination: PaginationSchema,
          },
        },
      },
    },
    400: ErrorResponseSchema,
  },
} as const;

export const CreateUserSchema = {
  tags: ['users'],
  summary: 'Create new user',
  description: 'Create a new user account with provided credentials and profile information',
  body: CreateUserRequestSchema,
  response: {
    201: SuccessResponseSchema({
      ...UserPublicSchema,
      description: 'Created user data',
    }),
    400: ErrorResponseSchema,
    409: ErrorResponseSchema,
  },
} as const;

export const GetUserRouteSchema = {
  tags: ['users'],
  summary: 'Get user profile',
  description: 'Retrieve user profile information by user ID',
  params: UserParamsSchema,
  response: {
    200: SuccessResponseSchema({
      ...UserPublicSchema,
      description: 'User profile data',
    }),
    400: ErrorResponseSchema,
    404: ErrorResponseSchema,
  },
} as const;

export const UpdateUserRouteSchema = {
  tags: ['users'],
  summary: 'Update user profile',
  description: 'Update user profile information',
  params: UserParamsSchema,
  body: UpdateUserRequestSchema,
  response: {
    200: SuccessResponseSchema({
      ...UserPublicSchema,
      description: 'Updated user profile data',
    }),
    400: ErrorResponseSchema,
    404: ErrorResponseSchema,
  },
} as const;

export const GetUserProfileSchema = {
  tags: ['users'],
  summary: 'Get authenticated user profile',
  description: 'Retrieve the current authenticated user profile. Requires valid JWT token.',
  security: [{ bearerAuth: [] }],
  response: {
    200: SuccessResponseSchema({
      ...UserPublicSchema,
      description: 'User profile data',
    }),
    400: ErrorResponseSchema,
    401: ErrorResponseSchema,
    500: ErrorResponseSchema,
  },
} as const;

export const UpdateUserProfileSchema = {
  tags: ['users'],
  summary: 'Update authenticated user profile',
  description: 'Update the current authenticated user profile information. Requires valid JWT token.',
  security: [{ bearerAuth: [] }],
  body: UpdateUserRequestSchema,
  response: {
    200: SuccessResponseSchema({
      ...UserPublicSchema,
      description: 'Updated user profile data',
    }),
    400: ErrorResponseSchema,
    401: ErrorResponseSchema,
    409: ErrorResponseSchema,
    500: ErrorResponseSchema,
  },
} as const;
