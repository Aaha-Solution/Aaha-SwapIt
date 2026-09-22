import React, { useState, useEffect, useRef } from 'react';
import { Send, X, ShieldCheck, CheckCheck, Sparkles, AlertCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { Product } from '../../types/product.types';
import { ChatMessage } from '../../types/chat.types';
import { chatApi } from '../../api/chat.api';
import { getSocket, joinUserRoom } from '../../api/socket';
import { formatINR } from '../../utils/helpers';

interface ChatModalProps {
  product: Product;
  onClose: () => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({ product, onClose }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const sellerId = product.seller?.id || (product as any).sellerId;
  const sellerName = product.seller?.name || 'Seller';

  // 1. Initial connection & loading chat history
  useEffect(() => {
    if (!user?.id || !sellerId) return;

    // Join my private socket room to receive instant messages
    joinUserRoom(user.id);

    // Fetch past message history
    async function loadHistory() {
      setIsLoading(true);
      try {
        const res = await chatApi.getChatHistory(sellerId, product.id);
        if (res.success && res.data) {
          setMessages(res.data);
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadHistory();

    // 2. Setup Socket.IO real-time listeners
    const socket = getSocket();

    const handleIncomingMessage = (newMsg: ChatMessage) => {
      // If message is from this seller or peer, append it only if not already present
      if (newMsg.senderId === sellerId || (newMsg.senderId === user?.id && newMsg.receiverId === sellerId)) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id || (m.id.startsWith('temp-') && m.message === newMsg.message))) {
            return prev.map((m) =>
              m.id.startsWith('temp-') && m.message === newMsg.message ? newMsg : m
            );
          }
          return [...prev, newMsg];
        });
      }
    };

    const handleSentAck = (savedMsg: ChatMessage) => {
      // Confirm message was saved, replace temporary placeholder
      setMessages((prev) => {
        const tempIdx = prev.findIndex(
          (m) => m.id.startsWith('temp-') && m.message === savedMsg.message
        );
        if (tempIdx !== -1) {
          const next = [...prev];
          next[tempIdx] = savedMsg;
          return next;
        }
        if (prev.some((m) => m.id === savedMsg.id)) return prev;
        return [...prev, savedMsg];
      });
    };

    socket.on('receive_chat_message', handleIncomingMessage);
    socket.on('message_sent_ack', handleSentAck);

    return () => {
      socket.off('receive_chat_message', handleIncomingMessage);
      socket.off('message_sent_ack', handleSentAck);
    };
  }, [user?.id, sellerId, product.id]);

  // Auto scroll to bottom inside container only
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || !user?.id || !sellerId) return;

    const socket = getSocket();

    // Optimistically show message immediately
    const tempMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      senderId: user.id,
      receiverId: sellerId,
      productId: product.id,
      message: text,
      read: false,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);
    setInputValue('');

    // Emit live message to backend Socket.IO
    socket.emit('send_chat_message', {
      senderId: user.id,
      receiverId: sellerId,
      productId: product.id,
      message: text,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col h-[620px] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
                {sellerName.charAt(0)}
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-tight">{sellerName}</h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full">
                  Online
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Usually replies within minutes</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Snapshot Bar */}
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-11 h-11 object-cover rounded-xl border border-slate-200"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-slate-800 truncate">{product.title}</h4>
            <span className="text-xs font-extrabold text-indigo-600">{formatINR(product.price)}</span>
          </div>
          <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-1 rounded-lg">
            {product.condition}
          </span>
        </div>

        {/* Message Thread */}
        <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#f8fafc]">
          {/* Security Banner */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 text-amber-800 text-[11px] border border-amber-200/60">
            <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>Never transfer money before inspecting the product in person.</span>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-2 text-slate-400">
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs">Connecting to secure chat...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center px-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 shadow-sm">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-xs font-bold text-slate-800 mb-1">Start a Conversation</h4>
              <p className="text-[11px] text-slate-500">
                Ask {sellerName} about availability, condition, or pick-up location.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.senderId === user?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                      isMine
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                    }`}
                  >
                    {msg.message}
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 px-1">
                    <span>
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {isMine && <CheckCheck className="w-3.5 h-3.5 text-indigo-500" />}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input Area */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 bg-white border-t border-slate-100 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Message ${sellerName}...`}
            className="flex-1 text-xs px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="p-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
