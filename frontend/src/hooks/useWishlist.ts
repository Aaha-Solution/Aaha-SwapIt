import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { toggleWishlist, removeFromWishlist } from '../store/slices/wishlistSlice';
import { wishlistApi } from '../api/wishlist.api';
import { useAuth } from './useAuth';
import { useToast } from './useToast';

export function useWishlist() {
  const dispatch = useDispatch<AppDispatch>();
  const itemIds = useSelector((state: RootState) => state.wishlist.itemIds);
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const isWishlisted = (id: string) => itemIds.includes(id);

  const toggle = (id: string, productTitle?: string) => {
    const isCurrentlyWishlisted = itemIds.includes(id);
    dispatch(toggleWishlist(id));

    if (isCurrentlyWishlisted) {
      toast.info(productTitle ? `"${productTitle}" removed from Wishlist` : 'Removed from Wishlist', {
        title: 'Wishlist Updated',
      });
      if (isAuthenticated) {
        wishlistApi.removeFromWishlist(id).catch(() => {});
      }
    } else {
      toast.success(productTitle ? `"${productTitle}" added to Wishlist` : 'Item added to your Wishlist!', {
        title: 'Saved to Wishlist ❤️',
        action: {
          label: 'View Wishlist',
          url: '/wishlist',
        },
      });
      if (isAuthenticated) {
        wishlistApi.addToWishlist(id).catch(() => {});
      }
    }
  };

  const remove = (id: string, productTitle?: string) => {
    dispatch(removeFromWishlist(id));
    toast.info(productTitle ? `"${productTitle}" removed from Wishlist` : 'Removed from Wishlist', {
      title: 'Wishlist Updated',
    });
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
