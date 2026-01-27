import 'dotenv/config';

export const env = {
  PORT: process.env.PORT || '3000',
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback-secret',
  WEBAPP_URL: process.env.WEBAPP_URL || 'http://localhost:3000',
} as const;
