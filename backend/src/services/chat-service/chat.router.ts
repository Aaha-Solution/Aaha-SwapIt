import { Router } from 'express';
import { getChatHistory, getConversations, deleteConversation, clearAllChats } from './chat.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { chatRateLimiter } from '../../middleware/rateLimiter.js';

export const chatRouter = Router();

chatRouter.use(chatRateLimiter);
chatRouter.use(requireAuth);

chatRouter.get('/history/:otherUserId', getChatHistory);
chatRouter.get('/conversations', getConversations);
chatRouter.delete('/conversation/:otherUserId', deleteConversation);
chatRouter.delete('/all', clearAllChats);

