import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Mail, CheckCircle2 } from 'lucide-react';
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

        <div className="categories-wrapper">
          {/* 12 Category Grid (6 cols x 2 rows) */}
          <div className="categories-grid">
            {CATEGORIES.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onClick={handleCategorySelect}
              />
            ))}
          </div>

          {/* Spanning Eco Promo Banner Card (Right 220px) */}
          <div className="eco-promo-card">
            <div>
              <h3 className="eco-title">
                Small<br />Choices<br />Big Impact
              </h3>
              <p className="eco-subtitle">
                Buy Pre-owned<br />Save the Planet
              </p>
              <button
                type="button"
                onClick={() => navigate('/products')}
                className="eco-btn"
              >
                <span>Learn More</span>
                <span>&rarr;</span>
              </button>
            </div>

            <div className="eco-img-wrap" style={{ borderRadius: '12px', overflow: 'hidden', height: '102px', marginTop: '10px' }}>
              <img
                src="/images/eco_plant.jpg"
                alt="Buy Pre-owned Save Planet"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Latest Listings Section */}
      <section className="listings-section" style={{ marginBottom: '24px' }}>
        <div className="section-title-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h2 className="section-title" style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px' }}>
            Latest Listings
          </h2>
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

        <div className="listings-wrapper">
          {/* 12 Listing Cards (6 cols x 2 rows) */}
          <div className="listings-grid">
            {isLoading
              ? Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} style={{ height: '190px', background: '#f1f5f9', borderRadius: '14px' }}></div>
                ))
              : products.slice(0, 12).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={(p) => setSelectedProduct(p)}
                  />
                ))}
          </div>

          {/* Newsletter Subscribe Card (Right 220px) */}
          <div className="newsletter-card">
            <div className="newsletter-icon-wrap">
              <Mail style={{ width: '20px', height: '20px' }} />
            </div>
            <h3 className="newsletter-title">
              Get the best deals in your city
            </h3>
            <p className="newsletter-sub">
              Subscribe for updates
            </p>

            {newsletterSubscribed ? (
              <div style={{ padding: '8px', background: '#dcfce7', color: '#15803d', borderRadius: '10px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 style={{ width: '14px', height: '14px' }} />
                <span>Subscribed!</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email"
                />
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    height: '36px',
                    borderRadius: '9999px',
                    background: '#6d28d9',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(109, 40, 217, 0.25)',
                    transition: 'all 0.2s',
                  }}
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
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
