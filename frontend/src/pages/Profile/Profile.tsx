import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Package,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle2,
  Trash2,
  Check,
  Plus,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { userApi } from '../../api/user.api';
import { productApi } from '../../api/product.api';
import { Product } from '../../types/product.types';
import { formatINR } from '../../utils/helpers';
import { useDispatch } from 'react-redux';
import { openPostAdModal } from '../../store/slices/userSlice';

export const Profile: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [myAds, setMyAds] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'sold'>('active');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAds() {
      setIsLoading(true);
      const res = await userApi.getMyAds();
      if (res.success && res.data) {
        setMyAds(res.data);
      }
      setIsLoading(false);
    }
    loadAds();
  }, []);

  const handleDeleteAd = async (id: string) => {
    if (confirm('Are you sure you want to delete this listing?')) {
      await productApi.deleteProduct(id);
      setMyAds((prev) => prev.filter((ad) => ad.id !== id));
    }
  };

  const handleMarkSold = (id: string) => {
    setMyAds((prev) =>
      prev.map((ad) => (ad.id === id ? { ...ad, status: 'sold' } : ad))
    );
  };

  const displayedAds = myAds.filter((ad) =>
    activeTab === 'sold' ? ad.status === 'sold' : ad.status !== 'sold'
  );

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={user?.name || 'User'}
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-indigo-50"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {user?.name || 'Iyyanar'}
                </h1>
                <CheckCircle2 className="w-5 h-5 text-indigo-600 fill-indigo-100" />
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
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Post Another Ad</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100">
          <div className="p-3.5 rounded-2xl bg-slate-50">
            <span className="text-[11px] font-semibold text-slate-400 block uppercase">Active Ads</span>
            <span className="text-xl font-extrabold text-slate-900 mt-0.5 block">
              {myAds.filter((a) => a.status !== 'sold').length}
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50">
            <span className="text-[11px] font-semibold text-slate-400 block uppercase">Total Views</span>
            <span className="text-xl font-extrabold text-slate-900 mt-0.5 block">452</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50">
            <span className="text-[11px] font-semibold text-slate-400 block uppercase">Buyer Inquiries</span>
            <span className="text-xl font-extrabold text-slate-900 mt-0.5 block">18</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50">
            <span className="text-[11px] font-semibold text-slate-400 block uppercase">Seller Rating</span>
            <span className="text-xl font-extrabold text-amber-600 mt-0.5 block">4.9 ★</span>
          </div>
        </div>
      </div>

      {/* My Listings Section */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-extrabold text-slate-900">Manage Your Listings</h2>
          </div>

          <div className="flex p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('active')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'active'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Active Listings
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('sold')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'sold'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sold Items
            </button>
          </div>
        </div>

        {/* Listings Table / Cards */}
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-20 bg-slate-100 rounded-2xl"></div>
            <div className="h-20 bg-slate-100 rounded-2xl"></div>
          </div>
        ) : displayedAds.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <p className="text-xs">No {activeTab} listings found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedAds.map((ad) => (
              <div
                key={ad.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center p-2 flex-shrink-0">
                    <img
                      src={ad.imageUrl}
                      alt={ad.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{ad.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="font-extrabold text-slate-900">{formatINR(ad.price)}</span>
                      <span>•</span>
                      <span>{ad.city}</span>
                      <span>•</span>
                      <span>Posted {ad.postedAt}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {ad.status !== 'sold' && (
                    <button
                      type="button"
                      onClick={() => handleMarkSold(ad.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold rounded-xl transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark Sold</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteAd(ad.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    title="Delete Ad"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
