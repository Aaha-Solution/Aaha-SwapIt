import React from 'react';
import { Product } from '../../types/product.types';
import { ProductCard } from '../ProductCard/ProductCard';
import { Loader } from '../Loader/Loader';
import { PackageOpen } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  onProductClick?: (product: Product) => void;
  emptyMessage?: string;
  onResetFilters?: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading,
  onProductClick,
  emptyMessage = 'No listings match your search criteria.',
  onResetFilters,
}) => {
  if (isLoading) {
    return <Loader count={8} />;
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center my-6">
        <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto mb-4">
          <PackageOpen className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-800">No Listings Found</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          {emptyMessage}
        </p>
        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
          >
            Clear All Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onClick={onProductClick}
        />
      ))}
    </div>
  );
};
