import { Product } from '../types/product.types';

const STORAGE_KEY = 'swapit_recently_viewed';
const EVENT_NAME = 'swapit_recently_viewed_changed';

export function getRecentlyViewed(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Filter out legacy mock data
        const valid = parsed.filter((p) => p && p.id && !p.id.startsWith('prod-rv-'));
        if (valid.length !== parsed.length) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
        }
        return valid;
      }
    }
  } catch {}
  return [];
}

export function addRecentlyViewed(product: Product): void {
  try {
    if (!product || !product.id || product.id.startsWith('prod-rv-')) return;
    const current = getRecentlyViewed();
    const filtered = current.filter((p) => p.id !== product.id);
    const updated = [product, ...filtered].slice(0, 20);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: updated }));
  } catch {}
}

export function removeRecentlyViewed(productId: string): Product[] {
  try {
    const current = getRecentlyViewed();
    const updated = current.filter((p) => p.id !== productId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: updated }));
    return updated;
  } catch {
    return [];
  }
}

export function clearRecentlyViewed(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: [] }));
  } catch {}
}

export function subscribeRecentlyViewed(callback: (items: Product[]) => void): () => void {
  const handler = (e: Event) => {
    const custom = e as CustomEvent<Product[]>;
    callback(custom.detail || getRecentlyViewed());
  };
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}
