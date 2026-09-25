import React, { useState } from 'react';
import { X, Star, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { ratingApi } from '../../api/rating.api';
import { Review, RatingSummary } from '../../types/rating.types';

interface WriteReviewModalProps {
  targetUserId: string;
  targetUserName: string;
  targetUserAvatar?: string;
  productId?: string;
  productTitle?: string;
  onClose: () => void;
  onSuccess: (data: { review: Review; summary: RatingSummary }) => void;
}

const POPULAR_TAGS = [
  'Item as Described',
  'Fast Delivery',
  'Quick Responder',
  'Fair Price',
  'Polite & Trustworthy',
  'Smooth Swap',
  'Great Packaging',
  'Punctual',
];

const RATING_LABELS: Record<number, { text: string; color: string; desc: string }> = {
  5: { text: 'Outstanding!', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', desc: 'Flawless communication, genuine item & smooth deal.' },
  4: { text: 'Very Good', color: 'text-indigo-600 bg-indigo-50 border-indigo-200', desc: 'Good experience, item arrived as expected.' },
  3: { text: 'Average', color: 'text-amber-600 bg-amber-50 border-amber-200', desc: 'Okay transaction with some minor hiccups.' },
  2: { text: 'Below Expectations', color: 'text-orange-600 bg-orange-50 border-orange-200', desc: 'Delays or condition didn’t fully match.' },
  1: { text: 'Poor Experience', color: 'text-red-600 bg-red-50 border-red-200', desc: 'Significant issues during transaction.' },
};

export const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
  targetUserId,
  targetUserName,
  targetUserAvatar,
  productId,
  productTitle,
  onClose,
  onSuccess,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Item as Described', 'Fast Delivery']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeRating = hoverRating !== null ? hoverRating : rating;
  const ratingInfo = RATING_LABELS[activeRating] || RATING_LABELS[5];

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please write a few words about your experience with this seller.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const res = await ratingApi.submitReview({
        targetUserId,
        rating,
        comment: comment.trim(),
        tags: selectedTags,
        productId,
        productTitle,
      });

      if (res.success && res.data) {
        onSuccess(res.data);
        onClose();
      } else {
        setError(res.message || 'Failed to submit review. Please try again.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error submitting review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Leave a Review & Rating</h2>
              <p className="text-[11px] text-slate-400">Share your swap / purchase experience</p>
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

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Target Seller Summary */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100/60">
            {targetUserAvatar ? (
              <img
                src={targetUserAvatar}
                alt={targetUserName}
                className="w-11 h-11 rounded-2xl object-cover ring-2 ring-white shadow-sm"
              />
            ) : (
              <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                {targetUserName.charAt(0)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <span className="text-[11px] text-indigo-600 font-bold uppercase tracking-wider block">
                Reviewing Seller
              </span>
              <h4 className="text-sm font-bold text-slate-900 truncate">{targetUserName}</h4>
              {productTitle && (
                <span className="text-xs text-slate-500 truncate block">
                  For: {productTitle}
                </span>
              )}
            </div>
          </div>

          {/* Error notice */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Interactive Star Rating Selector */}
          <div className="space-y-2 text-center py-2">
            <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
              Your Overall Rating
            </label>

            <div className="flex items-center justify-center gap-2 py-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="p-1 cursor-pointer hover:scale-125 transition-transform focus:outline-none"
                >
                  <Star
                    className={`w-9 h-9 transition-colors ${
                      star <= activeRating
                        ? 'text-amber-400 fill-amber-400 drop-shadow-md'
                        : 'text-slate-200 fill-slate-100'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Dynamic Sentiment label */}
            <div className="pt-1">
              <span
                className={`inline-block text-xs font-extrabold px-3 py-1 rounded-full border ${ratingInfo.color}`}
              >
                {ratingInfo.text} ({activeRating} / 5 Stars)
              </span>
              <p className="text-[11px] text-slate-400 mt-1">{ratingInfo.desc}</p>
            </div>
          </div>

          {/* Quick Tags Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
              What went well? (Select all that apply)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    className={`text-xs px-3 py-1.5 rounded-xl font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {isSelected ? `✓ ${tag}` : `+ ${tag}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comment Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Detailed Feedback
              </label>
              <span className="text-[10px] text-slate-400">{comment.length}/500 chars</span>
            </div>
            <textarea
              rows={4}
              maxLength={500}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell others about the item condition, communication speed, punctuality, and overall swap experience..."
              className="w-full text-xs sm:text-sm p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-slate-800 transition-all resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-100 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Post Review</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
