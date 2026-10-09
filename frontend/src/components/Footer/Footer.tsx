import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MessageCircle, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 bg-[#090d16] text-slate-300">
      {/* Main Footer Links */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <svg className="w-7 h-7" viewBox="0 0 32 32" fill="none">
                <circle cx="11" cy="16" r="8" stroke="#2563eb" strokeWidth="4.5" strokeLinecap="round"/>
                <circle cx="21" cy="16" r="8" stroke="#0ea5e9" strokeWidth="4.5" strokeLinecap="round"/>
              </svg>
              <span className="text-xl font-extrabold text-white">Swap<span className="text-blue-400">It</span></span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              India's favorite community marketplace to buy, sell, and reuse pre-owned items safely. Empowering circular commerce with local verified buyers and sellers.
            </p>
            <div className="space-y-2 pt-2 text-xs text-slate-400 font-medium">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Verified Sellers</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-sky-400" />
                <span>Instant In-App Chat</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>Zero Listing Fees</span>
              </div>
            </div>
          </div>

          {/* Popular Locations */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Popular Locations
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/products" className="hover:text-white transition-colors">White Town Puducherry</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Lawspet Puducherry</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Muthialpet Puducherry</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Heritage Town Puducherry</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Reddiarpalayam Puducherry</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Villiyanur Puducherry</Link></li>
            </ul>
          </div>

          {/* Trending Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Trending Categories
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/products" className="hover:text-white transition-colors">Used Cars & SUVs</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Motorcycles & Scooters</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">iPhones & Smartphones</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">MacBooks & Laptops</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Sofas & Home Decor</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Apartments & Rentals</Link></li>
            </ul>
          </div>

          {/* Help & Safety */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Help & Safety
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/terms" className="hover:text-white transition-colors">Help Center & FAQs</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Safe Trading Tips</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Scam & Fraud Alert</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">SwapIt Buyer Shield</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Contact Customer Care</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Report an Ad or Issue</Link></li>
            </ul>
          </div>

          {/* About SwapIt */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              About SwapIt
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/terms" className="hover:text-white transition-colors">About Our Mission</Link></li>
              <li className="flex items-center gap-2">
                <Link to="/terms" className="hover:text-white transition-colors">Careers</Link>
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded">HIRING</span>
              </li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Eco & Sustainability</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Press & Media Kit</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 mt-12 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 SwapIt Technologies India Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-slate-400 transition-colors">Terms & Conditions</Link>
            <Link to="/privacy" className="hover:text-slate-400 transition-colors">Cookies</Link>
            <Link to="/terms" className="hover:text-slate-400 transition-colors">Security</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

