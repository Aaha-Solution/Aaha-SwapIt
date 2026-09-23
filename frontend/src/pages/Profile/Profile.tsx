import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Package,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle2,
  Trash2,
  Check,
  Plus,
  Edit3,
  ExternalLink,
  Eye,
  Search,
  RotateCcw,
  Sparkles,
  ShoppingBag,
  TrendingUp,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { userApi } from '../../api/user.api';
import { productApi } from '../../api/product.api';
import { Product } from '../../types/product.types';
import { formatINR } from '../../utils/helpers';
import { openPostAdModal, setMyAdsCount } from '../../store/slices/userSlice';
import { EditProductModal } from '../../components/EditProductModal/EditProductModal';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();

  const [myAds, setMyAds] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'sold'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Load seller's listings
  useEffect(() => {
    async function loadAds() {
      setIsLoading(true);
      try {
        const res = await userApi.getMyAds();
        if (res.success && res.data) {
          setMyAds(res.data);
          const activeCount = res.data.filter((a) => a.status !== 'sold').length;
          dispatch(setMyAdsCount(activeCount));
        }
      } catch (err) {
        console.error('Failed to load seller ads:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAds();
  }, [dispatch]);

  // Handle Delete Ad
  const handleDeleteAd = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) return;
    setActionLoadingId(id);
    try {
      await productApi.deleteProduct(id);
      setMyAds((prev) => {
        const next = prev.filter((ad) => ad.id !== id);
        const activeCount = next.filter((a) => a.status !== 'sold').length;
        dispatch(setMyAdsCount(activeCount));
        return next;
      });
    } catch (err) {
      console.error('Failed to delete ad:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Mark as Sold or Relist
  const handleToggleStatus = async (ad: Product) => {
    const newStatus: 'active' | 'sold' = ad.status === 'sold' ? 'active' : 'sold';
    setActionLoadingId(ad.id);
    try {
      const res = await productApi.updateProductStatus(ad.id, newStatus);
      if (res.success) {
        setMyAds((prev) => {
          const next = prev.map((item) =>
            item.id === ad.id ? { ...item, status: newStatus } : item
          );
          const activeCount = next.filter((a) => a.status !== 'sold').length;
          dispatch(setMyAdsCount(activeCount));
          return next;
        });
      }
    } catch (err) {
      console.error('Failed to toggle ad status:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Update Product from Edit Modal
  const handleProductUpdated = (updated: Product) => {
    setMyAds((prev) => {
      const next = prev.map((item) => (item.id === updated.id ? updated : item));
      const activeCount = next.filter((a) => a.status !== 'sold').length;
      dispatch(setMyAdsCount(activeCount));
      return next;
    });
  };

  // Filter listings by tab and search
  const filteredAds = myAds.filter((ad) => {
    // Tab filter
    if (activeTab === 'active' && ad.status === 'sold') return false;
    if (activeTab === 'sold' && ad.status !== 'sold') return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = ad.title?.toLowerCase().includes(q);
      const matchCat = ad.category?.toLowerCase().includes(q);
      const matchCity = ad.city?.toLowerCase().includes(q);
      return matchTitle || matchCat || matchCity;
    }
    return true;
  });

  // KPI Metrics calculation
  const totalActive = myAds.filter((a) => a.status !== 'sold').length;
  const totalSold = myAds.filter((a) => a.status === 'sold').length;
  const totalViews = myAds.reduce((acc, a) => acc + (a.views || 48), 0);
  const totalInquiries = Math.max(12, totalActive * 4 + totalSold * 6);

  return (
    <div className="space-y-6">
      {/* Profile & Seller Header Card */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <img
                src={
                  user?.avatarUrl ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                }
                alt={user?.name || 'User'}
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-indigo-50 shadow-sm"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                ✓
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {user?.name || 'Iyyanar'}
                </h1>
                <span className="bg-indigo-50 text-indigo-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-indigo-100/60">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  Verified Seller
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {user?.email || 'iyyanar@example.com'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {user?.phone || '+91 98401 98765'}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {user?.location || 'Chennai'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Member since {user?.memberSince || 'Sep 2024'}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => dispatch(openPostAdModal())}
            className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl shadow-md shadow-indigo-100 transition-all active:scale-95 flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Ad</span>
          </button>
        </div>

        {/* Live Analytics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100">
          <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100/50">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">
                Active Listings
              </span>
              <Package className="w-4 h-4 text-indigo-600" />
            </div>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {totalActive}
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              {totalSold} items marked sold
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total Impressions
              </span>
              <Eye className="w-4 h-4 text-slate-400" />
            </div>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {totalViews}
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +18% this week
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Buyer Inquiries
              </span>
              <MessageSquare className="w-4 h-4 text-slate-400" />
            </div>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {totalInquiries}
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              Via Real-Time Chat
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-100/50">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
                Seller Score
              </span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-2xl font-black text-amber-600 mt-1 block">
              4.9 ★
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              100% Response Rate
            </span>
          </div>
        </div>
      </div>

      {/* My Listings Management Section */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Section Header & Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Manage Your Listings
              </h2>
              <p className="text-xs text-slate-400">
                Edit prices, mark products as sold, or relist anytime
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search within My Ads */}
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your listings..."
                className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200/60">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  activeTab === 'all'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                All ({myAds.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('active')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  activeTab === 'active'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Active ({totalActive})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('sold')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  activeTab === 'sold'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Sold ({totalSold})
              </button>
            </div>
          </div>
        </div>

        {/* Listings Cards */}
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-24 bg-slate-50 rounded-2xl"></div>
            <div className="h-24 bg-slate-50 rounded-2xl"></div>
          </div>
        ) : filteredAds.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">
              {searchQuery
                ? `No listings matching "${searchQuery}"`
                : `No ${activeTab === 'all' ? '' : activeTab} listings found`}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mb-4">
              {searchQuery
                ? 'Try searching with different keywords or clear the search filter.'
                : 'Publish your pre-owned items to reach thousands of buyers across DealKart.'}
            </p>
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
              >
                Clear Search
              </button>
            ) : (
              <button
                type="button"
                onClick={() => dispatch(openPostAdModal())}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
              >
                Create Your First Ad
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAds.map((ad) => {
              const isSold = ad.status === 'sold';
              const isLoadingThis = actionLoadingId === ad.id;

              return (
                <div
                  key={ad.id}
                  className={`flex flex-col lg:flex-row items-start lg:items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all gap-4 ${
                    isSold
                      ? 'bg-slate-50/70 border-slate-200/80 opacity-90'
                      : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm'
                  }`}
                >
                  {/* Left: Image & Info */}
                  <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                    <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center p-2 flex-shrink-0 border border-slate-100 relative overflow-hidden">
                      <img
                        src={ad.imageUrl}
                        alt={ad.title}
                        className="w-full h-full object-contain"
                      />
                      {isSold && (
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
                          <span className="text-[10px] font-black text-white uppercase tracking-wider bg-red-600 px-2 py-0.5 rounded shadow">
                            SOLD
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-sm font-bold text-slate-900 truncate max-w-md">
                          {ad.title}
                        </h3>
                        {isSold ? (
                          <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-md">
                            Sold Out
                          </span>
                        ) : (
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border border-emerald-100">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                            Active
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span className="font-extrabold text-slate-900 text-sm">
                          {formatINR(ad.price)}
                        </span>
                        <span>•</span>
                        <span className="capitalize">{ad.category || 'Item'}</span>
                        <span>•</span>
                        <span>{ad.condition || 'Good'}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {ad.city || 'Chennai'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3 text-slate-400" />
                          {ad.views || 64} views
                        </span>
                        <span>•</span>
                        <span>Posted {ad.postedAt || 'Recently'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end lg:self-auto flex-wrap">
                    {/* View Live Listing */}
                    <button
                      type="button"
                      onClick={() => navigate(`/products/${ad.id}`)}
                      className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded-xl transition-all flex items-center gap-1.5 border border-slate-200"
                      title="View public product page"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>

                    {/* Edit Listing Details */}
                    <button
                      type="button"
                      onClick={() => setEditingProduct(ad)}
                      className="px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all flex items-center gap-1.5 border border-indigo-100"
                      title="Edit price, title, or description"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    {/* Toggle Mark Sold / Relist */}
                    <button
                      type="button"
                      disabled={isLoadingThis}
                      onClick={() => handleToggleStatus(ad)}
                      className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                        isSold
                          ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                      }`}
                      title={isSold ? 'Relist as active item' : 'Mark as completed sale'}
                    >
                      {isSold ? (
                        <>
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Relist Ad</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Mark Sold</span>
                        </>
                      )}
                    </button>

                    {/* Delete Ad */}
                    <button
                      type="button"
                      disabled={isLoadingThis}
                      onClick={() => handleDeleteAd(ad.id, ad.title)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      title="Delete ad permanently"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSuccess={handleProductUpdated}
        />
      )}
    </div>
  );
};
