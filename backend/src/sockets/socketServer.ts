import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.config.js';
import { logger } from '../shared/logger.js';
import { prisma } from '../shared/prisma.js';
import {
  saveMessageToStore,
  updateMessageInStore,
  MOCK_USERS,
  MOCK_PRODUCTS,
  StoredMessage,
} from '../services/chat-service/chat.store.js';
import { addNotificationToStore, StoredNotification } from '../services/notification-service/notification.store.js';

// Online user registry: userId -> Set of socketIds
const onlineUsers = new Map<string, Set<string>>();

export const setupSocketIO = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: [ENV.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 20000,
    pingInterval: 25000,
    connectTimeout: 45000,
    transports: ['websocket', 'polling'],
  });

  // 1. Socket Authentication Middleware
  io.use((socket: Socket, next) => {
    try {
      const authHeader = socket.handshake.headers.authorization;
      const authToken = socket.handshake.auth?.token || (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null);

      if (authToken) {
        try {
          const decoded = jwt.verify(authToken, ENV.JWT_SECRET) as { id: string; email: string; name?: string; role?: string };
          socket.data.user = decoded;
          socket.data.userId = decoded.id;
        } catch {
          // Token invalid or expired, continue as guest
          socket.data.user = null;
        }
      }
      return next();
    } catch {
      return next();
    }
  });

  io.on('connection', (socket: Socket) => {
    const authenticatedUserId = socket.data.userId;
    logger.info({ socketId: socket.id, userId: authenticatedUserId || 'guest' }, 'Socket.IO client connected');

    // If socket authenticated via JWT, auto-join user room & track online status
    if (authenticatedUserId) {
      socket.join(`user:${authenticatedUserId}`);
      if (!onlineUsers.has(authenticatedUserId)) {
        onlineUsers.set(authenticatedUserId, new Set());
      }
      onlineUsers.get(authenticatedUserId)!.add(socket.id);

      // Broadcast online status to peers
      io.emit('user:presence_changed', { userId: authenticatedUserId, status: 'online' });
    }

    // Explicit room join for user notifications & direct messaging
    socket.on('join_user_room', (userId: string) => {
      if (!userId) return;
      socket.join(`user:${userId}`);
      socket.data.userId = userId;

      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
      }
      onlineUsers.get(userId)!.add(socket.id);
      io.emit('user:presence_changed', { userId, status: 'online' });

      logger.info({ socketId: socket.id, userId }, 'User joined private room');
    });

    // Check online status of user
    socket.on('check_user_online', (userId: string, callback?: (isOnline: boolean) => void) => {
      const isOnline = onlineUsers.has(userId) && (onlineUsers.get(userId)?.size || 0) > 0;
      if (typeof callback === 'function') {
        callback(isOnline);
      } else {
        socket.emit('user_online_response', { userId, isOnline });
      }
    });

    // Join product chat room
    socket.on('join_product_room', (productId: string) => {
      if (!productId) return;
      socket.join(`product:${productId}`);
      logger.info({ socketId: socket.id, productId }, 'Client joined product room');
    });

    // Typing indicators
    socket.on('typing_start', (data: { senderId: string; receiverId: string; senderName?: string }) => {
      if (!data?.receiverId) return;
      io.to(`user:${data.receiverId}`).emit('user_typing_start', {
        userId: data.senderId,
        userName: data.senderName || 'User',
      });
    });

    socket.on('typing_stop', (data: { senderId: string; receiverId: string }) => {
      if (!data?.receiverId) return;
      io.to(`user:${data.receiverId}`).emit('user_typing_stop', {
        userId: data.senderId,
      });
    });

    // Mark messages as read receipt
    socket.on('mark_messages_read', async (data: { readerId: string; senderId: string }) => {
      try {
        if (!data?.readerId || !data?.senderId) return;

        updateMessageInStore(
          (m) => m.senderId === data.senderId && m.receiverId === data.readerId && !m.read,
          (m) => {
            m.read = true;
          }
        );

        try {
          await prisma.chatMessage.updateMany({
            where: {
              senderId: data.senderId,
              receiverId: data.readerId,
              read: false,
            },
            data: { read: true },
          });
        } catch {}

        io.to(`user:${data.senderId}`).emit('messages_read_update', {
          readerId: data.readerId,
        });
      } catch (err) {
        logger.error({ err }, 'Error in mark_messages_read');
      }
    });

    // Emoji reaction on message
    socket.on('message_reaction', (data: {
      messageId: string;
      emoji: string;
      userId: string;
      receiverId: string;
    }) => {
      if (!data?.messageId || !data?.emoji) return;

      io.to(`user:${data.receiverId}`).emit('message_reaction_update', {
        messageId: data.messageId,
        emoji: data.emoji,
        userId: data.userId,
      });
      socket.emit('message_reaction_update', {
        messageId: data.messageId,
        emoji: data.emoji,
        userId: data.userId,
      });
    });

    // Real-time chat message between buyer and seller
    socket.on('send_chat_message', async (data: {
      senderId: string;
      receiverId: string;
      productId?: string;
      message: string;
    }) => {
      try {
        if (!data?.senderId || !data?.receiverId || !data?.message) return;

        const messagePayload: StoredMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
          senderId: data.senderId,
          receiverId: data.receiverId,
          productId: data.productId || null,
          message: data.message,
          read: false,
          createdAt: new Date().toISOString(),
        };

        // 1. Save in persisted store
        saveMessageToStore(messagePayload);

        // 2. Try saving to database (if db connected)
        try {
          const dbSaved = await prisma.chatMessage.create({
            data: {
              senderId: data.senderId,
              receiverId: data.receiverId,
              productId: data.productId,
              message: data.message,
            },
          });
          messagePayload.id = dbSaved.id;
        } catch {
          // In-memory fallback
        }

        // 3. Emit to recipient's private room
        io.to(`user:${data.receiverId}`).emit('receive_chat_message', messagePayload);

        // Live notification to receiver
        const senderUser = MOCK_USERS[data.senderId] || { name: socket.data.user?.name || 'SwapIt User', avatarUrl: undefined };
        const notif: StoredNotification = {
          id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
          userId: data.receiverId,
          title: `New Message from ${senderUser.name}`,
          message: data.message.length > 60 ? data.message.slice(0, 57) + '...' : data.message,
          type: 'message',
          read: false,
          link: '/messages',
          avatarUrl: senderUser.avatarUrl,
          createdAt: new Date().toISOString(),
        };
        addNotificationToStore(notif);
        io.to(`user:${data.receiverId}`).emit('receive_notification', notif);

        // Confirmation to sender
        socket.emit('message_sent_ack', messagePayload);

        // Automated smart seller reply simulation if receiver is a simulated seller (usr-1 through usr-12)
        if (MOCK_USERS[data.receiverId] && data.receiverId.startsWith('usr-') && data.receiverId !== data.senderId) {
          const peerSeller = MOCK_USERS[data.receiverId];
          const prodTitle = data.productId ? MOCK_PRODUCTS[data.productId]?.title : undefined;

          // Send typing indicator after 600ms
          setTimeout(() => {
            io.to(`user:${data.senderId}`).emit('user_typing_start', {
              userId: data.receiverId,
              userName: peerSeller.name,
            });
          }, 600);

          // Stop typing and send smart reply after 1800ms
          setTimeout(async () => {
            io.to(`user:${data.senderId}`).emit('user_typing_stop', {
              userId: data.receiverId,
            });

            const { getSmartSellerReply } = await import('../services/chat-service/chat.store.js');
            const replyText = getSmartSellerReply(data.message, peerSeller.name, prodTitle);

            const replyMsg: StoredMessage = {
              id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
              senderId: data.receiverId,
              receiverId: data.senderId,
              productId: data.productId || null,
              message: replyText,
              read: false,
              createdAt: new Date().toISOString(),
            };

            saveMessageToStore(replyMsg);
            io.to(`user:${data.senderId}`).emit('receive_chat_message', replyMsg);
          }, 1900);
        }
      } catch (err) {
        logger.error({ err }, 'Error handling socket chat message');
      }
    });

    // Real-time offer status updates (Accept / Decline manually by seller)
    socket.on('update_offer_status', async (data: {
      messageId: string;
      newStatus: 'accepted' | 'declined';
      senderId: string;
      receiverId: string;
    }) => {
      try {
        if (!data?.messageId || !data?.newStatus) return;

        let updatedMessageText = '';
        updateMessageInStore(
          (m) => m.id === data.messageId,
          (m) => {
            const match = m.message.match(/\[OFFER:(.*?)\]/);
            if (match && match[1]) {
              try {
                const offerObj = JSON.parse(match[1]);
                offerObj.status = data.newStatus;
                m.message = m.message.replace(/\[OFFER:.*?\]/, `[OFFER:${JSON.stringify(offerObj)}]`);
                updatedMessageText = m.message;
              } catch {}
            }
          }
        );

        if (updatedMessageText) {
          try {
            await prisma.chatMessage.update({
              where: { id: data.messageId },
              data: { message: updatedMessageText },
            });
          } catch {}
        }

        io.to(`user:${data.receiverId}`).emit('offer_status_changed', {
          messageId: data.messageId,
          newStatus: data.newStatus,
        });
        io.to(`user:${data.senderId}`).emit('offer_status_changed', {
          messageId: data.messageId,
          newStatus: data.newStatus,
        });
      } catch (err) {
        logger.error({ err }, 'Error handling offer status change');
      }
    });

    // Real-time deal agreements & location share broadcasts
    socket.on('deal:broadcast_agreement', (data: { receiverId: string; deal: any }) => {
      if (!data?.receiverId || !data?.deal) return;
      io.to(`user:${data.receiverId}`).emit('deal:agreement_received', data.deal);
    });

    socket.on('deal:share_location', (data: { receiverId: string; location: any }) => {
      if (!data?.receiverId || !data?.location) return;
      io.to(`user:${data.receiverId}`).emit('deal:location_received', data.location);
    });

    // Real-time live price alert or product update
    socket.on('subscribe_price_alert', (productId: string) => {
      if (!productId) return;
      socket.join(`price_alert:${productId}`);
    });

    socket.on('disconnect', () => {
      const userId = socket.data.userId;
      if (userId && onlineUsers.has(userId)) {
        const userSockets = onlineUsers.get(userId)!;
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          io.emit('user:presence_changed', { userId, status: 'offline' });
        }
      }
      logger.info({ socketId: socket.id }, 'Socket.IO client disconnected');
    });
  });

  return io;
};
