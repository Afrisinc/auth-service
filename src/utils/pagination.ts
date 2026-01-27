/**
 * Pagination metadata interface
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Paginated response interface
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Pagination helper class
 * Provides utilities for formatting paginated responses consistently
 */
export class PaginationHelper {
  /**
   * Format pagination metadata
   * @param page Current page number (1-indexed)
   * @param limit Items per page
   * @param total Total number of items
   * @returns Formatted pagination metadata
   */
  static formatPagination(page: number, limit: number, total: number): PaginationMeta {
    const totalPages = Math.ceil(total / limit);
    return {
      page,
      limit,
      totalItems: total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  /**
   * Format a paginated response
   * @param data Array of items
   * @param page Current page number
   * @param limit Items per page
   * @param total Total items count
   * @returns Formatted paginated response
   */
  static formatResponse<T>(data: T[], page: number, limit: number, total: number): PaginatedResponse<T> {
    return {
      data,
      pagination: this.formatPagination(page, limit, total),
    };
  }

  /**
   * Validate pagination parameters
   * @param page Page number
   * @param limit Items per page
   * @returns Valid pagination params
   */
  static validateParams(page: number, limit: number): { page: number; limit: number } {
    const validPage = Math.max(1, parseInt(String(page)) || 1);
    const validLimit = Math.min(100, Math.max(1, parseInt(String(limit)) || 10));
    return { page: validPage, limit: validLimit };
  }
}
