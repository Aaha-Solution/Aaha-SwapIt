import React from 'react';
import { Category } from '../../types/category.types';

interface CategoryCardProps {
  category: Category;
  isSelected?: boolean;
  onClick: (slug: string) => void;
}

const TINT_CLASSES: Record<string, string> = {
  cars: 'tint-red',
  bikes: 'tint-green',
  mobiles: 'tint-purple',
  laptops: 'tint-cyan',
  properties: 'tint-teal',
  furniture: 'tint-amber',
  electronics: 'tint-slate',
  fashion: 'tint-violet',
  pets: 'tint-cream',
  books: 'tint-sky',
  services: 'tint-light-blue',
  jobs: 'tint-tan',
};

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  isSelected,
  onClick,
}) => {
  const tint = TINT_CLASSES[category.slug] || 'tint-slate';

  return (
    <div
      onClick={() => onClick(category.slug)}
      className={`category-card ${tint} ${isSelected ? 'active-filter' : ''}`}
      style={{
        border: isSelected ? '2px solid #7c3aed' : 'none',
      }}
    >
      <div className="category-img-container">
        {category.imageUrl ? (
          <img
            src={category.imageUrl}
            alt={category.name}
            className="cat-img"
            loading="lazy"
          />
        ) : (
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#e0e7ff',
            color: '#4f46e5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '12px',
          }}>
            {category.name.charAt(0)}
          </div>
        )}
      </div>
      <span className="cat-label">{category.name}</span>
    </div>
  );
};
