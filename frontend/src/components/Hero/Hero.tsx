import React from 'react';
import { useSelector } from 'react-redux';
import { ShieldCheck, MapPin, Leaf, Sparkles } from 'lucide-react';
import { RootState } from '../../store/store';
import './Hero.css';

export const Hero: React.FC = () => {
  const { selectedCity } = useSelector((state: RootState) => state.user);
  const city = selectedCity || 'Pondicherry';

  return (
    <section className="marketplace-hero-banner" aria-label="Marketplace Banner">
      {/* Decorative ambient background accents */}
      <div className="hero-decor-orb-1" aria-hidden="true" />
      <div className="hero-decor-orb-2" aria-hidden="true" />

      {/* Left Column: Heading, Subtitle & Trust Badges */}
      <div className="hero-left-col">
        {/* Top Location / Trust Pill Badge */}
        <div className="hero-trust-pill">
          <Sparkles className="hero-pill-icon" size={14} />
          <span>{city}'s Trusted Marketplace</span>
        </div>

        {/* Primary Headline */}
        <h1 className="hero-main-title">
          Find Anything <br />
          <span className="hero-title-highlight">Near You</span>
        </h1>

        {/* Secondary Subtitle */}
        <p className="hero-description">
          Buy, sell or swap from cars, bikes, mobiles, laptops, properties,
          furniture and more — all in your city.
        </p>

        {/* 3 Trust & Value Badges in Horizontal Row */}
        <div className="hero-features-row">
          {/* Badge 1: Trusted Community */}
          <div className="hero-feature-item">
            <div className="hero-feature-icon-box blue-box">
              <ShieldCheck size={18} className="text-blue-600" />
            </div>
            <div className="hero-feature-text">
              <span className="hero-feature-title">Trusted Community</span>
              <span className="hero-feature-sub">Safe &amp; secure deals</span>
            </div>
          </div>

          {/* Badge 2: Local Listings */}
          <div className="hero-feature-item">
            <div className="hero-feature-icon-box blue-box">
              <MapPin size={18} className="text-blue-600" />
            </div>
            <div className="hero-feature-text">
              <span className="hero-feature-title">Local Listings</span>
              <span className="hero-feature-sub">Find great deals near you</span>
            </div>
          </div>

          {/* Badge 3: Buy • Sell • Reuse */}
          <div className="hero-feature-item">
            <div className="hero-feature-icon-box green-box">
              <Leaf size={18} className="text-emerald-600" />
            </div>
            <div className="hero-feature-text">
              <span className="hero-feature-title">Buy • Sell • Reuse</span>
              <span className="hero-feature-sub">A greener tomorrow</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Exact Visual Artwork from Uploaded Image */}
      <div className="hero-right-col">
        <div className="hero-artwork-frame">
          <img
            src="/images/hero_deals_artwork.png"
            alt={`Great deals Closer to you in ${city}`}
            className="hero-artwork-visual"
            loading="eager"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
