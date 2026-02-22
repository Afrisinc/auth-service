import {
  ForgotPasswordRequestSchema,
  LoginRequestSchema,
  RegisterRequestSchema,
} from '../requests/auth.schema';
import {
  ForgotPasswordResponseSchema,
  LoginResponseSchema,
  RegisterResponseSchema,
  ResetPasswordResponseSchema,
  VerifyResponseSchema,
} from '../responses/auth.schema';
import { ErrorResponseSchema } from '../responses/common.schema';

export const RegisterRouteSchema = {
  tags: ['auth'],
  summary: 'Register a new user',
  description: 'Create a new user account with email, password, firstName, lastName, and phone',
  body: RegisterRequestSchema,
  response: {
    201: RegisterResponseSchema,
    400: ErrorResponseSchema,
  },
} as const;

export const LoginRouteSchema = {
  tags: ['auth'],
  summary: 'Login user',
  description: 'Authenticate user with email and password, returns JWT token',
  body: LoginRequestSchema,
  response: {
    200: LoginResponseSchema,
    400: ErrorResponseSchema,
  },
} as const;

export const ForgotPasswordRouteSchema = {
  tags: ['auth'],
  summary: 'Reset user password',
  description: 'Initiate password reset process by providing email and source (webapp or app)',
  body: ForgotPasswordRequestSchema,
  response: {
    200: ForgotPasswordResponseSchema,
    400: ErrorResponseSchema,
  },
} as const;

export const ResetPasswordRouteSchema = {
  tags: ['auth'],
  summary: 'Reset user password',
  description: 'Reset the user password using token from email link. Provide token in query param.',
  querystring: {
    type: 'object',
    properties: {
      token: {
        type: 'string',
        description: 'Password reset token from email link',
      },
    },
    required: ['token'],
  },
  body: {
    type: 'object',
    properties: {
      newPassword: {
        type: 'string',
        minLength: 6,
        description: 'New password to set (minimum 6 characters)',
      },
    },
    required: ['newPassword'],
  },
  response: {
    200: ResetPasswordResponseSchema,
    400: ErrorResponseSchema,
  },
} as const;

export const VerifyRouteSchema = {
  tags: ['auth'],
  summary: 'Verify JWT token',
  description: 'Verify the validity of a JWT token and retrieve associated user information',
  headers: {
    type: 'object',
    properties: {
      authorization: {
        type: 'string',
        description: 'JWT token in format "Bearer <token>" or just "<token>"',
      },
    },
    required: ['authorization'],
  },
  response: {
    200: VerifyResponseSchema,
    401: ErrorResponseSchema,
  },
} as const;
