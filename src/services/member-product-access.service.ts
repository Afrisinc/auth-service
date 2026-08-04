import { MemberProductAccessRepository } from '../repositories/member-product-access.repository';
import { ProductRepository } from '../repositories/product.repository';
import { OrganizationRepository } from '../repositories/organization.repository';

const accessRepo = new MemberProductAccessRepository();
const productRepo = new ProductRepository();
const orgRepo = new OrganizationRepository();

export class MemberProductAccessService {
  async grantAccess(
    organizationId: string,
    userId: string,
    productCode: string,
    grantedBy: string,
    roleId?: string
  ) {
    const org = await orgRepo.findById(organizationId);
    if (!org) {
      throw new Error('ORGANIZATION_NOT_FOUND');
    }

    const member = await orgRepo.getMember(organizationId, userId);
    if (!member) {
      throw new Error('USER_NOT_ORG_MEMBER');
    }

    const product = await productRepo.findByCode(productCode);
    if (!product) {
      throw new Error('PRODUCT_NOT_FOUND');
    }

    const existing = await accessRepo.findByOrgUserProduct(organizationId, userId, product.id);
    if (existing) {
      throw new Error('ACCESS_ALREADY_GRANTED');
    }

    const access = await accessRepo.create({
      organization_id: organizationId,
      user_id: userId,
      product_id: product.id,
      role_id: roleId,
      granted_by: grantedBy,
    });

    return {
      id: access.id,
      organization_id: organizationId,
      user_id: userId,
      product_code: productCode,
      role_id: roleId,
      granted_by: grantedBy,
    };
  }

  async revokeAccess(organizationId: string, userId: string, productCode: string) {
    const product = await productRepo.findByCode(productCode);
    if (!product) {
      throw new Error('PRODUCT_NOT_FOUND');
    }

    const existing = await accessRepo.findByOrgUserProduct(organizationId, userId, product.id);
    if (!existing) {
      throw new Error('ACCESS_NOT_FOUND');
    }

    await accessRepo.deleteByOrgUserProduct(organizationId, userId, product.id);

    return {
      organization_id: organizationId,
      user_id: userId,
      product_code: productCode,
      revoked: true,
    };
  }

  async getMemberProducts(organizationId: string, userId: string) {
    return accessRepo.findByOrgAndUser(organizationId, userId);
  }

  async getOrganizationProductAccess(organizationId: string) {
    return accessRepo.findByOrganization(organizationId);
  }

  async getUserAccessibleProductIds(userId: string, organizationIds: string[]) {
    return accessRepo.getAccessibleProductIds(userId, organizationIds);
  }

  async checkUserHasAccess(organizationId: string, userId: string, productCode: string) {
    const product = await productRepo.findByCode(productCode);
    if (!product) {
      return false;
    }
    const access = await accessRepo.findByOrgUserProduct(organizationId, userId, product.id);
    return access !== null;
  }
}
