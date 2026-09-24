import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { ENV } from '../config/env.config.js';
import { logger } from '../shared/logger.js';
import { prisma } from '../shared/prisma.js';
import { inMemoryMessages, saveMessageToStore, updateMessageInStore, MOCK_USERS, MOCK_PRODUCTS, StoredMessage } from '../services/chat-service/chat.store.js';
import { addNotificationToStore, StoredNotification } from '../services/notification-service/notification.store.js';

export const setupSocketIO = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: [ENV.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    logger.info({ socketId: socket.id }, 'Socket.IO client connected');

    // Join user room for targeted notifications
    socket.on('join_user_room', (userId: string) => {
      socket.join(`user:${userId}`);
      logger.info({ socketId: socket.id, userId }, 'User joined private room');
    });

    // Join product chat room
    socket.on('join_product_room', (productId: string) => {
      socket.join(`product:${productId}`);
      logger.info({ socketId: socket.id, productId }, 'Client joined product room');
    });

    // Real-time chat message between buyer and seller
    socket.on('send_chat_message', async (data: {
      senderId: string;
      receiverId: string;
      productId?: string;
      message: string;
    }) => {
      try {
        const messagePayload: StoredMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
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
        
        // Also push a live notification to receiver's notification feed
        const senderUser = MOCK_USERS[data.senderId] || { name: 'User' };
        const notif: StoredNotification = {
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          userId: data.receiverId,
          title: `💬 New Message from ${senderUser.name}`,
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

    // Real-time live price alert or product update
    socket.on('subscribe_price_alert', (productId: string) => {
      socket.join(`price_alert:${productId}`);
    });

    socket.on('disconnect', () => {
      logger.info({ socketId: socket.id }, 'Socket.IO client disconnected');
    });
  });

  return io;
};
