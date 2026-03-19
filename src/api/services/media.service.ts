/**
 * Media Service
 * All media upload API calls
 */

import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import type { UploadMediaResponse, ApiSuccessResponse } from '../../types';

/**
 * Upload media files (images/videos)
 */
export const uploadMedia = async (formData: FormData): Promise<UploadMediaResponse> => {
  try {
    const response = await apiClient.post<any, ApiSuccessResponse<UploadMediaResponse>>(
      ENDPOINTS.MEDIA.UPLOAD,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
        // Increase timeout for large files
        timeout: 60000, // 60 seconds
        // Transform request to ensure proper FormData handling
        transformRequest: (data) => data,
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Media upload error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};
