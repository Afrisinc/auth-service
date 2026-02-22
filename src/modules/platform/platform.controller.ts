import type { FastifyReply, FastifyRequest } from 'fastify';
import { AnalyticsService } from './analytics.service';
import { ApiResponseHelper } from '@/utils/apiResponse';
import { getErrorMessage } from '@/utils/errorHandler';

const analyticsService = new AnalyticsService();

export async function getAnalyticsOverview(req: FastifyRequest, reply: FastifyReply) {
  try {
    const data = await analyticsService.getOverview();
    return ApiResponseHelper.success(reply, 'Analytics retrieved successfully', data);
  } catch (err: unknown) {
    return ApiResponseHelper.badRequest(reply, getErrorMessage(err));
  }
}

export async function getAnalyticsUsers(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { range } = req.query as { range?: string };
    const data = await analyticsService.getUserAnalytics(range || '30d');
    return ApiResponseHelper.success(reply, 'User analytics retrieved successfully', data);
  } catch (err: unknown) {
    return ApiResponseHelper.badRequest(reply, getErrorMessage(err));
  }
}

export async function getAnalyticsAccounts(req: FastifyRequest, reply: FastifyReply) {
  try {
    const data = await analyticsService.getAccountAnalytics();
    return ApiResponseHelper.success(reply, 'Account analytics retrieved successfully', data);
  } catch (err: unknown) {
    return ApiResponseHelper.badRequest(reply, getErrorMessage(err));
  }
}

export async function getAnalyticsProducts(req: FastifyRequest, reply: FastifyReply) {
  try {
    const data = await analyticsService.getProductAnalytics();
    return ApiResponseHelper.success(reply, 'Product analytics retrieved successfully', data);
  } catch (err: unknown) {
    return ApiResponseHelper.badRequest(reply, getErrorMessage(err));
  }
}

export async function getAnalyticsGrowth(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { range } = req.query as { range?: string };
    const data = await analyticsService.getGrowthMetrics(range || '30d');
    return ApiResponseHelper.success(reply, 'Growth metrics retrieved successfully', data);
  } catch (err: unknown) {
    return ApiResponseHelper.badRequest(reply, getErrorMessage(err));
  }
}
