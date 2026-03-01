import amqp, { ChannelModel } from 'amqplib';
import { rabbitConnOptions } from './config';
import { ServerError } from '@/utils/http-error';

export const rabbitConnection = async (): Promise<ChannelModel> => {
  console.log('Attempting to connect to RabbitMQ with options:', rabbitConnOptions);
  try {
    const connection = await amqp.connect(rabbitConnOptions);
    return connection;
  } catch (err) {
    console.error('RabbitMQ connection failed ' + err);
    throw new ServerError('RabbitMQ connection failed' + err);
  }
};
