import type { FastifyReply, FastifyRequest } from 'fastify';
import { UserService } from '../services/user.service';
import { ApiResponseHelper } from '../utils/apiResponse';

const service = new UserService();

export async function getUserProfile(req: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (req as any).user?.sub || (req as any).user?.userId;
    if (!userId) {
      return ApiResponseHelper.unauthorized(reply, 'Authentication required');
    }
    const result = await service.getUserProfile(userId);
    return ApiResponseHelper.success(reply, 'Profile retrieved successfully', result);
  } catch (err: any) {
    return ApiResponseHelper.notFound(reply, err.message);
  }
}

export async function updateUserProfile(req: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (req as any).user?.sub || (req as any).user?.userId;
    if (!userId) {
      return ApiResponseHelper.unauthorized(reply, 'Authentication required');
    }
    const result = await service.updateUserProfile(userId, req.body);
    return ApiResponseHelper.updated(reply, 'Profile updated successfully', result);
  } catch (err: any) {
    return ApiResponseHelper.badRequest(reply, err.message);
  }
}

export async function getAllUsers(req: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (req as any).user?.sub || (req as any).user?.userId;
    if (!userId) {
      return ApiResponseHelper.unauthorized(reply, 'Authentication required');
    }

    const {
      page = 1,
      limit = 10,
      search,
      status,
    } = req.query as {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
    };

    // Validate pagination parameters
    const pageNum = Math.max(1, Math.min(page, 10000));
    const limitNum = Math.max(1, Math.min(limit, 100));

    const result = await service.getAllUsers(pageNum, limitNum, search, status);
    return ApiResponseHelper.success(reply, 'Users retrieved successfully', result);
  } catch (err: any) {
    return ApiResponseHelper.badRequest(reply, err.message);
  }
}
