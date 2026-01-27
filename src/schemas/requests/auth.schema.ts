export const RegisterRequestSchema = {
  type: 'object',
  properties: {
    email: {
      type: 'string',
      format: 'email',
      description: 'User email address for registration',
    },
    password: {
      type: 'string',
      minLength: 6,
      description: 'User password (minimum 6 characters)',
    },
    firstName: {
      type: 'string',
      minLength: 1,
      description: 'User first name',
    },
    lastName: {
      type: 'string',
      minLength: 1,
      description: 'User last name',
    },
    phone: {
      type: 'string',
      minLength: 10,
      description: 'User phone number (minimum 10 characters)',
    },
  },
  required: ['email', 'password', 'firstName', 'lastName', 'phone'],
  additionalProperties: false,
} as const;

export const LoginRequestSchema = {
  type: 'object',
  properties: {
    email: {
      type: 'string',
      format: 'email',
      description: 'User email address for login',
    },
    password: {
      type: 'string',
      description: 'User password',
    },
  },
  required: ['email', 'password'],
  additionalProperties: false,
} as const;

export const ForgotPasswordRequestSchema = {
  type: 'object',
  properties: {
    email: {
      type: 'string',
      format: 'email',
      description: 'User email address to send reset instructions',
    },
    source: {
      type: 'string',
      enum: ['webapp', 'app'],
      description: 'Source of the request, either webapp or app',
    },
  },
  required: ['email', 'source'],
  additionalProperties: false,
} as const;

export const ResetPasswordRequestSchema = {
  type: 'object',
  properties: {
    token: {
      type: 'string',
      description: 'Password reset token received via email or OTP',
    },
    newPassword: {
      type: 'string',
      minLength: 6,
      description: 'New password to set (minimum 6 characters)',
    },
  },
  required: ['token', 'newPassword'],
  additionalProperties: false,
} as const;
