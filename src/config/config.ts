import { envMap } from './constants';

interface RabbitEnv {
  protocol: string;
  hostname: string;
  port: number;
  username: string;
  password: string;
  vhost: string;
}
const appEnv = process.env.APP_ENV?.toLowerCase() || 'development';
const envPrefix = envMap[appEnv] || 'DEV';

const createRabbitConfig = (envPrefix: string): RabbitEnv => {
  const protocol = process.env[`${envPrefix}_RABBIT_PROTOCOL`] ?? 'amqp';
  const hostname = process.env[`${envPrefix}_RABBIT_SERVER`] ?? 'localhost';
  const port = parseInt(process.env[`${envPrefix}_RABBIT_PORT`] ?? '5672', 10);
  const username = process.env[`${envPrefix}_RABBIT_USERNAME`] ?? 'guest';
  const password = process.env[`${envPrefix}_RABBIT_PASSWORD`] ?? 'guest';
  const vhost = process.env[`${envPrefix}_RABBIT_VHOST`] ?? '/';

  return { protocol, hostname, port, username, password, vhost };
};

export const rabbitConnOptions = createRabbitConfig(envPrefix);
