import type { FastifyReply, FastifyRequest } from 'fastify';
import { MemberProductAccessService } from '../services/member-product-access.service';
import { ApiResponseHelper } from '../utils/apiResponse';
import { getErrorMessage } from '../utils/errorHandler';

const service = new MemberProductAccessService();

export async function grantProductAccess(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { organizationId, userId } = req.params as { organizationId: string; userId: string };
    const { product_code, role_id } = req.body as { product_code: string; role_id?: string };
    const grantedBy = (req as any).user?.sub || (req as any).user?.userId;

    if (!grantedBy) {
      return ApiResponseHelper.unauthorized(reply, 'User not authenticated');
    }

    const result = await service.grantAccess(organizationId, userId, product_code, grantedBy, role_id);
    return ApiResponseHelper.created(reply, 'Product access granted successfully', result);
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    if (message === 'ORGANIZATION_NOT_FOUND') {
      return ApiResponseHelper.notFound(reply, 'Organization not found');
    }
    if (message === 'USER_NOT_ORG_MEMBER') {
      return ApiResponseHelper.badRequest(reply, 'User is not a member of this organization');
    }
    if (message === 'PRODUCT_NOT_FOUND') {
      return ApiResponseHelper.notFound(reply, 'Product not found');
    }
    if (message === 'ACCESS_ALREADY_GRANTED') {
      return ApiResponseHelper.badRequest(reply, 'User already has access to this product');
    }
    return ApiResponseHelper.badRequest(reply, message);
  }
}

export async function revokeProductAccess(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { organizationId, userId, productCode } = req.params as {
      organizationId: string;
      userId: string;
      productCode: string;
    };

    const result = await service.revokeAccess(organizationId, userId, productCode);
    return ApiResponseHelper.success(reply, 'Product access revoked successfully', result);
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    if (message === 'PRODUCT_NOT_FOUND') {
      return ApiResponseHelper.notFound(reply, 'Product not found');
    }
    if (message === 'ACCESS_NOT_FOUND') {
      return ApiResponseHelper.notFound(reply, 'User does not have access to this product');
    }
    return ApiResponseHelper.badRequest(reply, message);
  }
}

export async function getMemberProducts(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { organizationId, userId } = req.params as { organizationId: string; userId: string };

    const products = await service.getMemberProducts(organizationId, userId);
    return ApiResponseHelper.success(reply, 'Member products retrieved successfully', { products });
  } catch (err: unknown) {
    return ApiResponseHelper.badRequest(reply, getErrorMessage(err));
  }
}

export async function getOrganizationProductAccess(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { organizationId } = req.params as { organizationId: string };

    const access = await service.getOrganizationProductAccess(organizationId);
    return ApiResponseHelper.success(reply, 'Organization product access retrieved successfully', { access });
  } catch (err: unknown) {
    return ApiResponseHelper.badRequest(reply, getErrorMessage(err));
  }
}
