export interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  category: string;
  categoryId?: string;
  images: string[];
  imageUrl: string;
  location: string;
  city: string;
  postedAt: string;
  condition: 'Brand New' | 'Like New' | 'Good' | 'Fair';
  featured?: boolean;
  badge?: 'featured' | 'good' | 'likenew' | 'verified' | 'brandnew';
  badgeText?: string;
  seller: {
    id: string;
    name: string;
    phone?: string;
    avatarUrl?: string;
    memberSince: string;
    rating?: number;
    verified?: boolean;
  };
  views?: number;
  status?: 'active' | 'sold' | 'draft';
}

export interface ProductFilterOptions {
  search?: string;
  category?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'featured' | 'price-asc' | 'price-desc' | 'newest';
  page?: number;
  limit?: number;
}
