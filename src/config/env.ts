import 'dotenv/config';

export const env = {
  PORT: process.env.PORT || '3000',
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback-secret',
  WEBAPP_URL: process.env.WEBAPP_URL || 'http://localhost:3000',
  NOTIFY_SERVICE_URL: process.env.NOTIFY_SERVICE_URL || 'http://localhost:3001',
  MEDIA_SERVICE_URL: process.env.MEDIA_SERVICE_URL || 'http://localhost:3002',
  BILLING_SERVICE_URL: process.env.BILLING_SERVICE_URL || 'http://localhost:3003',
} as const;
