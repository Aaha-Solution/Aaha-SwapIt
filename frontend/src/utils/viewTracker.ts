const VIEWED_ADS_KEY = 'swapit_viewed_ad_ids';

/**
 * Checks if the current user/browser session has already viewed this product.
 * If not viewed, marks it as viewed and returns true (indicating this is a new unique view).
 * If already viewed, returns false (view count should NOT increment again).
 */
export function markProductViewedIfNew(productId: string): boolean {
  if (!productId) return false;
  try {
    const raw = localStorage.getItem(VIEWED_ADS_KEY);
    const viewedIds: string[] = raw ? JSON.parse(raw) : [];
    if (!viewedIds.includes(productId)) {
      viewedIds.push(productId);
      // Keep up to 500 recent viewed product IDs to prevent storage bloat
      localStorage.setItem(VIEWED_ADS_KEY, JSON.stringify(viewedIds.slice(-500)));
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
