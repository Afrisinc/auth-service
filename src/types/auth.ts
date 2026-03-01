export type { SignupPayload } from '../schemas/requests/auth.schema';

export interface LoginUserRequest {
  email: string;
  password: string;
  product_code?: string;
}
