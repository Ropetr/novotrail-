/** Standard API response wrapper */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/** Standard API error response */
export interface ApiErrorResponse {
  success: false;
  error: string;
  message?: string;
  statusCode?: number;
}

/** Paginated response */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** Pagination query params */
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/** Entity status types */
export type EntityStatus = 'active' | 'inactive' | 'blocked';
export type PersonType = 'pf' | 'pj';
