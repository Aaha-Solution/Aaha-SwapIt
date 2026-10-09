import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SavedSearch {
  id: string;
  query?: string;
  category?: string;
  city?: string;
  minPrice?: number | null;
  maxPrice?: number | null;
  condition?: string;
  notificationsEnabled: boolean;
  createdAt: string;
  lastCheckedCount?: number;
}

export interface PriceDropWatch {
  productId: string;
  productTitle: string;
  originalPrice: number;
  currentPrice: number;
  imageUrl?: string;
  notificationsEnabled: boolean;
  createdAt: string;
}

interface AlertState {
  savedSearches: SavedSearch[];
  priceDropWatches: PriceDropWatch[];
}

const STORAGE_KEY_SEARCHES = 'swapit_saved_searches';
const STORAGE_KEY_PRICE_WATCHES = 'swapit_price_watches';

const loadSavedSearches = (): SavedSearch[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SEARCHES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((s) => s && !s.id?.startsWith('search-default-'));
      }
    }
  } catch {}
  return [];
};

const loadPriceWatches = (): PriceDropWatch[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PRICE_WATCHES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {}
  return [];
};

const initialState: AlertState = {
  savedSearches: loadSavedSearches(),
  priceDropWatches: loadPriceWatches(),
};

const saveToLocalStorage = (state: AlertState) => {
  try {
    localStorage.setItem(STORAGE_KEY_SEARCHES, JSON.stringify(state.savedSearches));
    localStorage.setItem(STORAGE_KEY_PRICE_WATCHES, JSON.stringify(state.priceDropWatches));
  } catch {}
};

export const alertSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    addSavedSearch: (
      state,
      action: PayloadAction<Omit<SavedSearch, 'id' | 'createdAt' | 'notificationsEnabled'>>
    ) => {
      const newSearch: SavedSearch = {
        ...action.payload,
        id: `search-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        notificationsEnabled: true,
        createdAt: new Date().toISOString(),
      };
      // Check if already exists with same parameters
      const existsIndex = state.savedSearches.findIndex(
        (s) =>
          (s.query || '').toLowerCase() === (newSearch.query || '').toLowerCase() &&
          s.category === newSearch.category &&
          s.city === newSearch.city &&
          s.maxPrice === newSearch.maxPrice
      );
      if (existsIndex >= 0) {
        state.savedSearches[existsIndex] = newSearch;
      } else {
        state.savedSearches.unshift(newSearch);
      }
      saveToLocalStorage(state);
    },
    removeSavedSearch: (state, action: PayloadAction<string>) => {
      state.savedSearches = state.savedSearches.filter((s) => s.id !== action.payload);
      saveToLocalStorage(state);
    },
    toggleSavedSearchNotification: (state, action: PayloadAction<string>) => {
      const search = state.savedSearches.find((s) => s.id === action.payload);
      if (search) {
        search.notificationsEnabled = !search.notificationsEnabled;
        saveToLocalStorage(state);
      }
    },
    togglePriceDropWatch: (
      state,
      action: PayloadAction<{
        productId: string;
        productTitle: string;
        price: number;
        imageUrl?: string;
      }>
    ) => {
      const existingIdx = state.priceDropWatches.findIndex(
        (w) => w.productId === action.payload.productId
      );
      if (existingIdx >= 0) {
        state.priceDropWatches.splice(existingIdx, 1);
      } else {
        state.priceDropWatches.unshift({
          productId: action.payload.productId,
          productTitle: action.payload.productTitle,
          originalPrice: action.payload.price,
          currentPrice: action.payload.price,
          imageUrl: action.payload.imageUrl,
          notificationsEnabled: true,
          createdAt: new Date().toISOString(),
        });
      }
      saveToLocalStorage(state);
    },
    removePriceDropWatch: (state, action: PayloadAction<string>) => {
      state.priceDropWatches = state.priceDropWatches.filter((w) => w.productId !== action.payload);
      saveToLocalStorage(state);
    },
  },
});

export const {
  addSavedSearch,
  removeSavedSearch,
  toggleSavedSearchNotification,
  togglePriceDropWatch,
  removePriceDropWatch,
} = alertSlice.actions;

export default alertSlice.reducer;
