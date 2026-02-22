import type { FastifyReply, FastifyRequest } from 'fastify';
import { ProductService } from '../services/product.service';
import { ApiResponseHelper } from '../utils/apiResponse';
import { getErrorMessage } from '../utils/errorHandler';

const service = new ProductService();

export async function getProductEnrollments(req: FastifyRequest, reply: FastifyReply) {
  try {
    const stats = await service.getEnrollmentStats();
    return ApiResponseHelper.success(reply, 'Products enrollments retrieved successfully', stats);
  } catch (err: unknown) {
    return ApiResponseHelper.badRequest(reply, getErrorMessage(err));
  }
}

export async function getProductAccounts(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { productId } = req.params as { productId: string };
    const {
      page = 1,
      limit = 50,
      status,
    } = req.query as {
      page?: number;
      limit?: number;
      status?: string;
    };

    // Validate pagination parameters
    const pageNum = Math.max(1, Math.min(page, 10000));
    const limitNum = Math.max(1, Math.min(limit, 100));

    const result = await service.getProductAccountsEnrolled(productId, pageNum, limitNum, status);
    return ApiResponseHelper.success(reply, 'Product accounts retrieved successfully', result);
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    if (message === 'Product not found') {
      return ApiResponseHelper.notFound(reply, message);
    }
    return ApiResponseHelper.badRequest(reply, message);
  }
}

export async function createProduct(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { name, code, description } = req.body as {
      name: string;
      code: string;
      description?: string;
    };

    if (!name || !code) {
      return ApiResponseHelper.badRequest(reply, 'Name and code are required');
    }

    const result = await service.createProduct(name, code, description);
    return ApiResponseHelper.created(reply, 'Product created successfully', result);
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    if (message.includes('unique constraint')) {
      return ApiResponseHelper.badRequest(reply, 'Product code already exists');
    }
    return ApiResponseHelper.badRequest(reply, message);
  }
}
