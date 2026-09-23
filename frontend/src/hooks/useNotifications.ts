import { useState, useEffect, useCallback } from 'react';
import { notificationApi } from '../api/notification.api';
import { NotificationItem } from '../types/notification.types';
import { getSocket, joinUserRoom } from '../api/socket';
import { useAuth } from './useAuth';

export const useNotifications = () => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeToast, setActiveToast] = useState<NotificationItem | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      setIsLoading(true);
      const res = await notificationApi.getNotifications();
      if (res.success && res.data) {
        setNotifications(res.data);
        setUnreadCount(res.unreadCount ?? res.data.filter((n) => !n.read).length);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Real-time Socket.IO listener for notifications
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    joinUserRoom(user.id);
    const socket = getSocket();

    const handleNewNotification = (notif: NotificationItem) => {
      setNotifications((prev) => [notif, ...prev.filter((n) => n.id !== notif.id)]);
      setUnreadCount((prev) => prev + 1);
      setActiveToast(notif);

      // Auto-hide toast after 5.5s
      const timer = setTimeout(() => {
        setActiveToast((current) => (current?.id === notif.id ? null : current));
      }, 5500);

      return () => clearTimeout(timer);
    };

    socket.on('receive_notification', handleNewNotification);

    return () => {
      socket.off('receive_notification', handleNewNotification);
    };
  }, [isAuthenticated, user?.id]);

  const markAsRead = async (id: string) => {
    try {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      await notificationApi.markAsRead(id);
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      await notificationApi.markAllAsRead();
    } catch (err) {
      console.error('Failed to mark all notifications as read', err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const target = notifications.find((n) => n.id === id);
      if (target && !target.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      await notificationApi.deleteNotification(id);
    } catch (err) {
      console.error('Failed to delete notification', err);
    }
  };

  const triggerTestAlert = async () => {
    try {
      const demoTitles = [
        { title: '🔥 Deal Alert: Sony PS5', message: 'Seller accepted your ₹38,000 offer! Complete payment now.', type: 'offer', link: '/messages' },
        { title: '⚡ Fast Swap Proposal', message: 'New swap request received for your DSLR Camera.', type: 'deal', link: '/messages' },
        { title: '📉 Price Drop on MacBook M2', message: 'Price decreased by 12% in your city.', type: 'price_drop', link: '/products' },
      ];
      const random = demoTitles[Math.floor(Math.random() * demoTitles.length)];

      await notificationApi.triggerTestNotification({
        title: random.title,
        message: random.message,
        type: random.type,
        link: random.link,
      });
    } catch (err) {
      console.error('Failed to trigger test notification', err);
    }
  };

  const dismissToast = () => {
    setActiveToast(null);
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    activeToast,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    triggerTestAlert,
    dismissToast,
    refreshNotifications: fetchNotifications,
  };
};
