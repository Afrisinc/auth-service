import { RabbitMQExchange } from '../utils/rabbitmq';

declare module 'fastify' {
  interface FastifyInstance {
    rabbit: {
      connection: typeof RabbitMQExchange;
      getConnection: typeof RabbitMQExchange.getConnection;
      messagePublisher: typeof RabbitMQExchange.messagePublisher;
      messageConsumer: typeof RabbitMQExchange.messageConsumer;
      setupQueueBinding: typeof RabbitMQExchange.setupQueueBinding;
      shutdown: typeof RabbitMQExchange.shutdown;
    };
  }
}
