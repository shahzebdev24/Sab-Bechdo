/**
 * User Types
 */

export interface UserLocation {
  city?: string;
  region?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export interface UserPreferences {
  notifications: {
    chat: boolean;
    likes: boolean;
    comments: boolean;
    follows: boolean;
    system: boolean;
  };
  theme: 'light' | 'dark' | 'system';
  language: string;
}

export interface UserStats {
  activeAds: number;
  soldItems: number;
  totalAds: number;
  rating: number;
  totalReviews: number;
}

export interface SellerProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  username?: string;
  joinedAt: string;
  stats: UserStats;
}

export interface UpdateProfileRequest {
  name?: string;
  avatarUrl?: string;
  username?: string;
  phone?: string;
  location?: UserLocation;
}

export interface UpdatePreferencesRequest {
  notifications?: {
    chat?: boolean;
    likes?: boolean;
    comments?: boolean;
    follows?: boolean;
    system?: boolean;
  };
  theme?: 'light' | 'dark' | 'system';
  language?: string;
}
