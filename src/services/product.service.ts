import { ProductRepository } from '../repositories/product.repository';

const productRepo = new ProductRepository();

export class ProductService {
  async getEnrollmentStats() {
    return productRepo.getEnrollmentStats();
  }

  async getProductAccountsEnrolled(productId: string, page: number = 1, limit: number = 50, status?: string) {
    const skip = (page - 1) * limit;
    const result = await productRepo.getProductAccountsEnrolled(productId, skip, limit, status);

    if (!result) {
      throw new Error('Product not found');
    }

    return {
      product: result.product,
      accounts: result.accounts,
      pagination: {
        page,
        limit,
        totalItems: result.pagination.total,
        totalPages: Math.ceil(result.pagination.total / limit),
        hasNext: page < Math.ceil(result.pagination.total / limit),
        hasPrev: page > 1,
      },
    };
  }

  async createProduct(
    name: string,
    code: string,
    description?: string,
    partnerId?: string,
    baseUrl?: string,
    allowedCallbacks?: string[]
  ) {
    const existing = await productRepo.findByCode(code);
    if (existing) {
      throw new Error('PRODUCT_CODE_EXISTS');
    }

    return productRepo.create({
      name,
      code,
      description,
      partner_id: partnerId,
      baseUrl: baseUrl || '',
      allowedCallbacks: allowedCallbacks || [],
    });
  }

  async createOrganizationProduct(
    organizationId: string,
    name: string,
    code: string,
    description?: string,
    partnerId?: string,
    baseUrl?: string,
    allowedCallbacks?: string[]
  ) {
    const org = await productRepo.findOrganizationById(organizationId);
    if (!org) {
      throw new Error('ORGANIZATION_NOT_FOUND');
    }

    if (partnerId) {
      const partner = await productRepo.findPartnerByIdAndOrg(partnerId, organizationId);
      if (!partner) {
        throw new Error('PARTNER_NOT_IN_ORG');
      }
    }

    const existing = await productRepo.findByCode(code);
    if (existing) {
      throw new Error('PRODUCT_CODE_EXISTS');
    }

    const product = await productRepo.create({
      name,
      code,
      description,
      partner_id: partnerId,
      baseUrl: baseUrl || '',
      allowedCallbacks: allowedCallbacks || [],
    });

    // Create enrollment for organization
    const orgAccount = await productRepo.findOrganizationAccount(organizationId);
    if (orgAccount) {
      await productRepo.createEnrollment({
        account_id: orgAccount.id,
        product_id: product.id,
        status: product.status,
        plan: 'FREE',
      });
    }

    return product;
  }

  async getProductById(productId: string) {
    const product = await productRepo.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }

  async getProductsByStatus(status: string) {
    return productRepo.findMany(0, 1000, { status });
  }

  async getProductsByStatuses(statuses: string[]) {
    return productRepo.findMany(0, 1000, { status: { in: statuses } });
  }

  async updateProduct(productId: string, data: { name?: string; description?: string; status?: string }) {
    const product = await productRepo.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const updateData: any = {};
    if (data.name) {
      updateData.name = data.name;
    }
    if (data.description) {
      updateData.description = data.description;
    }
    if (data.status) {
      updateData.status = data.status;
    }

    return productRepo.update(productId, updateData);
  }

  async updateOrganizationProduct(
    organizationId: string,
    productId: string,
    data: {
      productData?: { name?: string; description?: string; baseUrl?: string; status?: string };
      enrollmentData?: { status?: string; plan?: string };
    }
  ) {
    const org = await productRepo.findOrganizationById(organizationId);
    if (!org) {
      throw new Error('ORGANIZATION_NOT_FOUND');
    }

    const product = await productRepo.findById(productId);
    if (!product) {
      throw new Error('PRODUCT_NOT_FOUND');
    }

    const orgAccount = await productRepo.findOrganizationAccount(organizationId);
    if (!orgAccount) {
      throw new Error('ORGANIZATION_NOT_FOUND');
    }

    const enrollment = await productRepo.findEnrollment(orgAccount.id, productId);
    if (!enrollment) {
      throw new Error('ENROLLMENT_NOT_FOUND');
    }

    const productUpdateData: any = {};
    if (data.productData?.name) {
      productUpdateData.name = data.productData.name;
    }
    if (data.productData?.description) {
      productUpdateData.description = data.productData.description;
    }
    if (data.productData?.baseUrl) {
      productUpdateData.baseUrl = data.productData.baseUrl;
    }
    if (data.productData?.status) {
      productUpdateData.status = data.productData.status;
    }

    const enrollmentUpdateData: any = {};
    if (data.enrollmentData?.status) {
      enrollmentUpdateData.status = data.enrollmentData.status;
    }
    if (data.enrollmentData?.plan) {
      enrollmentUpdateData.plan = data.enrollmentData.plan;
    }

    const updatedProduct =
      Object.keys(productUpdateData).length > 0
        ? await productRepo.update(productId, productUpdateData)
        : product;

    const updatedEnrollment =
      Object.keys(enrollmentUpdateData).length > 0
        ? await productRepo.updateEnrollment(enrollment.id, enrollmentUpdateData)
        : enrollment;

    return {
      product: updatedProduct,
      enrollment: updatedEnrollment,
    };
  }

  async getUserAssignedProducts(userId: string) {
    return productRepo.getUserAssignedProducts(userId);
  }
}
