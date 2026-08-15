import type { FastifyReply, FastifyRequest } from 'fastify';
import { PartnerService } from '../services/partner.service';
import { ApiResponseHelper } from '../utils/apiResponse';
import { getErrorMessage } from '../utils/errorHandler';

const service = new PartnerService();

export async function createPartner(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { organizationId } = req.params as { organizationId: string };
    const { name, email, phone, location, description } = req.body as any;

    const result = await service.createPartner(organizationId, {
      name,
      email,
      phone,
      location,
      description,
    });

    return ApiResponseHelper.created(reply, 'Partner created successfully', result);
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    if (message === 'PARTNER_NAME_REQUIRED') {
      return ApiResponseHelper.badRequest(reply, 'Partner name is required');
    }
    if (message === 'PARTNER_NAME_TOO_LONG') {
      return ApiResponseHelper.badRequest(reply, 'Partner name must be 255 characters or less');
    }
    if (message === 'INVALID_EMAIL_FORMAT') {
      return ApiResponseHelper.badRequest(reply, 'Invalid email format');
    }
    if (message === 'PARTNER_NAME_EXISTS_IN_ORG') {
      return ApiResponseHelper.badRequest(
        reply,
        'A partner with this name already exists in your organization'
      );
    }
    return ApiResponseHelper.badRequest(reply, message);
  }
}

export async function getPartner(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { partnerId } = req.params as { partnerId: string };

    const result = await service.getPartnerById(partnerId);
    return ApiResponseHelper.success(reply, 'Partner retrieved successfully', result);
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    if (message === 'PARTNER_NOT_FOUND') {
      return ApiResponseHelper.notFound(reply, 'Partner not found');
    }
    return ApiResponseHelper.badRequest(reply, message);
  }
}

export async function getAllPartners(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { organizationId } = req.params as { organizationId: string };
    const { page = 1, limit = 10, search } = req.query as any;

    const result = await service.getAllPartners(
      organizationId,
      Number.parseInt(page),
      Number.parseInt(limit),
      search
    );
    return ApiResponseHelper.success(reply, 'Partners retrieved successfully', result);
  } catch (err: unknown) {
    return ApiResponseHelper.badRequest(reply, getErrorMessage(err));
  }
}

export async function updatePartner(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { partnerId } = req.params as { partnerId: string };
    const { name, email, phone, location, description, status } = req.body as any;

    const result = await service.updatePartner(partnerId, {
      name,
      email,
      phone,
      location,
      description,
      status,
    });

    return ApiResponseHelper.success(reply, 'Partner updated successfully', result);
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    if (message === 'PARTNER_NOT_FOUND') {
      return ApiResponseHelper.notFound(reply, 'Partner not found');
    }
    if (message === 'PARTNER_NAME_REQUIRED') {
      return ApiResponseHelper.badRequest(reply, 'Partner name is required');
    }
    if (message === 'PARTNER_NAME_TOO_LONG') {
      return ApiResponseHelper.badRequest(reply, 'Partner name must be 255 characters or less');
    }
    if (message === 'INVALID_EMAIL_FORMAT') {
      return ApiResponseHelper.badRequest(reply, 'Invalid email format');
    }
    if (message === 'PARTNER_NAME_EXISTS_IN_ORG') {
      return ApiResponseHelper.badRequest(
        reply,
        'A partner with this name already exists in your organization'
      );
    }
    if (message === 'INVALID_PARTNER_STATUS') {
      return ApiResponseHelper.badRequest(
        reply,
        'Partner status must be one of: ACTIVE, INACTIVE, SUSPENDED'
      );
    }
    return ApiResponseHelper.badRequest(reply, message);
  }
}

export async function deletePartner(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { partnerId } = req.params as { partnerId: string };

    await service.deletePartner(partnerId);
    return ApiResponseHelper.success(reply, 'Partner deleted successfully', { success: true });
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    if (message === 'PARTNER_NOT_FOUND') {
      return ApiResponseHelper.notFound(reply, 'Partner not found');
    }
    return ApiResponseHelper.badRequest(reply, message);
  }
}

export async function getPartnerProducts(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { partnerId } = req.params as { partnerId: string };

    const result = await service.getPartnerProducts(partnerId);
    return ApiResponseHelper.success(reply, 'Partner products retrieved successfully', result);
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    if (message === 'PARTNER_NOT_FOUND') {
      return ApiResponseHelper.notFound(reply, 'Partner not found');
    }
    return ApiResponseHelper.badRequest(reply, message);
  }
}
