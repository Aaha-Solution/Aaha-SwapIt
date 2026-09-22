import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  LayoutGrid,
  Car,
  Bike,
  Smartphone,
  Tv,
  Building2,
  Armchair,
  Shirt,
  Dog,
  BookOpen,
  Briefcase,
  Wrench,
  Package,
  Heart,
  MessageSquare,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { setSelectedCategory, setMessagesCount } from '../../store/slices/userSlice';
import { useWishlist } from '../../hooks/useWishlist';
import { useAuth } from '../../hooks/useAuth';
import { chatApi } from '../../api/chat.api';
import { getSocket, joinUserRoom } from '../../api/socket';

interface NavItem {
  id: string;
  name: string;
  slug: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}

const CATEGORY_ITEMS: NavItem[] = [
  { id: 'cars', name: 'Cars', slug: 'cars', icon: Car },
  { id: 'bikes', name: 'Bikes', slug: 'bikes', icon: Bike },
  { id: 'mobiles', name: 'Mobiles & Tablets', slug: 'mobiles', icon: Smartphone },
  { id: 'electronics', name: 'Electronics', slug: 'electronics', icon: Tv },
  { id: 'properties', name: 'Property', slug: 'properties', icon: Building2 },
  { id: 'furniture', name: 'Furniture', slug: 'furniture', icon: Armchair },
  { id: 'fashion', name: 'Fashion', slug: 'fashion', icon: Shirt },
  { id: 'pets', name: 'Pets', slug: 'pets', icon: Dog },
  { id: 'books', name: 'Books & Hobbies', slug: 'books', icon: BookOpen },
  { id: 'jobs', name: 'Jobs', slug: 'jobs', icon: Briefcase },
  { id: 'services', name: 'Services', slug: 'services', icon: Wrench },
];

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedCategory, myAdsCount, messagesCount } = useSelector((state: RootState) => state.user);
  const { count: wishlistCount } = useWishlist();
  const { isAuthenticated, user, openLoginModal } = useAuth();

  // Keep unread messages count synchronized
  React.useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    joinUserRoom(user.id);

    // Initial fetch of unread messages count
    async function fetchUnread() {
      try {
        const res = await chatApi.getConversations();
        if (res.success && res.data) {
          const totalUnread = res.data.reduce(
            (acc, c) => acc + (c.unreadCount || (c.unread ? 1 : 0)),
            0
          );
          dispatch(setMessagesCount(totalUnread));
        }
      } catch (err) {
        // Silently catch
      }
    }

    fetchUnread();

    const socket = getSocket();
    const handleIncoming = () => {
      // If not currently on messages page, refresh unread count
      if (window.location.pathname !== '/messages') {
        fetchUnread();
      }
    };

    socket.on('receive_chat_message', handleIncoming);
    return () => {
      socket.off('receive_chat_message', handleIncoming);
    };
  }, [isAuthenticated, user?.id, dispatch]);

  const handleCategoryClick = (slug: string) => {
    dispatch(setSelectedCategory(slug));
    navigate('/products');
  };

  const handleProtectedNav = (path: string) => {
    if (!isAuthenticated) {
      openLoginModal();
    } else {
      navigate(path);
    }
  };

  return (
    <aside className="app-sidebar">
      <nav className="sidebar-nav">
        {/* Home */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `nav-item ${isActive && selectedCategory === 'all' ? 'active' : ''}`
          }
          onClick={() => dispatch(setSelectedCategory('all'))}
        >
          <Home className="nav-icon" />
          <span>Home</span>
        </NavLink>

        {/* All Products with Explore badge */}
        <button
          type="button"
          onClick={() => {
            dispatch(setSelectedCategory('all'));
            navigate('/products');
          }}
          className={`nav-item ${
            selectedCategory === 'all' && window.location.pathname === '/products'
              ? 'active'
              : ''
          }`}
          style={{ width: '100%', justifyContent: 'space-between' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <LayoutGrid className="nav-icon" />
            <span>All Products</span>
          </div>
          <span style={{
            background: '#4f46e5',
            color: '#ffffff',
            fontSize: '9.5px',
            fontWeight: 700,
            padding: '2px 7px',
            borderRadius: '9999px',
            textTransform: 'uppercase',
            letterSpacing: '0.3px',
          }}>
            Explore
          </span>
        </button>

        {/* Categories Header */}
        <div style={{
          fontSize: '10.5px',
          fontWeight: 700,
          color: '#94a3b8',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          padding: '14px 14px 4px',
        }}>
          Categories
        </div>

        {/* Category Items */}
        {CATEGORY_ITEMS.map((item) => {
          const Icon = item.icon;
          const isSelected = selectedCategory === item.slug;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleCategoryClick(item.slug)}
              className={`nav-item ${isSelected ? 'active' : ''}`}
              style={{ width: '100%', border: 'none', background: isSelected ? 'var(--sidebar-active-bg)' : 'transparent', textAlign: 'left', cursor: 'pointer' }}
            >
              <Icon className="nav-icon" />
              <span>{item.name}</span>
            </button>
          );
        })}

        {/* My Account Divider & Section */}
        <div style={{
          fontSize: '10.5px',
          fontWeight: 700,
          color: '#94a3b8',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          padding: '14px 14px 4px',
          marginTop: '6px',
          borderTop: '1px solid #f1f5f9',
        }}>
          My Account
        </div>

        {/* My Ads */}
        <button
          type="button"
          onClick={() => handleProtectedNav('/profile')}
          className="nav-item"
          style={{ width: '100%', justifyContent: 'space-between', border: 'none', background: 'transparent', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Package className="nav-icon" />
            <span>My Ads</span>
          </div>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>{myAdsCount}</span>
        </button>

        {/* Favorites */}
        <button
          type="button"
          onClick={() => handleProtectedNav('/wishlist')}
          className="nav-item"
          style={{ width: '100%', justifyContent: 'space-between', border: 'none', background: 'transparent', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Heart className="nav-icon" />
            <span>Favorites</span>
          </div>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>{wishlistCount}</span>
        </button>

        {/* Messages */}
        <button
          type="button"
          onClick={() => handleProtectedNav('/messages')}
          className={`nav-item ${window.location.pathname === '/messages' ? 'active' : ''}`}
          style={{ width: '100%', justifyContent: 'space-between', border: 'none', background: window.location.pathname === '/messages' ? 'var(--sidebar-active-bg)' : 'transparent', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <MessageSquare className="nav-icon" />
            <span>Messages</span>
          </div>
          {messagesCount > 0 && (
            <span style={{
              background: '#ef4444',
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: 700,
              padding: '1px 6px',
              borderRadius: '9999px',
            }}>
              {messagesCount}
            </span>
          )}
        </button>
      </nav>
    </aside>
  );
};
