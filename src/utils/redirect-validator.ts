/**
 * Validates redirect URLs against whitelist to prevent open redirect attacks
 */

export class RedirectValidator {
  /**
   * Validates a redirect URL against product's allowed callbacks
   * @param redirectUrl - URL to validate
   * @param allowedCallbacks - JSON array of allowed callback URLs
   * @returns true if URL is safe, false otherwise
   */
  static isValidRedirect(redirectUrl: string, allowedCallbacks: any): boolean {
    if (!redirectUrl || !allowedCallbacks) {
      return false;
    }

    try {
      // Parse the redirect URL
      const redirectUrlObj = new URL(redirectUrl);

      // Ensure allowedCallbacks is an array
      const callbacks = Array.isArray(allowedCallbacks) ? allowedCallbacks : [];

      // Check if redirectUrl matches any allowed callback
      return callbacks.some((callback: string) => {
        try {
          const callbackUrl = new URL(callback);

          // Compare protocol, hostname, and pathname
          return (
            redirectUrlObj.protocol === callbackUrl.protocol &&
            redirectUrlObj.hostname === callbackUrl.hostname &&
            redirectUrlObj.pathname === callbackUrl.pathname
          );
        } catch {
          return false;
        }
      });
    } catch {
      // Invalid URL format
      return false;
    }
  }

  /**
   * Validates a redirect URL against product's base URL (lenient check)
   * @param redirectUrl - URL to validate
   * @param baseUrl - Product's base URL
   * @returns true if URL belongs to product domain
   */
  static isValidProductDomain(redirectUrl: string, baseUrl: string): boolean {
    if (!redirectUrl || !baseUrl) {
      return false;
    }

    try {
      const redirectUrlObj = new URL(redirectUrl);
      const baseUrlObj = new URL(baseUrl);

      // Check if redirect URL is on the same domain
      return redirectUrlObj.hostname === baseUrlObj.hostname;
    } catch {
      return false;
    }
  }

  /**
   * Parse and validate redirect URL components
   */
  static parseRedirectUrl(redirectUrl: string) {
    try {
      const url = new URL(redirectUrl);
      return {
        valid: true,
        protocol: url.protocol,
        hostname: url.hostname,
        pathname: url.pathname,
        href: url.href,
      };
    } catch (error) {
      return {
        valid: false,
        error: 'Invalid URL format',
      };
    }
  }
}

export default RedirectValidator;
