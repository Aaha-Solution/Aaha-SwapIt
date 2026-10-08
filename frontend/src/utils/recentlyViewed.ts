import { Product } from '../types/product.types';

const STORAGE_KEY = 'swapit_recently_viewed';
const EVENT_NAME = 'swapit_recently_viewed_changed';

const DEFAULT_RECENT_PRODUCTS: Product[] = [
  {
    id: 'prod-rv-1',
    title: 'Apple iPhone 14 Pro 128GB Space Black',
    price: 58000,
    description: 'Immaculate condition with battery health 94%, box & bill included.',
    category: 'mobiles',
    imageUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&auto=format&fit=crop&q=80'],
    location: 'White Town, Pondicherry',
    city: 'Puducherry',
    postedAt: '2 hours ago',
    condition: 'Like New',
    badge: 'verified',
    seller: {
      id: 'seller-1',
      name: 'Arun Kumar',
      memberSince: 'Jan 2023',
      rating: 4.9,
      verified: true,
    },
  },
  {
    id: 'prod-rv-2',
    title: 'Royal Enfield Meteor 350 Fireball Yellow',
    price: 165000,
    description: '2022 model, 11,200 km driven. Single owner with full service records.',
    category: 'bikes',
    imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=500&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=500&auto=format&fit=crop&q=80'],
    location: 'Lawspet, Pondicherry',
    city: 'Puducherry',
    postedAt: '4 hours ago',
    condition: 'Like New',
    badge: 'featured',
    seller: {
      id: 'seller-2',
      name: 'Vignesh R',
      memberSince: 'Mar 2022',
      rating: 4.8,
      verified: true,
    },
  },
  {
    id: 'prod-rv-3',
    title: 'Sony PlayStation 5 Disc Edition + 2 DualSense',
    price: 42500,
    description: 'Sparingly used PS5 console with Spider-Man 2 & God of War Ragnarok.',
    category: 'electronics',
    imageUrl: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500&auto=format&fit=crop&q=80'],
    location: 'Muthialpet, Pondicherry',
    city: 'Puducherry',
    postedAt: 'Yesterday',
    condition: 'Like New',
    seller: {
      id: 'seller-3',
      name: 'Karthik S',
      memberSince: 'Aug 2023',
      rating: 4.7,
      verified: true,
    },
  },
  {
    id: 'prod-rv-4',
    title: 'MacBook Pro 14" M1 Pro 16GB / 512GB SSD',
    price: 89000,
    description: 'Space Gray, pristine condition with MagSafe charger & original packaging.',
    category: 'electronics',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=80'],
    location: 'Heritage Town, Pondicherry',
    city: 'Puducherry',
    postedAt: 'Yesterday',
    condition: 'Like New',
    badge: 'verified',
    seller: {
      id: 'seller-4',
      name: 'Pooja Narayanan',
      memberSince: 'Nov 2022',
      rating: 5.0,
      verified: true,
    },
  },
  {
    id: 'prod-rv-5',
    title: 'Maruti Suzuki Swift ZXi 2021 Petrol (Red)',
    price: 540000,
    description: 'Single owner, only 28,000 km run, comprehensive insurance valid.',
    category: 'cars',
    imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=500&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=500&auto=format&fit=crop&q=80'],
    location: 'Reddiarpalayam, Pondicherry',
    city: 'Puducherry',
    postedAt: '2 days ago',
    condition: 'Good',
    seller: {
      id: 'seller-5',
      name: 'Manoj Chandran',
      memberSince: 'Feb 2021',
      rating: 4.8,
      verified: true,
    },
  },
  {
    id: 'prod-rv-6',
    title: 'Canon EOS R6 Mark II Mirrorless Camera Body',
    price: 145000,
    description: 'Shutter count under 8k, bill, warranty, 2 extra LP-E6NH batteries.',
    category: 'electronics',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=80'],
    location: 'White Town, Pondicherry',
    city: 'Puducherry',
    postedAt: '2 days ago',
    condition: 'Like New',
    seller: {
      id: 'seller-6',
      name: 'Studio Lenscraft',
      memberSince: 'Jun 2020',
      rating: 4.9,
      verified: true,
    },
  },
  {
    id: 'prod-rv-7',
    title: 'Solid Sheesham Wood 6-Seater Dining Table',
    price: 24000,
    description: 'Handcrafted teak finish table with 6 cushioned chairs, excellent state.',
    category: 'furniture',
    imageUrl: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=500&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1617806118233-18e1de247200?w=500&auto=format&fit=crop&q=80'],
    location: 'Villiyanur, Pondicherry',
    city: 'Puducherry',
    postedAt: '3 days ago',
    condition: 'Good',
    seller: {
      id: 'seller-7',
      name: 'Devika Pillai',
      memberSince: 'Sep 2023',
      rating: 4.6,
      verified: false,
    },
  },
  {
    id: 'prod-rv-8',
    title: 'KTM Duke 390 BS6 (Single Owner, Ceramic Coated)',
    price: 185000,
    description: '2021 Duke 390 with Metzeler tyres, crash guards & quickshifter+.',
    category: 'bikes',
    imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=500&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=500&auto=format&fit=crop&q=80'],
    location: 'Lawspet, Pondicherry',
    city: 'Puducherry',
    postedAt: '3 days ago',
    condition: 'Like New',
    seller: {
      id: 'seller-8',
      name: 'Naveen Kumar',
      memberSince: 'Jul 2022',
      rating: 4.7,
      verified: true,
    },
  },
  {
    id: 'prod-rv-9',
    title: 'Samsung Galaxy S23 Ultra 256GB Green with S-Pen',
    price: 69999,
    description: 'Snapdragon 8 Gen 2, 200MP camera, scratchless screen with Spigen case.',
    category: 'mobiles',
    imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&auto=format&fit=crop&q=80'],
    location: 'Heritage Town, Pondicherry',
    city: 'Puducherry',
    postedAt: '4 days ago',
    condition: 'Like New',
    badge: 'verified',
    seller: {
      id: 'seller-9',
      name: 'Ramesh Babu',
      memberSince: 'Apr 2021',
      rating: 4.9,
      verified: true,
    },
  },
  {
    id: 'prod-rv-10',
    title: 'Dell XPS 15 9520 (Intel i7 12th Gen, 32GB RAM)',
    price: 78000,
    description: 'OLED 3.5K touch display, RTX 3050 Ti, 1TB NVMe SSD. Workstation grade.',
    category: 'electronics',
    imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&auto=format&fit=crop&q=80'],
    location: 'Muthialpet, Pondicherry',
    city: 'Puducherry',
    postedAt: '5 days ago',
    condition: 'Like New',
    seller: {
      id: 'seller-10',
      name: 'Suresh Tech',
      memberSince: 'Jan 2022',
      rating: 4.8,
      verified: true,
    },
  },
  {
    id: 'prod-rv-11',
    title: '2 BHK Furnished Sea-View Apartment White Town',
    price: 22000,
    description: 'Fully furnished with AC, modular kitchen, balcony overlooking the promenade.',
    category: 'properties',
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&auto=format&fit=crop&q=80'],
    location: 'White Town Promenade, Pondicherry',
    city: 'Puducherry',
    postedAt: '5 days ago',
    condition: 'Brand New',
    seller: {
      id: 'seller-11',
      name: 'Oceanic Properties',
      memberSince: 'Jan 2020',
      rating: 5.0,
      verified: true,
    },
  },
  {
    id: 'prod-rv-12',
    title: 'Yamaha FZ-S V3 Bluetooth Edition Matte Black',
    price: 72000,
    description: '2020 model, 16,000 km, single-channel ABS, pristine engine sound.',
    category: 'bikes',
    imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=500&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=500&auto=format&fit=crop&q=80'],
    location: 'Lawspet, Pondicherry',
    city: 'Puducherry',
    postedAt: '6 days ago',
    condition: 'Good',
    seller: {
      id: 'seller-12',
      name: 'Deepak V',
      memberSince: 'Oct 2021',
      rating: 4.5,
      verified: false,
    },
  },
];

export function getRecentlyViewed(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  // Default to 12 items matching initial badge
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_RECENT_PRODUCTS));
  } catch {}
  return DEFAULT_RECENT_PRODUCTS;
}

export function addRecentlyViewed(product: Product): void {
  try {
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
