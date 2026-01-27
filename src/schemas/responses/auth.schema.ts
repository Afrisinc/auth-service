import { UserPublicSchema } from '../entities/user.schema';

export const AuthDataSchema = {
  type: 'object',
  properties: {
    user: UserPublicSchema,
    token: {
      type: 'string',
      description: 'JWT authentication token',
    },
  },
  required: ['user', 'token'],
} as const;

export const RegisterResponseSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean', example: true },
    resp_msg: { type: 'string', example: 'User registered successfully' },
    resp_code: { type: 'number', example: 1001 },
    data: AuthDataSchema,
  },
  required: ['success', 'resp_msg', 'resp_code', 'data'],
} as const;

export const LoginResponseSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean', example: true },
    resp_msg: { type: 'string', example: 'Login successful' },
    resp_code: { type: 'number', example: 1000 },
    data: AuthDataSchema,
  },
  required: ['success', 'resp_msg', 'resp_code', 'data'],
} as const;

export const ForgotPasswordResponseSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean', example: true },
    resp_msg: {
      type: 'string',
      example: 'Reset password email sent successfully',
    },
    resp_code: { type: 'number', example: 1002 },
    data: {
      type: 'object',
      properties: {
        resetLink: { type: 'string', nullable: true },
        otp: { type: 'string', nullable: true },
      },
      required: [],
    },
  },
  required: ['success', 'resp_msg', 'resp_code', 'data'],
} as const;

export const ResetPasswordResponseSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean', example: true },
    resp_msg: { type: 'string', example: 'Password reset successfully' },
    resp_code: { type: 'number', example: 1003 },
    data: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Password reset successfully' },
      },
      required: ['message'],
    },
  },
  required: ['success', 'resp_msg', 'resp_code', 'data'],
} as const;
