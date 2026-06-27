import amqp, { ChannelModel } from 'amqplib';
import { rabbitConnOptions } from './config';
import { ServerError } from '@/utils/http-error';
import { logger } from '@/utils/logger';

export const rabbitConnection = async (): Promise<ChannelModel> => {
  logger.info({ options: rabbitConnOptions }, 'Attempting to connect to RabbitMQ');
  try {
    const connection = await amqp.connect(rabbitConnOptions);
    return connection;
  } catch (err) {
    logger.error({ error: err }, 'RabbitMQ connection failed');
    throw new ServerError('RabbitMQ connection failed' + err);
  }
};
