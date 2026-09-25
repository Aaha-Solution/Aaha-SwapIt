import React from 'react';
import { Star } from 'lucide-react';
import { RatingBreakdown as IRatingBreakdown } from '../../types/rating.types';

interface RatingBreakdownProps {
  breakdown: IRatingBreakdown;
  percentages: IRatingBreakdown;
  totalReviews: number;
}

export const RatingBreakdown: React.FC<RatingBreakdownProps> = ({
  breakdown,
  percentages,
  totalReviews,
}) => {
  const stars: (5 | 4 | 3 | 2 | 1)[] = [5, 4, 3, 2, 1];

  return (
    <div className="space-y-2 w-full">
      {stars.map((star) => {
        const count = breakdown[star] || 0;
        const pct = percentages[star] || 0;

        return (
          <div key={star} className="flex items-center gap-2.5 text-xs">
            <div className="flex items-center gap-1 w-10 text-slate-600 font-semibold justify-end">
              <span>{star}</span>
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            </div>

            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>

            <span className="w-8 text-[11px] text-slate-400 text-right">
              {totalReviews > 0 ? `${pct}%` : '0%'}
            </span>
            <span className="w-6 text-[10px] text-slate-400 text-right font-medium">
              ({count})
            </span>
          </div>
        );
      })}
    </div>
  );
};
