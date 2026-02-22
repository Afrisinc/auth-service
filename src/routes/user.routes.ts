import type { FastifyInstance } from 'fastify';
import { getUserProfile, updateUserProfile, getAllUsers } from '../controllers/user.controller';
import { GetUserProfileSchema, UpdateUserProfileSchema, GetAllUsersSchema } from '@/schemas';
import { authGuard } from '@/middlewares/authGuard';

export async function userRoutes(app: FastifyInstance) {
  app.get('/users', { preHandler: authGuard, schema: GetAllUsersSchema }, getAllUsers);
  app.get('/users/profile', { preHandler: authGuard, schema: GetUserProfileSchema }, getUserProfile);
  app.put('/users/profile', { preHandler: authGuard, schema: UpdateUserProfileSchema }, updateUserProfile);
}
