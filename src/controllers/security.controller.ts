import type { FastifyReply, FastifyRequest } from 'fastify';
import { SecurityService } from '../services/security.service';
import { ApiResponseHelper } from '../utils/apiResponse';
import { getErrorMessage } from '../utils/errorHandler';

const service = new SecurityService();

export async function getSecurityOverview(req: FastifyRequest, reply: FastifyReply) {
  try {
    const {
      range = '24h',
      limit = 5,
      failed_login_limit = 10,
    } = req.query as {
      range?: '24h' | '7d' | '30d';
      limit?: number;
      failed_login_limit?: number;
    };

    // Validate range parameter
    const validRanges = ['24h', '7d', '30d'];
    if (!validRanges.includes(range)) {
      return ApiResponseHelper.badRequest(reply, 'Invalid range parameter. Must be one of: 24h, 7d, 30d');
    }

    // Validate numeric parameters
    const limitNum = Math.max(1, Math.min(limit || 5, 50));
    const failedLoginLimitNum = Math.max(1, Math.min(failed_login_limit || 10, 100));

    const result = await service.getSecurityOverview({
      range: range as '24h' | '7d' | '30d',
      limit: limitNum,
      failed_login_limit: failedLoginLimitNum,
    });

    return ApiResponseHelper.success(reply, 'Security overview retrieved successfully', result);
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    return ApiResponseHelper.badRequest(reply, message);
  }
}
