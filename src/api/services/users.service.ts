/**
 * Users Service
 * All user-related API calls
 */

import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import type {
  User,
  SellerProfile,
  UserPreferences,
  UpdateProfileRequest,
  UpdatePreferencesRequest,
  ApiSuccessResponse,
} from '../../types';

/**
 * Get current user profile
 */
export const getMe = async (): Promise<User> => {
  const response = await apiClient.get<any, ApiSuccessResponse<User>>(
    ENDPOINTS.USERS.ME
  );
  return response.data;
};

/**
 * Update current user profile
 */
export const updateProfile = async (data: UpdateProfileRequest): Promise<User> => {
  const response = await apiClient.patch<any, ApiSuccessResponse<User>>(
    ENDPOINTS.USERS.ME,
    data
  );
  return response.data;
};

/**
 * Get user preferences
 */
export const getPreferences = async (): Promise<UserPreferences> => {
  const response = await apiClient.get<any, ApiSuccessResponse<UserPreferences>>(
    ENDPOINTS.USERS.PREFERENCES
  );
  return response.data;
};

/**
 * Update user preferences
 */
export const updatePreferences = async (data: UpdatePreferencesRequest): Promise<UserPreferences> => {
  const response = await apiClient.patch<any, ApiSuccessResponse<UserPreferences>>(
    ENDPOINTS.USERS.PREFERENCES,
    data
  );
  return response.data;
};

/**
 * Get seller profile by ID
 */
export const getSellerProfile = async (id: string): Promise<SellerProfile> => {
  const response = await apiClient.get<any, ApiSuccessResponse<SellerProfile>>(
    ENDPOINTS.USERS.SELLER_PROFILE(id)
  );
  return response.data;
};
