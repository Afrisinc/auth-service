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
  app.post('/register', { schema: RegisterRouteSchema }, registerUser);
  app.post('/login', { schema: LoginRouteSchema }, loginUser);
  app.post('/oauth/exchange', { schema: OAuthExchangeRouteSchema }, exchangeCodeForToken);
  app.post('/forgot-password', { schema: ForgotPasswordRouteSchema }, forgotPassword);
  app.post('/reset-password', { schema: ResetPasswordRouteSchema }, resetPassword);
  app.get('/verify-email', verifyEmail);
  app.post('/verify', { schema: VerifyRouteSchema }, verifyAuth);
}
