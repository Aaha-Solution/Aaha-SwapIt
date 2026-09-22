import { Router } from 'express';
import { getChatHistory, getConversations, deleteConversation, clearAllChats } from './chat.controller.js';
import { optionalAuth } from '../../middleware/auth.middleware.js';

export const chatRouter = Router();

chatRouter.use(optionalAuth);

chatRouter.get('/history/:otherUserId', getChatHistory);
chatRouter.get('/conversations', getConversations);
chatRouter.delete('/conversation/:otherUserId', deleteConversation);
chatRouter.delete('/all', clearAllChats);
