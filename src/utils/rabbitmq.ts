import { Channel, ChannelModel, ConsumeMessage, Message } from 'amqplib';
import { randomUUID } from 'crypto';
import { logger } from './logger';
import { rabbitConnection } from '../config/rabbit';

const defaultQueueOptions = { durable: true, persistent: true };
const defaultConsumptionOptions = { durable: true };

interface ActiveConsumers {
  queueName: string;
  handler: (msg: Message, channel: Channel) => void;
  routingKey: string;
  exchangeName: string;
  options: any;
}
export class RabbitMQExchange {
  static connection: ChannelModel | null;
  static consumerChannel: Channel | null;
  static publisherChannel: Channel | null;
  static activeConsumers = [] as ActiveConsumers[];
  static activeBindings = [];

  // --- CORE CONNECTION HANDLING ---
  static async getConnection() {
    if (!this.connection) {
      this.connection = await rabbitConnection();

      this.connection.on('close', async () => {
        logger.warn('RabbitMQ connection closed — attempting recovery...');
        this.connection = null;
        this.consumerChannel = null;
        this.publisherChannel = null;
        await this.recover();
      });

      this.connection.on('error', err => {
        logger.error('RabbitMQ connection error:', err.message);
      });
    }

    return this.connection;
  }

  static async createChannel(type = 'consumer') {
    const connection = await this.getConnection();
    const channel = await connection.createChannel();

    channel.on('error', err => {
      logger.error(`RabbitMQ ${type} channel error:`, err.message);
    });

    channel.on('close', async () => {
      logger.warn(`RabbitMQ ${type} channel closed. Recovering...`);
      if (type === 'consumer') {
        this.consumerChannel = null;
        await this.recoverConsumers();
      } else if (type === 'publisher') {
        this.publisherChannel = null;
      }
    });

    return channel;
  }

  // --- CONSUMER CREATION ---
  static async messageConsumer(
    queueName: string,
    handler: (msg: Message, channel: Channel) => void,
    routingKey: string,
    exchangeName: string,
    options = defaultConsumptionOptions
  ) {
    const consumerId = randomUUID();
    logger.info(`Setting up consumer ${consumerId} on [${exchangeName}/${queueName}]`);

    if (!this.consumerChannel) {
      this.consumerChannel = await this.createChannel('consumer');
    }

    const channel = this.consumerChannel;

    // Ensure exchange and queue exist
    await channel.assertExchange(exchangeName, 'direct', options);
    await channel.assertQueue(queueName, { durable: true });
    await channel.bindQueue(queueName, exchangeName, routingKey);

    const wrappedHandler = async (msg: ConsumeMessage | null) => {
      try {
        if (!msg) return;
        const { content } = msg;
        const parsedMsg = JSON.parse(content.toString());
        const message = parsedMsg.msg;
        console.log(`Received message: ${JSON.stringify(message)}`);

        const processedMsg = {
          ...msg,
          consumedAt: new Date(),
          consumerId,
          fields: msg.fields,
        };
        // const processedMsg = {
        //   body: message,
        //   raw: msg,
        //   consumedAt: new Date(),
        //   consumerId,
        // };

        await handler(processedMsg, channel);
      } catch (error: any) {
        console.log(`Error processing message: ${error}\n`);
      }
    };

    const { consumerTag } = await channel.consume(queueName, wrappedHandler, { noAck: false });
    logger.info(`Consumer ${consumerId} active (tag: ${consumerTag}) on queue ${queueName}`);

    // Save for recovery
    this.activeConsumers.push({ queueName, handler, routingKey, exchangeName, options });
    return consumerTag;
  }

  // --- PUBLISHER CREATION ---
  static async messagePublisher(
    exchangeName: string,
    options = defaultQueueOptions,
    exchangeType = 'direct'
  ) {
    if (!this.publisherChannel) {
      this.publisherChannel = await this.createChannel('publisher');
    }

    const channel = this.publisherChannel;
    await channel.assertExchange(exchangeName, exchangeType, options);

    channel.on('return', msg => {
      const content = msg.content.toString();
      logger.warn(`Message returned (unroutable): ${content}`);
    });

    return (routingKey: string, msg: Message, publishingOptions = { persistent: true, mandatory: true }) => {
      const payload = JSON.stringify({ msg, dateProduced: new Date() });
      const result = channel.publish(exchangeName, routingKey, Buffer.from(payload), publishingOptions);
      if (!result) {
        logger.warn('Publish backpressure detected!');
      }
      return result;
    };
  }

  // --- QUEUE / EXCHANGE BINDING ---
  static async setupQueueBinding(bindings = []) {
    try {
      const connection = await this.getConnection();
      const channel = await connection.createChannel();

      for (const { exchange, queue, routingKey } of bindings) {
        await channel.assertExchange(exchange, 'direct', { durable: true });
        await channel.assertQueue(queue, { durable: true });
        await channel.bindQueue(queue, exchange, routingKey);
        logger.info(`Bound queue [${queue}] to exchange [${exchange}] with key [${routingKey}]`);
      }

      // Store bindings for recovery
      this.activeBindings = bindings;
      await channel.close();
      logger.info('All RabbitMQ queues and exchanges set up successfully.');
    } catch (err: any) {
      logger.error('Error setting up RabbitMQ bindings:', err.message);
    }
  }

  // --- RECOVERY WORKFLOW ---
  static async recover() {
    try {
      logger.info('Recovering RabbitMQ connection...');
      await this.getConnection();
      await this.recoverBindings();
      await this.recoverConsumers();
      logger.info('RabbitMQ recovery completed.');
    } catch (err: any) {
      logger.error('RabbitMQ recovery failed:', err.message);
      setTimeout(() => this.recover(), 5000);
    }
  }

  static async recoverBindings() {
    if (!this.activeBindings.length) return;
    logger.info('Recreating RabbitMQ exchanges, queues, and bindings...');
    await this.setupQueueBinding(this.activeBindings);
  }

  static async recoverConsumers() {
    if (!this.activeConsumers.length) return;
    logger.info('Re-subscribing all RabbitMQ consumers...');
    const consumers = [...this.activeConsumers];
    this.activeConsumers = [];
    for (const c of consumers) {
      try {
        await this.messageConsumer(c.queueName, c.handler, c.routingKey, c.exchangeName, c.options);
        logger.info(`Recovered consumer for queue: ${c.queueName}`);
      } catch (err: any) {
        logger.error(`Failed to recover consumer ${c.queueName}:`, err.message);
      }
    }
  }

  // --- SHUTDOWN ---
  static async shutdown() {
    try {
      if (this.consumerChannel) await this.consumerChannel.close();
      if (this.publisherChannel) await this.publisherChannel.close();
      if (this.connection) await this.connection.close();
      logger.info('RabbitMQ connection and channels closed cleanly.');
    } catch (err: any) {
      logger.error('Error during RabbitMQ shutdown:', err.message);
    }
  }
}
