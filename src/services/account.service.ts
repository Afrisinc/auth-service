import { AccountRepository } from '../repositories/account.repository';
import { AccountProductRepository } from '../repositories/account-product.repository';
import { ProductRepository } from '../repositories/product.repository';
import { OrganizationRepository } from '../repositories/organization.repository';
import { prisma } from '../database/prismaClient';
import { env } from '@/config/env';

const accountRepo = new AccountRepository();
const accountProductRepo = new AccountProductRepository();
const productRepo = new ProductRepository();
const orgRepo = new OrganizationRepository();

export class AccountService {
  async getAccount(accountId: string) {
    return accountRepo.findByIdWithProducts(accountId);
  }

  async getUserAccounts(userId: string) {
    return accountRepo.getUserAccounts(userId);
  }

  async enrollProduct(accountId: string, productCode: string, plan: string) {
    // Validate account exists
    const account = await accountRepo.findById(accountId);
    if (!account) {
      throw new Error('ACCOUNT_NOT_FOUND');
    }

    // Validate product exists
    const product = await productRepo.findByCode(productCode);
    if (!product) {
      throw new Error('PRODUCT_NOT_FOUND');
    }

    // Check if already enrolled
    const existing = await accountProductRepo.findByAccountAndProduct(accountId, product.id);
    if (existing) {
      throw new Error('ALREADY_ENROLLED');
    }

    // Use Prisma transaction for atomicity
    return await prisma.$transaction(async txn => {
      // Create enrollment in PROVISIONING status within transaction
      const enrollment = await accountProductRepo.create(
        {
          account_id: accountId,
          product_id: product.id,
          status: 'PROVISIONING',
          plan: plan || 'FREE',
          external_resource_id: null,
        },
        txn
      );

      try {
        // Call product microservice internal provisioning endpoint
        const provisioningResponse = await this.callProductProvisioning(
          productCode,
          accountId,
          account.type,
          account
        );

        // Update enrollment with active status and resource ID within transaction
        const updatedEnrollment = await accountProductRepo.update(
          enrollment.id,
          {
            status: 'ACTIVE',
            external_resource_id: provisioningResponse?.data?.resource_id,
          },
          txn
        );

        return {
          enrollment_id: updatedEnrollment.id,
          product_code: productCode,
          account_id: accountId,
          plan: updatedEnrollment.plan,
          status: updatedEnrollment.status,
        };
      } catch {
        // Mark enrollment as suspended on provisioning failure
        // Transaction will be rolled back automatically on error
        await accountProductRepo.update(enrollment.id, { status: 'SUSPENDED' }, txn);
        throw new Error('PROVISIONING_FAILED');
      }
    });
  }

  private async callProductProvisioning(
    productCode: string,
    accountId: string,
    accountType: string,
    account: any
  ) {
    // Map product code to service URL (can be made configurable)
    const serviceUrls: Record<string, string> = {
      notify: env.NOTIFY_SERVICE_URL,
      media: env.MEDIA_SERVICE_URL,
      billing: env.BILLING_SERVICE_URL,
    };

    const baseUrl = serviceUrls[productCode] || `http://${productCode}-service`;
    const endpoint = `${baseUrl}/internal/provision`;

    const provisioningPayload = {
      account_id: accountId,
      account_type: accountType,
      code: account.organization_id ? `${account.organization_id}-${accountId}` : accountId,
      name: account.organization_id ? 'Organization Account' : 'Individual Account',
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(provisioningPayload),
    });

    if (!response.ok) {
      throw new Error(`Provisioning failed with status ${response.status}`);
    }

    return response.json();
  }

  async validateAccountEnrolledInProduct(accountId: string, productCode: string) {
    return accountProductRepo.validateAccountEnrolledInProduct(accountId, productCode);
  }

  async validateUserOwnsAccount(userId: string, accountId: string) {
    return accountRepo.validateUserOwnsAccount(userId, accountId);
  }

  async getAccountProducts(accountId: string) {
    const account = await accountRepo.findByIdWithProducts(accountId);
    return account?.products || [];
  }

  async getProductEnrollment(accountId: string, productCode: string) {
    return accountProductRepo.findByAccountAndProductCode(accountId, productCode);
  }

  async updateProductStatus(accountId: string, productId: string, status: string) {
    const enrollment = await accountProductRepo.findByAccountAndProduct(accountId, productId);
    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    return accountProductRepo.update(enrollment.id, { status });
  }

  async validateUserCanAccessAccount(userId: string, accountId: string) {
    const account = await accountRepo.findById(accountId);
    if (!account) {
      return false;
    }

    // User owns the account
    if (account.owner_user_id === userId) {
      return true;
    }

    // User is a member of the organization (for organization accounts)
    if (account.organization_id) {
      const member = await orgRepo.getMember(account.organization_id, userId);
      return member !== null;
    }

    return false;
  }
}
