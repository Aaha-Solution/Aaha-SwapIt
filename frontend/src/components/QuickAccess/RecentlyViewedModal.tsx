import React from 'react';
import { createPortal } from 'react-dom';
import { X, Trash2, Eye, MapPin, ExternalLink, Sparkles } from 'lucide-react';
import { Product } from '../../types/product.types';
import { formatINR } from '../../utils/helpers';

interface RecentlyViewedModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: Product[];
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
  onSelectProduct: (product: Product) => void;
  onViewAllInMarketplace: () => void;
}

export const RecentlyViewedModal: React.FC<RecentlyViewedModalProps> = ({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onClearAll,
  onSelectProduct,
  onViewAllInMarketplace,
}) => {
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
        style={{ border: '1px solid #e2e8f0' }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">Recently Viewed</h3>
                <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </span>
              </div>
              <p className="text-xs text-slate-500">Products and listings you recently explored</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 transition-colors flex items-center gap-1.5"
                title="Clear browsing history"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body - Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {items.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mb-3">
                <Eye className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">No recently viewed items</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                Browse products on SwapIt and the ones you explore will appear here for fast access.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onViewAllInMarketplace();
                }}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20"
              >
                Explore Marketplace
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="group relative flex gap-3 p-3 rounded-xl border border-slate-200/80 bg-white hover:border-blue-400 hover:shadow-md hover:shadow-blue-500/5 transition-all cursor-pointer"
                  onClick={() => onSelectProduct(item)}
                >
                  {/* Thumbnail */}
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                    <img
                      src={item.imageUrl || (item.images && item.images[0])}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    {item.badge && (
                      <span className="absolute top-1 left-1 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                        {item.badge.toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h5>
                      <p className="text-sm font-extrabold text-blue-700 mt-0.5">
                        {formatINR(item.price)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                      <span className="flex items-center gap-1 truncate max-w-[120px]">
                        <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{item.location || item.city}</span>
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveItem(item.id);
                        }}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded hover:bg-slate-50 transition-colors"
                        title="Remove from history"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {items.length > 0 && (
          <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50 text-xs">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              Showing your latest {items.length} viewed listings
            </span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onViewAllInMarketplace();
              }}
              className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 hover:underline"
            >
              <span>View in Marketplace</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
