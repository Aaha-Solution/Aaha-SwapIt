import React, { useState } from 'react';
import { Bell, X, Check, Sparkles, SlidersHorizontal, MapPin, Tag, ShieldCheck } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addSavedSearch } from '../../store/slices/alertSlice';
import { formatINR } from '../../utils/helpers';

interface SaveSearchModalProps {
  currentFilters: {
    query?: string;
    category?: string;
    city?: string;
    minPrice?: number | null;
    maxPrice?: number | null;
    condition?: string;
  };
  onClose: () => void;
  onSaved: () => void;
}

export const SaveSearchModal: React.FC<SaveSearchModalProps> = ({
  currentFilters,
  onClose,
  onSaved,
}) => {
  const dispatch = useDispatch();
  const [searchTitle, setSearchTitle] = useState(
    currentFilters.query
      ? `Alert for "${currentFilters.query}"`
      : `${currentFilters.category && currentFilters.category !== 'all' ? currentFilters.category : 'All Items'} in ${currentFilters.city || 'All Cities'}`
  );
  const [maxPrice, setMaxPrice] = useState<string>(
    currentFilters.maxPrice ? String(currentFilters.maxPrice) : ''
  );
  const [instantAlerts, setInstantAlerts] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(
      addSavedSearch({
        query: currentFilters.query || undefined,
        category: currentFilters.category || 'all',
        city: currentFilters.city || 'all',
        minPrice: currentFilters.minPrice || null,
        maxPrice: maxPrice ? parseFloat(maxPrice) : currentFilters.maxPrice || null,
        condition: currentFilters.condition || 'all',
      })
    );
    onSaved();
    onClose();
  };

  return (
    <div className="modal-backdrop show active" onClick={onClose} style={{ zIndex: 1200 }}>
      <div
        className="modal-container"
        style={{ maxWidth: '440px', width: '90%', padding: '24px', borderRadius: '20px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Save Search & Get Alerts</h3>
              <p className="text-[11px] text-slate-500">
                Receive instant notifications when matching items are listed
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Summary Tags */}
        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl mb-4 text-xs space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
            Filter Parameters
          </span>
          <div className="flex flex-wrap gap-1.5">
            {currentFilters.query && (
              <span className="bg-indigo-100/80 text-indigo-700 font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Keyword: "{currentFilters.query}"
              </span>
            )}
            {currentFilters.city && currentFilters.city !== 'all' && (
              <span className="bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 border border-blue-200">
                <MapPin className="w-3 h-3" /> City: {currentFilters.city}
              </span>
            )}
            {currentFilters.category && currentFilters.category !== 'all' && (
              <span className="bg-purple-50 text-purple-700 font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 border border-purple-200">
                <Tag className="w-3 h-3" /> Category: {currentFilters.category}
              </span>
            )}
            {currentFilters.condition && currentFilters.condition !== 'all' && (
              <span className="bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-lg border border-emerald-200">
                Condition: {currentFilters.condition}
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Search Alert Label
            </label>
            <input
              type="text"
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              placeholder="e.g. iPhone in Mumbai under 40k"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Max Budget Ceiling (Optional)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-400 font-bold text-xs">₹</span>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="e.g. 35000"
                className="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/60 border border-indigo-100">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-600" />
              <div>
                <span className="font-bold text-slate-800 block text-[11.5px]">Instant In-App Alerts</span>
                <span className="text-[10px] text-slate-500">Notify right when an item matching this search drops</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={instantAlerts}
              onChange={(e) => setInstantAlerts(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save & Activate Alert</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
