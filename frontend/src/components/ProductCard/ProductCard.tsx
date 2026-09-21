import React from 'react';
import { Product } from '../../types/product.types';
import { formatINR } from '../../utils/helpers';
import { useWishlist } from '../../hooks/useWishlist';

interface ProductCardProps {
  product: Product;
  onClick?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const { isWishlisted, toggle } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggle(product.id);
  };

  const getBadgeClass = () => {
    switch (product.badge) {
      case 'featured':
        return 'tag-featured';
      case 'good':
        return 'tag-good';
      case 'likenew':
        return 'tag-likenew';
      case 'verified':
        return 'tag-verified';
      case 'brandnew':
        return 'tag-likenew';
      default:
        return 'tag-featured';
    }
  };

  return (
    <article
      onClick={() => onClick && onClick(product)}
      className="listing-card prod-card"
    >
      {/* Image Box */}
      <div className="listing-img-box">
        <img
          src={product.imageUrl}
          alt={product.title}
          className="listing-img"
          loading="lazy"
        />

        {/* Badge Tag */}
        {product.badgeText && (
          <span className={`prod-badge-tag ${getBadgeClass()}`}>
            {product.badgeText}
          </span>
        )}

        {/* Favorite Heart Button */}
        <button
          type="button"
          onClick={handleHeartClick}
          className={`fav-heart-btn ${wishlisted ? 'liked' : ''}`}
          aria-label={wishlisted ? 'Remove from favorites' : 'Add to favorites'}
        >
          <svg
            className="heart-icon"
            viewBox="0 0 24 24"
            fill={wishlisted ? '#ef4444' : 'none'}
            stroke={wishlisted ? '#ef4444' : '#475569'}
          >
            <path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Details */}
      <div className="listing-details">
        <div className="listing-price">{formatINR(product.price)}</div>
        <h3 className="listing-name">{product.title}</h3>
        <div className="listing-meta">
          <span className="meta-city">{product.city}</span> • <span>{product.postedAt}</span>
        </div>
      </div>
    </article>
  );
};
