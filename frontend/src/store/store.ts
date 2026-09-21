import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import wishlistReducer from './slices/wishlistSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    wishlist: wishlistReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
