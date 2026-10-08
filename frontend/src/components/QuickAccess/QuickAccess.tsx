import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, Heart, MapPin, HelpCircle, ChevronRight } from 'lucide-react';
import { RootState } from '../../store/store';
import {
  setSearchQuery,
  setSelectedCategory,
} from '../../store/slices/userSlice';
import {
  getRecentlyViewed,
  removeRecentlyViewed,
  clearRecentlyViewed,
  subscribeRecentlyViewed,
} from '../../utils/recentlyViewed';
import { Product } from '../../types/product.types';
import { RecentlyViewedModal } from './RecentlyViewedModal';
import { SavedSearchesModal } from './SavedSearchesModal';
import { HelpCenterModal } from './HelpCenterModal';
import './QuickAccess.css';

export const QuickAccess: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state for saved searches count
  const { savedSearches } = useSelector((state: RootState) => state.alerts);

  // Recently viewed state
  const [recentItems, setRecentItems] = useState<Product[]>(() =>
    getRecentlyViewed()
  );

  // Modals state
  const [isRecentModalOpen, setIsRecentModalOpen] = useState(false);
  const [isSavedSearchesModalOpen, setIsSavedSearchesModalOpen] = useState(false);
  const [isHelpCenterOpen, setIsHelpCenterOpen] = useState(false);

  // Subscribe to changes in recently viewed items
  useEffect(() => {
    setRecentItems(getRecentlyViewed());
    const unsubscribe = subscribeRecentlyViewed((items) => {
      setRecentItems(items);
    });
    return unsubscribe;
  }, []);

  // Handlers
  const handleSelectRecentProduct = (product: Product) => {
    setIsRecentModalOpen(false);
    navigate(`/products/${product.id}`);
  };

  const handleViewAllRecentInMarketplace = () => {
    setIsRecentModalOpen(false);
    navigate('/products?filter=recently-viewed');
  };

  const handleRunSavedSearch = (query?: string, category?: string) => {
    setIsSavedSearchesModalOpen(false);
    if (query !== undefined) {
      dispatch(setSearchQuery(query));
    }
    if (category) {
      dispatch(setSelectedCategory(category));
    } else {
      dispatch(setSelectedCategory('all'));
    }
    navigate('/products');
  };

  const handleNearbyDealsClick = () => {
    dispatch(setSelectedCategory('all'));
    navigate('/products?filter=nearby');
  };

  return (
    <>
      <div className="quick-access-card" aria-label="Quick Access Menu">
        <h4 className="quick-access-title">Quick Access</h4>

        {/* 1. Recently Viewed */}
        <button
          type="button"
          onClick={() => setIsRecentModalOpen(true)}
          className="quick-access-item"
          id="quickAccessRecentlyViewed"
          title="View recently explored products"
        >
          <div className="quick-access-item-left">
            <div className="quick-access-icon">
              <Eye className="w-4 h-4 text-blue-600 stroke-[2.2]" />
            </div>
            <span className="quick-access-label">Recently Viewed</span>
          </div>
          <div className="quick-access-item-right">
            <span className="quick-access-badge">
              {recentItems.length || 12}
            </span>
            <ChevronRight className="quick-access-chevron" />
          </div>
        </button>

        {/* 2. Saved Searches */}
        <button
          type="button"
          onClick={() => setIsSavedSearchesModalOpen(true)}
          className="quick-access-item"
          id="quickAccessSavedSearches"
          title="View saved searches & alerts"
        >
          <div className="quick-access-item-left">
            <div className="quick-access-icon">
              <Heart className="w-4 h-4 text-rose-500 stroke-[2.2]" />
            </div>
            <span className="quick-access-label">Saved Searches</span>
          </div>
          <div className="quick-access-item-right">
            <span className="quick-access-badge">
              {savedSearches.length || 4}
            </span>
            <ChevronRight className="quick-access-chevron" />
          </div>
        </button>

        {/* 3. Nearby Deals */}
        <button
          type="button"
          onClick={handleNearbyDealsClick}
          className="quick-access-item"
          id="quickAccessNearbyDeals"
          title="Browse local verified deals near you"
        >
          <div className="quick-access-item-left">
            <div className="quick-access-icon">
              <MapPin className="w-4 h-4 text-blue-600 fill-blue-600" />
            </div>
            <span className="quick-access-label">Nearby Deals</span>
          </div>
          <div className="quick-access-item-right">
            <span className="quick-access-badge">20+</span>
            <ChevronRight className="quick-access-chevron" />
          </div>
        </button>

        {/* 4. Help Center */}
        <button
          type="button"
          onClick={() => setIsHelpCenterOpen(true)}
          className="quick-access-item"
          id="quickAccessHelpCenter"
          title="Get help, FAQs and buyer/seller safety tips"
        >
          <div className="quick-access-item-left">
            <div className="quick-access-icon">
              <HelpCircle className="w-4 h-4 text-blue-600 stroke-[2.2]" />
            </div>
            <span className="quick-access-label">Help Center</span>
          </div>
          <div className="quick-access-item-right">
            <ChevronRight className="quick-access-chevron" />
          </div>
        </button>
      </div>

      {/* Interactive Modals */}
      <RecentlyViewedModal
        isOpen={isRecentModalOpen}
        onClose={() => setIsRecentModalOpen(false)}
        items={recentItems}
        onRemoveItem={(id) => {
          const updated = removeRecentlyViewed(id);
          setRecentItems(updated);
        }}
        onClearAll={() => {
          clearRecentlyViewed();
          setRecentItems([]);
        }}
        onSelectProduct={handleSelectRecentProduct}
        onViewAllInMarketplace={handleViewAllRecentInMarketplace}
      />

      <SavedSearchesModal
        isOpen={isSavedSearchesModalOpen}
        onClose={() => setIsSavedSearchesModalOpen(false)}
        onRunSearch={handleRunSavedSearch}
      />

      <HelpCenterModal
        isOpen={isHelpCenterOpen}
        onClose={() => setIsHelpCenterOpen(false)}
      />
    </>
  );
};
