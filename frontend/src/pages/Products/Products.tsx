import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Bell, Check, Sparkles } from 'lucide-react';
import { RootState } from '../../store/store';
import { useProducts } from '../../hooks/useProducts';
import { ProductCard } from '../../components/ProductCard/ProductCard';
import { ProductDetails } from '../ProductDetails/ProductDetails';
import { Filter } from '../../components/Filter/Filter';
import { SaveSearchModal } from '../../components/SaveSearchModal/SaveSearchModal';
import { EmptyState } from '../../components/EmptyState/EmptyState';
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

  // Check if current search is already saved
  const isCurrentSearchSaved = savedSearches.some(
    (s) =>
      (s.query || '').toLowerCase() === (searchQuery || '').toLowerCase() &&
      s.category === selectedCategory &&
      s.city === selectedCity
  );

  const handleCategorySelect = (catId: string) => {
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
        <span className="breadcrumb-current">All Products</span>
      </nav>

      {/* 2. View Header Bar */}
      <div className="view-header-bar products-header-bar flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="view-title flex items-center gap-2.5">
            <span>Marketplace Products</span>
            <span className="header-count-badge" id="productsTotalCount">
              {products.length} {products.length === 1 ? 'item' : 'items'}
            </span>
          </h1>
          <p className="view-subtitle">
            Explore verified second-hand items with smart filters, price ranges, and instant seller chat
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
      ) : products.length === 0 ? (
        <EmptyState
          city={selectedCity}
          category={selectedCategory}
          searchQuery={searchQuery}
        />
      ) : (
        <div className="all-products-grid">
          {products.map((product) => (
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
