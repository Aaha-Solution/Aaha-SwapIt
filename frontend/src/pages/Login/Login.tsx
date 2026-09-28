import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Zap, X, Shield, Store, User as UserIcon, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface LoginProps {
  isModal?: boolean;
  onClose?: () => void;
  onSwitchToSignup?: () => void;
  initialRole?: 'customer' | 'seller' | 'admin';
}

export const Login: React.FC<LoginProps> = ({
  isModal = false,
  onClose,
  onSwitchToSignup,
  initialRole = 'customer',
}) => {
  const navigate = useNavigate();
  const { login, quickDemoLogin, isLoading, error } = useAuth();

  // Role selection: 'customer' | 'seller' | 'admin'
  const [selectedRole, setSelectedRole] = useState<'customer' | 'seller' | 'admin'>(initialRole);

  // Form states per role
  const [emailOrPhone, setEmailOrPhone] = useState('customer@swapit.com');
  const [password, setPassword] = useState('Password@123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [validationError, setValidationError] = useState('');

  // Switch role tab and auto-fill helpful demo credentials
  const handleRoleChange = (role: 'customer' | 'seller' | 'admin') => {
    setSelectedRole(role);
    setValidationError('');
    if (role === 'admin') {
      setEmailOrPhone('admin@swapit.com');
      setPassword('Password@123');
    } else if (role === 'seller') {
      setEmailOrPhone('seller@swapit.com');
      setPassword('Password@123');
    } else {
      setEmailOrPhone('customer@swapit.com');
      setPassword('Password@123');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone.trim()) {
      setValidationError('Please enter your email or phone number');
      return;
    }
    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return;
    }
    setValidationError('');

    const res = await login({
      emailOrPhone,
      password,
      role: selectedRole,
    });

    if (res.success) {
      if (onClose) {
        onClose();
      }
      if (selectedRole === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  };

  const handleDemoClick = () => {
    quickDemoLogin(selectedRole);
    if (onClose) {
      onClose();
    }
    if (selectedRole === 'admin') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  const content = (
    <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
      {/* Close button if modal */}
      {isModal && onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Header Logo */}
      <div className="flex items-center gap-2 mb-5">
        <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
          <circle cx="11" cy="16" r="8" stroke="#3b82f6" strokeWidth="4.5" strokeLinecap="round" />
          <circle cx="21" cy="16" r="8" stroke="#7c3aed" strokeWidth="4.5" strokeLinecap="round" />
        </svg>
        <span className="text-xl font-extrabold text-slate-900 tracking-tight">
          Swap<span className="text-indigo-600 italic">It</span>
        </span>
      </div>

      {/* Primary Tab Switcher (Sign In vs New Account) */}
      <div className="flex p-1 bg-slate-100 rounded-xl mb-4">
        <button
          type="button"
          className="flex-1 py-2 text-xs font-bold rounded-lg bg-white shadow-sm text-slate-900 transition-all"
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={onSwitchToSignup || (() => navigate('/signup'))}
          className="flex-1 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
        >
          New Account
        </button>
      </div>

      {/* Role Selection Switcher: Customer | Seller | Admin */}
      <div className="mb-4">
        <div className="flex p-1 bg-slate-50 border border-slate-200/80 rounded-xl">
          <button
            type="button"
            onClick={() => handleRoleChange('customer')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[11.5px] font-bold rounded-lg transition-all cursor-pointer ${
              selectedRole === 'customer'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Customer</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('seller')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[11.5px] font-bold rounded-lg transition-all cursor-pointer ${
              selectedRole === 'seller'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Seller Login</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('admin')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[11.5px] font-bold rounded-lg transition-all cursor-pointer ${
              selectedRole === 'admin'
                ? 'bg-indigo-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>
      </div>

      {/* Welcome Title & Role Guidance */}
      <div className="mb-4">
        <h2 className="text-xl font-extrabold text-slate-900">
          {selectedRole === 'admin'
            ? 'Administrator Login'
            : selectedRole === 'seller'
            ? 'Seller Account Login'
            : 'Welcome back!'}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {selectedRole === 'admin' &&
            'Sign in with administrator credentials to manage platform, listings, and create sellers.'}
          {selectedRole === 'seller' &&
            'Sign in to manage inventory and post ads. (Selling accounts are created and authorized by Admin)'}
          {selectedRole === 'customer' &&
            'Sign in to browse listings, chat with buyers and sellers, and save favorite deals.'}
        </p>

        {selectedRole === 'seller' && (
          <div className="mt-2.5 p-2 bg-emerald-50 border border-emerald-200/80 rounded-xl text-[11px] text-emerald-800 flex items-center gap-2">
            <Store className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              <strong>Note:</strong> Like OLX, Seller accounts are created directly by the Admin.
            </span>
          </div>
        )}

        {selectedRole === 'admin' && (
          <div className="mt-2.5 p-2 bg-indigo-50 border border-indigo-200/80 rounded-xl text-[11px] text-indigo-800 flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>Admin portal access to onboard sellers and manage platform operations.</span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {(validationError || error) && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{validationError || error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Email or Phone */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {selectedRole === 'admin'
              ? 'Admin Email'
              : selectedRole === 'seller'
              ? 'Seller Email / Phone'
              : 'Email or Phone Number'}
          </label>
          <div className="relative flex items-center">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3" />
            <input
              type="text"
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              placeholder={
                selectedRole === 'admin'
                  ? 'admin@swapit.com'
                  : selectedRole === 'seller'
                  ? 'seller@swapit.com'
                  : 'customer@swapit.com'
              }
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-colors"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700">Password</label>
            <a href="#forgot" className="text-[11px] font-semibold text-indigo-600 hover:underline">
              Forgot password?
            </a>
          </div>
          <div className="relative flex items-center">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Remember me */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
          />
          <label htmlFor="rememberMe" className="text-xs text-slate-600 cursor-pointer select-none">
            Keep me signed in
          </label>
        </div>

        {/* Sign In Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2.5 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer ${
            selectedRole === 'admin'
              ? 'bg-indigo-700 hover:bg-indigo-800'
              : selectedRole === 'seller'
              ? 'bg-emerald-600 hover:bg-emerald-700'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {isLoading
            ? 'Signing In...'
            : selectedRole === 'admin'
            ? 'Sign In as Admin'
            : selectedRole === 'seller'
            ? 'Sign In as Seller'
            : 'Sign In'}
        </button>
      </form>

      {/* Social / Demo Login Dividers */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-100"></div>
        </div>
        <div className="relative flex justify-center text-[10.5px] uppercase tracking-wider text-slate-400">
          <span className="bg-white px-2">Or continue with</span>
        </div>
      </div>

      <div className="space-y-2">
        {/* Google Login */}
        <button
          type="button"
          onClick={handleDemoClick}
          className="w-full flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.96 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Quick Demo Login button dynamically adapted to selected role */}
        <button
          type="button"
          onClick={handleDemoClick}
          className={`w-full flex items-center justify-center gap-2 py-2.5 border border-dashed rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedRole === 'admin'
              ? 'bg-indigo-50/70 border-indigo-300 text-indigo-800 hover:bg-indigo-100/70'
              : selectedRole === 'seller'
              ? 'bg-emerald-50/70 border-emerald-300 text-emerald-800 hover:bg-emerald-100/70'
              : 'bg-blue-50/70 border-blue-300 text-blue-800 hover:bg-blue-100/70'
          }`}
        >
          <Zap className="w-4 h-4 fill-current shrink-0" />
          <span>
            {selectedRole === 'admin' && '⚡ Quick Demo Login (Admin - Iyyanar)'}
            {selectedRole === 'seller' && '⚡ Quick Demo Login (Seller - Karthik)'}
            {selectedRole === 'customer' && '⚡ Quick Demo Login (Customer - Vignesh)'}
          </span>
        </button>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-slate-500 mt-5">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToSignup || (() => navigate('/signup'))}
          className="font-bold text-indigo-600 hover:underline cursor-pointer"
        >
          Create one for free
        </button>
      </p>
    </div>
  );

  if (isModal) {
    return content;
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      {content}
    </div>
  );
};
