import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { toggleWishlist, removeFromWishlist } from '../store/slices/wishlistSlice';

export function useWishlist() {
  const dispatch = useDispatch<AppDispatch>();
  const itemIds = useSelector((state: RootState) => state.wishlist.itemIds);

  const isWishlisted = (id: string) => itemIds.includes(id);

  const toggle = (id: string) => {
    dispatch(toggleWishlist(id));
  };

  const remove = (id: string) => {
    dispatch(removeFromWishlist(id));
  };

  return {
    itemIds,
    count: itemIds.length,
    isWishlisted,
    toggle,
    remove,
  };
}
