/**
 * Validation Constants
 * Frontend validation rules matching backend constraints
 */

import * as FileSystem from 'expo-file-system/legacy';

export const MEDIA_VALIDATION = {
  // Image validation
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_IMAGE_SIZE_MB: 10,
  ALLOWED_IMAGE_FORMATS: ['jpg', 'jpeg', 'png', 'webp', 'gif'] as const,
  
  // Video validation
  MAX_VIDEO_SIZE: 50 * 1024 * 1024, // 50MB (reduced for faster upload)
  MAX_VIDEO_SIZE_MB: 50,
  ALLOWED_VIDEO_FORMATS: ['mp4', 'mov', 'avi', 'webm'] as const,
  
  // Upload limits
  MAX_PHOTOS_PER_AD: 5,
  MIN_PHOTOS_PER_AD: 1,
};

export const AD_VALIDATION = {
  TITLE: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 100,
  },
  DESCRIPTION: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 1000,
  },
  PRICE: {
    MIN: 0,
    MAX: 999999999,
  },
} as const;

/**
 * Format bytes to human readable size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Get file size from URI (React Native)
 */
export const getFileSize = async (uri: string): Promise<number> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists || !('size' in fileInfo)) {
      return 0;
    }
    return fileInfo.size;
  } catch (error) {
    console.error('Error getting file size:', error);
    return 0;
  }
};

/**
 * Validate image file
 */
export const validateImage = (uri: string, size?: number): { valid: boolean; error?: string } => {
  // Check format
  const extension = uri.split('.').pop()?.toLowerCase() || '';
  const allowedFormats = MEDIA_VALIDATION.ALLOWED_IMAGE_FORMATS as readonly string[];
  if (!allowedFormats.includes(extension)) {
    return {
      valid: false,
      error: `Invalid image format. Allowed: ${allowedFormats.join(', ')}`,
    };
  }
  
  // Check size if provided
  if (size && size > MEDIA_VALIDATION.MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: `Image too large. Maximum size: ${MEDIA_VALIDATION.MAX_IMAGE_SIZE_MB}MB`,
    };
  }
  
  return { valid: true };
};

/**
 * Validate video file
 */
export const validateVideo = (uri: string, size?: number): { valid: boolean; error?: string } => {
  // Check format
  const extension = uri.split('.').pop()?.toLowerCase() || '';
  const allowedFormats = MEDIA_VALIDATION.ALLOWED_VIDEO_FORMATS as readonly string[];
  if (!allowedFormats.includes(extension)) {
    return {
      valid: false,
      error: `Invalid video format. Allowed: ${allowedFormats.join(', ')}`,
    };
  }
  
  // Check size if provided
  if (size && size > MEDIA_VALIDATION.MAX_VIDEO_SIZE) {
    return {
      valid: false,
      error: `Video too large. Maximum size: ${MEDIA_VALIDATION.MAX_VIDEO_SIZE_MB}MB`,
    };
  }
  
  return { valid: true };
};
