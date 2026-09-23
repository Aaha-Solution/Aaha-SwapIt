import axiosInstance from './axiosInstance';
import { NotificationsResponse, NotificationItem } from '../types/notification.types';

export const notificationApi = {
  async getNotifications(): Promise<NotificationsResponse> {
    const res = await axiosInstance.get('/notifications');
    return res.data;
  },

  async markAsRead(id: string): Promise<{ success: boolean; message: string }> {
    const res = await axiosInstance.put(`/notifications/${id}/read`);
    return res.data;
  },

  async markAllAsRead(): Promise<{ success: boolean; message: string }> {
    const res = await axiosInstance.put('/notifications/read-all');
    return res.data;
  },

  async deleteNotification(id: string): Promise<{ success: boolean; message: string }> {
    const res = await axiosInstance.delete(`/notifications/${id}`);
    return res.data;
  },

  async triggerTestNotification(payload: {
    title: string;
    message: string;
    type?: string;
    link?: string;
    avatarUrl?: string;
  }): Promise<{ success: boolean; data: NotificationItem }> {
    const res = await axiosInstance.post('/notifications/create', payload);
    return res.data;
  },
};
