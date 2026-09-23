export type NotificationType = 'message' | 'offer' | 'price_drop' | 'system' | 'deal' | 'favorite';

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  link?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface NotificationsResponse {
  success: boolean;
  data: NotificationItem[];
  unreadCount: number;
}
