import React, { useState, useEffect } from 'react';
import { X, Star, ShieldCheck, CheckCircle2, MessageSquarePlus, Clock, Zap } from 'lucide-react';
import { ratingApi } from '../../api/rating.api';
import { Review, RatingSummary } from '../../types/rating.types';
import { StarRating } from './StarRating';
import { RatingBreakdown } from './RatingBreakdown';
import { ReviewCard } from './ReviewCard';
import { WriteReviewModal } from './WriteReviewModal';

interface SellerReviewsModalProps {
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  verified?: boolean;
  memberSince?: string;
  productId?: string;
  productTitle?: string;
  onClose: () => void;
}

export const SellerReviewsModal: React.FC<SellerReviewsModalProps> = ({
  sellerId,
  sellerName,
  sellerAvatar,
  verified = true,
  memberSince = 'Sep 2024',
  productId,
  productTitle,
  onClose,
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<RatingSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [filterStar, setFilterStar] = useState<number | null>(null);

  useEffect(() => {
    async function loadReviews() {
      setIsLoading(true);
      try {
        const res = await ratingApi.getUserReviews(sellerId);
        if (res.success && res.data) {
          setReviews(res.data.reviews);
          setSummary(res.data.summary);
        }
      } catch (err) {
        console.error('Failed to load reviews:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadReviews();
  }, [sellerId]);

  const handleReviewSubmitted = (data: { review: Review; summary: RatingSummary }) => {
    setReviews((prev) => [data.review, ...prev]);
    setSummary(data.summary);
  };

  const filteredReviews = filterStar
    ? reviews.filter((r) => Math.round(r.rating) === filterStar)
    : reviews;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Seller Trust & Reviews</h2>
              <p className="text-[11px] text-slate-400">Verified buyer feedback and performance reputation</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Seller Overview Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/60 border border-indigo-100/70">
            <div className="flex items-center gap-4">
              {sellerAvatar ? (
                <img
                  src={sellerAvatar}
                  alt={sellerName}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-200 shadow-sm"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-bold flex items-center justify-center text-lg shadow-sm">
                  {sellerName.charAt(0)}
                </div>
              )}
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-base font-extrabold text-slate-900">{sellerName}</h3>
                  {verified && (
                    <span className="flex items-center gap-0.5 text-[10px] text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-full font-bold">
                      <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                      Verified
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Member since {memberSince}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                    <Zap className="w-3.5 h-3.5" />
                    100% Response Rate
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsWriteModalOpen(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-100 transition-all flex items-center justify-center gap-1.5 flex-shrink-0 cursor-pointer"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Write a Review</span>
            </button>
          </div>

          {/* Rating Summary & Breakdown Grid */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-5 p-5 rounded-2xl bg-slate-50/70 border border-slate-100">
              {/* Left Score Box */}
              <div className="md:col-span-2 flex flex-col items-center justify-center text-center p-3 sm:border-r border-slate-200/60">
                <span className="text-4xl font-black text-slate-900 tracking-tight">
                  {summary.averageRating.toFixed(1)}
                </span>
                <div className="mt-1.5 mb-1">
                  <StarRating rating={summary.averageRating} size="md" />
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  Based on {summary.totalReviews} {summary.totalReviews === 1 ? 'review' : 'verified reviews'}
                </span>

                <div className="mt-3 flex flex-wrap justify-center gap-1">
                  {summary.topTags.slice(0, 3).map((t, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-semibold"
                    >
                      ✓ {t.tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right Bars */}
              <div className="md:col-span-3 flex items-center">
                <RatingBreakdown
                  breakdown={summary.breakdown}
                  percentages={summary.breakdownPercentages}
                  totalReviews={summary.totalReviews}
                />
              </div>
            </div>
          )}

          {/* Reviews List & Star Filter Tabs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Buyer Feedback ({filteredReviews.length})
              </h4>

              {/* Filter chips */}
              <div className="flex items-center gap-1 overflow-x-auto py-1">
                <button
                  type="button"
                  onClick={() => setFilterStar(null)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    filterStar === null
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All
                </button>
                {[5, 4, 3, 2, 1].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFilterStar(filterStar === s ? null : s)}
                    className={`text-xs px-2 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      filterStar === s
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>{s}</span>
                    <Star className="w-3 h-3 fill-current" />
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            {isLoading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-24 bg-slate-50 rounded-2xl"></div>
                <div className="h-24 bg-slate-50 rounded-2xl"></div>
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="text-center py-10 bg-slate-50/50 rounded-2xl border border-slate-100">
                <p className="text-xs text-slate-500">
                  {filterStar
                    ? `No ${filterStar}-star reviews yet.`
                    : 'No reviews for this seller yet. Be the first to leave one!'}
                </p>
                <button
                  type="button"
                  onClick={() => setIsWriteModalOpen(true)}
                  className="mt-3 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl"
                >
                  Write the First Review
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredReviews.map((rev) => (
                  <ReviewCard key={rev.id} review={rev} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Write Review Modal Overlay */}
        {isWriteModalOpen && (
          <WriteReviewModal
            targetUserId={sellerId}
            targetUserName={sellerName}
            targetUserAvatar={sellerAvatar}
            productId={productId}
            productTitle={productTitle}
            onClose={() => setIsWriteModalOpen(false)}
            onSuccess={handleReviewSubmitted}
          />
        )}
      </div>
    </div>
  );
};
