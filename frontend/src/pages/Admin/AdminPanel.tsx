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
  ShieldAlert,
  AlertTriangle,
  Ban,
  PackageX,
  FileCheck,
  Eye,
  MessageSquareWarning,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../api/auth.api';
import { reportApi } from '../../api/report.api';
import { User, SellerAccountInput } from '../../types/user.types';
import { Report, SafetyStats, ReportStatus, ModerationAction } from '../../types/report.types';
import { CITIES } from '../../utils/constants';

export const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'create' | 'list' | 'safety'>('create');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSellers: 0,
    totalCustomers: 0,
    totalProducts: 0,
  });
  const [sellers, setSellers] = useState<Array<User & { _count?: { products: number } }>>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [safetyStats, setSafetyStats] = useState<SafetyStats | null>(null);
  const [reportFilter, setReportFilter] = useState<string>('all');
  const [safetyActionId, setSafetyActionId] = useState<string | null>(null);

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
      const [statsRes, sellersRes, reportsRes] = await Promise.all([
        authApi.getAdminStats(),
        authApi.getSellers(),
        reportApi.getAdminReports(),
      ]);

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
      if (sellersRes.success && sellersRes.data) {
        setSellers(sellersRes.data);
      }
      if (reportsRes.success && reportsRes.data) {
        setReports(reportsRes.data.reports);
        setSafetyStats(reportsRes.data.stats);
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
      setSafetyStats({
        totalReports: 2,
        pendingReports: 1,
        investigatingReports: 1,
        resolvedReports: 0,
        dismissedReports: 0,
        takedownsCount: 0,
        trustSafetyScore: 98,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateReport = async (
    reportId: string,
    status: ReportStatus,
    actionTaken: ModerationAction,
    notes?: string
  ) => {
    setSafetyActionId(reportId);
    const res = await reportApi.updateReport(reportId, {
      status,
      actionTaken,
      adminNotes: notes || `Moderated by admin on ${new Date().toLocaleDateString()}`,
    });
    setSafetyActionId(null);

    if (res.success && res.data) {
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? (res.data as Report) : r))
      );
      setFeedback({
        type: 'success',
        message: `Report ${reportId} updated to "${status}" with action "${actionTaken}".`,
      });
      // Refresh safety stats
      const statsRes = await reportApi.getSafetyStats();
      if (statsRes.success && statsRes.data) {
        setSafetyStats(statsRes.data);
      }
    } else {
      setFeedback({
        type: 'error',
        message: res.error || 'Failed to update report',
      });
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
      <div className="flex items-center gap-2 border-b border-slate-200 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('create')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
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
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'list'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Manage Sellers Directory ({sellers.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('safety')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'safety'
              ? 'border-rose-600 text-rose-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          <span className="flex items-center gap-1.5">
            <span>Trust & Safety Moderation</span>
            {reports.filter((r) => r.status === 'pending').length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {reports.filter((r) => r.status === 'pending').length}
              </span>
            )}
          </span>
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

      {/* Tab 3: Trust & Safety Fraud Moderation Center */}
      {activeTab === 'safety' && (
        <div className="space-y-6">
          {/* Safety Summary Banner & Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-sm">
              <div className="flex items-center justify-between text-rose-500 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Pending Action</span>
                <ShieldAlert className="w-4 h-4 text-rose-600" />
              </div>
              <p className="text-2xl font-black text-rose-950">
                {safetyStats?.pendingReports ?? reports.filter((r) => r.status === 'pending').length}
              </p>
              <span className="text-[11px] text-rose-600 font-medium mt-0.5 block">Requires review</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Investigating</span>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-slate-900">
                {safetyStats?.investigatingReports ?? reports.filter((r) => r.status === 'investigating').length}
              </p>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Under scrutiny</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Takedowns</span>
                <Ban className="w-4 h-4 text-red-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">
                {safetyStats?.takedownsCount ?? reports.filter((r) => r.actionTaken === 'listing_removed').length}
              </p>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Listings removed</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm bg-gradient-to-br from-white to-emerald-50/40">
              <div className="flex items-center justify-between text-emerald-600 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Platform Trust Score</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-emerald-950">
                {safetyStats?.trustSafetyScore ?? 98}%
              </p>
              <span className="text-[11px] text-emerald-700 font-medium mt-0.5 block">Community health</span>
            </div>
          </div>

          {/* Moderation Queue Container */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                  <span>Flagged Ads & Fraud Reports</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Review reported listings, counterfeit flags, or scam attempts submitted by users.
                </p>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {(['all', 'pending', 'investigating', 'resolved', 'dismissed'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setReportFilter(tab)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                      reportFilter === tab
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Reports List */}
            {(() => {
              const filteredReports = reports.filter((r) =>
                reportFilter === 'all' ? true : r.status === reportFilter
              );

              if (filteredReports.length === 0) {
                return (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 opacity-80" />
                    <p className="text-sm font-bold text-slate-700">No reports found for this filter</p>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      All clean! There are no flagged listings or user safety complaints matching this status.
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {filteredReports.map((report) => {
                    const isActing = safetyActionId === report.id;

                    const reasonBadges: Record<string, { label: string; color: string }> = {
                      fraud_scam: { label: 'Scam / Fraud Attempt', color: 'bg-rose-100 text-rose-800 border-rose-200' },
                      counterfeit: { label: 'Counterfeit / Replica', color: 'bg-amber-100 text-amber-800 border-amber-200' },
                      prohibited_item: { label: 'Prohibited Item', color: 'bg-red-100 text-red-800 border-red-200' },
                      inaccurate_description: { label: 'Misleading Info', color: 'bg-orange-100 text-orange-800 border-orange-200' },
                      harassment: { label: 'Abusive / Harassment', color: 'bg-purple-100 text-purple-800 border-purple-200' },
                      suspicious_seller: { label: 'Suspicious Profile', color: 'bg-blue-100 text-blue-800 border-blue-200' },
                      other: { label: 'Other Concern', color: 'bg-slate-100 text-slate-800 border-slate-200' },
                    };

                    const statusBadges: Record<string, { label: string; color: string }> = {
                      pending: { label: 'Pending Review', color: 'bg-rose-50 text-rose-700 border-rose-200 font-extrabold' },
                      investigating: { label: 'Investigating', color: 'bg-amber-50 text-amber-700 border-amber-200' },
                      resolved: { label: 'Resolved', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                      dismissed: { label: 'Dismissed', color: 'bg-slate-100 text-slate-600 border-slate-200' },
                    };

                    const badge = reasonBadges[report.reason] || { label: report.reason, color: 'bg-slate-100 text-slate-800' };
                    const statusBadge = statusBadges[report.status] || { label: report.status, color: 'bg-slate-100 text-slate-800' };

                    return (
                      <div
                        key={report.id}
                        className="p-5 rounded-2xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:border-indigo-200 transition-all space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badge.color}`}>
                              {badge.label}
                            </span>
                            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusBadge.color}`}>
                              {statusBadge.label}
                            </span>
                            {report.actionTaken && report.actionTaken !== 'none' && (
                              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                                Action: {report.actionTaken.replace('_', ' ')}
                              </span>
                            )}
                          </div>

                          <span className="text-[11px] text-slate-400">
                            Reported {new Date(report.createdAt).toLocaleString()}
                          </span>
                        </div>

                        {/* Reported Item / Seller Details */}
                        <div className="p-3.5 rounded-xl bg-white border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900">
                                {report.productTitle || 'Reported Listing'}
                              </span>
                              {report.productPrice && (
                                <span className="text-xs font-extrabold text-indigo-600">
                                  ₹{report.productPrice.toLocaleString()}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Seller: <strong>{report.sellerName || 'Unknown'}</strong> {report.sellerId && `(${report.sellerId})`}
                            </p>
                          </div>

                          <div className="text-[11px] text-slate-500">
                            <span>Reporter: <strong>{report.reporterName}</strong> ({report.reporterEmail || 'Anonymous'})</span>
                          </div>
                        </div>

                        {/* Description */}
                        <div className="text-xs text-slate-700 bg-white/80 p-3 rounded-xl border border-slate-100 leading-relaxed">
                          <strong className="text-slate-900 font-semibold block mb-0.5">Report Description:</strong>
                          {report.description}
                        </div>

                        {/* Admin Notes if present */}
                        {report.adminNotes && (
                          <div className="text-[11px] text-indigo-900 bg-indigo-50/60 p-2.5 rounded-xl border border-indigo-100">
                            <strong>Admin Note:</strong> {report.adminNotes}
                          </div>
                        )}

                        {/* Moderation Actions Bar */}
                        <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100">
                          {report.status !== 'resolved' && (
                            <>
                              <button
                                type="button"
                                disabled={isActing}
                                onClick={() =>
                                  handleUpdateReport(
                                    report.id,
                                    'resolved',
                                    'listing_removed',
                                    'Listing removed due to community safety violation'
                                  )
                                }
                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                              >
                                <Ban className="w-3.5 h-3.5" />
                                <span>Take Down Ad</span>
                              </button>

                              <button
                                type="button"
                                disabled={isActing}
                                onClick={() =>
                                  handleUpdateReport(
                                    report.id,
                                    'investigating',
                                    'warning_sent',
                                    'Warning notification dispatched to seller'
                                  )
                                }
                                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                              >
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>Warn Seller</span>
                              </button>

                              <button
                                type="button"
                                disabled={isActing}
                                onClick={() =>
                                  handleUpdateReport(
                                    report.id,
                                    'resolved',
                                    'none',
                                    'Resolved after inspection'
                                  )
                                }
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Mark Resolved</span>
                              </button>
                            </>
                          )}

                          {report.status !== 'dismissed' && (
                            <button
                              type="button"
                              disabled={isActing}
                              onClick={() =>
                                handleUpdateReport(
                                  report.id,
                                  'dismissed',
                                  'none',
                                  'Report reviewed and dismissed as false alarm'
                                )
                              }
                              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
                            >
                              <span>Dismiss</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
