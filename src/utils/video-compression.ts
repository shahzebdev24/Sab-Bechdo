/**
 * Video Compression Utility
 * Compress videos before upload to reduce file size
 */

import * as FileSystem from 'expo-file-system/legacy';
import { MEDIA_VALIDATION } from '../constants/validation';

/**
 * Check if video needs compression
 */
export const needsCompression = async (videoUri: string): Promise<boolean> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(videoUri);
    if (!fileInfo.exists || !('size' in fileInfo)) {
      return false;
    }
    
    return fileInfo.size > MEDIA_VALIDATION.MAX_VIDEO_SIZE;
  } catch (error) {
    console.error('Error checking video size:', error);
    return false;
  }
};

/**
 * Get video file size
 */
export const getVideoSize = async (videoUri: string): Promise<number> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(videoUri);
    if (!fileInfo.exists || !('size' in fileInfo)) {
      return 0;
    }
    return fileInfo.size;
  } catch (error) {
    console.error('Error getting video size:', error);
    return 0;
  }
};
