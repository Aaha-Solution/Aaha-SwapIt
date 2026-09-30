export type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'countered' | 'completed' | 'cancelled';

export interface Offer {
  id: string;
  buyerId: string;
  sellerId: string;
  productId: string;
  offerAmount: number;
  originalPrice: number;
  status: OfferStatus;
  counterAmount?: number | null;
  exchangeItem?: string | null;
  pickupLocation?: string | null;
  pickupTime?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  product?: {
    id: string;
    title: string;
    imageUrl: string;
    price: number;
  };
  buyer?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
    phone?: string | null;
  };
  seller?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
    phone?: string | null;
  };
}

export interface CreateOfferPayload {
  productId: string;
  sellerId: string;
  offerAmount: number;
  originalPrice: number;
  exchangeItem?: string;
  pickupLocation?: string;
  pickupTime?: string;
  notes?: string;
}
