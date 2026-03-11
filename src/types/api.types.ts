/**
 * API Response Types
 * Standard API response structure
 */

// Success response wrapper
export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

// Error response wrapper
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    errors?: Record<string, string[]>; // Validation errors
  };
}

// Generic API response
export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

// API Error class
export class ApiError extends Error {
  statusCode: number;
  errors?: Record<string, string[]>;

  constructor(message: string, statusCode: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}
