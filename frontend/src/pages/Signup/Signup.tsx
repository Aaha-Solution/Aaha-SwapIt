import React, { useState } from 'react';
import { User, Mail, Phone, Lock, MapPin, X, Zap } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { CITIES } from '../../utils/constants';

interface SignupProps {
  isModal?: boolean;
  onClose?: () => void;
  onSwitchToLogin?: () => void;
}

export const Signup: React.FC<SignupProps> = ({
  isModal = false,
  onClose,
  onSwitchToLogin,
}) => {
  const navigate = useNavigate();
  const { quickDemoLogin, isLoading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('Chennai');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setValidationError('Please enter your full name');
      return;
    }
    if (!email.includes('@')) {
      setValidationError('Please enter a valid email address');
      return;
    }
    if (phone.length < 10) {
      setValidationError('Please enter a valid 10-digit mobile number');
      return;
    }
    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return;
    }
    if (!agreeTerms) {
      setValidationError('You must accept terms of service');
      return;
    }

    quickDemoLogin();
    if (onClose) onClose();
    else navigate('/');
  };

  const handleDemoClick = () => {
    quickDemoLogin();
    if (onClose) onClose();
    else navigate('/');
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
      <div className="flex items-center gap-2 mb-6">
        <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
          <circle cx="11" cy="16" r="8" stroke="#3b82f6" strokeWidth="4.5" strokeLinecap="round" />
          <circle cx="21" cy="16" r="8" stroke="#7c3aed" strokeWidth="4.5" strokeLinecap="round" />
        </svg>
        <span className="text-xl font-extrabold text-slate-900">
          Swap<span className="text-indigo-600 italic">It</span>
        </span>
      </div>

      {/* Tab Switcher */}
      <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
        <button
          type="button"
          onClick={onSwitchToLogin || (() => navigate('/login'))}
          className="flex-1 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-all"
        >
          Sign In
        </button>
        <button
          type="button"
          className="flex-1 py-2 text-xs font-bold rounded-lg bg-white shadow-sm text-slate-900 transition-all"
        >
          New Account
        </button>
      </div>

      {/* Title */}
      <div className="mb-6">
        <h2 className="text-xl font-extrabold text-slate-900">Join SwapIt today</h2>
        <p className="text-xs text-slate-500 mt-1">
          Create your verified account in 30 seconds to buy and sell safely.
        </p>
      </div>

      {validationError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
          {validationError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
          <div className="relative flex items-center">
            <User className="w-4 h-4 text-slate-400 absolute left-3" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Iyyanar"
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
          <div className="relative flex items-center">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. name@example.com"
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Phone</label>
            <div className="relative flex items-center">
              <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9840123456"
                className="w-full pl-8 pr-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
            <div className="relative flex items-center">
              <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full pl-8 pr-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 outline-none appearance-none"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Create Password</label>
          <div className="relative flex items-center">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="agreeTerms"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
          />
          <label htmlFor="agreeTerms" className="text-[11px] text-slate-500 cursor-pointer select-none">
            I agree to the <a href="#terms" className="text-indigo-600 underline">Terms of Service</a> & <a href="#privacy" className="text-indigo-600 underline">Privacy Policy</a>
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-50"
        >
          {isLoading ? 'Creating Account...' : 'Register Account'}
        </button>
      </form>

      <div className="mt-4">
        <button
          type="button"
          onClick={handleDemoClick}
          className="w-full flex items-center justify-center gap-2 py-2 bg-indigo-50/60 border border-dashed border-indigo-300 rounded-xl text-xs font-bold text-indigo-700 hover:bg-indigo-100/60 transition-colors"
        >
          <Zap className="w-4 h-4 text-indigo-600 fill-indigo-600" />
          <span>Quick Demo Login (Iyyanar)</span>
        </button>
      </div>

      <p className="text-center text-xs text-slate-500 mt-5">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin || (() => navigate('/login'))}
          className="font-bold text-indigo-600 hover:underline"
        >
          Sign in here
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
