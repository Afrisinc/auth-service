import { SecurityService } from '../services/security.service';
import { logger } from './logger';

const securityService = new SecurityService();

/**
 * Records a failed login attempt for security monitoring
 * Silently fails to avoid disrupting the authentication flow
 */
export async function recordLoginFailure(
  email: string,
  ipAddress: string,
  reason: string,
  userId?: string
) {
  try {
    await securityService.recordFailedLogin({
      email,
      ip_address: ipAddress,
      failure_reason: reason,
      user_id: userId,
    });
  } catch (error) {
    // Log but don't throw - security recording should never crash auth
    logger.error(
      `Failed to record login failure for ${email}`,
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * Extracts IP address from Fastify request
 */
export function getClientIP(req: any): string {
  return req.ip || req.ips?.[0] || req.headers['x-forwarded-for'] || 'unknown';
}
