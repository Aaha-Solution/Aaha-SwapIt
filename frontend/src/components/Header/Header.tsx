import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, User as UserIcon, Heart, Package, LogOut } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useAuth } from '../../hooks/useAuth';
import { SearchBar } from '../SearchBar/SearchBar';
import { NotificationDropdown } from '../NotificationDropdown/NotificationDropdown';
import { openPostAdModal } from '../../store/slices/userSlice';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated, openLoginModal, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePostAdClick = () => {
    if (!isAuthenticated) {
      openLoginModal();
    } else {
      dispatch(openPostAdModal());
    }
  };

  return (
    <header className="app-header">
      <div className="header-container">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo">
          <div className="logo-icon-wrap">
            <svg className="logo-icon" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="16" r="8" stroke="url(#head-logo-1)" strokeWidth="4.5" strokeLinecap="round"/>
              <circle cx="21" cy="16" r="8" stroke="url(#head-logo-2)" strokeWidth="4.5" strokeLinecap="round"/>
              <path d="M16 11L18 8L16 5" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 21L14 24L16 27" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="head-logo-1" x1="3" y1="8" x2="19" y2="24" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#1d4ed8"/>
                  <stop offset="1" stopColor="#3b82f6"/>
                </linearGradient>
                <linearGradient id="head-logo-2" x1="13" y1="8" x2="29" y2="24" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#4f46e5"/>
                  <stop offset="1" stopColor="#7c3aed"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="logo-text-group">
            <span className="logo-title">
              Swap<span className="logo-accent">It</span>
            </span>
            <span className="logo-tagline">Buy • Sell • Reuse</span>
          </div>
        </Link>

        {/* Global Search Bar */}
        <div style={{ flex: 1, maxWidth: '620px' }}>
          <SearchBar onSearchSubmit={() => navigate('/products')} />
        </div>

        {/* Right Actions */}
        <div className="header-actions">
          {isAuthenticated && <NotificationDropdown />}

          {isAuthenticated && user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  borderRadius: '9999px',
                  background: '#f1f5f9',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <img
                  src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt={user.name}
                  style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                  {user.name}
                </span>
              </button>

              {isUserMenuOpen && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 8px)',
                  width: '200px',
                  background: '#ffffff',
                  borderRadius: '14px',
                  boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.15)',
                  border: '1px solid #e2e8f0',
                  padding: '8px 0',
                  zIndex: 1000,
                }}>
                  <div style={{ padding: '8px 16px', borderBottom: '1px solid #f1f5f9' }}>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{user.name}</p>
                    <p style={{ fontSize: '11px', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 16px', fontSize: '12.5px', color: '#334155', textDecoration: 'none' }}
                  >
                    <UserIcon style={{ width: '15px', height: '15px', color: '#64748b' }} />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 16px', fontSize: '12.5px', color: '#334155', textDecoration: 'none' }}
                  >
                    <Package style={{ width: '15px', height: '15px', color: '#64748b' }} />
                    <span>My Listings</span>
                  </Link>
                  <Link
                    to="/wishlist"
                    onClick={() => setIsUserMenuOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 16px', fontSize: '12.5px', color: '#334155', textDecoration: 'none' }}
                  >
                    <Heart style={{ width: '15px', height: '15px', color: '#64748b' }} />
                    <span>Saved Favorites</span>
                  </Link>
                  <div style={{ margin: '4px 0', borderTop: '1px solid #f1f5f9' }}></div>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setIsUserMenuOpen(false);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 16px',
                      fontSize: '12.5px',
                      color: '#dc2626',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <LogOut style={{ width: '15px', height: '15px', color: '#dc2626' }} />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={openLoginModal}
              className="btn-login"
            >
              Login
            </button>
          )}

          {/* Post an Ad Button */}
          <button
            type="button"
            onClick={handlePostAdClick}
            className="btn-post-ad"
          >
            <span className="plus-sign">+</span>
            <span>Post an Ad</span>
          </button>
        </div>
      </div>
    </header>
  );
};
