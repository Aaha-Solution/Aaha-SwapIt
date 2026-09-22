import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { ENV } from '../config/env.config.js';
import { logger } from '../shared/logger.js';
import { prisma } from '../shared/prisma.js';
import { inMemoryMessages, saveMessageToStore, MOCK_USERS, MOCK_PRODUCTS, getSmartSellerReply, StoredMessage } from '../services/chat-service/chat.store.js';

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
        // Also emit back to sender confirmation
        socket.emit('message_sent_ack', messagePayload);

        // 4. Smart Instant Seller Bot Simulation
        // If recipient is a demo seller, simulate automated contextual reply
        const sellerProfile = MOCK_USERS[data.receiverId] || { name: 'Seller' };
        const productSnapshot = data.productId ? MOCK_PRODUCTS[data.productId] : null;

        setTimeout(async () => {
          const replyText = getSmartSellerReply(
            data.message,
            sellerProfile.name,
            productSnapshot?.title
          );

          const replyPayload: StoredMessage = {
            id: `msg-reply-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            senderId: data.receiverId,
            receiverId: data.senderId,
            productId: data.productId || null,
            message: replyText,
            read: false,
            createdAt: new Date().toISOString(),
          };

          // Save reply in persisted store
          saveMessageToStore(replyPayload);

          // Try save in DB
          try {
            await prisma.chatMessage.create({
              data: {
                senderId: data.receiverId,
                receiverId: data.senderId,
                productId: data.productId,
                message: replyText,
              },
            });
          } catch {
            // Memory fallback
          }

          // Emit reply to buyer's room once
          io.to(`user:${data.senderId}`).emit('receive_chat_message', replyPayload);
        }, 1400);

      } catch (err) {
        logger.error({ err }, 'Error handling socket chat message');
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
