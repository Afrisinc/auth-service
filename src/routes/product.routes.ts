import type { FastifyInstance } from 'fastify';
import { getProductEnrollments, getProductAccounts, createProduct } from '../controllers/product.controller';
import { GetProductEnrollmentsSchema, GetProductAccountsSchema, CreateProductSchema } from '../schemas';
import { authGuard } from '../middlewares/authGuard';

export async function productRoutes(app: FastifyInstance) {
  // Create a new product
  app.post('/products', { schema: CreateProductSchema, onRequest: [authGuard] }, createProduct);

  // Get all products with enrollment statistics
  app.get(
    '/products/enrollments',
    { schema: GetProductEnrollmentsSchema, onRequest: [authGuard] },
    getProductEnrollments
  );

  // Get accounts enrolled in a specific product
  app.get(
    '/products/:productId/accounts',
    { schema: GetProductAccountsSchema, onRequest: [authGuard] },
    getProductAccounts
  );
}
