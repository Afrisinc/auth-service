import type { FastifyReply, FastifyRequest } from 'fastify';
import { UserService } from '../services/user.service';
import { ApiResponseHelper } from '../utils/apiResponse';

const service = new UserService();

export async function getUserProfile(req: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (req as any).user?.userId;
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
    const userId = (req as any).user?.userId;
    if (!userId) {
      return ApiResponseHelper.unauthorized(reply, 'Authentication required');
    }
    const result = await service.updateUserProfile(userId, req.body);
    return ApiResponseHelper.updated(reply, 'Profile updated successfully', result);
  } catch (err: any) {
    return ApiResponseHelper.badRequest(reply, err.message);
  }
}
