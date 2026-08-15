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
    const { name, code, description, partner_id, baseUrl, allowedCallbacks } = req.body as {
      name: string;
      code: string;
      description?: string;
      partner_id?: string;
      baseUrl?: string;
      allowedCallbacks?: string[];
    };

    if (!name || !code) {
      return ApiResponseHelper.badRequest(reply, 'Name and code are required');
    }

    const result = await service.createProduct(
      name,
      code,
      description,
      partner_id,
      baseUrl,
      allowedCallbacks
    );
    return ApiResponseHelper.created(reply, 'Product created successfully', result);
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    if (message === 'PARTNER_NOT_FOUND') {
      return ApiResponseHelper.notFound(reply, 'Partner not found');
    }
    if (message === 'PRODUCT_CODE_EXISTS') {
      return ApiResponseHelper.badRequest(reply, 'Product code already exists');
    }
    return ApiResponseHelper.badRequest(reply, message);
  }
}

export async function createOrganizationProduct(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { organizationId } = req.params as { organizationId: string };
    const { name, code, description, partner_id, baseUrl, allowedCallbacks } = req.body as {
      name: string;
      code: string;
      description?: string;
      partner_id?: string;
      baseUrl?: string;
      allowedCallbacks?: string[];
    };

    if (!name || !code) {
      return ApiResponseHelper.badRequest(reply, 'Name and code are required');
    }

    const result = await service.createOrganizationProduct(
      organizationId,
      name,
      code,
      description,
      partner_id,
      baseUrl,
      allowedCallbacks
    );
    return ApiResponseHelper.created(reply, 'Product created successfully', result);
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    if (message === 'ORGANIZATION_NOT_FOUND') {
      return ApiResponseHelper.notFound(reply, 'Organization not found');
    }
    if (message === 'PARTNER_NOT_FOUND') {
      return ApiResponseHelper.notFound(reply, 'Partner not found');
    }
    if (message === 'PRODUCT_CODE_EXISTS') {
      return ApiResponseHelper.badRequest(reply, 'Product code already exists');
    }
    if (message === 'PARTNER_NOT_IN_ORG') {
      return ApiResponseHelper.badRequest(reply, 'Partner does not belong to this organization');
    }
    return ApiResponseHelper.badRequest(reply, message);
  }
}

export async function getProductById(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { productId } = req.params as { productId: string };
    const result = await service.getProductById(productId);
    return ApiResponseHelper.success(reply, 'Product retrieved successfully', result);
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    if (message === 'Product not found') {
      return ApiResponseHelper.notFound(reply, message);
    }
    return ApiResponseHelper.badRequest(reply, message);
  }
}

export async function getPublicProducts(req: FastifyRequest, reply: FastifyReply) {
  try {
    const statuses = ['LIVE', 'COMING_SOON', 'BETA', 'ACTIVE'];
    const result = await service.getProductsByStatuses(statuses);

    // Return only public-safe fields for public display
    const publicProducts = result.map((product: any) => ({
      id: product.id,
      name: product.name,
      code: product.code,
      description: product.description,
      status: product.status,
    }));

    return ApiResponseHelper.success(reply, 'Products retrieved successfully', publicProducts);
  } catch (err: unknown) {
    return ApiResponseHelper.badRequest(reply, getErrorMessage(err));
  }
}

export async function updateProduct(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { productId } = req.params as { productId: string };
    const { name, description, status } = req.body as {
      name?: string;
      description?: string;
      status?: string;
    };

    if (!name && !description && !status) {
      return ApiResponseHelper.badRequest(
        reply,
        'At least one field (name, description, status) is required'
      );
    }

    const result = await service.updateProduct(productId, { name, description, status });
    return ApiResponseHelper.success(reply, 'Product updated successfully', result);
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    if (message === 'Product not found') {
      return ApiResponseHelper.notFound(reply, message);
    }
    return ApiResponseHelper.badRequest(reply, message);
  }
}

export async function updateOrganizationProduct(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { organizationId, productId } = req.params as {
      organizationId: string;
      productId: string;
    };
    const {
      name,
      description,
      baseUrl,
      status: productStatus,
      enrollmentStatus,
      plan,
    } = req.body as {
      name?: string;
      description?: string;
      baseUrl?: string;
      status?: string;
      enrollmentStatus?: string;
      plan?: string;
    };

    const productData = { name, description, baseUrl, status: productStatus };
    const enrollmentData = { status: enrollmentStatus, plan };

    if (!Object.values(productData).some(v => v) && !Object.values(enrollmentData).some(v => v)) {
      return ApiResponseHelper.badRequest(
        reply,
        'At least one field required: name, description, baseUrl, status, enrollmentStatus, or plan'
      );
    }

    const result = await service.updateOrganizationProduct(organizationId, productId, {
      productData,
      enrollmentData,
    });
    return ApiResponseHelper.success(reply, 'Product and enrollment updated successfully', result);
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    if (message === 'ORGANIZATION_NOT_FOUND') {
      return ApiResponseHelper.notFound(reply, 'Organization not found');
    }
    if (message === 'PRODUCT_NOT_FOUND') {
      return ApiResponseHelper.notFound(reply, 'Product not found');
    }
    if (message === 'ENROLLMENT_NOT_FOUND') {
      return ApiResponseHelper.notFound(reply, 'Product enrollment not found');
    }
    return ApiResponseHelper.badRequest(reply, message);
  }
}

export async function getUserProducts(req: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = req.user?.sub || req.user?.userId;
    if (!userId) {
      return ApiResponseHelper.unauthorized(reply, 'User not authenticated');
    }

    const result = await service.getUserAssignedProducts(userId);
    return ApiResponseHelper.success(reply, 'User products retrieved successfully', result);
  } catch (err: unknown) {
    return ApiResponseHelper.badRequest(reply, getErrorMessage(err));
  }
}
