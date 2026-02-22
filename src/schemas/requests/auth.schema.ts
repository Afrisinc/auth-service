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
      description: 'User first name (optional)',
    },
    lastName: {
      type: 'string',
      description: 'User last name (optional)',
    },
    phone: {
      type: 'string',
      description: 'User phone number (optional)',
    },
    location: {
      type: 'string',
      description: 'User location/address (optional)',
    },
  },
  required: ['email', 'password'],
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
  },
  required: ['email'],
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
