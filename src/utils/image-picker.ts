/**
 * Image Picker Utility
 * Handles image selection from gallery or camera with proper permissions
 */

import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

export interface PickedImage {
  uri: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
}

/**
 * Request camera permissions
 */
export const requestCameraPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'web') return true;

  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  
  if (status !== 'granted') {
    Alert.alert(
      'Permission Required',
      'Camera permission is required to take photos. Please enable it in settings.'
    );
    return false;
  }
  
  return true;
};

/**
 * Request media library permissions
 */
export const requestMediaLibraryPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'web') return true;

  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
  if (status !== 'granted') {
    Alert.alert(
      'Permission Required',
      'Media library permission is required to select photos. Please enable it in settings.'
    );
    return false;
  }
  
  return true;
};

/**
 * Pick image from gallery
 */
export const pickImageFromGallery = async (): Promise<PickedImage | null> => {
  try {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) return null;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1], // Square crop for avatar
      quality: 0.8,
      allowsMultipleSelection: false,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    
    return {
      uri: asset.uri,
      fileName: asset.fileName || `photo-${Date.now()}.jpg`,
      mimeType: asset.mimeType || 'image/jpeg',
      fileSize: asset.fileSize || 0,
    };
  } catch (error) {
    console.error('Error picking image from gallery:', error);
    Alert.alert('Error', 'Failed to pick image from gallery');
    return null;
  }
};

/**
 * Take photo with camera
 */
export const takePhotoWithCamera = async (): Promise<PickedImage | null> => {
  try {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return null;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1], // Square crop for avatar
      quality: 0.8,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    
    return {
      uri: asset.uri,
      fileName: asset.fileName || `photo-${Date.now()}.jpg`,
      mimeType: asset.mimeType || 'image/jpeg',
      fileSize: asset.fileSize || 0,
    };
  } catch (error) {
    console.error('Error taking photo with camera:', error);
    Alert.alert('Error', 'Failed to take photo');
    return null;
  }
};

/**
 * Show action sheet to choose between camera and gallery
 */
export const showImagePickerOptions = (): Promise<'camera' | 'gallery' | null> => {
  return new Promise((resolve) => {
    Alert.alert(
      'Choose Photo',
      'Select a photo for your profile',
      [
        {
          text: 'Take Photo',
          onPress: () => resolve('camera'),
        },
        {
          text: 'Choose from Gallery',
          onPress: () => resolve('gallery'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => resolve(null),
        },
      ],
      { cancelable: true, onDismiss: () => resolve(null) }
    );
  });
};

/**
 * Convert picked image to FormData for upload
 */
export const createImageFormData = (image: PickedImage): FormData => {
  const formData = new FormData();
  
  // @ts-ignore - FormData append accepts this format in React Native
  formData.append('files', {
    uri: image.uri,
    type: image.mimeType,
    name: image.fileName,
  });
  
  return formData;
};
