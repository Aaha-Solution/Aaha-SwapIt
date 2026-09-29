import React, { useState, useEffect } from 'react';
import {
  Shield,
  UserPlus,
  Users,
  Store,
  Package,
  CheckCircle2,
  Trash2,
  Search,
  Phone,
  Mail,
  MapPin,
  Lock,
  Copy,
  Check,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../api/auth.api';
import { User, SellerAccountInput } from '../../types/user.types';
import { CITIES } from '../../utils/constants';

export const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSellers: 0,
    totalCustomers: 0,
    totalProducts: 0,
  });
  const [sellers, setSellers] = useState<Array<User & { _count?: { products: number } }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; pass: string; name: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // New Seller Form State
  const [formData, setFormData] = useState<SellerAccountInput>({
    name: '',
    email: '',
    phone: '',
    location: 'Puducherry',
    password: 'Password@123',
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, sellersRes] = await Promise.all([
        authApi.getAdminStats(),
        authApi.getSellers(),
      ]);

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
      if (sellersRes.success && sellersRes.data) {
        setSellers(sellersRes.data);
      }
    } catch {
      // Fallback demo data if offline
      setStats({
        totalUsers: 12,
        totalSellers: 4,
        totalCustomers: 7,
        totalProducts: 8,
      });
      setSellers([
        {
          id: 'usr-demo-seller',
          name: 'Karthik Raja (Seller)',
          email: 'seller@swapit.com',
          phone: '+91 98401 23456',
          location: 'Puducherry',
          verified: true,
          role: 'seller',
          memberSince: 'Oct 2024',
          _count: { products: 3 },
        },
        {
          id: 'usr-2',
          name: 'Suresh Motors',
          email: 'suresh@example.com',
          phone: '+91 94441 55210',
          location: 'Puducherry',
          verified: true,
          role: 'seller',
          memberSince: 'Nov 2024',
          _count: { products: 2 },
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSeller = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.password?.trim()) {
      setFeedback({ type: 'error', message: 'Name, Email, and Password are required.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);
    try {
      const res = await authApi.createSeller(formData);
      if (res.success) {
        setCreatedCredentials({
          email: formData.email,
          pass: formData.password || 'Password@123',
          name: formData.name,
        });
        setFeedback({
          type: 'success',
          message: `Seller "${formData.name}" has been created successfully! The seller can now log in via the "Seller Login" tab.`,
        });
        setFormData({
          name: '',
          email: '',
          phone: '',
          location: 'Puducherry',
          password: 'Password@123',
        });
        fetchData();
      } else {
        setFeedback({ type: 'error', message: res.message || 'Failed to create seller.' });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.response?.data?.message || 'Error occurred while creating seller.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSeller = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove seller "${name}"?`)) return;

    try {
      const res = await authApi.deleteSeller(id);
      if (res.success) {
        setFeedback({ type: 'success', message: `Seller "${name}" removed successfully.` });
        fetchData();
      } else {
        setFeedback({ type: 'error', message: res.message || 'Failed to delete seller.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Error deleting seller.' });
    }
  };

  const copyCredentials = () => {
    if (!createdCredentials) return;
    const text = `SwapIt Seller Login:\nEmail: ${createdCredentials.email}\nPassword: ${createdCredentials.pass}\nLogin at: ${window.location.origin}/login (Select 'Seller Login')`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const filteredSellers = sellers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.location && s.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 mb-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-xs font-bold text-indigo-300 mb-3">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              <span>ADMINISTRATOR PORTAL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Seller Management & Platform Controls
            </h1>
            <p className="text-sm text-slate-300 mt-1.5 max-w-2xl">
              As per OLX-style verified business model, sellers on SwapIt are authorized and onboarded
              exclusively by the Admin. Customers can browse and buy, while sellers post verified ads.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-semibold backdrop-blur transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Stats</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Users</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.totalUsers || sellers.length + 3}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Across all roles</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Verified Sellers</span>
            <Store className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-950">{stats.totalSellers || sellers.length}</p>
          <span className="text-[11px] text-emerald-600 font-medium mt-0.5 block">Created by Admin</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Customers</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.totalCustomers || 5}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Public registrations</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Live Listings</span>
            <Package className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.totalProducts || 8}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Posted by sellers</span>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`mb-6 p-4 rounded-2xl border flex items-start gap-3 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 text-xs">
            <p className="font-semibold">{feedback.message}</p>
          </div>
        </div>
      )}

      {/* Newly Created Credentials Banner with 1-Click Copy */}
      {createdCredentials && (
        <div className="mb-6 p-5 bg-indigo-50/80 border border-indigo-200 rounded-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase text-indigo-700 tracking-wider">
                Seller Account Login Details
              </span>
              <div className="mt-1 space-y-0.5 text-xs text-slate-800 font-mono">
                <p>
                  <strong>Seller Name:</strong> {createdCredentials.name}
                </p>
                <p>
                  <strong>Login Email:</strong>{' '}
                  <span className="bg-white px-2 py-0.5 rounded border border-indigo-100 font-bold text-indigo-900">
                    {createdCredentials.email}
                  </span>
                </p>
                <p>
                  <strong>Initial Password:</strong>{' '}
                  <span className="bg-white px-2 py-0.5 rounded border border-indigo-100 font-bold text-indigo-900">
                    {createdCredentials.pass}
                  </span>
                </p>
              </div>
            </div>
            <button
              onClick={copyCredentials}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Details!' : 'Copy Credentials'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab('create')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'create'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Create New Seller Login</span>
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'list'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Manage Sellers Directory ({sellers.length})</span>
        </button>
      </div>

      {/* Tab 1: Create New Seller Form */}
      {activeTab === 'create' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-md">
          <div className="max-w-2xl">
            <h2 className="text-lg font-extrabold text-slate-900">
              Create Authorized Seller Login
            </h2>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              Create seller credentials for authorized business dealers or private sellers. They will be able
              to sign in via the <strong>Seller Login</strong> option and post product listings.
            </p>

            <form onSubmit={handleCreateSeller} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Seller / Business Name <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Store className="w-4 h-4 text-slate-400 absolute left-3" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Balaji Motors or Suresh Electronics"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Seller Email (Username) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. balaji@swapit.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Phone Number
                  </label>
                  <div className="relative flex items-center">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98401 23456"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Operating City / Hub
                  </label>
                  <div className="relative flex items-center">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                    <select
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
                    >
                      {CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Initial Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
                    <input
                      type="text"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Password@123"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isSubmitting ? 'Creating Seller...' : 'Create Seller Account'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab 2: Sellers Directory */}
      {activeTab === 'list' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md">
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sellers by name, email, city..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
              />
            </div>
            <span className="text-xs text-slate-500">
              Showing {filteredSellers.length} verified sellers
            </span>
          </div>

          {filteredSellers.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Store className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-semibold text-slate-600">No sellers found</p>
              <p className="text-xs mt-1">Use the "Create New Seller Login" tab to add sellers.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                    <th className="pb-3 px-3">Seller Details</th>
                    <th className="pb-3 px-3">Contact</th>
                    <th className="pb-3 px-3">Location</th>
                    <th className="pb-3 px-3">Status</th>
                    <th className="pb-3 px-3">Listings</th>
                    <th className="pb-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredSellers.map((seller) => (
                    <tr key={seller.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0">
                            {seller.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{seller.name}</p>
                            <p className="text-[11px] text-slate-500 font-mono">{seller.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {seller.phone || '—'}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {seller.location || 'Chennai'}
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          Admin Verified
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-700">
                        {seller._count?.products ?? 0} ads
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleDeleteSeller(seller.id, seller.name)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Remove Seller"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
