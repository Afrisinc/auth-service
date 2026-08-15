import fp from 'fastify-plugin';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import * as crypto from 'node:crypto';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';

const SERVICE_SECRET = env.SERVICE_SECRET ?? process.env.SERVICE_SECRET ?? '';
const TIMESTAMP_TOLERANCE = 300; // 5 minutes in seconds

interface SignatureVerificationOptions {
  enabled?: boolean;
  ignorePaths?: string[];
}

function verifyGatewaySignature(request: FastifyRequest): void {
  const signature =
    (request.headers['x-gateway-signature'] as string | undefined) ||
    (request.headers['X-Gateway-Signature'] as string | undefined);
  const timestamp =
    (request.headers['x-gateway-timestamp'] as string | undefined) ||
    (request.headers['X-Gateway-Timestamp'] as string | undefined);

  if (!signature || !timestamp) {
    throw new Error('Missing gateway signature headers');
  }

  // Verify timestamp is recent (prevent replay attacks)
  const currentTime = Math.floor(Date.now() / 1000);
  const requestTime = Number.parseInt(timestamp, 10);

  if (Math.abs(currentTime - requestTime) > TIMESTAMP_TOLERANCE) {
    throw new Error('Request timestamp is too old');
  }

  // Reconstruct the signature
  const method = request.method;
  const path = request.url.split('?')[0]; // Remove query params
  const body = request.body ? JSON.stringify(request.body) : '';
  const data = `${method}:${path}:${timestamp}:${body}`;

  const expectedSignature = crypto.createHmac('sha256', SERVICE_SECRET).update(data).digest('hex');

  logger.debug(
    {
      method,
      path,
      receivedSignature: signature,
      expectedSignature,
      timestamp,
      bodyStr: body,
    },
    'Signature verification debug info'
  );

  if (signature !== expectedSignature) {
    throw new Error('Invalid gateway signature');
  }
}

async function gatewaySignaturePlugin(fastify: FastifyInstance, options: SignatureVerificationOptions = {}) {
  const { enabled = true, ignorePaths = [] } = options;

  if (!enabled) {
    return;
  }

  fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
    // Skip verification for ignored paths
    if (ignorePaths.some(path => request.url.startsWith(path))) {
      return;
    }

    // Skip health checks and docs
    if (
      request.url === '/health' ||
      request.url === '/docs' ||
      request.url.startsWith('/docs/') ||
      request.url === '/favicon.ico'
    ) {
      return;
    }

    try {
      verifyGatewaySignature(request);
    } catch (error: any) {
      logger.error({ error: error.message }, 'Gateway signature verification failed');
      reply.status(401).send({
        success: false,
        resp_code: 1001,
        resp_msg: 'Unauthorized - invalid gateway signature',
        error_msg: error.message,
      });
    }
  });
}

export default fp(gatewaySignaturePlugin, {
  name: 'gateway-signature-verification',
  fastify: '4.x',
});
