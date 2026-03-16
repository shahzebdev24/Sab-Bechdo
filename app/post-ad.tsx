import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';

import { theme } from '@/theme';
import { useCreateAd, useUpdateAd, useUploadMedia, useAdDetail, useCategories } from '@/src/hooks';
import type { AdCategory, AdCondition, AdLocation } from '@/src/types';

const MAX_PHOTOS = 5;

type PhotoItem = {
  id: string;
  uri: string;
};

export default function PostAdScreen() {
  const params = useLocalSearchParams<{ editId?: string }>();
  const isEditMode = !!params.editId;

  // Fetch categories from API
  const { data: categoriesData, isLoading: isCategoriesLoading } = useCategories();

  // Transform categories to options format and filter only active
  const CATEGORY_OPTIONS = useMemo(() => {
    if (!categoriesData) return [];
    return categoriesData
      .filter(cat => cat.isActive) // Only active categories
      .map(cat => ({
        label: cat.name,
        value: cat.name, // Use original name, not snake_case
      }));
  }, [categoriesData]);
  
  // Fetch ad data if in edit mode
  const { data: existingAd, isLoading: isLoadingAd } = useAdDetail(
    params.editId || '',
    isEditMode
  );

  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AdCategory | null>(null);
  const [condition, setCondition] = useState<AdCondition>('new');
  const [description, setDescription] = useState('');
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [locationState, setLocationState] = useState<AdLocation | null>(null);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { mutate: createAd, isPending: isCreatingAd } = useCreateAd();
  const { mutate: updateAd, isPending: isUpdatingAd } = useUpdateAd();
  const { mutateAsync: uploadMedia } = useUploadMedia();

  // Pre-populate form when editing
  useEffect(() => {
    if (isEditMode && existingAd) {
      setTitle(existingAd.title);
      setPrice(existingAd.price.toString());
      setSelectedCategory(existingAd.category);
      setCondition(existingAd.condition);
      setDescription(existingAd.description);
      setLocationState(existingAd.location);
      
      // Set existing photos
      if (existingAd.photoUrls && existingAd.photoUrls.length > 0) {
        const existingPhotos: PhotoItem[] = existingAd.photoUrls.map((url, index) => ({
          id: `existing-${index}`,
          uri: url,
        }));
        setPhotos(existingPhotos);
      }
      
      // Set existing video
      if (existingAd.videoUrl) {
        setVideoUri(existingAd.videoUrl);
      }
    }
  }, [isEditMode, existingAd]);

  const videoPlayer = useVideoPlayer(videoUri || '', (player) => {
    player.loop = true;
    if (videoUri) {
      player.play();
    }
  });

  const descriptionCount = useMemo(() => description.length, [description]);

  const handlePickPhotos = useCallback(async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission required',
          'Please allow photo library access to add pictures to your ad.'
        );
        return;
      }

      const remaining = Math.max(MAX_PHOTOS - photos.length, 0);
      if (remaining === 0) {
        Alert.alert('Limit reached', `You can upload up to ${MAX_PHOTOS} photos.`);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: remaining,
        quality: 0.7, // Reduced quality for faster processing
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const newItems: PhotoItem[] = result.assets
        .filter((asset): asset is ImagePicker.ImagePickerAsset => !!asset.uri)
        .map((asset, index) => ({
          id: `${Date.now()}-${index}`,
          uri: asset.uri,
        }));

      setPhotos((prev) => [...prev, ...newItems].slice(0, MAX_PHOTOS));
    } catch (error) {
      console.warn('Failed to pick images', error);
      Alert.alert('Something went wrong', 'Unable to open your photo library right now.');
    }
  }, [photos.length]);

  const handlePickVideo = useCallback(async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission required',
          'Please allow video library access to add a video to your ad.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        allowsEditing: true,
        aspect: [9, 16],
        quality: 1,
      });

      if (!result.canceled) {
        setVideoUri(result.assets[0].uri);
      }
    } catch (error) {
      console.warn('Failed to pick video', error);
      Alert.alert('Something went wrong', 'Unable to open your video library right now.');
    }
  }, []);

  const handleRemovePhoto = useCallback((id: string) => {
    setPhotos((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleSelectCategory = useCallback((value: AdCategory) => {
    setSelectedCategory(value);
    setCategoryModalVisible(false);
  }, []);

  const handleToggleCondition = useCallback((value: AdCondition) => {
    setCondition(value);
  }, []);

  const handleSelectLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== Location.PermissionStatus.GRANTED) {
        Alert.alert(
          'Permission required',
          'Please allow location access to set the ad location.'
        );
        return;
      }

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const base: AdLocation = {
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
        accuracy: current.coords.accuracy ?? undefined,
      };

      let addressText: string | undefined;

      try {
        const [address] = await Location.reverseGeocodeAsync({
          latitude: base.latitude,
          longitude: base.longitude,
        });

        if (address) {
          const parts = [
            address.name,
            address.street,
            address.city,
            address.region,
            address.country,
          ].filter(Boolean);
          addressText = parts.join(', ');
        }
      } catch {
        addressText = undefined;
      }

      const fullLocation: AdLocation = {
        ...base,
        address: addressText,
      };

      setLocationState(fullLocation);
    } catch (error) {
      console.error('Failed to set location', error);
      Alert.alert('Location error', 'Unable to fetch your location right now. Please try again.');
    }
  }, []);

  const handlePostAd = useCallback(async () => {
    if (isUploading || isCreatingAd || isUpdatingAd) return;

    // Validation
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      Alert.alert('Missing title', 'Please enter a title for your ad.');
      return;
    }

    const numericPrice = Number(price.replace(/[^\d.]/g, ''));
    if (!numericPrice || Number.isNaN(numericPrice) || numericPrice <= 0) {
      Alert.alert('Invalid price', 'Please enter a valid price in PKR.');
      return;
    }

    if (!selectedCategory) {
      Alert.alert('Select category', 'Please choose a category for your ad.');
      return;
    }

    if (!photos.length && !videoUri) {
      Alert.alert('Add content', 'Please add at least one photo or a video.');
      return;
    }

    if (!locationState) {
      Alert.alert('Select location', 'Please select a location for your ad.');
      return;
    }

    try {
      setIsUploading(true);

      // Separate existing URLs from new uploads
      const existingPhotoUrls = photos.filter(p => p.id.startsWith('existing-')).map(p => p.uri);
      const newPhotos = photos.filter(p => !p.id.startsWith('existing-'));

      // Upload new photos
      let uploadedPhotoUrls: string[] = [...existingPhotoUrls];
      if (newPhotos.length > 0) {
        const formData = new FormData();
        
        newPhotos.forEach((photo, index) => {
          formData.append('files', {
            uri: photo.uri,
            type: 'image/jpeg',
            name: `photo_${index}.jpg`,
          } as any);
        });

        const uploadResult = await uploadMedia(formData);
        uploadedPhotoUrls = [...uploadedPhotoUrls, ...uploadResult.files.map(file => file.secureUrl)];
      }

      // Upload video if it's new (not existing URL)
      let uploadedVideoUrl: string | undefined = videoUri || undefined;
      if (videoUri && !videoUri.startsWith('http')) {
        const videoFormData = new FormData();
        videoFormData.append('files', {
          uri: videoUri,
          type: 'video/mp4',
          name: 'video.mp4',
        } as any);

        const videoUploadResult = await uploadMedia(videoFormData);
        uploadedVideoUrl = videoUploadResult.files[0]?.secureUrl;
      }

      setIsUploading(false);

      const adData = {
        title: trimmedTitle,
        price: numericPrice,
        currency: 'PKR',
        category: selectedCategory,
        condition,
        description: description.trim(),
        photoUrls: uploadedPhotoUrls,
        videoUrl: uploadedVideoUrl,
        location: locationState,
      };

      // Update or Create
      if (isEditMode && params.editId) {
        updateAd(
          { id: params.editId, data: adData },
          {
            onSuccess: () => {
              Alert.alert('Success', 'Your ad has been updated.', [
                {
                  text: 'OK',
                  onPress: () => router.back(),
                },
              ]);
            },
            onError: (error: any) => {
              Alert.alert(
                'Update Failed',
                error.message || 'Failed to update ad. Please try again.'
              );
            },
          }
        );
      } else {
        createAd(
          adData,
          {
            onSuccess: () => {
              Alert.alert('Success', 'Your ad has been posted.', [
                {
                  text: 'OK',
                  onPress: () => {
                    if (uploadedVideoUrl) {
                      router.replace('/(tabs)/reel');
                    } else {
                      router.replace('/(tabs)');
                    }
                  },
                },
              ]);
            },
            onError: (error: any) => {
              Alert.alert(
                'Post Failed',
                error.message || 'Failed to create ad. Please try again.'
              );
            },
          }
        );
      }
    } catch (error: any) {
      setIsUploading(false);
      console.error('Failed to upload media', error);
      Alert.alert(
        'Upload Failed',
        error.message || 'Failed to upload media. Please check your connection and try again.'
      );
    }
  }, [
    condition,
    description,
    isCreatingAd,
    isUpdatingAd,
    isUploading,
    locationState,
    photos,
    price,
    selectedCategory,
    title,
    videoUri,
    isEditMode,
    params.editId,
    createAd,
    updateAd,
    uploadMedia,
  ]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          bounces={false}>
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.headerIcon} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={22} color={theme.colors.textPrimary} />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>{isEditMode ? 'Edit Ad' : 'Post New Ad'}</Text>
              <Text style={styles.headerSubtitle}>Step 1 of 2</Text>
            </View>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.photosCard}>
            <TouchableOpacity style={styles.uploadArea} activeOpacity={0.9} onPress={handlePickPhotos}>
              <View style={styles.uploadIconCircle}>
                <Ionicons name="cloud-upload-outline" size={24} color={theme.colors.primary} />
              </View>
              <Text style={styles.uploadTitle}>Add Photos (up to {MAX_PHOTOS})</Text>
              <Text style={styles.uploadSubtitle}>{photos.length} / {MAX_PHOTOS} selected</Text>
            </TouchableOpacity>

            {photos.length > 0 && (
              <View style={styles.photoRow}>
                {photos.map((item) => (
                  <View key={item.id} style={styles.photoItem}>
                    <Image source={{ uri: item.uri }} style={styles.photoImage} />
                    <TouchableOpacity
                      style={styles.photoRemoveButton}
                      onPress={() => handleRemovePhoto(item.id)}
                      activeOpacity={0.8}>
                      <Ionicons name="close" size={14} color={theme.colors.card} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.videoCard}>
            <View style={styles.videoUploadArea}>
              {videoUri ? (
                <View style={styles.videoPreviewContainer}>
                  <View style={styles.videoSuccessHeader}>
                    <View style={styles.videoStatusRow}>
                      <Ionicons name="videocam" size={20} color={theme.colors.primary} />
                      <Text style={styles.videoStatusText}>Video Preview</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => setVideoUri(null)}
                      style={styles.removeCircleBtn}
                    >
                      <Ionicons name="trash" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>

                  <VideoView
                    player={videoPlayer}
                    style={styles.videoPreview}
                    contentFit="cover"
                    nativeControls={false}
                  />

                  <View style={styles.editActionsRow}>
                    <TouchableOpacity
                      style={styles.cropActionBtn}
                      onPress={() => router.push({
                        pathname: '/video-edit',
                        params: { uri: videoUri }
                      })}
                    >
                      <Ionicons name="cut-outline" size={20} color="#fff" />
                      <Text style={styles.cropActionText}>Edit Video</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.videoPlaceholderRow}
                  activeOpacity={0.9}
                  onPress={handlePickVideo}
                >
                  <View style={styles.videoIconWrapper}>
                    <Ionicons name="videocam-outline" size={22} color={theme.colors.primary} />
                  </View>
                  <View style={styles.videoTextContainer}>
                    <Text style={styles.videoTitle}>Add Video for Reels</Text>
                    <Text style={styles.videoSubtitle}>Maximum 30 seconds recommended</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#94A3B8" style={{ marginLeft: 'auto' }} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.formCard}>
            <TextInput
              placeholder="Title"
              style={styles.input}
              placeholderTextColor="#94A3B8"
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              placeholder="Price (PKR)"
              style={styles.input}
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />

            <TouchableOpacity
              style={styles.inputRow}
              activeOpacity={0.9}
              onPress={() => setCategoryModalVisible(true)}>
              <Text
                style={[
                  styles.inputPlaceholder,
                  selectedCategory && styles.inputValueText,
                ]}>
                {selectedCategory 
                  ? CATEGORY_OPTIONS.find(c => c.value === selectedCategory)?.label 
                  : 'Category'}
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>

            <View style={styles.segmentLabelRow}>
              <Text style={styles.segmentLabel}>Condition</Text>
            </View>
            <View style={styles.segmentRow}>
              <TouchableOpacity
                style={[
                  styles.segmentPill,
                  condition === 'new' && styles.segmentPillActive,
                ]}
                activeOpacity={0.9}
                onPress={() => handleToggleCondition('new')}>
                <Text
                  style={[
                    styles.segmentText,
                    condition === 'new' && styles.segmentTextActive,
                  ]}>
                  New
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segmentPill,
                  condition === 'used' && styles.segmentPillActive,
                ]}
                activeOpacity={0.9}
                onPress={() => handleToggleCondition('used')}>
                <Text
                  style={[
                    styles.segmentText,
                    condition === 'used' && styles.segmentTextActive,
                  ]}>
                  Used
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.inputRow}
              activeOpacity={0.9}
              onPress={handleSelectLocation}>
              <View style={styles.locationLeft}>
                <Ionicons name="location-outline" size={18} color={theme.colors.primary} />
                <Text
                  style={[
                    styles.inputPlaceholder,
                    locationState && styles.inputValueText,
                  ]}>
                  {locationState?.address ?? 'Select location'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>

            <View style={styles.descriptionContainer}>
              <TextInput
                style={styles.descriptionInput}
                placeholder="Description"
                placeholderTextColor="#94A3B8"
                multiline
                maxLength={500}
                value={description}
                onChangeText={setDescription}
              />
              <Text style={styles.charCount}>{descriptionCount} / 500</Text>
            </View>
          </View>
        </ScrollView>

        <SafeAreaView edges={['bottom']} style={styles.footerSafeArea}>
          <TouchableOpacity
            style={[styles.postButton, (isUploading || isCreatingAd || isUpdatingAd || isLoadingAd) && styles.postButtonDisabled]}
            activeOpacity={0.9}
            disabled={isUploading || isCreatingAd || isUpdatingAd || isLoadingAd}
            onPress={handlePostAd}>
            {isUploading || isCreatingAd || isUpdatingAd ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.postButtonText}>
                  {isUploading ? 'Uploading...' : isEditMode ? 'Updating...' : 'Posting...'}
                </Text>
              </View>
            ) : (
              <Text style={styles.postButtonText}>{isEditMode ? 'Update Ad' : 'Post Ad'}</Text>
            )}
          </TouchableOpacity>
        </SafeAreaView>

        <Modal
          visible={categoryModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setCategoryModalVisible(false)}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setCategoryModalVisible(false)}>
            <View style={styles.modalSheet}>
              <Text style={styles.modalTitle}>Select category</Text>
              {isCategoriesLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                  <Text style={styles.loadingText}>Loading categories...</Text>
                </View>
              ) : CATEGORY_OPTIONS.length === 0 ? (
                <Text style={styles.emptyText}>No categories available</Text>
              ) : (
                CATEGORY_OPTIONS.map((option) => {
                  const isActive = option.value === selectedCategory;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.modalItem,
                        isActive && styles.modalItemActive,
                      ]}
                      activeOpacity={0.9}
                      onPress={() => handleSelectCategory(option.value)}>
                      <Text
                        style={[
                          styles.modalItemText,
                          isActive && styles.modalItemTextActive,
                        ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          </Pressable>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.round,
    backgroundColor: theme.colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  headerSubtitle: {
    marginTop: 2,
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
  },
  headerSpacer: {
    width: 36,
  },
  photosCard: {
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  uploadArea: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  uploadIconCircle: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.round,
    backgroundColor: theme.colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  uploadTitle: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  uploadSubtitle: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  photoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  photoItem: {
    width: '31%',
    aspectRatio: 4 / 3,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    marginHorizontal: 4,
    marginBottom: 8,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoRemoveButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: theme.radius.round,
    backgroundColor: 'rgba(15,23,42,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoCard: {
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  videoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.round,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  videoTextContainer: {},
  videoTitle: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textPrimary,
  },
  videoSubtitle: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
  },
  formCard: {
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  input: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
    backgroundColor: '#F9FBFF',
  },
  inputRow: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
    backgroundColor: '#F9FBFF',
  },
  inputPlaceholder: {
    fontSize: theme.fontSizes.sm,
    color: '#94A3B8',
  },
  inputValueText: {
    color: theme.colors.textPrimary,
  },
  segmentLabelRow: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  segmentLabel: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
  },
  segmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  segmentPill: {
    flex: 1,
    borderRadius: theme.radius.round,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: theme.spacing.xs,
    alignItems: 'center',
    backgroundColor: '#F9FBFF',
  },
  segmentPillActive: {
    backgroundColor: '#BBF7D0',
    borderColor: '#22C55E',
  },
  segmentText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  segmentTextActive: {
    color: '#166534',
    fontWeight: '600',
  },
  locationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  descriptionContainer: {
    marginTop: theme.spacing.sm,
  },
  descriptionInput: {
    minHeight: 90,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textPrimary,
    backgroundColor: '#F9FBFF',
    textAlignVertical: 'top',
  },
  charCount: {
    alignSelf: 'flex-end',
    marginTop: 4,
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
  },
  footerSafeArea: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    backgroundColor: 'transparent',
  },
  postButton: {
    height: 52,
    borderRadius: theme.radius.round,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  postButtonText: {
    color: theme.colors.card,
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
  },
  postButtonDisabled: {
    opacity: 0.7,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.35)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: theme.colors.card,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    gap: theme.spacing.xs,
  },
  modalTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  modalItem: {
    paddingVertical: theme.spacing.sm,
  },
  modalItemActive: {
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.sm,
  },
  modalItemText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  modalItemTextActive: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  emptyText: {
    padding: theme.spacing.xl,
    textAlign: 'center',
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  removeVideoBtn: {
    marginLeft: 'auto',
    padding: 8,
  },
  videoUploadArea: {
    padding: theme.spacing.sm,
  },
  videoPreviewContainer: {
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  videoPreview: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.md,
    backgroundColor: '#000',
  },
  videoSuccessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  videoStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  videoStatusText: {
    fontSize: theme.fontSizes.sm,
    fontWeight: '600',
    color: '#166534',
  },
  removeCircleBtn: {
    padding: 4,
  },
  editActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cropActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    gap: 8,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cropActionText: {
    color: '#fff',
    fontSize: theme.fontSizes.sm,
    fontWeight: '600',
  },
  videoHintText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  videoPlaceholderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

