import { Product } from '../types/product.types';
import { Category } from '../types/category.types';

export const CITIES = [
  'Puducherry',
  'White Town',
  'Heritage Town',
  'Lawspet',
  'Muthialpet',
  'Reddiarpalayam',
  'Villiyanur',
  'Nellithope',
  'Gorimedu',
  'Mudaliarpet',
  'Ariyankuppam',
  'Thattanchavady',
  'Kalapet',
  'Bahour',
  'Karaikal',
];

export const CATEGORIES: Category[] = [
  { id: 'cars', name: 'Cars', slug: 'cars', imageUrl: '/images/car_red.png', itemCount: 0, featured: true },
  { id: 'bikes', name: 'Bikes', slug: 'bikes', imageUrl: '/images/bike_yamaha.png', itemCount: 0, featured: true },
  { id: 'mobiles', name: 'Mobiles', slug: 'mobiles', imageUrl: '/images/phone_purple.png', itemCount: 0, featured: true },
  { id: 'laptops', name: 'Laptops & Computers', slug: 'laptops', imageUrl: '/images/laptop_macbook.png', itemCount: 0, featured: true },
  { id: 'properties', name: 'Properties', slug: 'properties', imageUrl: '/images/apartment.png', itemCount: 0, featured: true },
  { id: 'furniture', name: 'Furniture', slug: 'furniture', imageUrl: '/images/sofa_brown.png', itemCount: 0, featured: true },
  { id: 'electronics', name: 'Electronics', slug: 'electronics', imageUrl: '/images/camera.png', itemCount: 0, featured: true },
  { id: 'fashion', name: 'Fashion', slug: 'fashion', imageUrl: '/images/fashion.png', itemCount: 0, featured: true },
  { id: 'pets', name: 'Pets', slug: 'pets', imageUrl: '/images/pet.png', itemCount: 0, featured: true },
  { id: 'books', name: 'Books & Hobbies', slug: 'books', imageUrl: '/images/books.png', itemCount: 0, featured: true },
  { id: 'services', name: 'Services', slug: 'services', imageUrl: '/images/services.png', itemCount: 0, featured: true },
  { id: 'jobs', name: 'Jobs', slug: 'jobs', imageUrl: '/images/jobs.png', itemCount: 0, featured: true },
];

export const INITIAL_PRODUCTS: Product[] = [];
