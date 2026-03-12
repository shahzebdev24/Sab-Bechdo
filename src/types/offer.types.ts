/**
 * Offer Types
 */

import { User } from './auth.types';
import { Ad } from './ad.types';

export type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export interface Offer {
  id: string;
  ad: Ad | string;
  fromUser: User | string;
  toUser: User | string;
  amount: number;
  currency: string;
  status: OfferStatus;
  message?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOfferRequest {
  adId: string;
  amount: number;
  message?: string;
}

export interface UpdateOfferStatusRequest {
  status: 'accepted' | 'rejected' | 'cancelled';
}

export interface PaginatedOffersResponse {
  offers: Offer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
