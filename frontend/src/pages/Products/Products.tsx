import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Sparkles, ShoppingBag } from 'lucide-react';
import { RootState } from '../../store/store';
import { useProducts } from '../../hooks/useProducts';
import { ProductCard } from '../../components/ProductCard/ProductCard';
import { ProductDetails } from '../ProductDetails/ProductDetails';
import { Filter } from '../../components/Filter/Filter';
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
  const { selectedCategory } = useSelector((state: RootState) => state.user);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleCategorySelect = (catId: string) => {
    dispatch(setSelectedCategory(catId));
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

      {/* 4. Filter Bar */}
      <Filter />

      {/* 5. Products Grid Layout (6 cols x 2 rows standard) */}
      <div className="products-view-grid" id="productsGridContainer">
        {isLoading ? (
          Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="product-card skeleton-card"
              style={{ height: '260px', background: '#f8fafc', borderRadius: '14px', border: '1px solid #f1f5f9' }}
            >
              <div style={{ height: '140px', background: '#e2e8f0', borderRadius: '12px 12px 0 0' }}></div>
              <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ height: '14px', background: '#cbd5e1', borderRadius: '4px', width: '70%' }}></div>
                <div style={{ height: '18px', background: '#94a3b8', borderRadius: '4px', width: '40%' }}></div>
                <div style={{ height: '10px', background: '#e2e8f0', borderRadius: '4px', width: '90%' }}></div>
              </div>
            </div>
          ))
        ) : products.length > 0 ? (
          products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={(p) => setSelectedProduct(p)}
            />
          ))
        ) : (
          <div
            className="empty-state-card"
            style={{
              gridColumn: '1 / -1',
              padding: '60px 20px',
              textAlign: 'center',
              background: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: '#eef2ff',
                color: '#4f46e5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <ShoppingBag size={28} />
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
              No listings match your criteria
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '380px', margin: '0 auto 20px' }}>
              Try adjusting your category filters, clearing price constraints, or searching with broader keywords.
            </p>
            <button
              type="button"
              onClick={() => dispatch(resetFilters())}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <Sparkles size={16} />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* 6. Product Details Modal */}
      {selectedProduct && (
        <ProductDetails
          productId={selectedProduct.id}
          isModal={true}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};
