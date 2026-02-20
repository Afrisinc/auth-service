import type { FastifyReply, FastifyRequest } from 'fastify';
import { AccountService } from '../services/account.service';
import { ApiResponseHelper } from '../utils/apiResponse';
import { getErrorMessage } from '../utils/errorHandler';
import { generateProductScopedToken } from '../utils/jwt';

const service = new AccountService();

export async function getAccount(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { accountId } = req.params as { accountId: string };
    const userId = (req as any).user?.sub || (req as any).user?.userId;

    if (!userId) {
      return ApiResponseHelper.unauthorized(reply, 'User not authenticated');
    }

    // Validate user can access account
    const canAccess = await service.validateUserCanAccessAccount(userId, accountId);
    if (!canAccess) {
      return ApiResponseHelper.unauthorized(reply, 'You do not have access to this account');
    }

    const result = await service.getAccount(accountId);
    if (!result) {
      return ApiResponseHelper.notFound(reply, 'Account not found');
    }

    return ApiResponseHelper.success(reply, 'Account retrieved successfully', result);
  } catch (err: unknown) {
    return ApiResponseHelper.badRequest(reply, getErrorMessage(err));
  }
}

export async function getUserAccounts(req: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (req as any).user?.sub || (req as any).user?.userId;

    if (!userId) {
      return ApiResponseHelper.unauthorized(reply, 'User not authenticated');
    }

    const accounts = await service.getUserAccounts(userId);
    return ApiResponseHelper.success(reply, 'Accounts retrieved successfully', { accounts });
  } catch (err: unknown) {
    return ApiResponseHelper.badRequest(reply, getErrorMessage(err));
  }
}

export async function enrollProduct(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { accountId } = req.params as { accountId: string };
    const { product_code, plan } = req.body as { product_code: string; plan?: string };
    const userId = (req as any).user?.sub || (req as any).user?.userId;

    if (!userId) {
      return ApiResponseHelper.unauthorized(reply, 'User not authenticated');
    }

    // Validate user can access account
    const canAccess = await service.validateUserCanAccessAccount(userId, accountId);
    if (!canAccess) {
      return ApiResponseHelper.unauthorized(reply, 'You do not have access to this account');
    }

    const result = await service.enrollProduct(accountId, product_code, plan || 'FREE');
    return ApiResponseHelper.created(reply, 'Product enrollment successful', result);
  } catch (err: unknown) {
    return ApiResponseHelper.badRequest(reply, getErrorMessage(err));
  }
}

export async function switchProduct(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { account_id, product_code } = req.body as { account_id: string; product_code: string };
    const userId = (req as any).user?.sub || (req as any).user?.userId;
    const email = (req as any).user?.email;

    if (!userId) {
      return ApiResponseHelper.unauthorized(reply, 'User not authenticated');
    }

    // Validate user can access account
    const canAccess = await service.validateUserCanAccessAccount(userId, account_id);
    if (!canAccess) {
      return ApiResponseHelper.unauthorized(reply, 'You do not have access to this account');
    }

    // Get product enrollment with external_resource_id
    const enrollment = await service.getProductEnrollment(account_id, product_code);
    if (!enrollment) {
      return ApiResponseHelper.badRequest(reply, 'PRODUCT_NOT_ENROLLED');
    }

    // Validate enrollment is active with resource_id
    if (enrollment.status !== 'ACTIVE') {
      return ApiResponseHelper.badRequest(reply, 'PRODUCT_NOT_ACTIVE');
    }

    if (!enrollment.external_resource_id) {
      return ApiResponseHelper.badRequest(reply, 'PRODUCT_NOT_ACTIVE');
    }

    // Get account details
    const account = await service.getAccount(account_id);
    if (!account) {
      return ApiResponseHelper.notFound(reply, 'Account not found');
    }

    // Generate product-scoped token with resource_id
    const token = generateProductScopedToken(
      userId,
      email,
      account_id,
      account.type,
      product_code,
      enrollment.external_resource_id
    );

    return ApiResponseHelper.success(reply, 'Product switched successfully', {
      account_id,
      product: product_code,
      account_type: account.type,
      token,
    });
  } catch (err: unknown) {
    return ApiResponseHelper.badRequest(reply, getErrorMessage(err));
  }
}

export async function getAccountProducts(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { accountId } = req.params as { accountId: string };
    const userId = (req as any).user?.sub || (req as any).user?.userId;

    if (!userId) {
      return ApiResponseHelper.unauthorized(reply, 'User not authenticated');
    }

    // Validate user can access account
    const canAccess = await service.validateUserCanAccessAccount(userId, accountId);
    if (!canAccess) {
      return ApiResponseHelper.unauthorized(reply, 'You do not have access to this account');
    }

    const products = await service.getAccountProducts(accountId);
    return ApiResponseHelper.success(reply, 'Products retrieved successfully', { products });
  } catch (err: unknown) {
    return ApiResponseHelper.badRequest(reply, getErrorMessage(err));
  }
}
