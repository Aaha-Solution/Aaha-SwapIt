import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { toggleWishlist, removeFromWishlist } from '../store/slices/wishlistSlice';
import { wishlistApi } from '../api/wishlist.api';
import { useAuth } from './useAuth';

export function useWishlist() {
  const dispatch = useDispatch<AppDispatch>();
  const itemIds = useSelector((state: RootState) => state.wishlist.itemIds);
  const { isAuthenticated } = useAuth();

  const isWishlisted = (id: string) => itemIds.includes(id);

  const toggle = (id: string) => {
    const isCurrentlyWishlisted = itemIds.includes(id);
    dispatch(toggleWishlist(id));
    if (isAuthenticated) {
      if (isCurrentlyWishlisted) {
        wishlistApi.removeFromWishlist(id).catch(() => {});
      } else {
        wishlistApi.addToWishlist(id).catch(() => {});
      }
    }
  };

  const remove = (id: string) => {
    dispatch(removeFromWishlist(id));
    if (isAuthenticated) {
      wishlistApi.removeFromWishlist(id).catch(() => {});
    }
  };

  return {
    itemIds,
    count: itemIds.length,
    isWishlisted,
    toggle,
    remove,
  };
}
