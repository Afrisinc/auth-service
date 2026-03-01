import fp from 'fastify-plugin';
import { RabbitMQExchange } from '../utils/rabbitmq';
import type { FastifyInstance } from 'fastify';

export default fp(async (fastify: FastifyInstance) => {
  await RabbitMQExchange.setupQueueBinding();
  fastify.decorate('rabbit', {
    connection: RabbitMQExchange,
    getConnection: RabbitMQExchange.getConnection.bind(RabbitMQExchange),
    messageConsumer: RabbitMQExchange.messageConsumer.bind(RabbitMQExchange),
    messagePublisher: RabbitMQExchange.messagePublisher.bind(RabbitMQExchange),
    setupQueueBinding: RabbitMQExchange.setupQueueBinding.bind(RabbitMQExchange),
    shutdown: RabbitMQExchange.shutdown.bind(RabbitMQExchange),
  });

  fastify.addHook('onClose', async () => {
    await RabbitMQExchange.shutdown();
  });
});
