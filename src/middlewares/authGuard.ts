import type { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { logger } from '@/utils/logger.js';
import { ApiResponseHelper } from '@/utils/apiResponse.js';

interface JwtPayload {
  sub?: string;
  userId?: string;
  email: string;
  account_ids?: string[];
  account_id?: string;
  account_type?: string;
  product?: string;
  resource_id?: string;
  role?: string;
  type?: string;
  iat: number;
  exp: number;
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      sub?: string;
      userId?: string;
      email: string;
      account_ids?: string[];
      account_id?: string;
      account_type?: string;
      product?: string;
      resource_id?: string;
      role?: string;
      type?: string;
    };
  }
}

export const authGuard = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    let authHeader = request.headers.authorization;

    if (!authHeader) {
      logger.warn(
        {
          ip: request.ip,
          userAgent: request.headers['user-agent'],
          path: request.url,
        },
        'Authorization header missing'
      );
      return ApiResponseHelper.unauthorized(reply, 'Authorization header is required');
    }

    // Auto-prefix Bearer if token is provided without it
    if (!authHeader.startsWith('Bearer ')) {
      authHeader = `Bearer ${authHeader}`;
    }

    const token = authHeader.slice(7); // Remove 'Bearer ' prefix

    if (!token) {
      logger.warn(
        {
          ip: request.ip,
          path: request.url,
        },
        'Bearer token missing'
      );
      return ApiResponseHelper.unauthorized(reply, 'Bearer token is required');
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      logger.error('JWT_SECRET environment variable not configured');
      return ApiResponseHelper.internalError(reply, 'Server configuration error');
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    // Validate token type and route compatibility
    const tokenType = decoded.type || 'base'; // Default to base for backward compatibility
    const path = request.url.split('?')[0]; // Remove query params

    if (tokenType === 'base') {
      // Base tokens can access accounts, auth, identity, and platform routes
      const allowedPaths = [
        '/accounts',
        '/auth/switch-product',
        '/organizations',
        '/auth/',
        '/platform',
        '/users',
        '/products',
      ];
      const isAllowed = allowedPaths.some(p => path.startsWith(p));
      if (!isAllowed) {
        logger.warn(
          {
            userId: decoded.sub,
            tokenType,
            attemptedPath: path,
          },
          'Base token used for non-allowed route'
        );
        return ApiResponseHelper.unauthorized(reply, 'Token type not valid for this route');
      }
    } else if (tokenType === 'product') {
      // Product tokens require resource_id and product claim
      if (!decoded.product || !decoded.resource_id) {
        logger.warn(
          {
            userId: decoded.sub,
            tokenType,
            path,
            hasClaim: !!decoded.product,
            hasResourceId: !!decoded.resource_id,
          },
          'Product token missing required claims'
        );
        return ApiResponseHelper.unauthorized(reply, 'Invalid product token');
      }
    }

    // Attach user info to request object (support both old and new token formats)
    request.user = {
      sub: decoded.sub,
      userId: decoded.userId,
      email: decoded.email,
      account_ids: decoded.account_ids,
      account_id: decoded.account_id,
      account_type: decoded.account_type,
      product: decoded.product,
      resource_id: decoded.resource_id,
      role: decoded.role,
      type: decoded.type,
    };

    const userId = decoded.sub || decoded.userId;
    logger.debug(
      {
        userId,
        email: decoded.email,
        tokenType: decoded.type,
        path: request.url,
      },
      'User authenticated successfully'
    );
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      logger.warn(
        {
          ip: request.ip,
          path: request.url,
          expiredAt: error.expiredAt,
        },
        'JWT token expired'
      );
      return ApiResponseHelper.tokenExpired(reply);
    }

    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn(
        {
          ip: request.ip,
          path: request.url,
          error: error.message,
        },
        'Invalid JWT token'
      );
      return ApiResponseHelper.tokenInvalid(reply);
    }

    logger.error(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        ip: request.ip,
        path: request.url,
      },
      'Auth guard error'
    );

    return ApiResponseHelper.internalError(reply, 'Authentication failed');
  }
};

export const optionalAuthGuard = async (request: FastifyRequest, reply: FastifyReply) => {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return; // Continue without authentication
  }

  try {
    await authGuard(request, reply);
  } catch (error) {
    // For optional auth, we don't block the request on auth failure
    logger.debug(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        ip: request.ip,
        path: request.url,
      },
      'Optional auth failed, continuing without authentication'
    );
  }
};
