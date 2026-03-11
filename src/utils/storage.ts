/**
 * Storage Utility
 * Wrapper around AsyncStorage for type-safe storage operations
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../config';
import type { User, AuthTokens } from '../types';

/**
 * Save access token
 */
export const saveAccessToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  } catch (error) {
    console.error('Error saving access token:', error);
    throw error;
  }
};

/**
 * Get access token
 */
export const getAccessToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
};

/**
 * Save refresh token
 */
export const saveRefreshToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  } catch (error) {
    console.error('Error saving refresh token:', error);
    throw error;
  }
};

/**
 * Get refresh token
 */
export const getRefreshToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
};

/**
 * Save both tokens
 */
export const saveTokens = async (tokens: AuthTokens): Promise<void> => {
  try {
    await Promise.all([
      saveAccessToken(tokens.accessToken),
      saveRefreshToken(tokens.refreshToken),
    ]);
  } catch (error) {
    console.error('Error saving tokens:', error);
    throw error;
  }
};

/**
 * Remove all tokens
 */
export const removeTokens = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
    ]);
  } catch (error) {
    console.error('Error removing tokens:', error);
    throw error;
  }
};

/**
 * Save user data
 */
export const saveUser = async (user: User): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user:', error);
    throw error;
  }
};

/**
 * Get user data
 */
export const getUser = async (): Promise<User | null> => {
  try {
    const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

/**
 * Remove user data
 */
export const removeUser = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
  } catch (error) {
    console.error('Error removing user:', error);
    throw error;
  }
};

/**
 * Clear all app data
 */
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing all data:', error);
    throw error;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const token = await getAccessToken();
    return !!token;
  } catch (error) {
    return false;
  }
};
