export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  productId?: string | null;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface ConversationProduct {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  condition: string;
  status: string;
  city?: string;
}

export interface Conversation {
  peerUser: {
    id: string;
    name: string;
    avatarUrl?: string | null;
    location?: string | null;
  };
  lastMessage: string;
  productId?: string | null;
  product?: ConversationProduct | null;
  lastMessageAt: string;
  unread: boolean;
  unreadCount?: number;
}
