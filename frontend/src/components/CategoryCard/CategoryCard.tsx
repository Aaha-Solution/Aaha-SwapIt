import React, { useState } from 'react';
import {
  Car,
  Bike,
  Smartphone,
  Laptop,
  Building2,
  Armchair,
  Tv,
  Shirt,
  Dog,
  BookOpen,
  Briefcase,
  Wrench,
} from 'lucide-react';
import { Category } from '../../types/category.types';

interface CategoryCardProps {
  category: Category;
  isSelected?: boolean;
  onClick: (slug: string) => void;
}

const CATEGORY_IMAGES: Record<string, { img: string; fallbackIcon: React.ComponentType<{ className?: string }> }> = {
  cars: { img: '/images/car_red.jpg', fallbackIcon: Car },
  bikes: { img: '/images/bike_yamaha.jpg', fallbackIcon: Bike },
  mobiles: { img: '/images/phone_purple.jpg', fallbackIcon: Smartphone },
  laptops: { img: '/images/laptop_macbook.jpg', fallbackIcon: Laptop },
  properties: { img: '/images/apartment.jpg', fallbackIcon: Building2 },
  furniture: { img: '/images/sofa_brown.jpg', fallbackIcon: Armchair },
  electronics: { img: '/images/camera.jpg', fallbackIcon: Tv },
  fashion: { img: '/images/fashion.jpg', fallbackIcon: Shirt },
  pets: { img: '/images/pet.jpg', fallbackIcon: Dog },
  books: { img: '/images/books.jpg', fallbackIcon: BookOpen },
  services: { img: '/images/services.jpg', fallbackIcon: Wrench },
  jobs: { img: '/images/jobs.jpg', fallbackIcon: Briefcase },
};

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  isSelected,
  onClick,
}) => {
  const [imgError, setImgError] = useState(false);
  const meta = CATEGORY_IMAGES[category.slug] || {
    img: category.imageUrl || '/images/camera.jpg',
    fallbackIcon: Building2,
  };
  const FallbackIcon = meta.fallbackIcon;

  return (
    <button
      type="button"
      onClick={() => onClick(category.slug)}
      className={`group relative flex flex-col items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-white border transition-all duration-200 cursor-pointer text-center w-full ${
        isSelected
          ? 'border-blue-600 shadow-md ring-2 ring-blue-500/20 bg-blue-50/10'
          : 'border-slate-200/90 hover:border-slate-400 hover:shadow-md hover:-translate-y-0.5'
      }`}
      style={{
        boxShadow: isSelected ? '0 4px 12px rgba(37, 99, 235, 0.12)' : '0 1px 3px rgba(15, 23, 42, 0.03)',
      }}
    >
      {/* Authentic Product Photo Container */}
      <div className="w-full h-20 sm:h-24 rounded-xl bg-slate-50 overflow-hidden flex items-center justify-center mb-2.5 relative">
        {!imgError ? (
          <img
            src={meta.img}
            alt={category.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
            <FallbackIcon className="w-6 h-6" />
          </div>
        )}
      </div>

      {/* Category Name */}
      <span className="text-xs sm:text-[13px] font-semibold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1 pb-0.5">
        {category.name}
      </span>
    </button>
  );
};
