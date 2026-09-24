import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WishlistState {
  itemIds: string[];
}

const getStoredWishlist = (): string[] => {
  try {
    const stored = localStorage.getItem('dealkart_wishlist');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const initialState: WishlistState = {
  itemIds: getStoredWishlist(),
};

export const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    setWishlist: (state, action: PayloadAction<string[]>) => {
      state.itemIds = action.payload;
      try {
        localStorage.setItem('dealkart_wishlist', JSON.stringify(state.itemIds));
      } catch {}
    },
    toggleWishlist: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const index = state.itemIds.indexOf(id);
      if (index >= 0) {
        state.itemIds.splice(index, 1);
      } else {
        state.itemIds.push(id);
      }
      try {
        localStorage.setItem('dealkart_wishlist', JSON.stringify(state.itemIds));
      } catch {}
    },
    removeFromWishlist: (state, action: PayloadAction<string>) => {
      state.itemIds = state.itemIds.filter((id) => id !== action.payload);
      try {
        localStorage.setItem('dealkart_wishlist', JSON.stringify(state.itemIds));
      } catch {}
    },
    clearWishlist: (state) => {
      state.itemIds = [];
      try {
        localStorage.removeItem('dealkart_wishlist');
      } catch {}
    },
  },
});

export const { setWishlist, toggleWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
