/**
 * Avatar Upload Hook
 * Handles avatar image selection and upload
 */

import { useState } from 'react';
import { Alert } from 'react-native';
import { useUploadMedia } from './useMediaMutations';
import { useUpdateProfile } from './useUserMutations';
import {
  showImagePickerOptions,
  pickImageFromGallery,
  takePhotoWithCamera,
  createImageFormData,
  type PickedImage,
} from '../../utils/image-picker';

export const useAvatarUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<PickedImage | null>(null);
  
  const uploadMedia = useUploadMedia();
  const updateProfile = useUpdateProfile();

  /**
   * Handle avatar selection and upload
   */
  const uploadAvatar = async (): Promise<string | null> => {
    try {
      setIsUploading(true);

      // Step 1: Show options (Camera or Gallery)
      const choice = await showImagePickerOptions();
      if (!choice) {
        setIsUploading(false);
        return null;
      }

      // Step 2: Pick image based on choice
      let pickedImage: PickedImage | null = null;
      
      if (choice === 'camera') {
        pickedImage = await takePhotoWithCamera();
      } else {
        pickedImage = await pickImageFromGallery();
      }

      if (!pickedImage) {
        setIsUploading(false);
        return null;
      }

      setSelectedImage(pickedImage);

      // Step 3: Upload to Cloudinary via backend
      const formData = createImageFormData(pickedImage);
      const uploadResult = await uploadMedia.mutateAsync(formData);

      if (!uploadResult.files || uploadResult.files.length === 0) {
        throw new Error('No file uploaded');
      }

      const avatarUrl = uploadResult.files[0].secureUrl;

      // Step 4: Update user profile with new avatar URL
      await updateProfile.mutateAsync({ avatarUrl });

      setIsUploading(false);
      return avatarUrl;
      
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      setIsUploading(false);
      
      Alert.alert(
        'Upload Failed',
        error.message || 'Failed to upload avatar. Please try again.'
      );
      
      return null;
    }
  };

  return {
    uploadAvatar,
    isUploading,
    selectedImage,
  };
};
