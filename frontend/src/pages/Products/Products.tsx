import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { useProducts } from '../../hooks/useProducts';
import { ProductCard } from '../../components/ProductCard/ProductCard';
import { ProductDetails } from '../ProductDetails/ProductDetails';
import {
  setSelectedCategory,
  setPriceRange,
  setSortBy,
  resetFilters,
} from '../../store/slices/userSlice';
import { Product } from '../../types/product.types';

const CATEGORY_PILLS = [
  { id: 'all', name: 'All Items' },
  { id: 'cars', name: '🚗 Cars' },
  { id: 'bikes', name: '🏍️ Bikes' },
  { id: 'mobiles', name: '📱 Mobiles' },
  { id: 'electronics', name: '💻 Electronics' },
  { id: 'properties', name: '🏠 Properties' },
  { id: 'furniture', name: '🛋️ Furniture' },
  { id: 'fashion', name: '👔 Fashion' },
  { id: 'pets', name: '🐕 Pets' },
  { id: 'books', name: '📚 Books' },
  { id: 'services', name: '⚡ Services' },
];

export const Products: React.FC = () => {
  const dispatch = useDispatch();
  const { products, isLoading } = useProducts();
  const { selectedCategory, priceRange, sortBy } = useSelector(
    (state: RootState) => state.user
  );

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleCategorySelect = (catId: string) => {
    dispatch(setSelectedCategory(catId));
  };

  const handlePriceSelect = (range: string) => {
    dispatch(setPriceRange(range));
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setSortBy(e.target.value as 'featured' | 'price-asc' | 'price-desc' | 'newest'));
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
      <div className="view-header-bar products-header-bar">
        <div>
          <h1 className="view-title">
            Marketplace Products
            <span className="header-count-badge" id="productsTotalCount">
              {products.length} items
            </span>
          </h1>
          <p className="view-subtitle">
            Explore verified second-hand items with smart filters and instant seller chat
          </p>
        </div>
      </div>

      {/* 3. Filter & Control Toolbar Card */}
      <div className="products-toolbar-card">
        {/* Category Quick-Pills Scroll */}
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

        {/* Secondary Filter Controls Row */}
        <div className="products-controls-row">
          {/* Price Range Pills */}
          <div className="price-range-pills">
            <span className="control-label">Price Range:</span>
            <button
              type="button"
              onClick={() => handlePriceSelect('all')}
              className={`price-pill ${priceRange === 'all' ? 'active' : ''}`}
            >
              All Prices
            </button>
            <button
              type="button"
              onClick={() => handlePriceSelect('under15k')}
              className={`price-pill ${priceRange === 'under15k' ? 'active' : ''}`}
            >
              Under ₹15,000
            </button>
            <button
              type="button"
              onClick={() => handlePriceSelect('15k-50k')}
              className={`price-pill ${priceRange === '15k-50k' ? 'active' : ''}`}
            >
              ₹15k - ₹50,000
            </button>
            <button
              type="button"
              onClick={() => handlePriceSelect('above50k')}
              className={`price-pill ${priceRange === 'above50k' ? 'active' : ''}`}
            >
              ₹50,000+
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="sort-control-wrap">
            <label htmlFor="productsSortSelect" className="control-label">
              Sort by:
            </label>
            <select
              id="productsSortSelect"
              value={sortBy}
              onChange={handleSortChange}
              className="products-sort-select"
            >
              <option value="featured">Featured / Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. All Products Grid: 5 columns exactly matching prototype */}
      {isLoading ? (
        <div className="all-products-grid">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} style={{ height: '220px', background: '#f1f5f9', borderRadius: '14px' }}></div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div
          className="empty-state-box"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 24px',
            background: '#ffffff',
            borderRadius: '18px',
            border: '1px solid #f1f5f9',
            boxShadow: '0 4px 12px -2px rgba(15, 23, 42, 0.05)',
            textAlign: 'center',
            margin: '20px 0',
          }}
        >
          <div
            className="empty-icon-wrap"
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              marginBottom: '16px',
            }}
          >
            <svg
              style={{ width: '32px', height: '32px' }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
          </div>
          <h3 style={{ margin: '0 0 8px', fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>
            No products found
          </h3>
          <p style={{ margin: '0 0 20px', fontSize: '13.5px', color: '#64748b', maxWidth: '440px', lineHeight: 1.5 }}>
            We couldn't find any listings matching your current category or filters. Try adjusting your filters or search terms.
          </p>
          <button
            type="button"
            onClick={() => dispatch(resetFilters())}
            className="btn-primary-action"
            style={{
              padding: '10px 24px',
              borderRadius: '9999px',
              background: '#6366f1',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
              transition: 'all 0.2s ease',
            }}
          >
            Clear All Filters
          </button>
        </div>
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
