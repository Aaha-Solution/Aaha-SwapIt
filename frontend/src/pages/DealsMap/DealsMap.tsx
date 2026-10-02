import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Sparkles, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import { DealsNearMeMap } from '../../components/DealsNearMeMap/DealsNearMeMap';
import { ProductDetails } from '../ProductDetails/ProductDetails';
import { Product } from '../../types/product.types';

export const DealsMap: React.FC = () => {
  const navigate = useNavigate();
  const { products, isLoading } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <div style={{ width: '100%' }}>
      {/* 1. Breadcrumbs */}
      <nav className="view-breadcrumbs">
        <Link to="/" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">Deals Near Me (Live Map)</span>
      </nav>

      {/* 2. Page Header Bar */}
      <div className="view-header-bar products-header-bar flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div>
          <h1 className="view-title flex items-center gap-2.5">
            <MapPin className="w-6 h-6 text-pink-600" />
            <span>Deals Near Me (Radius Map)</span>
          </h1>
          <p className="view-subtitle">
            Locate verified second-hand items around your current location or selected landmark
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/products')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 text-xs font-bold transition-all shadow-2xs cursor-pointer self-start md:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Marketplace</span>
        </button>
      </div>

      {/* 3. Dedicated Interactive Map Component */}
      <div className="mb-8">
        <DealsNearMeMap
          products={products}
          onSelectProduct={(p) => setSelectedProduct(p)}
        />
      </div>

      {/* 4. Product Details Modal */}
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
