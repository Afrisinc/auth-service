import type { FastifyInstance } from 'fastify';
import {
  exchangeCodeForToken,
  forgotPassword,
  loginUser,
  registerUser,
  resetPassword,
  verifyAuth,
  verifyEmail,
} from '../controllers/auth.controller';
import {
  ForgotPasswordRouteSchema,
  LoginRouteSchema,
  RegisterRouteSchema,
  ResetPasswordRouteSchema,
  VerifyRouteSchema,
  OAuthExchangeRouteSchema,
} from '../schemas';

export async function authRoutes(app: FastifyInstance) {
  app.post('/auth/register', { schema: RegisterRouteSchema }, registerUser);
  app.post('/auth/login', { schema: LoginRouteSchema }, loginUser);
  app.post('/oauth/exchange', { schema: OAuthExchangeRouteSchema }, exchangeCodeForToken);
  app.post('/auth/forgot-password', { schema: ForgotPasswordRouteSchema }, forgotPassword);
  app.post('/reset-password', { schema: ResetPasswordRouteSchema }, resetPassword);
  app.get('/auth/verify-email', verifyEmail);
  app.post('/auth/verify', { schema: VerifyRouteSchema }, verifyAuth);
}
