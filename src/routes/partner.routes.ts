import type { FastifyInstance } from 'fastify';
import {
  createPartner,
  getPartner,
  getAllPartners,
  updatePartner,
  deletePartner,
  getPartnerProducts,
} from '../controllers/partner.controller';
import {
  CreatePartnerSchema,
  GetPartnerSchema,
  GetAllPartnersSchema,
  UpdatePartnerSchema,
  DeletePartnerSchema,
  GetPartnerProductsSchema,
} from '../schemas/routes/partner.schema';
import { authGuard } from '../middlewares/authGuard';

export async function partnerRoutes(app: FastifyInstance) {
  app.post(
    '/organizations/:organizationId/partners',
    { schema: CreatePartnerSchema, onRequest: [authGuard] },
    createPartner
  );
  app.get(
    '/organizations/:organizationId/partners',
    { schema: GetAllPartnersSchema, onRequest: [authGuard] },
    getAllPartners
  );
  app.get(
    '/organizations/:organizationId/partners/:partnerId',
    { schema: GetPartnerSchema, onRequest: [authGuard] },
    getPartner
  );
  app.put(
    '/organizations/:organizationId/partners/:partnerId',
    { schema: UpdatePartnerSchema, onRequest: [authGuard] },
    updatePartner
  );
  app.delete(
    '/organizations/:organizationId/partners/:partnerId',
    { schema: DeletePartnerSchema, onRequest: [authGuard] },
    deletePartner
  );
  app.get(
    '/organizations/:organizationId/partners/:partnerId/products',
    { schema: GetPartnerProductsSchema, onRequest: [authGuard] },
    getPartnerProducts
  );
}
