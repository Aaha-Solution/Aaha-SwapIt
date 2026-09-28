export type UserRole = 'customer' | 'seller' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  location?: string;
  memberSince?: string;
  verified?: boolean;
  role?: UserRole | string;
}

export interface SellerAccountInput {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  location?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
