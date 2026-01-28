import type { FastifyInstance } from 'fastify';
import {
  forgotPassword,
  loginUser,
  registerUser,
  resetPassword,
  verifyAuth,
} from '../controllers/auth.controller';
import {
  ForgotPasswordRouteSchema,
  LoginRouteSchema,
  RegisterRouteSchema,
  ResetPasswordRouteSchema,
  VerifyRouteSchema,
} from '../schemas';

export async function authRoutes(app: FastifyInstance) {
  app.post('/auth/register', { schema: RegisterRouteSchema }, registerUser);
  app.post('/auth/login', { schema: LoginRouteSchema }, loginUser);
  app.post('/auth/forgot-password', { schema: ForgotPasswordRouteSchema }, forgotPassword);
  app.post('/reset-password', { schema: ResetPasswordRouteSchema }, resetPassword);
  app.post('/auth/verify', { schema: VerifyRouteSchema }, verifyAuth);
}
