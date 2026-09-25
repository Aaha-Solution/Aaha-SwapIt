export interface Review {
  id: string;
  targetUserId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar?: string;
  rating: number; // 1 to 5
  comment: string;
  tags?: string[];
  productId?: string;
  productTitle?: string;
  helpfulCount: number;
  helpfulUserIds?: string[];
  createdAt: string;
}

export interface RatingBreakdown {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
}

export interface RatingSummary {
  userId: string;
  averageRating: number;
  totalReviews: number;
  breakdown: RatingBreakdown;
  breakdownPercentages: RatingBreakdown;
  topTags: { tag: string; count: number }[];
  responseRate: string;
  verifiedSeller: boolean;
  memberSince: string;
}

export interface CreateReviewDTO {
  targetUserId: string;
  rating: number;
  comment: string;
  tags?: string[];
  productId?: string;
  productTitle?: string;
}
