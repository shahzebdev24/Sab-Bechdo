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
  const response = await apiClient.post<any, ApiSuccessResponse<UploadMediaResponse>>(
    ENDPOINTS.MEDIA.UPLOAD,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};
