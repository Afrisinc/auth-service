export const UserEntitySchema = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      format: 'uuid',
      description: 'Unique identifier for the user',
    },
    firstName: {
      type: 'string',
      description: 'User first name',
    },
    lastName: {
      type: 'string',
      description: 'User last name',
    },
    phone: {
      type: 'string',
      description: 'User phone number',
    },
    email: {
      type: 'string',
      description: 'User email address',
    },
    tin: {
      type: 'string',
      description: 'Tax Identification Number (optional)',
    },
    companyName: {
      type: 'string',
      description: 'Company name (optional)',
    },
    lastLogin: {
      type: 'string',
      format: 'date-time',
      description: 'Last login timestamp (optional)',
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
      description: 'Account creation timestamp',
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
      description: 'Account creation timestamp',
    },
  },
  required: ['id', 'email', 'firstName', 'lastName', 'phone', 'createdAt'],
} as const;

export const UserPublicSchema = {
  type: 'object',
  properties: {
    id: UserEntitySchema.properties.id,
    email: UserEntitySchema.properties.email,
    firstName: UserEntitySchema.properties.firstName,
    lastName: UserEntitySchema.properties.lastName,
    phone: UserEntitySchema.properties.phone,
    tin: UserEntitySchema.properties.tin,
    companyName: UserEntitySchema.properties.companyName,
    lastLogin: UserEntitySchema.properties.lastLogin,
    createdAt: UserEntitySchema.properties.createdAt,
    updatedAt: UserEntitySchema.properties.updatedAt,
  },
  required: ['id', 'email', 'createdAt'],
} as const;
