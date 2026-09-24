import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import {
  setSelectedCategory,
  setPriceRange,
  setCustomPriceRange,
  setSelectedCondition,
  setSelectedCity,
  setSortBy,
  clearFilter,
  resetFilters,
  SortOption,
} from '../../store/slices/userSlice';
import { CATEGORIES, CITIES } from '../../utils/constants';
import { X, SlidersHorizontal, RotateCcw, Check } from 'lucide-react';

const CONDITIONS = ['all', 'Brand New', 'Like New', 'Good', 'Fair'];

export const Filter: React.FC = () => {
  const dispatch = useDispatch();
  const {
    searchQuery,
    selectedCategory,
    priceRange,
    customMinPrice,
    customMaxPrice,
    selectedCondition,
    selectedCity,
    sortBy,
  } = useSelector((state: RootState) => state.user);

  const [minInput, setMinInput] = useState<string>(customMinPrice !== null ? String(customMinPrice) : '');
  const [maxInput, setMaxInput] = useState<string>(customMaxPrice !== null ? String(customMaxPrice) : '');

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedCategory !== 'all' ||
    priceRange !== 'all' ||
    selectedCondition !== 'all' ||
    (selectedCity !== 'all' && selectedCity !== 'Chennai') ||
    sortBy !== 'featured';

  const handleApplyCustomPrice = (e: React.FormEvent) => {
    e.preventDefault();
    const min = minInput.trim() ? parseFloat(minInput) : null;
    const max = maxInput.trim() ? parseFloat(maxInput) : null;
    dispatch(setCustomPriceRange({ min, max }));
  };

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
            onClick={() => {
              dispatch(resetFilters());
              setMinInput('');
              setMaxInput('');
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* Primary Filter Controls Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Category Selector */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => dispatch(setSelectedCategory(e.target.value))}
            className="w-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 focus:bg-white transition-colors cursor-pointer"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Location / City Selector */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
            Location
          </label>
          <select
            value={selectedCity}
            onChange={(e) => dispatch(setSelectedCity(e.target.value))}
            className="w-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 focus:bg-white transition-colors cursor-pointer"
          >
            <option value="all">All Cities</option>
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* Condition Selector */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
            Item Condition
          </label>
          <select
            value={selectedCondition}
            onChange={(e) => dispatch(setSelectedCondition(e.target.value))}
            className="w-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 focus:bg-white transition-colors cursor-pointer"
          >
            {CONDITIONS.map((cond) => (
              <option key={cond} value={cond}>
                {cond === 'all' ? 'All Conditions' : cond}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => dispatch(setSortBy(e.target.value as SortOption))}
            className="w-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 focus:bg-white transition-colors cursor-pointer"
          >
            <option value="featured">Featured First</option>
            <option value="newest">Newly Listed</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="views-desc">Most Viewed</option>
          </select>
        </div>
      </div>

      {/* Secondary Price Filter Options & Custom Min/Max Input */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        {/* Quick Price Range Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-500 mr-1">Price:</span>
          {[
            { id: 'all', label: 'Any Price' },
            { id: 'under15k', label: '< ₹15,000' },
            { id: '15k-50k', label: '₹15k - ₹50k' },
            { id: 'above50k', label: '₹50,000+' },
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                dispatch(setPriceRange(p.id));
                setMinInput('');
                setMaxInput('');
              }}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                priceRange === p.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Custom Price Range Form */}
        <form onSubmit={handleApplyCustomPrice} className="flex items-center gap-1.5">
          <input
            type="number"
            placeholder="Min ₹"
            value={minInput}
            onChange={(e) => setMinInput(e.target.value)}
            className="w-20 bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-lg px-2 py-1 outline-none focus:border-indigo-500"
          />
          <span className="text-slate-400 text-xs">-</span>
          <input
            type="number"
            placeholder="Max ₹"
            value={maxInput}
            onChange={(e) => setMaxInput(e.target.value)}
            className="w-20 bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-lg px-2 py-1 outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Check className="w-3 h-3" />
            <span>Go</span>
          </button>
        </form>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-[11px] text-slate-400 font-medium">Active Filters:</span>

          {searchQuery && (
            <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full">
              <span>Search: "{searchQuery}"</span>
              <button
                type="button"
                onClick={() => dispatch(clearFilter('search'))}
                className="hover:text-indigo-900 cursor-pointer"
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
                onClick={() => dispatch(clearFilter('category'))}
                className="hover:text-indigo-900 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedCity !== 'all' && selectedCity !== 'Chennai' && (
            <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full">
              <span>City: {selectedCity}</span>
              <button
                type="button"
                onClick={() => dispatch(clearFilter('city'))}
                className="hover:text-indigo-900 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedCondition !== 'all' && (
            <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full">
              <span>Condition: {selectedCondition}</span>
              <button
                type="button"
                onClick={() => dispatch(clearFilter('condition'))}
                className="hover:text-indigo-900 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {priceRange !== 'all' && (
            <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full">
              <span>
                Price:{' '}
                {priceRange === 'custom'
                  ? `₹${customMinPrice || 0} - ₹${customMaxPrice || 'Any'}`
                  : priceRange}
              </span>
              <button
                type="button"
                onClick={() => {
                  dispatch(clearFilter('price'));
                  setMinInput('');
                  setMaxInput('');
                }}
                className="hover:text-indigo-900 cursor-pointer"
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

