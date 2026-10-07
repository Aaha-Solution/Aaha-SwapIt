import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, AuthState } from '../../types/user.types';

const getStoredUser = (): User | null => {
  const stored = localStorage.getItem('dealkart_user');
  if (!stored) return null;
  try {
    const user = JSON.parse(stored);
    if (user && user.name) {
      user.name = user.name.replace(/\s*\((Customer|Admin|Seller)\)/gi, '').trim();
    }
    return user;
  } catch {
    return null;
  }
};

const storedUser = getStoredUser();
const storedToken = localStorage.getItem('dealkart_token');

const initialState: AuthState = {
  user: storedUser,
  token: storedToken || null,
  isAuthenticated: !!storedToken,
  isLoading: false,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      const cleanUser = {
        ...action.payload.user,
        name: action.payload.user.name?.replace(/\s*\((Customer|Admin|Seller)\)/gi, '').trim() || action.payload.user.name,
      };
      state.user = cleanUser;
      state.token = action.payload.token;
      state.error = null;
      localStorage.setItem('dealkart_user', JSON.stringify(cleanUser));
      localStorage.setItem('dealkart_token', action.payload.token);
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    quickDemoLogin: (state, action: PayloadAction<('admin' | 'seller' | 'customer') | undefined>) => {
      const targetRole = action.payload || 'admin';
      let demoUser: User;
      let demoToken: string;

      if (targetRole === 'seller') {
        demoUser = {
          id: 'usr-demo-seller',
          name: 'Karthik Raja',
          email: 'seller@swapit.com',
          phone: '+91 98401 23456',
          location: 'Chennai',
          memberSince: 'Oct 2024',
          verified: true,
          role: 'seller',
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        };
        demoToken = 'demo-jwt-token-seller';
      } else if (targetRole === 'customer') {
        demoUser = {
          id: 'usr-demo-customer',
          name: 'Vignesh',
          email: 'customer@swapit.com',
          phone: '+91 97910 88231',
          location: 'Chennai',
          memberSince: 'Jan 2025',
          verified: true,
          role: 'customer',
          avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        };
        demoToken = 'demo-jwt-token-customer';
      } else {
        demoUser = {
          id: 'usr-demo-admin',
          name: 'Iyyanar',
          email: 'admin@swapit.com',
          phone: '+91 98401 98765',
          location: 'Chennai',
          memberSince: 'Sep 2024',
          verified: true,
          role: 'admin',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        };
        demoToken = 'demo-jwt-token-admin';
      }

      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = demoUser;
      state.token = demoToken;
      state.error = null;
      localStorage.setItem('dealkart_user', JSON.stringify(demoUser));
      localStorage.setItem('dealkart_token', demoToken);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      localStorage.removeItem('dealkart_user');
      localStorage.removeItem('dealkart_token');
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, quickDemoLogin, logout } = authSlice.actions;
export default authSlice.reducer;
