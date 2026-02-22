import type { FastifyRequest, FastifyReply } from 'fastify';
import { ApiResponseHelper } from '@/utils/apiResponse';
import { logger } from '@/utils/logger';

/**
 * Platform analytics authorization guard
 * For internal service use - requires base token (not product-scoped)
 */
export const platformAdminGuard = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    // Check if user is authenticated
    if (!request.user) {
      logger.warn(
        {
          ip: request.ip,
          path: request.url,
        },
        'Platform analytics access without authentication'
      );
      return ApiResponseHelper.unauthorized(reply, 'Authentication required');
    }

    // Require base token (not product-scoped)
    const tokenType = (request.user as any).type || 'base';
    if (tokenType !== 'base') {
      logger.warn(
        {
          userId: request.user.sub,
          tokenType,
          ip: request.ip,
          path: request.url,
        },
        'Platform analytics access denied - requires base token'
      );
      return ApiResponseHelper.forbidden(reply, 'Base token required for analytics access');
    }

    logger.debug(
      {
        userId: request.user.sub,
        path: request.url,
      },
      'Platform analytics access granted'
    );
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        ip: request.ip,
        path: request.url,
      },
      'Platform analytics authorization error'
    );
    return ApiResponseHelper.internalError(reply, 'Authorization check failed');
  }
};
