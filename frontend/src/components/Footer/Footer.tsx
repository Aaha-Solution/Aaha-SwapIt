import React from 'react';
import { ShieldCheck, MessageCircle, Sparkles, QrCode } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 bg-[#090d16] text-slate-300">
      {/* Mobile App Download Dark Banner */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 p-8 sm:p-10 shadow-2xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5" /> Mobile Experience
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Try the SwapIt App for Faster Deals
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Buy, sell, chat in real-time, and get instant notifications on price drops anywhere in your city.
              </p>
            </div>

            {/* App Store Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="#app-store"
                className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white transition-all duration-200"
              >
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.87-.9.04-2 .61-2.64 1.36-.57.65-1.06 1.73-.93 2.76 1.01.08 2.04-.52 2.65-1.25z"/>
                </svg>
                <div className="text-left">
                  <div className="text-[10px] text-slate-400 uppercase leading-none">Download on the</div>
                  <div className="text-xs font-bold leading-tight">App Store</div>
                </div>
              </a>

              <a
                href="#google-play"
                className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white transition-all duration-200"
              >
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M3.6 1.8l11.4 11.4-11.4 11.4c-.4-.4-.6-1-.6-1.8V3.6c0-.8.2-1.4.6-1.8zm12.8 12.8L18.7 16l-13.9 8.1 11.6-9.5zm2.3-1.8l2.6 1.5c.9.5.9 1.4 0 1.9l-2.6 1.5-1.5-2.4 1.5-2.5zm-2.3-1.8L4.8 1.5 18.7 9.6l-2.3 1.4z"/>
                </svg>
                <div className="text-left">
                  <div className="text-[10px] text-slate-400 uppercase leading-none">Get it on</div>
                  <div className="text-xs font-bold leading-tight">Google Play</div>
                </div>
              </a>

              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                <QrCode className="w-5 h-5 text-indigo-400" />
                <span>Scan to install</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <svg className="w-7 h-7" viewBox="0 0 32 32" fill="none">
                <circle cx="11" cy="16" r="8" stroke="#3b82f6" strokeWidth="4.5" strokeLinecap="round"/>
                <circle cx="21" cy="16" r="8" stroke="#8b5cf6" strokeWidth="4.5" strokeLinecap="round"/>
              </svg>
              <span className="text-xl font-extrabold text-white">Swap<span className="text-indigo-400">It</span></span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              India's favorite community marketplace to buy, sell, and reuse pre-owned items safely. Empowering circular commerce with local verified buyers & sellers.
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
                <Sparkles className="w-4 h-4 text-amber-400" />
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
              <li><a href="#chennai" className="hover:text-white transition-colors">Chennai Classifieds</a></li>
              <li><a href="#bangalore" className="hover:text-white transition-colors">Bangalore Classifieds</a></li>
              <li><a href="#mumbai" className="hover:text-white transition-colors">Mumbai Classifieds</a></li>
              <li><a href="#delhi" className="hover:text-white transition-colors">Delhi NCR Classifieds</a></li>
              <li><a href="#hyderabad" className="hover:text-white transition-colors">Hyderabad Classifieds</a></li>
              <li><a href="#pune" className="hover:text-white transition-colors">Pune Classifieds</a></li>
            </ul>
          </div>

          {/* Trending Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Trending Categories
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#cars" className="hover:text-white transition-colors">Used Cars & SUVs</a></li>
              <li><a href="#bikes" className="hover:text-white transition-colors">Motorcycles & Scooters</a></li>
              <li><a href="#mobiles" className="hover:text-white transition-colors">iPhones & Smartphones</a></li>
              <li><a href="#laptops" className="hover:text-white transition-colors">MacBooks & Laptops</a></li>
              <li><a href="#furniture" className="hover:text-white transition-colors">Sofas & Home Decor</a></li>
              <li><a href="#apartments" className="hover:text-white transition-colors">Apartments & Rentals</a></li>
            </ul>
          </div>

          {/* Help & Safety */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Help & Safety
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#help" className="hover:text-white transition-colors">Help Center & FAQs</a></li>
              <li><a href="#safety" className="hover:text-white transition-colors">Safe Trading Tips</a></li>
              <li><a href="#scam" className="hover:text-white transition-colors">Scam & Fraud Alert</a></li>
              <li><a href="#shield" className="hover:text-white transition-colors">SwapIt Buyer Shield</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors">Contact Customer Care</a></li>
              <li><a href="#report" className="hover:text-white transition-colors">Report an Ad / Issue</a></li>
            </ul>
          </div>

          {/* About SwapIt */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              About SwapIt
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#about" className="hover:text-white transition-colors">About Our Mission</a></li>
              <li className="flex items-center gap-2">
                <a href="#careers" className="hover:text-white transition-colors">Careers</a>
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded">HIRING</span>
              </li>
              <li><a href="#eco" className="hover:text-white transition-colors">Eco & Sustainability</a></li>
              <li><a href="#press" className="hover:text-white transition-colors">Press & Media Kit</a></li>
              <li><a href="#terms" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 mt-12 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 SwapIt Technologies India Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#privacy" className="hover:text-slate-400 transition-colors">Privacy</a>
            <a href="#terms" className="hover:text-slate-400 transition-colors">Terms</a>
            <a href="#cookies" className="hover:text-slate-400 transition-colors">Cookies</a>
            <a href="#security" className="hover:text-slate-400 transition-colors">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
