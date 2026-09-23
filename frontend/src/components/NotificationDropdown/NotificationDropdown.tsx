import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Trash2,
  MessageSquare,
  Tag,
  Zap,
  Sparkles,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationItem, NotificationType } from '../../types/notification.types';
import { NotificationToast } from './NotificationToast';

export const NotificationDropdown: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'messages' | 'deals'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    isLoading,
    activeToast,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    triggerTestAlert,
    dismissToast,
  } = useNotifications();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter notifications according to active tab
  const filteredNotifications = notifications.filter((notif) => {
    if (activeTab === 'unread') return !notif.read;
    if (activeTab === 'messages') return notif.type === 'message';
    if (activeTab === 'deals') return notif.type === 'offer' || notif.type === 'deal' || notif.type === 'price_drop';
    return true;
  });

  const formatTimestamp = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return 'Yesterday';
      return `${diffDays}d ago`;
    } catch {
      return 'Recently';
    }
  };

  const getIconForType = (type: NotificationType) => {
    switch (type) {
      case 'message':
        return (
          <div style={{ background: '#eff6ff', color: '#2563eb', padding: '8px', borderRadius: '10px' }}>
            <MessageSquare style={{ width: '16px', height: '16px' }} />
          </div>
        );
      case 'price_drop':
        return (
          <div style={{ background: '#fef2f2', color: '#dc2626', padding: '8px', borderRadius: '10px' }}>
            <Tag style={{ width: '16px', height: '16px' }} />
          </div>
        );
      case 'offer':
      case 'deal':
        return (
          <div style={{ background: '#f5f3ff', color: '#7c3aed', padding: '8px', borderRadius: '10px' }}>
            <Zap style={{ width: '16px', height: '16px' }} />
          </div>
        );
      default:
        return (
          <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '8px', borderRadius: '10px' }}>
            <Sparkles style={{ width: '16px', height: '16px' }} />
          </div>
        );
    }
  };

  const handleNotificationClick = (notif: NotificationItem) => {
    if (!notif.read) {
      markAsRead(notif.id);
    }
    if (notif.link) {
      setIsOpen(false);
      navigate(notif.link);
    }
  };

  return (
    <div className="relative" ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          background: isOpen ? '#e2e8f0' : '#f1f5f9',
          border: 'none',
          cursor: 'pointer',
          color: '#334155',
          transition: 'all 0.2s ease',
        }}
      >
        <Bell style={{ width: '18px', height: '18px' }} />

        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              minWidth: '18px',
              height: '18px',
              padding: '0 4px',
              borderRadius: '9999px',
              background: '#ef4444',
              color: '#ffffff',
              fontSize: '10.5px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 0 2px #ffffff',
              animation: unreadCount > 0 ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 10px)',
            width: '380px',
            maxHeight: '520px',
            background: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 20px 35px -5px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(226, 232, 240, 0.9)',
            zIndex: 1050,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'fadeIn 0.18s ease-out',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 16px 10px',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    background: '#eff6ff',
                    color: '#2563eb',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                  }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11.5px',
                    color: '#4f46e5',
                    fontWeight: 600,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px 6px',
                    borderRadius: '6px',
                  }}
                  title="Mark all as read"
                >
                  <CheckCheck style={{ width: '14px', height: '14px' }} />
                  <span>Mark all read</span>
                </button>
              )}

              <button
                type="button"
                onClick={triggerTestAlert}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                  fontSize: '11px',
                  color: '#64748b',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '3px 7px',
                  cursor: 'pointer',
                }}
                title="Trigger simulated live notification"
              >
                <Plus style={{ width: '11px', height: '11px' }} />
                <span>Test Alert</span>
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div
            style={{
              display: 'flex',
              padding: '6px 12px',
              gap: '6px',
              background: '#f8fafc',
              borderBottom: '1px solid #f1f5f9',
            }}
          >
            {(
              [
                { key: 'all', label: 'All' },
                { key: 'unread', label: `Unread (${unreadCount})` },
                { key: 'messages', label: 'Messages' },
                { key: 'deals', label: 'Deals & Offers' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '4px 10px',
                  fontSize: '11.5px',
                  fontWeight: activeTab === tab.key ? 700 : 500,
                  borderRadius: '9999px',
                  border: 'none',
                  background: activeTab === tab.key ? '#ffffff' : 'transparent',
                  color: activeTab === tab.key ? '#0f172a' : '#64748b',
                  boxShadow: activeTab === tab.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div style={{ flex: 1, overflowY: 'auto', maxHeight: '350px' }}>
            {isLoading ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                Loading updates...
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div style={{ padding: '36px 20px', textAlign: 'center' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 10px',
                    color: '#94a3b8',
                  }}
                >
                  <Bell style={{ width: '20px', height: '20px' }} />
                </div>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                  No notifications yet
                </p>
                <p style={{ margin: '4px 0 0', fontSize: '11.5px', color: '#94a3b8' }}>
                  We’ll notify you when someone messages you or an offer updates.
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  style={{
                    padding: '12px 16px',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start',
                    borderBottom: '1px solid #f8fafc',
                    background: notif.read ? '#ffffff' : '#f8faff',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = notif.read ? '#f8fafc' : '#edf3ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = notif.read ? '#ffffff' : '#f8faff';
                  }}
                >
                  {/* Icon or Avatar */}
                  {notif.avatarUrl ? (
                    <img
                      src={notif.avatarUrl}
                      alt="Avatar"
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    getIconForType(notif.type)
                  )}

                  {/* Body */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                      <h4
                        style={{
                          margin: 0,
                          fontSize: '12.5px',
                          fontWeight: notif.read ? 600 : 700,
                          color: '#0f172a',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {notif.title}
                      </h4>
                      <span style={{ fontSize: '10.5px', color: '#94a3b8', flexShrink: 0 }}>
                        {formatTimestamp(notif.createdAt)}
                      </span>
                    </div>

                    <p
                      style={{
                        margin: '3px 0 0',
                        fontSize: '12px',
                        color: notif.read ? '#64748b' : '#334155',
                        lineHeight: 1.35,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {notif.message}
                    </p>
                  </div>

                  {/* Right Actions / Unread Dot */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      flexShrink: 0,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {!notif.read && (
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#3b82f6',
                          display: 'inline-block',
                        }}
                      />
                    )}

                    <button
                      type="button"
                      onClick={() => deleteNotification(notif.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#cbd5e1',
                        cursor: 'pointer',
                        padding: '2px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#cbd5e1')}
                      title="Delete notification"
                    >
                      <Trash2 style={{ width: '13px', height: '13px' }} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '10px 16px',
              borderTop: '1px solid #f1f5f9',
              background: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Real-time updates enabled</span>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate('/messages');
              }}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '11.5px',
                fontWeight: 600,
                color: '#4f46e5',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>View all messages</span>
              <ExternalLink style={{ width: '12px', height: '12px' }} />
            </button>
          </div>
        </div>
      )}

      {/* Floating Real-time Toast Alert */}
      <NotificationToast
        notification={activeToast}
        onDismiss={dismissToast}
        onMarkRead={markAsRead}
      />
    </div>
  );
};
