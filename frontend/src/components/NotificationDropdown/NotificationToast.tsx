import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Bell, MessageSquare, Tag, Zap, ArrowRight } from 'lucide-react';
import { NotificationItem } from '../../types/notification.types';

interface NotificationToastProps {
  notification: NotificationItem | null;
  onDismiss: () => void;
  onMarkRead: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onDismiss,
  onMarkRead,
}) => {
  const navigate = useNavigate();

  if (!notification) return null;

  const getIcon = () => {
    switch (notification.type) {
      case 'message':
        return <MessageSquare style={{ width: '18px', height: '18px', color: '#3b82f6' }} />;
      case 'price_drop':
        return <Tag style={{ width: '18px', height: '18px', color: '#ef4444' }} />;
      case 'offer':
      case 'deal':
        return <Zap style={{ width: '18px', height: '18px', color: '#8b5cf6' }} />;
      default:
        return <Bell style={{ width: '18px', height: '18px', color: '#0ea5e9' }} />;
    }
  };

  const handleClick = () => {
    onMarkRead(notification.id);
    onDismiss();
    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '24px',
        zIndex: 9999,
        minWidth: '320px',
        maxWidth: '400px',
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(12px)',
        borderRadius: '16px',
        boxShadow: '0 20px 35px -5px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(99, 102, 241, 0.2)',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        cursor: 'pointer',
      }}
      onClick={handleClick}
    >
      <div
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          border: '1px solid #e2e8f0',
        }}
      >
        {getIcon()}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <h4
            style={{
              margin: 0,
              fontSize: '13px',
              fontWeight: 700,
              color: '#0f172a',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {notification.title}
          </h4>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 600,
              color: '#3b82f6',
              background: '#eff6ff',
              padding: '2px 6px',
              borderRadius: '6px',
              flexShrink: 0,
            }}
          >
            Live
          </span>
        </div>

        <p
          style={{
            margin: '4px 0 8px',
            fontSize: '12px',
            color: '#475569',
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {notification.message}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#4f46e5', fontWeight: 600 }}>
          <span>View details</span>
          <ArrowRight style={{ width: '12px', height: '12px' }} />
        </div>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDismiss();
        }}
        style={{
          background: 'none',
          border: 'none',
          color: '#94a3b8',
          cursor: 'pointer',
          padding: '2px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-label="Close notification"
      >
        <X style={{ width: '15px', height: '15px' }} />
      </button>
    </div>
  );
};
