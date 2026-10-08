import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, CheckCircle2 } from 'lucide-react';
import { RootState } from '../../store/store';
import { CATEGORIES } from '../../utils/constants';
import { useProducts } from '../../hooks/useProducts';
import { CategoryCard } from '../../components/CategoryCard/CategoryCard';
import { ProductCard } from '../../components/ProductCard/ProductCard';
import { ProductDetails } from '../ProductDetails/ProductDetails';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { setSelectedCategory } from '../../store/slices/userSlice';
import { Product } from '../../types/product.types';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { products, isLoading } = useProducts();
  const { selectedCity } = useSelector((state: RootState) => state.user);

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
        </div>
      </section>

      {/* 2. Latest Listings Section */}
      <section className="listings-section" style={{ marginBottom: '24px' }}>
        <div className="section-title-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
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
          {/* Listings Grid or Empty State */}
          {isLoading ? (
            <div className="listings-grid">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} style={{ height: '190px', background: '#f1f5f9', borderRadius: '14px' }}></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <EmptyState city={selectedCity} />
          ) : (
            <div className="listings-grid">
              {products.slice(0, 12).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={(p) => setSelectedProduct(p)}
                />
              ))}
            </div>
          )}
        </div>
      </section>



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
