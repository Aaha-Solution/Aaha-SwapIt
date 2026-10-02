import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Mail, CheckCircle2, MapPin } from 'lucide-react';
import { CATEGORIES } from '../../utils/constants';
import { useProducts } from '../../hooks/useProducts';
import { CategoryCard } from '../../components/CategoryCard/CategoryCard';
import { ProductCard } from '../../components/ProductCard/ProductCard';
import { ProductDetails } from '../ProductDetails/ProductDetails';
import { setSelectedCategory } from '../../store/slices/userSlice';
import { Product } from '../../types/product.types';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { products, isLoading } = useProducts();

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleCategorySelect = (slug: string) => {
    dispatch(setSelectedCategory(slug));
    navigate('/products');
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.includes('@')) {
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setNewsletterSubscribed(false), 4000);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* 1. Explore Categories Section */}
      <section className="categories-section" style={{ marginBottom: '32px' }}>
        <div className="section-title-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h2 className="section-title" style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px' }}>
            Explore Categories
          </h2>
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="section-link"
            style={{ fontSize: '12.5px', fontWeight: 600, color: '#4f46e5', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <span>See All Categories</span>
            <span>&rarr;</span>
          </button>
        </div>

        {/* Clean 12 Category Grid (Full-Width Responsive 6 cols) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {CATEGORIES.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onClick={handleCategorySelect}
            />
          ))}
        </div>
      </section>

      {/* 2. Latest Listings Section */}
      <section className="listings-section" style={{ marginBottom: '24px' }}>
        <div className="section-title-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 className="section-title" style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px' }}>
              Latest Listings
            </h2>
            <button
              type="button"
              onClick={() => navigate('/deals-near-me')}
              style={{
                fontSize: '11.5px',
                fontWeight: 700,
                color: '#db2777',
                background: '#fdf2f8',
                border: '1px solid #fbcfe8',
                padding: '4px 10px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: '0 1px 3px rgba(219, 39, 119, 0.08)',
                transition: 'all 0.15s ease',
              }}
            >
              <MapPin size={13} style={{ color: '#db2777', strokeWidth: 2.5 }} />
              <span>Deals Near Me (Map)</span>
            </button>
          </div>
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="section-link"
            style={{ fontSize: '12.5px', fontWeight: 600, color: '#4f46e5', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <span>View All</span>
            <span>&rarr;</span>
          </button>
        </div>

        {/* Full-width Responsive 6-col Listings Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
          {isLoading
            ? Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-48 bg-slate-100 rounded-2xl animate-pulse" />
              ))
            : products.slice(0, 12).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={(p) => setSelectedProduct(p)}
                />
              ))}
        </div>
      </section>

      {/* 3. Strip Banner: Home Explore More Bar */}
      <div className="home-explore-more-bar">
        <div className="explore-info">
          <h4>Looking for more variety & great deals?</h4>
          <p>Explore all 12+ verified pre-owned items across categories with instant filters</p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/products')}
          className="btn-explore-products"
          style={{ border: 'none', cursor: 'pointer' }}
        >
          <span>Explore All Products (12+)</span>
          <span>&rarr;</span>
        </button>
      </div>

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
