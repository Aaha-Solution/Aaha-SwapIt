import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Compass, MapPin, Plus, MessageSquare, User } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { useAuth } from '../../hooks/useAuth';
import { openPostAdModal } from '../../store/slices/userSlice';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { messagesCount } = useSelector((state: RootState) => state.user);
  const { isAuthenticated, user, openLoginModal } = useAuth();

  const pathname = location.pathname;

  const handlePostAd = () => {
    if (!isAuthenticated) {
      openLoginModal();
    } else {
      dispatch(openPostAdModal());
    }
  };

  return (
    <nav className="mobile-bottom-nav">
      <div className="mobile-nav-items">
        {/* 1. Home */}
        <NavLink
          to="/"
          className={({ isActive }) => `mobile-nav-btn ${isActive && pathname === '/' ? 'active' : ''}`}
        >
          <Home size={20} className="mobile-nav-icon" />
          <span className="mobile-nav-label">Home</span>
        </NavLink>

        {/* 2. Explore / Products */}
        <NavLink
          to="/products"
          className={({ isActive }) => `mobile-nav-btn ${isActive ? 'active' : ''}`}
        >
          <Compass size={20} className="mobile-nav-icon" />
          <span className="mobile-nav-label">Explore</span>
        </NavLink>

        {/* 3. Central Post Ad Button */}
        <button
          type="button"
          onClick={handlePostAd}
          className="mobile-post-btn"
          aria-label="Post an Ad"
        >
          <div className="post-btn-glow"></div>
          <Plus size={22} strokeWidth={2.8} className="post-btn-icon" />
        </button>

        {/* 4. Deals Map */}
        <NavLink
          to="/deals-near-me"
          className={({ isActive }) => `mobile-nav-btn ${isActive ? 'active' : ''}`}
        >
          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <MapPin size={20} className="mobile-nav-icon" />
            <span className="mobile-live-dot" />
          </div>
          <span className="mobile-nav-label">Near Me</span>
        </NavLink>

        {/* 5. Messages or Profile */}
        {isAuthenticated ? (
          <NavLink
            to="/messages"
            className={({ isActive }) => `mobile-nav-btn ${isActive ? 'active' : ''}`}
          >
            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquare size={20} className="mobile-nav-icon" />
              {messagesCount > 0 && (
                <span className="mobile-badge-count">{messagesCount > 9 ? '9+' : messagesCount}</span>
              )}
            </div>
            <span className="mobile-nav-label">Chats</span>
          </NavLink>
        ) : (
          <button
            type="button"
            onClick={openLoginModal}
            className="mobile-nav-btn"
          >
            <User size={20} className="mobile-nav-icon" />
            <span className="mobile-nav-label">Login</span>
          </button>
        )}
      </div>
    </nav>
  );
};
