export interface FallbackProduct {
  id: string;
  title: string;
  price: number;
  description: string;
  category: string;
  categoryId: string;
  imageUrl: string;
  images: string[];
  city: string;
  location: string;
  neighborhood?: string;
  latitude?: number;
  longitude?: number;
  postedAt: string;
  condition: string;
  featured?: boolean;
  badge?: string;
  badgeText?: string;
  views: number;
  status: string;
  seller: {
    id: string;
    name: string;
    phone?: string;
    avatarUrl?: string;
    memberSince: string;
    rating: number;
    verified: boolean;
  };
}

export const FALLBACK_PRODUCTS: FallbackProduct[] = [];

