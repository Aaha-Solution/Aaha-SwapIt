import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, AuthState } from '../../types/user.types';

const storedUser = localStorage.getItem('dealkart_user');
const storedToken = localStorage.getItem('dealkart_token');

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
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
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
      localStorage.setItem('dealkart_user', JSON.stringify(action.payload.user));
      localStorage.setItem('dealkart_token', action.payload.token);
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    quickDemoLogin: (state) => {
      const demoUser: User = {
        id: 'usr-demo-iyyanar',
        name: 'Iyyanar',
        email: 'iyyanar@example.com',
        phone: '+91 98401 98765',
        location: 'Chennai',
        memberSince: 'Sep 2024',
        verified: true,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      };
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = demoUser;
      state.token = 'demo-jwt-token-iyyanar';
      state.error = null;
      localStorage.setItem('dealkart_user', JSON.stringify(demoUser));
      localStorage.setItem('dealkart_token', 'demo-jwt-token-iyyanar');
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
