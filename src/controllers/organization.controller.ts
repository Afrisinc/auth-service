import type { FastifyReply, FastifyRequest } from 'fastify';
import { OrganizationService } from '../services/organization.service';
import { ApiResponseHelper } from '../utils/apiResponse';
import { getErrorMessage } from '../utils/errorHandler';

const service = new OrganizationService();

export async function createOrganization(req: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (req as any).user?.sub || (req as any).user?.userId;
    if (!userId) {
      return ApiResponseHelper.unauthorized(reply, 'User not authenticated');
    }

    const result = await service.createOrganization(req.body, userId);
    return ApiResponseHelper.created(reply, 'Organization created successfully', result);
  } catch (err: unknown) {
    return ApiResponseHelper.badRequest(reply, getErrorMessage(err));
  }
}

export async function getOrganization(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { organizationId } = req.params as { organizationId: string };

    const result = await service.getOrganization(organizationId);
    if (!result) {
      return ApiResponseHelper.notFound(reply, 'Organization not found');
    }

    return ApiResponseHelper.success(reply, 'Organization retrieved successfully', result);
  } catch (err: unknown) {
    return ApiResponseHelper.badRequest(reply, getErrorMessage(err));
  }
}

export async function addMember(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { organizationId } = req.params as { organizationId: string };
    const { user_id, role } = req.body as { user_id: string; role: string };

    const result = await service.addMember(organizationId, user_id, role);
    return ApiResponseHelper.created(reply, 'Member added successfully', result);
  } catch (err: unknown) {
    return ApiResponseHelper.badRequest(reply, getErrorMessage(err));
  }
}

export async function removeMember(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { organizationId, userId } = req.params as { organizationId: string; userId: string };

    const result = await service.removeMember(organizationId, userId);
    return ApiResponseHelper.success(reply, 'Member removed successfully', result);
  } catch (err: unknown) {
    return ApiResponseHelper.badRequest(reply, getErrorMessage(err));
  }
}

export async function listMembers(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { organizationId } = req.params as { organizationId: string };

    const members = await service.listMembers(organizationId);
    return ApiResponseHelper.success(reply, 'Members retrieved successfully', { members });
  } catch (err: unknown) {
    return ApiResponseHelper.badRequest(reply, getErrorMessage(err));
  }
}

export async function updateOrganization(req: FastifyRequest, reply: FastifyReply) {
  try {
    const { organizationId } = req.params as { organizationId: string };

    const result = await service.updateOrganization(organizationId, req.body);
    return ApiResponseHelper.success(reply, 'Organization updated successfully', result);
  } catch (err: unknown) {
    return ApiResponseHelper.badRequest(reply, getErrorMessage(err));
  }
}
