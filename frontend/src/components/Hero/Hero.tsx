import React from 'react';
import { useSelector } from 'react-redux';
import { Sparkles } from 'lucide-react';
import { RootState } from '../../store/store';
import heroBannerBg from '../../assets/images/hero_banner_full.png';
import './Hero.css';

export const Hero: React.FC = () => {
  const { selectedCity } = useSelector((state: RootState) => state.user);
  const city = selectedCity && selectedCity !== 'all' ? selectedCity : 'Pondicherry';

  return (
    <section
      className="marketplace-hero-banner"
      style={{ backgroundImage: `url(${heroBannerBg})` }}
      aria-label="Marketplace Banner"
    >
      {/* Decorative ambient background accents */}
      <div className="hero-decor-orb-1" aria-hidden="true" />
      <div className="hero-decor-orb-2" aria-hidden="true" />

      {/* Left Column: Heading & Subtitle */}
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
      </div>

      {/* Right Column Spacer: Keeps the background artwork & 'Local Deals Stronger Communities' unobstructed */}
      <div className="hero-right-col" aria-hidden="true" />
    </section>
  );
};

export default Hero;
