import React, { useState } from 'react';
import { X, Handshake, MapPin, Calendar, IndianRupee, ShieldCheck } from 'lucide-react';
import { DealAgreement, ConversationProduct } from '../../types/chat.types';
import { formatINR } from '../../utils/helpers';

interface AgreeDealModalProps {
  product?: ConversationProduct | null;
  peerName: string;
  onClose: () => void;
  onSubmitDeal: (deal: DealAgreement) => void;
}

export const AgreeDealModal: React.FC<AgreeDealModalProps> = ({
  product,
  peerName,
  onClose,
  onSubmitDeal,
}) => {
  const [agreedPrice, setAgreedPrice] = useState<number>(product?.price || 0);
  const [meetLocation, setMeetLocation] = useState('Promenade Beach (Gandhi Statue), White Town, Puducherry');
  const [meetTime, setMeetTime] = useState('Tomorrow around 5:00 PM');
  const [customTerms, setCustomTerms] = useState('');

  const generateHandshakeOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetLocation.trim()) return;

    const deal: DealAgreement = {
      productTitle: product?.title || 'Listing',
      agreedPrice: agreedPrice > 0 ? agreedPrice : (product?.price || 0),
      meetLocation: meetLocation.trim(),
      meetTime: meetTime.trim() || undefined,
      status: 'agreed',
      handshakeCode: generateHandshakeOTP(),
    };

    onSubmitDeal(deal);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <Handshake className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight">Lock In Deal Agreement</h3>
              <p className="text-[11px] text-emerald-100">Set final price & safe meetup point with {peerName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {product && (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center gap-3">
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-12 h-12 object-cover rounded-xl border border-slate-200"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-900 truncate">{product.title}</h4>
                <p className="text-[11px] text-slate-500">
                  Listing price: <span className="font-bold text-slate-700">{formatINR(product.price)}</span>
                </p>
              </div>
            </div>
          )}

          {/* Agreed Price */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span>Final Agreed Price (₹)</span>
              <span className="text-[10px] text-emerald-600 font-semibold">Mutual Agreement</span>
            </label>
            <div className="relative">
              <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                value={agreedPrice}
                onChange={(e) => setAgreedPrice(Number(e.target.value))}
                min={1}
                required
                className="w-full text-xs font-bold pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          {/* Meetup Location */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Public Meetup Location & Landmark
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 -translate-y-1/2" />
              <input
                type="text"
                value={meetLocation}
                onChange={(e) => setMeetLocation(e.target.value)}
                placeholder="e.g. Phoenix Mall Food Court, Anna Nagar Metro"
                required
                className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            {/* Quick preset locations */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {[
                'Phoenix Marketcity, Velachery',
                'Anna Nagar Metro Station',
                'Express Avenue Mall, Royapettah',
                'Forum Vijaya Mall, Vadapalani',
              ].map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setMeetLocation(loc)}
                  className="text-[10px] bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 text-slate-600 font-medium px-2 py-1 rounded-lg border border-slate-200 transition-colors"
                >
                  {loc.split(',')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Proposed Meetup Date/Time */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Proposed Date & Time
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={meetTime}
                onChange={(e) => setMeetTime(e.target.value)}
                placeholder="e.g. Today at 6:00 PM, Tomorrow afternoon"
                className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          {/* Safety Tip Notice */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-start gap-2.5 text-emerald-950 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>
              A unique 4-digit verification code will be generated for in-person handshake verification.
            </span>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Handshake className="w-4 h-4" />
              <span>Confirm & Send</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
