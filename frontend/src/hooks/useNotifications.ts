import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { notificationApi } from '../api/notification.api';
import { NotificationItem, NotificationType } from '../types/notification.types';
import { getSocket, joinUserRoom } from '../api/socket';
import { useAuth } from './useAuth';
import { addToast, ToastType } from '../store/slices/toastSlice';

export const useNotifications = () => {
  const dispatch = useDispatch();
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

      // Map notification types to toast types
      let toastType: ToastType = 'info';
      if (notif.type === 'offer' || notif.type === 'deal') {
        toastType = 'success';
      } else if (notif.type === 'price_drop') {
        toastType = 'warning';
      }

      dispatch(
        addToast({
          type: toastType,
          title: notif.title || 'New Notification',
          message: notif.message,
          duration: 5000,
          action: notif.link ? { label: 'View Deal', url: notif.link } : undefined,
        })
      );

      // Auto-hide local toast
      const timer = setTimeout(() => {
        setActiveToast((current) => (current?.id === notif.id ? null : current));
      }, 5000);

      return () => clearTimeout(timer);
    };

    socket.on('receive_notification', handleNewNotification);

    return () => {
      socket.off('receive_notification', handleNewNotification);
    };
  }, [isAuthenticated, user?.id, dispatch]);

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

  const dismissToast = () => {
    setActiveToast(null);
  };

  const triggerTestAlert = async (type: NotificationType = 'offer') => {
    const mockTitles: Record<NotificationType, string> = {
      offer: 'New Offer Received! 🎉',
      message: 'New Message from Buyer 💬',
      price_drop: 'Price Drop Alert 📉',
      deal: 'Deal Confirmed 🤝',
      favorite: 'Item Added to Wishlist ⭐',
      system: 'SwapIt Safety Tip 🛡️',
    };

    const mockMessages: Record<NotificationType, string> = {
      offer: 'Karthik Raja offered ₹24,000 for your iPhone 13.',
      message: 'Is the Royal Enfield still available for test drive?',
      price_drop: 'MacBook Air M2 price dropped to ₹68,000 in your area.',
      deal: 'Your deal for Leather Biker Jacket was accepted!',
      favorite: '3 people saved your Yamaha FZ listing this week.',
      system: 'Always meet in public locations when exchanging goods.',
    };

    const mockItem: NotificationItem = {
      id: 'test-' + Date.now(),
      userId: user?.id || 'usr-current',
      title: mockTitles[type] || 'New Notification',
      message: mockMessages[type] || 'You have a new update on SwapIt.',
      type,
      read: false,
      link: type === 'message' ? '/messages' : '/products',
      createdAt: 'Just now',
    };

    setNotifications((prev) => [mockItem, ...prev]);
    setUnreadCount((prev) => prev + 1);
    setActiveToast(mockItem);

    let toastType: ToastType = 'info';
    if (type === 'offer' || type === 'deal') toastType = 'success';
    else if (type === 'price_drop') toastType = 'warning';

    dispatch(
      addToast({
        type: toastType,
        title: mockItem.title,
        message: mockItem.message,
        duration: 5000,
        action: mockItem.link ? { label: 'Open', url: mockItem.link } : undefined,
      })
    );
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    activeToast,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    dismissToast,
    triggerTestAlert,
  };
};
