import { OrganizationRepository } from '../repositories/organization.repository';
import { AccountRepository } from '../repositories/account.repository';
import { prisma } from '../database/prismaClient';

const orgRepo = new OrganizationRepository();
const accountRepo = new AccountRepository();

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

      // Add creator as owner in organization_members
      await tx.organizationMember.create({
        data: {
          organization_id: organization.id,
          user_id: userId,
          role: 'OWNER',
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

  async addMember(organizationId: string, userId: string, role: string) {
    const member = await orgRepo.addMember(organizationId, userId, role);
    return {
      member_id: member.id,
      organization_id: member.organization_id,
      user_id: member.user_id,
      role: member.role,
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
    return org?.members || [];
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
    return member?.role === 'OWNER';
  }
}
