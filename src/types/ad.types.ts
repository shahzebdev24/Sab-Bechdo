/**
 * Ad Types
 */

import { User } from './auth.types';

export type AdCategory = 
  | 'electronics'
  | 'vehicles'
  | 'property'
  | 'fashion'
  | 'home_garden'
  | 'sports'
  | 'books'
  | 'pets'
  | 'services'
  | 'other';

export type AdCondition = 'new' | 'used';

export type AdStatus = 'active' | 'pending' | 'sold' | 'archived';

export interface AdLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
}

export interface Ad {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: AdCategory;
  condition: AdCondition;
  owner: User;
  photoUrls: string[];
  videoUrl?: string;
  location: AdLocation;
  status: AdStatus;
  views: number;
  isFavorite?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdRequest {
  title: string;
  description: string;
  price: number;
  currency?: string;
  category: AdCategory;
  condition: AdCondition;
  photoUrls: string[];
  videoUrl?: string;
  location: AdLocation;
}

export interface UpdateAdRequest {
  title?: string;
  description?: string;
  price?: number;
  currency?: string;
  category?: AdCategory;
  condition?: AdCondition;
  photoUrls?: string[];
  videoUrl?: string;
  location?: AdLocation;
}

export interface UpdateAdStatusRequest {
  status: AdStatus;
}

export interface AdFilters {
  category?: AdCategory;
  minPrice?: number;
  maxPrice?: number;
  lat?: number;
  lng?: number;
  radius?: number;
  search?: string;
  sort?: 'recent' | 'price_asc' | 'price_desc' | 'views';
  page?: number;
  limit?: number;
}

export interface PaginatedAdsResponse {
  ads: Ad[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
