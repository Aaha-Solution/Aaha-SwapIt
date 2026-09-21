import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WishlistState {
  itemIds: string[];
}

const storedWishlist = localStorage.getItem('dealkart_wishlist');

const initialState: WishlistState = {
  itemIds: storedWishlist ? JSON.parse(storedWishlist) : ['prod-1', 'prod-3'], // default 2 favorites matching prototype!
};

export const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    toggleWishlist: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const index = state.itemIds.indexOf(id);
      if (index >= 0) {
        state.itemIds.splice(index, 1);
      } else {
        state.itemIds.push(id);
      }
      localStorage.setItem('dealkart_wishlist', JSON.stringify(state.itemIds));
    },
    removeFromWishlist: (state, action: PayloadAction<string>) => {
      state.itemIds = state.itemIds.filter((id) => id !== action.payload);
      localStorage.setItem('dealkart_wishlist', JSON.stringify(state.itemIds));
    },
    clearWishlist: (state) => {
      state.itemIds = [];
      localStorage.removeItem('dealkart_wishlist');
    },
  },
});

export const { toggleWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
