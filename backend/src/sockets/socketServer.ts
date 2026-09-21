import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { ENV } from '../config/env.config.js';
import { logger } from '../shared/logger.js';
import { prisma } from '../shared/prisma.js';

export const setupSocketIO = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: [ENV.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000'],
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
        const savedMessage = await prisma.chatMessage.create({
          data: {
            senderId: data.senderId,
            receiverId: data.receiverId,
            productId: data.productId,
            message: data.message,
          },
        });

        // Emit to recipient's private room
        io.to(`user:${data.receiverId}`).emit('receive_chat_message', savedMessage);
        // Also emit back to sender confirmation
        socket.emit('message_sent_ack', savedMessage);
      } catch (err) {
        logger.error({ err }, 'Error saving socket chat message');
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
