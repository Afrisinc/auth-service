import { PartnerRepository } from '../repositories/partner.repository';
import { CreatePartnerDto, UpdatePartnerDto } from '../dtos/partner.dto';

const partnerRepo = new PartnerRepository();

export class PartnerService {
  async createPartner(organizationId: string, data: CreatePartnerDto) {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('PARTNER_NAME_REQUIRED');
    }

    if (data.name.length > 255) {
      throw new Error('PARTNER_NAME_TOO_LONG');
    }

    if (data.email && !this.isValidEmail(data.email)) {
      throw new Error('INVALID_EMAIL_FORMAT');
    }

    const existing = await partnerRepo.findByOrgAndName(organizationId, data.name.trim());
    if (existing) {
      throw new Error('PARTNER_NAME_EXISTS_IN_ORG');
    }

    return partnerRepo.create({
      organization_id: organizationId,
      ...data,
    });
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidStatus(status: string): boolean {
    return ['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(status);
  }

  async getPartnerById(id: string) {
    const partner = await partnerRepo.findById(id);
    if (!partner) {
      throw new Error('PARTNER_NOT_FOUND');
    }
    return partner;
  }

  async getAllPartners(organizationId: string, page: number = 1, limit: number = 10, search?: string) {
    if (page < 1) {
      page = 1;
    }
    if (limit < 1 || limit > 100) {
      limit = 10;
    }

    const skip = (page - 1) * limit;
    const { partners, total } = await partnerRepo.findMany(organizationId, skip, limit, search);

    return {
      partners,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  async updatePartner(id: string, data: UpdatePartnerDto) {
    const partner = await partnerRepo.findById(id);
    if (!partner) {
      throw new Error('PARTNER_NOT_FOUND');
    }

    const updateData: any = {};
    if (data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0) {
        throw new Error('PARTNER_NAME_REQUIRED');
      }
      if (data.name.length > 255) {
        throw new Error('PARTNER_NAME_TOO_LONG');
      }

      if (data.name !== partner.name) {
        const existing = await partnerRepo.findByOrgAndName(partner.organization_id, data.name.trim());
        if (existing) {
          throw new Error('PARTNER_NAME_EXISTS_IN_ORG');
        }
      }
      updateData.name = data.name;
    }
    if (data.email !== undefined) {
      if (data.email && !this.isValidEmail(data.email)) {
        throw new Error('INVALID_EMAIL_FORMAT');
      }
      updateData.email = data.email;
    }
    if (data.phone !== undefined) {
      updateData.phone = data.phone;
    }
    if (data.location !== undefined) {
      updateData.location = data.location;
    }
    if (data.description !== undefined) {
      updateData.description = data.description;
    }
    if (data.status !== undefined) {
      if (!this.isValidStatus(data.status)) {
        throw new Error('INVALID_PARTNER_STATUS');
      }
      updateData.status = data.status;
    }

    return partnerRepo.update(id, updateData);
  }

  async deletePartner(id: string) {
    const partner = await partnerRepo.findById(id);
    if (!partner) {
      throw new Error('PARTNER_NOT_FOUND');
    }

    return partnerRepo.delete(id);
  }

  async getPartnerProducts(partnerId: string) {
    const partner = await partnerRepo.findById(partnerId);
    if (!partner) {
      throw new Error('PARTNER_NOT_FOUND');
    }

    return partnerRepo.getPartnerProducts(partnerId);
  }
}
