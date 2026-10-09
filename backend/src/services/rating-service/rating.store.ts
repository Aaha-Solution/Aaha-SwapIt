import fs from 'fs';
import path from 'path';
import { Review, RatingSummary } from './rating.types.js';

const STORE_PATH = path.resolve(process.cwd(), 'reviews_store.json');

export const inMemoryReviews: Review[] = [];

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

  const averageRating = totalReviews > 0 ? Number((sum / totalReviews).toFixed(1)) : 0;

  const breakdownPercentages = {
    5: totalReviews > 0 ? Math.round((breakdown[5] / totalReviews) * 100) : 0,
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
    averageRating,
    totalReviews,
    breakdown,
    breakdownPercentages,
    topTags,
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
