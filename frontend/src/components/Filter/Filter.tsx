import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import {
  setSelectedCategory,
  setPriceRange,
  setSortBy,
  setSearchQuery,
  resetFilters,
} from '../../store/slices/userSlice';
import { CATEGORIES } from '../../utils/constants';
import { X, SlidersHorizontal, RotateCcw } from 'lucide-react';

export const Filter: React.FC = () => {
  const dispatch = useDispatch();
  const { searchQuery, selectedCategory, priceRange, sortBy } = useSelector(
    (state: RootState) => state.user
  );

  const hasActiveFilters =
    searchQuery !== '' || selectedCategory !== 'all' || priceRange !== 'all' || sortBy !== 'featured';

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-4 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Filters & Sorting
          </span>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => dispatch(resetFilters())}
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* Filter Controls Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Category Selector */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => dispatch(setSelectedCategory(e.target.value))}
            className="w-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 focus:bg-white transition-colors"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
            Price Range
          </label>
          <select
            value={priceRange}
            onChange={(e) => dispatch(setPriceRange(e.target.value))}
            className="w-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 focus:bg-white transition-colors"
          >
            <option value="all">Any Price</option>
            <option value="under-10k">Under ₹10,000</option>
            <option value="10k-50k">₹10,000 - ₹50,000</option>
            <option value="above-50k">Above ₹50,000</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => dispatch(setSortBy(e.target.value as 'featured' | 'price-asc' | 'price-desc' | 'newest'))}
            className="w-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 focus:bg-white transition-colors"
          >
            <option value="featured">Featured First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="newest">Newly Listed</option>
          </select>
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-[11px] text-slate-400 font-medium">Active:</span>

          {searchQuery && (
            <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full">
              <span>Query: "{searchQuery}"</span>
              <button
                type="button"
                onClick={() => dispatch(setSearchQuery(''))}
                className="hover:text-indigo-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedCategory !== 'all' && (
            <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full">
              <span>Category: {CATEGORIES.find((c) => c.slug === selectedCategory)?.name || selectedCategory}</span>
              <button
                type="button"
                onClick={() => dispatch(setSelectedCategory('all'))}
                className="hover:text-indigo-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {priceRange !== 'all' && (
            <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full">
              <span>Price: {priceRange}</span>
              <button
                type="button"
                onClick={() => dispatch(setPriceRange('all'))}
                className="hover:text-indigo-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
