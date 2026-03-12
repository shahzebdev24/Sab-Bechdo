/**
 * Review Types
 */

import { User } from './auth.types';

export interface Review {
  id: string;
  seller: string;
  buyer: User;
  ad: {
    id: string;
    title: string;
    photoUrls: string[];
  };
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface CreateReviewRequest {
  sellerId: string;
  adId: string;
  rating: number;
  comment?: string;
}

export interface PaginatedReviewsResponse {
  reviews: Review[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
