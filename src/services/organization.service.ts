import { OrganizationRepository } from '../repositories/organization.repository';
import { prisma } from '../database/prismaClient';

const orgRepo = new OrganizationRepository();

export class OrganizationService {
  async createOrganization(data: any, userId: string) {
    // Create organization and organization account in transaction
    const result = await prisma.$transaction(async tx => {
      // Create organization
      const organization = await tx.organization.create({
        data: {
          name: data.name,
          legal_name: data.legal_name,
          country: data.country,
          tax_id: data.tax_id,
          org_email: data.org_email,
          org_phone: data.org_phone,
          location: data.location,
        },
      });

      // Create organization account
      const account = await tx.account.create({
        data: {
          type: 'ORGANIZATION',
          owner_user_id: userId,
          organization_id: organization.id,
        },
      });

      // Add creator as organization member (role assigned separately via admin endpoints)
      await (tx as any).organizationMember.create({
        data: {
          organization_id: organization.id,
          user_id: userId,
          legacy_role: 'OWNER',
        },
      });

      return { organization, account };
    });

    return {
      organization_id: result.organization.id,
      account_id: result.account.id,
      name: result.organization.name,
    };
  }

  async getOrganization(organizationId: string) {
    return orgRepo.findByIdWithMembers(organizationId);
  }

  async addMember(organizationId: string, userId: string, roleId: string) {
    const member = await orgRepo.addMember(organizationId, userId, roleId);
    const memberData = member as any;
    return {
      member_id: memberData.id,
      organization_id: memberData.organization_id,
      user_id: memberData.user_id,
      role_id: memberData.role_id,
    };
  }

  async removeMember(organizationId: string, userId: string) {
    await orgRepo.removeMember(organizationId, userId);
    return { message: 'Member removed successfully' };
  }

  async getMember(organizationId: string, userId: string) {
    return orgRepo.getMember(organizationId, userId);
  }

  async listMembers(organizationId: string) {
    const org = await orgRepo.findByIdWithMembers(organizationId);
    if (!org?.members) {
      return [];
    }

    return org.members.map(member => {
      const memberData = member as any;
      return {
        id: memberData.id,
        organization_id: memberData.organization_id,
        user_id: memberData.user_id,
        role_id: memberData.role_id,
        role_name: memberData.role?.name,
        email: memberData.user?.email,
        firstName: memberData.user?.firstName,
        lastName: memberData.user?.lastName,
        phone: memberData.user?.phone,
        status: memberData.user?.status,
      };
    });
  }

  async updateOrganization(organizationId: string, data: any) {
    return orgRepo.update(organizationId, data);
  }

  async validateUserIsOrgMember(organizationId: string, userId: string) {
    const member = await orgRepo.getMember(organizationId, userId);
    return member !== null;
  }

  async validateUserIsOrgOwner(organizationId: string, userId: string) {
    const member = await orgRepo.getMember(organizationId, userId);
    if (!member) return false;
    const memberData = member as any;
    return memberData.legacy_role === 'OWNER';
  }

  async getAllOrganizations(page: number = 1, limit: number = 10, search?: string, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { legal_name: { contains: search, mode: 'insensitive' as const } },
        { org_email: { contains: search, mode: 'insensitive' as const } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const organizations = await orgRepo.findMany(skip, limit, where);
    const total = await orgRepo.count(where);

    return {
      data: organizations,
      pagination: {
        page,
        limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }
}
