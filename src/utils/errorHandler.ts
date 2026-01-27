/**
 * Extract error message from unknown error type
 * Handles Error instances, strings, and other types
 * @param err Unknown error caught in try-catch
 * @returns Error message string
 */
export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    return err.message;
  }
  if (typeof err === 'string') {
    return err;
  }
  if (err && typeof err === 'object' && 'message' in err) {
    return String((err as any).message);
  }
  return 'An unexpected error occurred';
}

/**
 * Extract status code from error if available
 * @param err Unknown error
 * @returns Status code if available, undefined otherwise
 */
export function getErrorStatusCode(err: unknown): number | undefined {
  if (err instanceof Error && 'statusCode' in err) {
    const code = (err as any).statusCode;
    return typeof code === 'number' ? code : undefined;
  }
  return undefined;
}
