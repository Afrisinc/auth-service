export const envMap: Record<string, string> = {
  development: 'DEV',
  uat: 'UAT',
  production: 'PDN',
  qa: 'QA',
};

export const RABBITMQ_CONSTANTS = {
  NOTIFICATIONS: {
    EXCHANGE_NAME: 'notifications',
    ROUTING_KEY: 'send_message',
  },
};

export const QUEUE_CONFIG = {
  QUEUE_NAME: 'notifications.email',
  EXCHANGE_NAME: 'notifications',
  ROUTING_KEY: 'send_message',
};

export const NOTIFICATION_TEMPLATES = {
  AUTH_VERIFY_EMAIL: 'AUTH_VERIFY_EMAIL',
  AUTH_PASSWORD_RESET: 'AUTH_PASSWORD_RESET',
};

export const NOTIFICATION_CHANNELS = {
  EMAIL: 'EMAIL',
  SMS: 'SMS',
  PUSH: 'PUSH',
};
