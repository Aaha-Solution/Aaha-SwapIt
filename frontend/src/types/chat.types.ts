export interface ChatOffer {
  amount: number;
  originalPrice: number;
  status: 'pending' | 'accepted' | 'declined' | 'countered';
  productTitle?: string;
  productId?: string;
  note?: string;
}

export interface DealAgreement {
  productTitle: string;
  agreedPrice: number;
  meetLocation: string;
  meetTime?: string;
  status: 'agreed' | 'completed' | 'cancelled';
  handshakeCode?: string;
}

export interface LocationShare {
  name: string;
  address: string;
  landmark?: string;
  city?: string;
}

export interface ImageAttachment {
  url: string;
  caption?: string;
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
  reactions?: Record<string, string[]>; // emoji -> array of userIds
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

export function parseDealAgreedFromMessage(messageText: string): { deal: DealAgreement | null; cleanText: string } {
  if (!messageText) return { deal: null, cleanText: '' };
  const match = messageText.match(/\[DEAL_AGREED:(.*?)\]/);
  if (match && match[1]) {
    try {
      const deal = JSON.parse(match[1]) as DealAgreement;
      const cleanText = messageText.replace(/\[DEAL_AGREED:.*?\]\s*/, '').trim();
      return { deal, cleanText };
    } catch {
      return { deal: null, cleanText: messageText };
    }
  }
  return { deal: null, cleanText: messageText };
}

export function parseLocationFromMessage(messageText: string): { location: LocationShare | null; cleanText: string } {
  if (!messageText) return { location: null, cleanText: '' };
  const match = messageText.match(/\[LOCATION:(.*?)\]/);
  if (match && match[1]) {
    try {
      const location = JSON.parse(match[1]) as LocationShare;
      const cleanText = messageText.replace(/\[LOCATION:.*?\]\s*/, '').trim();
      return { location, cleanText };
    } catch {
      return { location: null, cleanText: messageText };
    }
  }
  return { location: null, cleanText: messageText };
}

export function parseImageFromMessage(messageText: string): { imageAttachment: ImageAttachment | null; cleanText: string } {
  if (!messageText) return { imageAttachment: null, cleanText: '' };
  const match = messageText.match(/\[IMAGE:(.*?)\]/);
  if (match && match[1]) {
    try {
      const imageAttachment = JSON.parse(match[1]) as ImageAttachment;
      const cleanText = messageText.replace(/\[IMAGE:.*?\]\s*/, '').trim();
      return { imageAttachment, cleanText };
    } catch {
      return { imageAttachment: null, cleanText: messageText };
    }
  }
  return { imageAttachment: null, cleanText: messageText };
}

