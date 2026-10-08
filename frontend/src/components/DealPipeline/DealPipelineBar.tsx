import React from 'react';
import { MessageSquare, Tag, Handshake, CheckCircle2, Star, ArrowRight } from 'lucide-react';
import { formatINR } from '../../utils/helpers';
import { ChatOffer, DealAgreement } from '../../types/chat.types';

export type DealStage = 'inquiry' | 'offer_pending' | 'deal_agreed' | 'completed';

interface DealPipelineBarProps {
  stage: DealStage;
  latestOffer?: ChatOffer | null;
  dealAgreement?: DealAgreement | null;
  isSeller: boolean;
  onMakeOffer?: () => void;
  onLockDeal?: () => void;
  onCounterOffer?: (amount?: number) => void;
  onCompleteAndReview?: () => void;
}

export const DealPipelineBar: React.FC<DealPipelineBarProps> = ({
  stage,
  latestOffer,
  dealAgreement,
  isSeller,
  onMakeOffer,
  onLockDeal,
  onCounterOffer,
  onCompleteAndReview,
}) => {
  const steps = [
    {
      id: 'inquiry',
      label: 'Inquiry',
      icon: MessageSquare,
      done: true,
      active: stage === 'inquiry',
    },
    {
      id: 'offer',
      label: latestOffer ? (latestOffer.status === 'accepted' ? 'Offer Accepted' : 'Offer Placed') : 'Negotiate',
      icon: Tag,
      done: stage === 'offer_pending' || stage === 'deal_agreed' || stage === 'completed',
      active: stage === 'offer_pending',
    },
    {
      id: 'deal',
      label: 'Deal Locked',
      icon: Handshake,
      done: stage === 'deal_agreed' || stage === 'completed',
      active: stage === 'deal_agreed',
    },
    {
      id: 'complete',
      label: 'Completed',
      icon: Star,
      done: stage === 'completed',
      active: stage === 'completed',
    },
  ];

  return (
    <div className="bg-white border-b border-slate-200/80 px-4 py-2.5 shadow-2xs">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {/* Stepper Progress */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = step.done && !step.active && stage !== 'inquiry';
            return (
              <React.Fragment key={step.id}>
                {idx > 0 && (
                  <div
                    className={`h-0.5 w-3 sm:w-6 rounded-full transition-colors ${
                      step.done ? 'bg-indigo-600' : 'bg-slate-200'
                    }`}
                  />
                )}
                <div
                  className={`flex items-center gap-1 sm:gap-1.5 px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    step.active
                      ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 shadow-2xs'
                      : isCompleted
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-slate-400 bg-slate-50'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      step.active
                        ? 'text-indigo-600 animate-pulse'
                        : isCompleted
                        ? 'text-emerald-600'
                        : 'text-slate-400'
                    }`}
                  />
                  <span className="hidden md:inline">{step.label}</span>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Dynamic Contextual Action based on current stage */}
        <div className="flex items-center gap-2">
          {stage === 'inquiry' && onMakeOffer && (
            <button
              type="button"
              onClick={onMakeOffer}
              className="text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-lg border border-indigo-200 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Tag className="w-3 h-3" />
              <span>Make Offer</span>
            </button>
          )}

          {stage === 'offer_pending' && latestOffer && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-extrabold text-slate-700">
                Active Offer: <span className="text-indigo-600">{formatINR(latestOffer.amount)}</span>
              </span>
              {onCounterOffer && (
                <button
                  type="button"
                  onClick={() => onCounterOffer(latestOffer.amount)}
                  className="text-[10.5px] font-bold text-slate-600 hover:text-indigo-700 bg-slate-100 hover:bg-indigo-50 px-2 py-1 rounded-md transition-colors cursor-pointer"
                >
                  Counter
                </button>
              )}
            </div>
          )}

          {stage === 'deal_agreed' && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{dealAgreement ? formatINR(dealAgreement.agreedPrice) : 'Agreed'}</span>
              </span>
              {onCompleteAndReview && (
                <button
                  type="button"
                  onClick={onCompleteAndReview}
                  className="text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1 rounded-lg shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                  <span>Complete & Rate</span>
                </button>
              )}
            </div>
          )}

          {stage === 'completed' && (
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Deal Completed & Rated</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
