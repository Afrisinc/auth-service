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
    return productRepo.create({
      name,
      code,
      description,
    });
  }
}
