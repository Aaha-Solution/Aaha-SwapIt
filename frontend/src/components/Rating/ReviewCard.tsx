import React, { useState } from 'react';
import { ThumbsUp, CheckCircle2, ShoppingBag } from 'lucide-react';
import { Review } from '../../types/rating.types';
import { StarRating } from './StarRating';
import { ratingApi } from '../../api/rating.api';

interface ReviewCardProps {
  review: Review;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount || 0);
  const [isHelpful, setIsHelpful] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleHelpful = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      const res = await ratingApi.toggleHelpful(review.id);
      if (res.success && res.data) {
        setHelpfulCount(res.data.helpfulCount);
        setIsHelpful(res.data.isHelpful);
      } else {
        // Optimistic toggle
        setIsHelpful((prev) => !prev);
        setHelpfulCount((prev) => (isHelpful ? prev - 1 : prev + 1));
      }
    } catch {
      setIsHelpful((prev) => !prev);
      setHelpfulCount((prev) => (isHelpful ? prev - 1 : prev + 1));
    } finally {
      setIsUpdating(false);
    }
  };

  const formattedDate = new Date(review.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-md transition-all space-y-3">
      {/* Top Header: Reviewer Info + Rating */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {review.reviewerAvatar ? (
            <img
              src={review.reviewerAvatar}
              alt={review.reviewerName}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-50"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
              {review.reviewerName.charAt(0)}
            </div>
          )}

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900">{review.reviewerName}</span>
              <span className="flex items-center gap-0.5 text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded">
                <CheckCircle2 className="w-3 h-3" />
                Verified Buyer
              </span>
            </div>
            <span className="text-[11px] text-slate-400">{formattedDate}</span>
          </div>
        </div>

        <StarRating rating={review.rating} size="sm" />
      </div>

      {/* Product Reference (if any) */}
      {review.productTitle && (
        <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">
          <ShoppingBag className="w-3 h-3 text-indigo-500" />
          <span className="truncate max-w-xs">{review.productTitle}</span>
        </div>
      )}

      {/* Review Comment */}
      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
        {review.comment}
      </p>

      {/* Tags & Helpful Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-50">
        {/* Tags */}
        <div className="flex flex-wrap items-center gap-1.5">
          {review.tags?.map((tag, idx) => (
            <span
              key={idx}
              className="text-[10px] font-bold text-indigo-700 bg-indigo-50/80 px-2 py-0.5 rounded-full border border-indigo-100/50"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Helpful vote button */}
        <button
          type="button"
          onClick={handleHelpful}
          className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
            isHelpful
              ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200'
              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
          }`}
          title="Mark this review as helpful"
        >
          <ThumbsUp className={`w-3.5 h-3.5 ${isHelpful ? 'fill-indigo-600 text-indigo-600' : ''}`} />
          <span>Helpful ({helpfulCount})</span>
        </button>
      </div>
    </div>
  );
};
