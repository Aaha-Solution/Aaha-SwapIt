import { api } from './axiosInstance';
import { ApiResponse } from '../types/api.types';
import { ChatMessage, Conversation } from '../types/chat.types';

export const chatApi = {
  getChatHistory: async (otherUserId: string, productId?: string): Promise<ApiResponse<ChatMessage[]>> => {
    const params = productId ? { productId } : {};
    const res = await api.get(`/chat/history/${otherUserId}`, { params });
    return res.data;
  },

  getConversations: async (): Promise<ApiResponse<Conversation[]>> => {
    const res = await api.get('/chat/conversations');
    return res.data;
  },

  deleteConversation: async (otherUserId: string): Promise<ApiResponse<{ message: string }>> => {
    const res = await api.delete(`/chat/conversation/${otherUserId}`);
    return res.data;
  },

  clearAllChats: async (): Promise<ApiResponse<{ message: string }>> => {
    const res = await api.delete('/chat/all');
    return res.data;
  },
};
