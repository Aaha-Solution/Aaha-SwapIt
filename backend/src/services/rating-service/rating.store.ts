import fs from 'fs';
import path from 'path';
import { Review, RatingSummary } from './rating.types.js';

const STORE_PATH = path.resolve(process.cwd(), 'reviews_store.json');

export const inMemoryReviews: Review[] = [
  {
    id: 'rev-1',
    targetUserId: 'usr-demo-iyyanar',
    reviewerId: 'usr-buyer-priya',
    reviewerName: 'Priya Sharma',
    reviewerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    rating: 5,
    comment: 'Super fast communication! The item condition was exactly as described, properly packed and tested. Deal went very smooth.',
    tags: ['Item as Described', 'Fast Delivery', 'Great Communication'],
    productId: 'prod-1',
    productTitle: 'Apple MacBook Air M1',
    helpfulCount: 4,
    helpfulUserIds: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: 'rev-2',
    targetUserId: 'usr-demo-iyyanar',
    reviewerId: 'usr-buyer-arun',
    reviewerName: 'Arun Kumar',
    reviewerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    rating: 5,
    comment: 'Very polite and punctual seller. Even provided the original bill and warranty card. Highly recommended for genuine deals!',
    tags: ['Verified Genuine', 'Punctual', 'Fair Price'],
    productId: 'prod-2',
    productTitle: 'Sony WH-1000XM4 Headphones',
    helpfulCount: 2,
    helpfulUserIds: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    id: 'rev-3',
    targetUserId: 'usr-demo-iyyanar',
    reviewerId: 'usr-buyer-kavitha',
    reviewerName: 'Kavitha Raman',
    reviewerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    rating: 4,
    comment: 'Good transaction overall. Answered all my questions promptly and accepted a reasonable offer.',
    tags: ['Quick Responder', 'Friendly Seller'],
    productId: 'prod-3',
    productTitle: 'Canon EOS 1500D DSLR Camera',
    helpfulCount: 1,
    helpfulUserIds: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
  },
  {
    id: 'rev-4',
    targetUserId: 'usr-seller-2',
    reviewerId: 'usr-demo-iyyanar',
    reviewerName: 'Iyyanar',
    reviewerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    rating: 5,
    comment: 'Awesome experience swapping devices. Everything was clean and ready to use.',
    tags: ['Seamless Swap', 'Item as Described'],
    productId: 'prod-4',
    productTitle: 'iPad Air 5th Gen',
    helpfulCount: 3,
    helpfulUserIds: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
];

// Load persisted reviews from disk if exists
try {
  if (fs.existsSync(STORE_PATH)) {
    const raw = fs.readFileSync(STORE_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      inMemoryReviews.length = 0;
      inMemoryReviews.push(...parsed);
    }
  }
} catch {
  // Ignore filesystem read error
}

function persistStore() {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(inMemoryReviews, null, 2), 'utf-8');
  } catch {
    // Ignore filesystem write error
  }
}

export function getReviewsByTargetUserId(targetUserId: string): Review[] {
  return inMemoryReviews
    .filter((r) => r.targetUserId === targetUserId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function calculateRatingSummary(targetUserId: string): RatingSummary {
  const reviews = getReviewsByTargetUserId(targetUserId);
  const totalReviews = reviews.length;

  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const tagMap = new Map<string, number>();

  let sum = 0;
  for (const rev of reviews) {
    const r = Math.min(5, Math.max(1, Math.round(rev.rating)));
    breakdown[r as 1 | 2 | 3 | 4 | 5] = (breakdown[r as 1 | 2 | 3 | 4 | 5] || 0) + 1;
    sum += rev.rating;

    if (rev.tags && Array.isArray(rev.tags)) {
      for (const t of rev.tags) {
        tagMap.set(t, (tagMap.get(t) || 0) + 1);
      }
    }
  }

  const averageRating = totalReviews > 0 ? Number((sum / totalReviews).toFixed(1)) : 5.0;

  const breakdownPercentages = {
    5: totalReviews > 0 ? Math.round((breakdown[5] / totalReviews) * 100) : 100,
    4: totalReviews > 0 ? Math.round((breakdown[4] / totalReviews) * 100) : 0,
    3: totalReviews > 0 ? Math.round((breakdown[3] / totalReviews) * 100) : 0,
    2: totalReviews > 0 ? Math.round((breakdown[2] / totalReviews) * 100) : 0,
    1: totalReviews > 0 ? Math.round((breakdown[1] / totalReviews) * 100) : 0,
  };

  const topTags = Array.from(tagMap.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return {
    userId: targetUserId,
    averageRating: totalReviews > 0 ? averageRating : 4.9,
    totalReviews,
    breakdown,
    breakdownPercentages,
    topTags: topTags.length > 0 ? topTags : [
      { tag: 'Item as Described', count: 5 },
      { tag: 'Fast Delivery', count: 4 },
      { tag: 'Quick Responder', count: 3 },
      { tag: 'Fair Price', count: 3 },
    ],
    responseRate: '100%',
    verifiedSeller: true,
    memberSince: 'Sep 2024',
  };
}

export function addReviewToStore(review: Review): Review {
  inMemoryReviews.unshift(review);
  persistStore();
  return review;
}

export function toggleHelpfulInStore(reviewId: string, userId: string): { helpfulCount: number; isHelpful: boolean } | null {
  const rev = inMemoryReviews.find((r) => r.id === reviewId);
  if (!rev) return null;

  if (!rev.helpfulUserIds) rev.helpfulUserIds = [];
  const idx = rev.helpfulUserIds.indexOf(userId);

  if (idx >= 0) {
    rev.helpfulUserIds.splice(idx, 1);
    rev.helpfulCount = Math.max(0, rev.helpfulCount - 1);
    persistStore();
    return { helpfulCount: rev.helpfulCount, isHelpful: false };
  } else {
    rev.helpfulUserIds.push(userId);
    rev.helpfulCount += 1;
    persistStore();
    return { helpfulCount: rev.helpfulCount, isHelpful: true };
  }
}
