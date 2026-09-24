import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest' | 'views-desc';

interface UserState {
  selectedCity: string;
  searchQuery: string;
  selectedCategory: string;
  priceRange: string;
  customMinPrice: number | null;
  customMaxPrice: number | null;
  selectedCondition: string;
  sortBy: SortOption;
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
  customMinPrice: null,
  customMaxPrice: null,
  selectedCondition: 'all',
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
      state.customMinPrice = null;
      state.customMaxPrice = null;
    },
    setCustomPriceRange: (
      state,
      action: PayloadAction<{ min: number | null; max: number | null }>
    ) => {
      state.customMinPrice = action.payload.min;
      state.customMaxPrice = action.payload.max;
      state.priceRange = 'custom';
    },
    setSelectedCondition: (state, action: PayloadAction<string>) => {
      state.selectedCondition = action.payload;
    },
    setSortBy: (state, action: PayloadAction<SortOption>) => {
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
    clearFilter: (
      state,
      action: PayloadAction<'search' | 'category' | 'city' | 'condition' | 'price'>
    ) => {
      switch (action.payload) {
        case 'search':
          state.searchQuery = '';
          break;
        case 'category':
          state.selectedCategory = 'all';
          break;
        case 'city':
          state.selectedCity = 'all';
          break;
        case 'condition':
          state.selectedCondition = 'all';
          break;
        case 'price':
          state.priceRange = 'all';
          state.customMinPrice = null;
          state.customMaxPrice = null;
          break;
      }
    },
    resetFilters: (state) => {
      state.searchQuery = '';
      state.selectedCategory = 'all';
      state.priceRange = 'all';
      state.customMinPrice = null;
      state.customMaxPrice = null;
      state.selectedCondition = 'all';
      state.sortBy = 'featured';
    },
  },
});

export const {
  setSelectedCity,
  setSearchQuery,
  setSelectedCategory,
  setPriceRange,
  setCustomPriceRange,
  setSelectedCondition,
  setSortBy,
  setMessagesCount,
  setMyAdsCount,
  openAuthModal,
  closeAuthModal,
  openPostAdModal,
  closePostAdModal,
  openProductDetails,
  closeProductDetails,
  clearFilter,
  resetFilters,
} = userSlice.actions;

export default userSlice.reducer;
