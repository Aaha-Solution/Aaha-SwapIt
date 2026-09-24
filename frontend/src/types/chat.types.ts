export interface ChatOffer {
  amount: number;
  originalPrice: number;
  status: 'pending' | 'accepted' | 'declined' | 'countered';
  productTitle?: string;
  productId?: string;
  note?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  productId?: string | null;
  message: string;
  offer?: ChatOffer | null;
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

export function parseOfferFromMessage(messageText: string): { offer: ChatOffer | null; cleanText: string } {
  if (!messageText) return { offer: null, cleanText: '' };
  const match = messageText.match(/\[OFFER:(.*?)\]/);
  if (match && match[1]) {
    try {
      const offer = JSON.parse(match[1]) as ChatOffer;
      const cleanText = messageText.replace(/\[OFFER:.*?\]\s*/, '').trim();
      return { offer, cleanText };
    } catch {
      return { offer: null, cleanText: messageText };
    }
  }
  return { offer: null, cleanText: messageText };
}
