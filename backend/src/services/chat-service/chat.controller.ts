import { Request, Response } from 'express';
import { prisma } from '../../shared/prisma.js';
import { logger } from '../../shared/logger.js';
import { inMemoryMessages, updateMessageInStore, MOCK_USERS, MOCK_PRODUCTS, StoredMessage } from './chat.store.js';

export const getChatHistory = async (req: Request, res: Response) => {
  try {
    const currentUserId = (req as any).user?.id || 'usr-demo-iyyanar';
    const { otherUserId } = req.params;
    const { productId } = req.query;

    if (!currentUserId || !otherUserId) {
      return res.status(400).json({ success: false, message: 'Missing user parameters' });
    }

    let dbMessages: any[] = [];
    try {
      const whereCondition: any = {
        OR: [
          { senderId: currentUserId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: currentUserId },
        ],
      };

      if (productId && typeof productId === 'string') {
        whereCondition.productId = productId;
      }

      dbMessages = await prisma.chatMessage.findMany({
        where: whereCondition,
        orderBy: { createdAt: 'asc' },
        take: 100,
      });

      // Mark unread messages as read
      await prisma.chatMessage.updateMany({
        where: {
          senderId: otherUserId,
          receiverId: currentUserId,
          read: false,
        },
        data: { read: true },
      });
    } catch {
      // Prisma fallback
    }

    // In-memory messages for this conversation
    const memoryMessages = inMemoryMessages.filter((m) => {
      const matchesUsers =
        (m.senderId === currentUserId && m.receiverId === otherUserId) ||
        (m.senderId === otherUserId && m.receiverId === currentUserId);
      if (!matchesUsers) return false;
      if (productId && typeof productId === 'string') {
        return m.productId === productId;
      }
      return true;
    });

    // Mark in-memory messages as read
    updateMessageInStore(
      (m) => m.senderId === otherUserId && m.receiverId === currentUserId && !m.read,
      (m) => {
        m.read = true;
      }
    );

    // Merge and deduplicate
    const combined = [...dbMessages];
    for (const mem of memoryMessages) {
      if (!combined.some((d) => d.id === mem.id)) {
        combined.push(mem);
      }
    }

    combined.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return res.json({
      success: true,
      data: combined,
    });
  } catch (error) {
    logger.error({ error }, 'Error fetching chat history');
    return res.status(500).json({ success: false, message: 'Failed to fetch chat history' });
  }
};

export const getConversations = async (req: Request, res: Response) => {
  try {
    const currentUserId = (req as any).user?.id || 'usr-demo-iyyanar';

    let allMessages: any[] = [];

    // 1. Try fetching from database
    try {
      const dbMessages = await prisma.chatMessage.findMany({
        where: {
          OR: [{ senderId: currentUserId }, { receiverId: currentUserId }],
        },
        orderBy: { createdAt: 'desc' },
        include: {
          sender: { select: { id: true, name: true, avatarUrl: true, location: true } },
          receiver: { select: { id: true, name: true, avatarUrl: true, location: true } },
        },
      });
      allMessages = [...dbMessages];
    } catch {
      // Prisma fallback
    }

    // 2. Include in-memory messages
    const userMemoryMessages = inMemoryMessages.filter(
      (m) => m.senderId === currentUserId || m.receiverId === currentUserId
    );

    for (const mem of userMemoryMessages) {
      if (!allMessages.some((m) => m.id === mem.id)) {
        const peerId = mem.senderId === currentUserId ? mem.receiverId : mem.senderId;
        const mockPeer = MOCK_USERS[peerId] || { id: peerId, name: 'User', location: 'Chennai' };

        allMessages.push({
          ...mem,
          sender: mem.senderId === currentUserId ? { id: currentUserId, name: (req as any).user?.name || 'You' } : mockPeer,
          receiver: mem.receiverId === currentUserId ? { id: currentUserId, name: (req as any).user?.name || 'You' } : mockPeer,
        });
      }
    }

    // Sort by createdAt descending
    allMessages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // 3. Group by peer user
    const conversationMap = new Map<string, any>();
    const productIdsToFetch = new Set<string>();

    for (const msg of allMessages) {
      const peer = msg.senderId === currentUserId ? msg.receiver : msg.sender;
      const peerId = peer?.id || (msg.senderId === currentUserId ? msg.receiverId : msg.senderId);

      const peerUserObj = peer || MOCK_USERS[peerId] || { id: peerId, name: 'Seller', location: 'Chennai' };

      if (!conversationMap.has(peerId)) {
        if (msg.productId) {
          productIdsToFetch.add(msg.productId);
        }
        conversationMap.set(peerId, {
          peerUser: peerUserObj,
          lastMessage: msg.message,
          productId: msg.productId,
          lastMessageAt: msg.createdAt,
          unreadCount: (msg.receiverId === currentUserId && !msg.read) ? 1 : 0,
        });
      } else {
        if (msg.receiverId === currentUserId && !msg.read) {
          const conv = conversationMap.get(peerId);
          conv.unreadCount = (conv.unreadCount || 0) + 1;
        }
      }
    }

    // 4. Resolve product details (DB + MOCK_PRODUCTS)
    const productMap = new Map<string, any>();
    for (const [prodId, prod] of Object.entries(MOCK_PRODUCTS)) {
      productMap.set(prodId, prod);
    }

    try {
      if (productIdsToFetch.size > 0) {
        const products = await prisma.product.findMany({
          where: { id: { in: Array.from(productIdsToFetch) } },
          select: {
            id: true,
            title: true,
            price: true,
            imageUrl: true,
            condition: true,
            status: true,
            city: true,
          },
        });
        for (const p of products) {
          productMap.set(p.id, p);
        }
      }
    } catch {
      // Fallback to mock product map
    }

    // Attach product snapshots to conversations
    const conversations = Array.from(conversationMap.values()).map((conv) => ({
      ...conv,
      unread: conv.unreadCount > 0,
      product: conv.productId ? productMap.get(conv.productId) || null : null,
    }));

    return res.json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    logger.error({ error }, 'Error fetching conversations');
    return res.status(500).json({ success: false, message: 'Failed to fetch conversations' });
  }
};

export const deleteConversation = async (req: Request, res: Response) => {
  try {
    const currentUserId = (req as any).user?.id || 'usr-demo-iyyanar';
    const { otherUserId } = req.params;

    if (!otherUserId) {
      return res.status(400).json({ success: false, message: 'Missing user ID' });
    }

    // 1. Delete from store
    const { deleteConversationFromStore } = await import('./chat.store.js');
    deleteConversationFromStore(currentUserId, otherUserId);

    // 2. Try delete from DB
    try {
      await prisma.chatMessage.deleteMany({
        where: {
          OR: [
            { senderId: currentUserId, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: currentUserId },
          ],
        },
      });
    } catch {
      // Ignore DB error
    }

    return res.json({ success: true, message: 'Conversation deleted successfully' });
  } catch (error) {
    logger.error({ error }, 'Error deleting conversation');
    return res.status(500).json({ success: false, message: 'Failed to delete conversation' });
  }
};

export const clearAllChats = async (req: Request, res: Response) => {
  try {
    const currentUserId = (req as any).user?.id || 'usr-demo-iyyanar';

    // 1. Clear store
    const { clearAllMessagesFromStore } = await import('./chat.store.js');
    clearAllMessagesFromStore();

    // 2. Try delete from DB
    try {
      await prisma.chatMessage.deleteMany({
        where: {
          OR: [{ senderId: currentUserId }, { receiverId: currentUserId }],
        },
      });
    } catch {
      // Ignore DB error
    }

    return res.json({ success: true, message: 'All conversations cleared successfully' });
  } catch (error) {
    logger.error({ error }, 'Error clearing all chats');
    return res.status(500).json({ success: false, message: 'Failed to clear chats' });
  }
};
