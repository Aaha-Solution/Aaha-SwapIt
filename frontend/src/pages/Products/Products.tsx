import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Bell, Check, Sparkles, Eye, MapPin, X } from 'lucide-react';
import { RootState } from '../../store/store';
import { useProducts } from '../../hooks/useProducts';
import { ProductCard } from '../../components/ProductCard/ProductCard';
import { ProductDetails } from '../ProductDetails/ProductDetails';
import { Filter } from '../../components/Filter/Filter';
import { SaveSearchModal } from '../../components/SaveSearchModal/SaveSearchModal';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { getRecentlyViewed } from '../../utils/recentlyViewed';
import {
  setSelectedCategory,
  resetFilters,
} from '../../store/slices/userSlice';
import { Product } from '../../types/product.types';

const CATEGORY_PILLS = [
  { id: 'all', name: 'All Items' },
  { id: 'cars', name: 'Cars' },
  { id: 'bikes', name: 'Bikes' },
  { id: 'mobiles', name: 'Mobiles' },
  { id: 'electronics', name: 'Electronics' },
  { id: 'properties', name: 'Properties' },
  { id: 'furniture', name: 'Furniture' },
  { id: 'fashion', name: 'Fashion' },
  { id: 'pets', name: 'Pets' },
  { id: 'books', name: 'Books & Hobbies' },
  { id: 'services', name: 'Services' },
];

export const Products: React.FC = () => {
  const dispatch = useDispatch();
  const { products, isLoading } = useProducts();
  const {
    selectedCategory,
    searchQuery,
    selectedCity,
    priceRange,
    customMinPrice,
    customMaxPrice,
    selectedCondition,
  } = useSelector((state: RootState) => state.user);
  const { savedSearches } = useSelector((state: RootState) => state.alerts);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSaveSearchModalOpen, setIsSaveSearchModalOpen] = useState(false);
  const [saveSuccessToast, setSaveSuccessToast] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const filterParam = searchParams.get('filter');
  const isRecentlyViewedFilter = filterParam === 'recently-viewed';
  const isNearbyFilter = filterParam === 'nearby';

  // Check if current search is already saved
  const isCurrentSearchSaved = savedSearches.some(
    (s) =>
      (s.query || '').toLowerCase() === (searchQuery || '').toLowerCase() &&
      s.category === selectedCategory &&
      s.city === selectedCity
  );

  const displayedProducts = useMemo(() => {
    if (isRecentlyViewedFilter) {
      return getRecentlyViewed();
    }
    return products;
  }, [isRecentlyViewedFilter, products]);

  const handleCategorySelect = (catId: string) => {
    if (filterParam) {
      searchParams.delete('filter');
      setSearchParams(searchParams);
    }
    dispatch(setSelectedCategory(catId));
  };

  const handleSavedSearchSuccess = () => {
    setSaveSuccessToast(true);
    setTimeout(() => setSaveSuccessToast(false), 4000);
  };

  return (
    <div style={{ width: '100%' }}>
      {/* 1. Breadcrumbs */}
      <nav className="view-breadcrumbs">
        <Link to="/" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">
          {isRecentlyViewedFilter ? 'Recently Viewed' : isNearbyFilter ? 'Nearby Deals' : 'All Products'}
        </span>
      </nav>

      {/* Special Quick Access Filter Banners */}
      {isRecentlyViewedFilter && (
        <div className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-blue-900">
                Recently Viewed Listings ({displayedProducts.length})
              </h4>
              <p className="text-[11px] text-blue-700">
                All pre-owned products and deals you recently explored on SwapIt
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              searchParams.delete('filter');
              setSearchParams(searchParams);
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white text-blue-700 border border-blue-200 text-xs font-bold hover:bg-blue-50 transition-colors shadow-xs"
          >
            <span>View All Products</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {isNearbyFilter && (
        <div className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between gap-3 shadow-md shadow-blue-500/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 fill-white" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <span>Nearby Deals in {selectedCity || 'Puducherry'}</span>
                <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">20+ Hot Listings</span>
              </h4>
              <p className="text-[11px] text-blue-100">
                Verified sellers, discounted second-hand listings ready for instant local pickup
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              searchParams.delete('filter');
              setSearchParams(searchParams);
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white text-blue-700 text-xs font-bold hover:bg-blue-50 transition-colors shadow-xs whitespace-nowrap"
          >
            <span>Reset Filter</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. View Header Bar */}
      <div className="view-header-bar products-header-bar flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="view-title flex items-center gap-2.5">
            <span>
              {isRecentlyViewedFilter
                ? 'Recently Viewed Items'
                : isNearbyFilter
                ? `Deals Near ${selectedCity || 'You'}`
                : 'Marketplace Products'}
            </span>
            <span className="header-count-badge" id="productsTotalCount">
              {displayedProducts.length} {displayedProducts.length === 1 ? 'item' : 'items'}
            </span>
          </h1>
          <p className="view-subtitle">
            {isRecentlyViewedFilter
              ? 'Pick up where you left off. Fast access to items you were checking out.'
              : isNearbyFilter
              ? 'Find verified bargains and instant seller meetups right in your neighborhood.'
              : 'Explore verified second-hand items with smart filters, price ranges, and instant seller chat'}
          </p>
        </div>

        {/* Save Search & Deal Alert Button */}
        <div className="flex items-center gap-2">
          {saveSuccessToast && (
            <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5 animate-fadeIn">
              <Check className="w-3.5 h-3.5" />
              <span>Search Alert Saved!</span>
            </span>
          )}

          <button
            type="button"
            onClick={() => setIsSaveSearchModalOpen(true)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
              isCurrentSearchSaved
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 hover:border-indigo-300'
            }`}
            title="Save this search and receive alerts when new items match"
          >
            {isCurrentSearchSaved ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Search Alert Active</span>
              </>
            ) : (
              <>
                <Bell className="w-3.5 h-3.5 text-indigo-600" />
                <span>Save Search & Get Alerts</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3. Category Quick-Pills Scroll Bar */}
      <div style={{ marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
        <div className="category-pills-bar" id="productsCategoryPills">
          {CATEGORY_PILLS.map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => handleCategorySelect(pill.id)}
              className={`cat-pill ${selectedCategory === pill.id ? 'active' : ''}`}
            >
              {pill.name}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Advanced Filter Toolbar Card */}
      <Filter />

      {/* 5. All Products Grid: 5 columns matching prototype */}
      {isLoading ? (
        <div className="all-products-grid">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} style={{ height: '220px', background: '#f1f5f9', borderRadius: '14px' }}></div>
          ))}
        </div>
      ) : displayedProducts.length === 0 ? (
        <EmptyState
          city={selectedCity}
          category={selectedCategory}
          searchQuery={searchQuery}
        />
      ) : (
        <div className="all-products-grid">
          {displayedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={(p) => setSelectedProduct(p)}
            />
          ))}
        </div>
      )}

      {/* Save Search Alert Modal */}
      {isSaveSearchModalOpen && (
        <SaveSearchModal
          currentFilters={{
            query: searchQuery || undefined,
            category: selectedCategory,
            city: selectedCity,
            minPrice: customMinPrice,
            maxPrice: customMaxPrice,
            condition: selectedCondition,
          }}
          onClose={() => setIsSaveSearchModalOpen(false)}
          onSaved={handleSavedSearchSuccess}
        />
      )}

      {/* Quick Details Modal */}
      {selectedProduct && (
        <div className="modal-backdrop show active" onClick={() => setSelectedProduct(null)}>
          <div onClick={(e) => e.stopPropagation()}>
            <ProductDetails
              productId={selectedProduct.id}
              isModal={true}
              onClose={() => setSelectedProduct(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
