import React from 'react';
import { Handshake, MapPin, Calendar, ShieldCheck, KeyRound, CheckCircle2 } from 'lucide-react';
import { DealAgreement } from '../../types/chat.types';
import { formatINR } from '../../utils/helpers';

interface ChatDealAgreedCardProps {
  deal: DealAgreement;
  isSender: boolean;
  onCompleteAndReview?: () => void;
}

export const ChatDealAgreedCard: React.FC<ChatDealAgreedCardProps> = ({ deal, isSender, onCompleteAndReview }) => {
  return (
    <div className="my-2 p-4 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50/50 to-emerald-50/20 border-2 border-emerald-300/80 shadow-md max-w-[360px] text-slate-800 transition-all hover:shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
            <Handshake className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wide">
              Deal Agreement Locked
            </h4>
            <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Verified Mutual Agreement
            </span>
          </div>
        </div>
        <span className="text-[10px] font-black bg-emerald-200/80 text-emerald-900 px-2.5 py-1 rounded-full uppercase">
          {deal.status || 'Agreed'}
        </span>
      </div>

      {/* Product & Price */}
      <div className="bg-white/90 backdrop-blur-sm p-3 rounded-xl border border-emerald-200/60 mb-3 shadow-xs">
        <div className="text-[11px] font-bold text-slate-500 truncate mb-1">
          {deal.productTitle || 'Negotiated Listing'}
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] font-semibold text-slate-600">Agreed Price:</span>
          <span className="text-lg font-black text-emerald-700">
            {formatINR(deal.agreedPrice)}
          </span>
        </div>
      </div>

      {/* Meetup Details */}
      <div className="space-y-2 mb-3 text-xs">
        <div className="flex items-start gap-2 bg-emerald-100/50 p-2 rounded-lg text-emerald-950">
          <MapPin className="w-3.5 h-3.5 text-emerald-700 mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-emerald-800 uppercase block">
              Meetup Point:
            </span>
            <span className="text-xs font-semibold">{deal.meetLocation}</span>
          </div>
        </div>

        {deal.meetTime && (
          <div className="flex items-center gap-2 bg-emerald-100/50 p-2 rounded-lg text-emerald-950">
            <Calendar className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
            <div>
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                Proposed Time:
              </span>
              <span className="text-xs font-semibold">{deal.meetTime}</span>
            </div>
          </div>
        )}
      </div>

      {/* Handshake Verification Code */}
      {deal.handshakeCode && (
        <div className="bg-emerald-600 text-white p-2.5 rounded-xl flex items-center justify-between mb-3 shadow-xs">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-emerald-200" />
            <span className="text-[11px] font-bold">Exchange Handshake OTP:</span>
          </div>
          <span className="font-mono text-sm font-black tracking-widest bg-emerald-700/80 px-2 py-0.5 rounded border border-emerald-400">
            {deal.handshakeCode}
          </span>
        </div>
      )}

      {/* Complete & Review Action CTA */}
      {onCompleteAndReview && (
        <button
          type="button"
          onClick={onCompleteAndReview}
          className="w-full mb-2.5 py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>Mark Transaction Completed & Rate</span>
        </button>
      )}

      {/* Safety Notice Footer */}
      <div className="flex items-center gap-1.5 text-[10px] text-emerald-800/90 font-medium pt-1">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
        <span>Inspect the item thoroughly at the meetup before handing over cash.</span>
      </div>
    </div>
  );
};
