import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  selectedCity: string;
  searchQuery: string;
  selectedCategory: string;
  priceRange: string;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'newest';
  myAdsCount: number;
  messagesCount: number;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'signup';
  isPostAdModalOpen: boolean;
  activeDetailsProductId: string | null;
}

const initialState: UserState = {
  selectedCity: 'Chennai',
  searchQuery: '',
  selectedCategory: 'all',
  priceRange: 'all',
  sortBy: 'featured',
  myAdsCount: 0,
  messagesCount: 0,
  isAuthModalOpen: false,
  authModalTab: 'login',
  isPostAdModalOpen: false,
  activeDetailsProductId: null,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setSelectedCity: (state, action: PayloadAction<string>) => {
      state.selectedCity = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSelectedCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
    },
    setPriceRange: (state, action: PayloadAction<string>) => {
      state.priceRange = action.payload;
    },
    setSortBy: (state, action: PayloadAction<'featured' | 'price-asc' | 'price-desc' | 'newest'>) => {
      state.sortBy = action.payload;
    },
    setMessagesCount: (state, action: PayloadAction<number>) => {
      state.messagesCount = action.payload;
    },
    setMyAdsCount: (state, action: PayloadAction<number>) => {
      state.myAdsCount = action.payload;
    },
    openAuthModal: (state, action: PayloadAction<'login' | 'signup' | undefined>) => {
      state.isAuthModalOpen = true;
      state.authModalTab = action.payload || 'login';
    },
    closeAuthModal: (state) => {
      state.isAuthModalOpen = false;
    },
    openPostAdModal: (state) => {
      state.isPostAdModalOpen = true;
    },
    closePostAdModal: (state) => {
      state.isPostAdModalOpen = false;
    },
    openProductDetails: (state, action: PayloadAction<string>) => {
      state.activeDetailsProductId = action.payload;
    },
    closeProductDetails: (state) => {
      state.activeDetailsProductId = null;
    },
    resetFilters: (state) => {
      state.searchQuery = '';
      state.selectedCategory = 'all';
      state.priceRange = 'all';
      state.sortBy = 'featured';
    },
  },
});

export const {
  setSelectedCity,
  setSearchQuery,
  setSelectedCategory,
  setPriceRange,
  setSortBy,
  setMessagesCount,
  setMyAdsCount,
  openAuthModal,
  closeAuthModal,
  openPostAdModal,
  closePostAdModal,
  openProductDetails,
  closeProductDetails,
  resetFilters,
} = userSlice.actions;

export default userSlice.reducer;
