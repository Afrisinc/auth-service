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

  async createProduct(name: string, code: string, description?: string) {
    const existing = await productRepo.findByCode(code);
    if (existing) {
      throw new Error('Product code already exists');
    }

    return productRepo.create({
      name,
      code,
      description,
    });
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
}
