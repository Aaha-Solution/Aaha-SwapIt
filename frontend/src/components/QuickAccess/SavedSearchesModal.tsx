import React from 'react';
import { createPortal } from 'react-dom';
import { X, Heart, Bell, BellOff, Trash2, Search, ArrowRight, Sparkles } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import {
  removeSavedSearch,
  toggleSavedSearchNotification,
} from '../../store/slices/alertSlice';
import { formatINR } from '../../utils/helpers';

interface SavedSearchesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunSearch: (query?: string, category?: string) => void;
}

export const SavedSearchesModal: React.FC<SavedSearchesModalProps> = ({
  isOpen,
  onClose,
  onRunSearch,
}) => {
  const dispatch = useDispatch();
  const { savedSearches } = useSelector((state: RootState) => state.alerts);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="modal-backdrop show active"
      onClick={onClose}
      style={{
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
        style={{ border: '1px solid #e2e8f0' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center font-bold">
              <Heart className="w-5 h-5 fill-rose-500/20" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">Saved Searches</h3>
                <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {savedSearches.length} {savedSearches.length === 1 ? 'alert' : 'alerts'}
                </span>
              </div>
              <p className="text-xs text-slate-500">Track deal updates and custom query alerts</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {savedSearches.length === 0 ? (
            <div className="py-14 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-3">
                <Heart className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">No saved searches yet</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                When you search items in the marketplace, click "Save Search" to receive notifications on price drops and new listings.
              </p>
            </div>
          ) : (
            savedSearches.map((search) => (
              <div
                key={search.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/90 bg-white hover:border-blue-400 hover:shadow-sm transition-all"
              >
                <div
                  className="flex-1 min-w-0 cursor-pointer pr-3"
                  onClick={() => {
                    onClose();
                    onRunSearch(search.query, search.category);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800 hover:text-blue-600 transition-colors truncate">
                      {search.query || 'All Items'}
                    </span>
                    {search.category && search.category !== 'all' && (
                      <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md uppercase">
                        {search.category}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    {search.city && <span>📍 {search.city}</span>}
                    {search.maxPrice && (
                      <span>Under {formatINR(search.maxPrice)}</span>
                    )}
                    {search.lastCheckedCount && (
                      <span className="text-blue-600 font-semibold">
                        • {search.lastCheckedCount} matches
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Notification toggle */}
                  <button
                    type="button"
                    onClick={() => dispatch(toggleSavedSearchNotification(search.id))}
                    className={`p-2 rounded-lg transition-colors ${
                      search.notificationsEnabled
                        ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                        : 'text-slate-400 bg-slate-100 hover:bg-slate-200'
                    }`}
                    title={
                      search.notificationsEnabled
                        ? 'Alert notifications active'
                        : 'Alert notifications muted'
                    }
                  >
                    {search.notificationsEnabled ? (
                      <Bell className="w-4 h-4" />
                    ) : (
                      <BellOff className="w-4 h-4" />
                    )}
                  </button>

                  {/* Run search */}
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onRunSearch(search.query, search.category);
                    }}
                    className="p-2 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Run search now"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {/* Delete search */}
                  <button
                    type="button"
                    onClick={() => dispatch(removeSavedSearch(search.id))}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete saved search"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50 text-xs">
          <span className="text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            Instant alerts notify you when matching items are posted
          </span>
          <button
            type="button"
            onClick={() => {
              onClose();
              onRunSearch();
            }}
            className="text-blue-600 font-bold hover:underline flex items-center gap-1"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search Marketplace</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
