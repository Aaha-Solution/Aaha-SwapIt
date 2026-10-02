import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  PackageX,
  Ban,
  FileWarning,
  MessageSquareWarning,
  HelpCircle,
  X,
  CheckCircle2,
  ShieldCheck,
  Lock,
  Sparkles,
} from 'lucide-react';
import { reportApi } from '../../api/report.api';
import { ReportReason, CreateReportDTO } from '../../types/report.types';
import { Product } from '../../types/product.types';
import { useAuth } from '../../hooks/useAuth';

interface ReportModalProps {
  product?: Product;
  sellerId?: string;
  sellerName?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const REASONS: {
  id: ReportReason;
  label: string;
  desc: string;
  icon: React.ElementType;
  badgeColor: string;
}[] = [
  {
    id: 'fraud_scam',
    label: 'Potential Scam / Fraud',
    desc: 'Seller asked for advance payments, OTP, or wire transfers outside SwapIt',
    icon: AlertTriangle,
    badgeColor: 'text-rose-600 bg-rose-50 border-rose-200',
  },
  {
    id: 'counterfeit',
    label: 'Counterfeit or Fake Item',
    desc: 'Item appears to be an unauthorized replica, fake branding, or clone',
    icon: PackageX,
    badgeColor: 'text-amber-600 bg-amber-50 border-amber-200',
  },
  {
    id: 'prohibited_item',
    label: 'Prohibited or Illegal Item',
    desc: 'Restricted weapons, alcohol, prescription drugs, or contraband',
    icon: Ban,
    badgeColor: 'text-red-600 bg-red-50 border-red-200',
  },
  {
    id: 'inaccurate_description',
    label: 'Misleading Description',
    desc: 'Condition, specs, or pictures do not match what is being sold',
    icon: FileWarning,
    badgeColor: 'text-orange-600 bg-orange-50 border-orange-200',
  },
  {
    id: 'harassment',
    label: 'Inappropriate or Abusive Behavior',
    desc: 'Offensive language, harassment, or spamming in communication',
    icon: MessageSquareWarning,
    badgeColor: 'text-purple-600 bg-purple-50 border-purple-200',
  },
  {
    id: 'suspicious_seller',
    label: 'Suspicious Profile',
    desc: 'Fake user profile, impersonation, or unverified contact details',
    icon: ShieldAlert,
    badgeColor: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  {
    id: 'other',
    label: 'Other Safety Concern',
    desc: 'Any other safety or community guideline issue',
    icon: HelpCircle,
    badgeColor: 'text-slate-600 bg-slate-50 border-slate-200',
  },
];

export const ReportModal: React.FC<ReportModalProps> = ({
  product,
  sellerId,
  sellerName,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [selectedReason, setSelectedReason] = useState<ReportReason>('fraud_scam');
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const targetSellerName = sellerName || product?.seller?.name || 'Seller';
  const targetSellerId = sellerId || product?.seller?.id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || description.trim().length < 5) {
      setErrorMsg('Please provide at least 5 characters detailing your safety concern.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const payload: CreateReportDTO = {
      productId: product?.id,
      productTitle: product?.title,
      productPrice: product?.price,
      productImage: product?.imageUrl,
      sellerId: targetSellerId,
      sellerName: targetSellerName,
      reason: selectedReason,
      description: description.trim(),
      reporterEmail: contactEmail.trim() || undefined,
    };

    const res = await reportApi.submitReport(payload);
    setIsSubmitting(false);

    if (res.success) {
      setIsSuccess(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        setIsSuccess(false);
        setDescription('');
        onClose();
      }, 2200);
    } else {
      setErrorMsg(res.error || 'Failed to submit report. Please try again.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-rose-50 via-amber-50 to-orange-50 border-b border-rose-100/70 flex items-start justify-between relative">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-200 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Trust & Safety Report
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Flagging {product ? `"${product.title.slice(0, 30)}..."` : targetSellerName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        {isSuccess ? (
          <div className="p-8 sm:p-10 flex flex-col items-center text-center space-y-4 animate-scale-up">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">
              Report Submitted for Review
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 max-w-sm leading-relaxed">
              Our Trust & Safety moderators have been notified. We investigate all fraud reports promptly to protect our community.
            </p>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Thank you for keeping SwapIt safe</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Select Reason */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Select Reason for Concern
              </label>
              <div className="space-y-2">
                {REASONS.map((r) => {
                  const Icon = r.icon;
                  const isSelected = selectedReason === r.id;
                  return (
                    <div
                      key={r.id}
                      onClick={() => setSelectedReason(r.id)}
                      className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? 'border-rose-500 bg-rose-50/40 shadow-sm'
                          : 'border-slate-100 bg-slate-50/60 hover:border-slate-200 hover:bg-white'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${r.badgeColor}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-bold ${
                              isSelected ? 'text-rose-900' : 'text-slate-800'
                            }`}
                          >
                            {r.label}
                          </span>
                          <input
                            type="radio"
                            name="reportReason"
                            checked={isSelected}
                            onChange={() => setSelectedReason(r.id)}
                            className="text-rose-600 focus:ring-rose-500 h-3.5 w-3.5 cursor-pointer"
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          {r.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Describe the Issue
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe what happened (e.g., suspicious payment request, mismatched serial number, refusal to meet)..."
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 text-xs sm:text-sm text-slate-800 transition-all outline-none resize-none placeholder:text-slate-400"
              />
              <span className="text-[10px] text-slate-400 block text-right">
                {description.length} characters (min. 5)
              </span>
            </div>

            {/* Reporter Email */}
            {!isAuthenticated && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Your Email (for moderation updates)
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 text-xs text-slate-800 transition-all outline-none placeholder:text-slate-400"
                />
              </div>
            )}

            {/* Safety Reminder Card */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/60 flex items-start gap-2.5 text-[11px] text-amber-900 leading-snug">
              <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">Stay Safe on SwapIt</span>
                Never send advance payments via UPI or wire transfer before inspecting items in person. Always use SwapIt Escrow protection.
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || description.trim().length < 5}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md shadow-rose-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Submit Report</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
