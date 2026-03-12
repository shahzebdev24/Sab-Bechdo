/**
 * Media Mutation Hooks
 */

import { useMutation } from '@tanstack/react-query';
import { mediaService } from '../../api';

/**
 * Upload media files
 */
export const useUploadMedia = () => {
  return useMutation({
    mutationFn: (formData: FormData) => mediaService.uploadMedia(formData),
  });
};
