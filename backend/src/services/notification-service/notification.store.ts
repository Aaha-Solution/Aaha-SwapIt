export interface StoredNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'message' | 'offer' | 'price_drop' | 'system' | 'deal' | 'favorite';
  read: boolean;
  link?: string;
  createdAt: string;
  avatarUrl?: string | null;
}

export const inMemoryNotifications: StoredNotification[] = [
  {
    id: 'notif-1',
    userId: 'usr-demo-iyyanar',
    title: 'Welcome to SwapIt!',
    message: 'Explore thousands of verified pre-owned items or post your first listing in seconds.',
    type: 'system',
    read: false,
    link: '/products',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
  },
  {
    id: 'notif-2',
    userId: 'usr-demo-iyyanar',
    title: '🔥 Price Drop Alert: iPhone 13 Pro',
    message: 'An item in your wishlist dropped price from ₹52,000 to ₹45,999!',
    type: 'price_drop',
    read: false,
    link: '/products/prod-1',
    avatarUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=100&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
  },
  {
    id: 'notif-3',
    userId: 'usr-demo-iyyanar',
    title: '💬 New Message from Priya Sharma',
    message: '"Is the Apple MacBook Air M1 still available for exchange?"',
    type: 'message',
    read: false,
    link: '/messages',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
  },
  {
    id: 'notif-4',
    userId: 'usr-demo-iyyanar',
    title: '🤝 Swap Offer Received',
    message: 'Arun Kumar proposed a swap offer for your "Sony WH-1000XM4 Headphones".',
    type: 'offer',
    read: true,
    link: '/messages',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
];

export const getNotificationsByUserId = (userId: string): StoredNotification[] => {
  return inMemoryNotifications
    .filter((n) => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const addNotificationToStore = (notification: StoredNotification): StoredNotification => {
  inMemoryNotifications.unshift(notification);
  return notification;
};

export const markAsReadInStore = (id: string, userId: string): boolean => {
  const notif = inMemoryNotifications.find((n) => n.id === id && (n.userId === userId || !userId));
  if (notif) {
    notif.read = true;
    return true;
  }
  return false;
};

export const markAllAsReadInStore = (userId: string): number => {
  let count = 0;
  inMemoryNotifications.forEach((n) => {
    if (n.userId === userId && !n.read) {
      n.read = true;
      count++;
    }
  });
  return count;
};

export const deleteNotificationFromStore = (id: string, userId: string): boolean => {
  const index = inMemoryNotifications.findIndex((n) => n.id === id && (n.userId === userId || !userId));
  if (index !== -1) {
    inMemoryNotifications.splice(index, 1);
    return true;
  }
  return false;
};
