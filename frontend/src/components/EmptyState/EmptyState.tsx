import React from 'react';
import { Plus, Sparkles, MapPin, Compass } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { openPostAdModal, setSelectedCity, setSelectedCategory, resetFilters } from '../../store/slices/userSlice';
import { useNavigate } from 'react-router-dom';

interface EmptyStateProps {
  title?: string;
  subtitle?: string;
  city?: string;
  category?: string;
  searchQuery?: string;
  onPostAd?: () => void;
  showExploreAll?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  subtitle,
  city,
  category,
  searchQuery,
  onPostAd,
  showExploreAll = true,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleOpenPostAd = () => {
    if (onPostAd) {
      onPostAd();
    } else {
      dispatch(openPostAdModal());
    }
  };

  const handleResetFilters = () => {
    dispatch(resetFilters());
    dispatch(setSelectedCity('all'));
    dispatch(setSelectedCategory('all'));
    navigate('/products');
  };

  const heading =
    title ||
    (searchQuery
      ? `No results found for "${searchQuery}"`
      : city && city !== 'all'
      ? `No listings found in ${city} yet`
      : category && category !== 'all'
      ? `No listings in ${category} category yet`
      : 'No products listed yet');

  const subtext =
    subtitle ||
    (searchQuery
      ? 'Try checking for spelling errors or searching with broader keywords.'
      : city && city !== 'all'
      ? `Be the first person to post a pre-owned item or trade in ${city}!`
      : 'Start the marketplace by posting your first second-hand item for swap or sale.');

  return (
    <div
      style={{
        width: '100%',
        minHeight: '340px',
        padding: '44px 24px',
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
        border: '1.5px dashed #cbd5e1',
        borderRadius: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)',
        animation: 'fadeIn 0.3s ease',
      }}
    >
      {/* Animated Floating Graphic Illustration */}
      <div
        style={{
          position: 'relative',
          width: '120px',
          height: '120px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Glowing Background Pulse */}
        <div
          style={{
            position: 'absolute',
            inset: '8px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(241, 245, 249, 0) 70%)',
            animation: 'pulse 2.5s infinite ease-in-out',
          }}
        />

        {/* Floating Animated SVG Illustration */}
        <svg
          width="110"
          height="110"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            filter: 'drop-shadow(0 10px 15px rgba(99, 102, 241, 0.15))',
          }}
        >
          {/* Base Platform */}
          <ellipse cx="60" cy="100" rx="42" ry="10" fill="#e2e8f0" />
          <ellipse cx="60" cy="98" rx="34" ry="7" fill="#cbd5e1" />

          {/* Isometric Package Box */}
          <g>
            {/* Box Front Face */}
            <path
              d="M32 58L60 74V102L32 86V58Z"
              fill="#6366f1"
              opacity="0.9"
            />
            {/* Box Right Face */}
            <path
              d="M60 74L88 58V86L60 102V74Z"
              fill="#4f46e5"
            />
            {/* Box Top Face */}
            <path
              d="M60 42L88 58L60 74L32 58L60 42Z"
              fill="#818cf8"
            />
            {/* Open Flaps */}
            <path
              d="M32 58L22 46L48 34L60 42L32 58Z"
              fill="#a5b4fc"
              opacity="0.8"
            />
            <path
              d="M88 58L98 46L72 34L60 42L88 58Z"
              fill="#c7d2fe"
              opacity="0.8"
            />
            {/* Box Tape / Ribbon Accent */}
            <path
              d="M56 72L64 76V102L56 98V72Z"
              fill="#3730a3"
              opacity="0.5"
            />
          </g>

          {/* Floating Search Magnifier */}
          <g transform="translate(68, 22)">
            <circle cx="16" cy="16" r="12" stroke="#2563eb" strokeWidth="4" fill="#eff6ff" />
            <line x1="25" y1="25" x2="36" y2="36" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" />
            {/* Magnifier glass reflection */}
            <path d="M10 12A6 6 0 0 1 18 10" stroke="#93c5fd" strokeWidth="2.5" strokeLinecap="round" />
          </g>

          {/* Floating Sparkle Stars */}
          <g transform="translate(18, 28)">
            <path
              d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5L6 0Z"
              fill="#f59e0b"
            />
          </g>
          <g transform="translate(94, 78)">
            <path
              d="M4 0L5 3L8 4L5 5L4 8L3 5L0 4L3 3L4 0Z"
              fill="#10b981"
            />
          </g>
        </svg>
      </div>

      {/* Title */}
      <h3
        style={{
          margin: '0 0 8px',
          fontSize: '18px',
          fontWeight: 800,
          color: '#0f172a',
          letterSpacing: '-0.3px',
        }}
      >
        {heading}
      </h3>

      {/* Subtitle */}
      <p
        style={{
          margin: '0 0 24px',
          fontSize: '13px',
          color: '#64748b',
          maxWidth: '420px',
          lineHeight: 1.6,
        }}
      >
        {subtext}
      </p>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          type="button"
          onClick={handleOpenPostAd}
          style={{
            padding: '11px 22px',
            borderRadius: '14px',
            background: '#2563eb',
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
            transition: 'all 0.2s ease',
          }}
        >
          <Plus style={{ width: '16px', height: '16px' }} />
          <span>Post an Ad Now</span>
        </button>

        {showExploreAll && (
          <button
            type="button"
            onClick={handleResetFilters}
            style={{
              padding: '11px 20px',
              borderRadius: '14px',
              background: '#ffffff',
              color: '#334155',
              fontSize: '13px',
              fontWeight: 700,
              border: '1.5px solid #cbd5e1',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
            }}
          >
            <Compass style={{ width: '15px', height: '15px', color: '#64748b' }} />
            <span>Clear Filters & Explore</span>
          </button>
        )}
      </div>
    </div>
  );
};
