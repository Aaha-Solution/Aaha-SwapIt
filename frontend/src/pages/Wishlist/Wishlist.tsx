import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Heart, ArrowLeft, ShoppingBag } from 'lucide-react';
import { Product } from '../../types/product.types';
import { wishlistApi } from '../../api/wishlist.api';
import { productApi } from '../../api/product.api';
import { useWishlist } from '../../hooks/useWishlist';
import { setWishlist } from '../../store/slices/wishlistSlice';
import { ProductCard } from '../../components/ProductCard/ProductCard';

export const Wishlist: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { itemIds } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const res = await wishlistApi.getWishlist();
        if (res.success && res.data && res.data.length > 0) {
          setProducts(res.data);
          dispatch(setWishlist(res.data.map((p) => p.id)));
        } else {
          // If wishlistApi returns empty or standalone mode, match with productApi
          const prodRes = await productApi.getProducts({ limit: 100 });
          if (prodRes.success && prodRes.data) {
            const matched = prodRes.data.filter((p) => itemIds.includes(p.id));
            setProducts(matched);
            dispatch(setWishlist(matched.map((p) => p.id)));
          } else {
            setProducts([]);
          }
        }
      } catch {
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const displayedProducts = products.filter((p) => itemIds.includes(p.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-white border border-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              <span>Saved Favorites</span>
              <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            </h1>
            <p className="text-xs text-slate-500">
              {displayedProducts.length} {displayedProducts.length === 1 ? 'item' : 'items'} saved to your wishlist
            </p>
          </div>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-64 bg-slate-100 rounded-2xl"></div>
          ))}
        </div>
      ) : displayedProducts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center my-6">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Your wishlist is empty</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Click the heart icon on any listing to keep track of items you like and want to buy later.
          </p>
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Explore Marketplace</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {displayedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={(p) => navigate(`/products/${p.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
