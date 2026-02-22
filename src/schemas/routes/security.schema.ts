import { ErrorResponseSchema } from '../responses/common.schema';

export const GetSecurityOverviewSchema = {
  tags: ['security'],
  summary: 'Get security overview',
  description:
    'Returns comprehensive security monitoring data including failed login attempts, top attacking IPs, token issuance counts, and suspicious activity status',
  querystring: {
    type: 'object',
    properties: {
      range: {
        type: 'string',
        enum: ['24h', '7d', '30d'],
        default: '24h',
        description: 'Time range for failed logins - "24h", "7d", "30d"',
      },
      limit: {
        type: 'integer',
        minimum: 1,
        maximum: 50,
        default: 5,
        description: 'Number of top IPs to return',
      },
      failed_login_limit: {
        type: 'integer',
        minimum: 1,
        maximum: 100,
        default: 10,
        description: 'Number of failed login records to return',
      },
    },
  },
  security: [{ bearerAuth: [] }],
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        resp_msg: { type: 'string', example: 'Security overview retrieved successfully' },
        resp_code: { type: 'integer', example: 1000 },
        data: {
          type: 'object',
          properties: {
            failedLogins24h: {
              type: 'integer',
              description: 'Count of failed login attempts in the specified range',
              example: 47,
            },
            tokenIssuanceCount: {
              type: 'integer',
              description: 'Total number of tokens issued',
              example: 1284,
            },
            suspiciousActivity: {
              type: 'boolean',
              description: 'Whether suspicious activity has been detected',
              example: true,
            },
            topIPs: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  ip: { type: 'string', example: '192.168.1.105' },
                  attempts: { type: 'integer', example: 12 },
                },
              },
              description: 'Array of top IP addresses with failed login attempts',
            },
            failedLogins: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'fl-001' },
                  email: { type: 'string', example: 'user@example.com' },
                  ip: { type: 'string', example: '192.168.1.105' },
                  timestamp: { type: 'string', format: 'date-time', example: '2026-02-22T10:30:00.000Z' },
                  reason: {
                    type: 'string',
                    enum: ['Invalid password', 'Account locked', 'MFA failed', 'Expired token'],
                    example: 'Invalid password',
                  },
                },
              },
              description: 'Array of recent failed login records',
            },
          },
        },
      },
    },
    400: ErrorResponseSchema,
    401: ErrorResponseSchema,
  },
} as const;
