import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Search,
  Send,
  MessageSquare,
  ShieldCheck,
  CheckCheck,
  Clock,
  ArrowLeft,
  ExternalLink,
  Tag,
  MapPin,
  Sparkles,
  ShoppingBag,
  Trash2,
} from 'lucide-react';
import { RootState } from '../../store/store';
import { setMessagesCount } from '../../store/slices/userSlice';
import { Conversation, ChatMessage } from '../../types/chat.types';
import { chatApi } from '../../api/chat.api';
import { getSocket, joinUserRoom } from '../../api/socket';
import { formatINR } from '../../utils/helpers';
import { INITIAL_PRODUCTS } from '../../utils/constants';

export const Messages: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const queryUserId = searchParams.get('userId');
  const queryProductId = searchParams.get('productId');

  const { user } = useSelector((state: RootState) => state.auth);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatStreamRef = useRef<HTMLDivElement>(null);

  const handleDeleteConversation = async (peerId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (!window.confirm('Delete this conversation?')) return;
    try {
      await chatApi.deleteConversation(peerId);
      setConversations((prev) => prev.filter((c) => c.peerUser.id !== peerId));
      if (selectedConversation?.peerUser.id === peerId) {
        setSelectedConversation(null);
        setMessages([]);
        setMobileShowChat(false);
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const handleClearAllChats = async () => {
    if (!window.confirm('Are you sure you want to clear all conversation history?')) return;
    try {
      await chatApi.clearAllChats();
      setConversations([]);
      setSelectedConversation(null);
      setMessages([]);
      setMobileShowChat(false);
    } catch (err) {
      console.error('Failed to clear chats:', err);
    }
  };

  // Sync unread count to Redux store
  useEffect(() => {
    const totalUnread = conversations.reduce(
      (acc, c) => acc + (c.unreadCount || (c.unread ? 1 : 0)),
      0
    );
    dispatch(setMessagesCount(totalUnread));
  }, [conversations, dispatch]);

  // 1. Load all conversations on mount
  useEffect(() => {
    if (!user?.id) return;

    joinUserRoom(user.id);

    async function loadConversations() {
      setIsLoadingConversations(true);
      try {
        const res = await chatApi.getConversations();
        if (res.success && res.data) {
          setConversations(res.data);

          // If navigated with query params (e.g. from a product details page), select matching conversation
          if (queryUserId) {
            const found = res.data.find((c) => c.peerUser.id === queryUserId);
            if (found) {
              setSelectedConversation(found);
              setMobileShowChat(true);
            } else {
              // Resolve product & seller details from catalog
              const catalogProd = INITIAL_PRODUCTS.find(
                (p) => p.id === queryProductId || p.seller?.id === queryUserId
              );

              const tempConv: Conversation = {
                peerUser: {
                  id: queryUserId,
                  name: catalogProd?.seller?.name || 'Seller',
                  location: catalogProd?.location || 'Chennai',
                },
                lastMessage: 'Start a new conversation',
                productId: queryProductId || catalogProd?.id,
                product: catalogProd
                  ? {
                      id: catalogProd.id,
                      title: catalogProd.title,
                      price: catalogProd.price,
                      imageUrl: catalogProd.imageUrl,
                      condition: catalogProd.condition,
                      status: 'active',
                      city: catalogProd.city,
                    }
                  : null,
                lastMessageAt: new Date().toISOString(),
                unread: false,
                unreadCount: 0,
              };

              setConversations((prev) => {
                if (prev.some((c) => c.peerUser.id === queryUserId)) return prev;
                return [tempConv, ...prev];
              });
              setSelectedConversation(tempConv);
              setMobileShowChat(true);
            }
          } else if (res.data.length > 0 && window.innerWidth >= 768) {
            // Auto select first conversation on desktop
            setSelectedConversation(res.data[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load conversations:', err);
      } finally {
        setIsLoadingConversations(false);
      }
    }

    loadConversations();
  }, [user?.id, queryUserId, queryProductId]);

  // 2. Fetch messages when selectedConversation changes
  useEffect(() => {
    if (!user?.id || !selectedConversation?.peerUser?.id) return;

    async function loadMessages() {
      setIsLoadingMessages(true);
      try {
        const res = await chatApi.getChatHistory(
          selectedConversation!.peerUser.id,
          selectedConversation!.productId || undefined
        );
        if (res.success && res.data) {
          setMessages(res.data);

          // Mark current conversation as read in state
          setConversations((prev) =>
            prev.map((c) =>
              c.peerUser.id === selectedConversation!.peerUser.id
                ? { ...c, unread: false, unreadCount: 0 }
                : c
            )
          );
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
      } finally {
        setIsLoadingMessages(false);
      }
    }

    loadMessages();
  }, [selectedConversation?.peerUser?.id, selectedConversation?.productId, user?.id]);

  // 3. Socket.IO Real-Time incoming message listeners
  useEffect(() => {
    if (!user?.id) return;

    const socket = getSocket();

    const handleIncomingMessage = (newMsg: ChatMessage) => {
      // If message is for currently active chat thread, append to messages only if unique
      if (
        selectedConversation &&
        (newMsg.senderId === selectedConversation.peerUser.id || newMsg.senderId === user.id)
      ) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id || (m.id.startsWith('temp-') && m.message === newMsg.message))) {
            return prev.map((m) =>
              m.id.startsWith('temp-') && m.message === newMsg.message ? newMsg : m
            );
          }
          return [...prev, newMsg];
        });
      }

      // Update conversations list
      setConversations((prev) => {
        const peerId = newMsg.senderId === user.id ? newMsg.receiverId : newMsg.senderId;
        const existingIdx = prev.findIndex((c) => c.peerUser.id === peerId);

        if (existingIdx !== -1) {
          const updated = [...prev];
          const isCurrentActive = selectedConversation?.peerUser.id === peerId;
          const target = {
            ...updated[existingIdx],
            lastMessage: newMsg.message,
            lastMessageAt: newMsg.createdAt,
            unread: isCurrentActive ? false : true,
            unreadCount: isCurrentActive ? 0 : (updated[existingIdx].unreadCount || 0) + 1,
          };
          // Move updated conversation to top
          updated.splice(existingIdx, 1);
          return [target, ...updated];
        } else {
          // New conversation from someone
          const newConv: Conversation = {
            peerUser: {
              id: peerId,
              name: 'User',
            },
            lastMessage: newMsg.message,
            productId: newMsg.productId,
            lastMessageAt: newMsg.createdAt,
            unread: true,
            unreadCount: 1,
          };
          return [newConv, ...prev];
        }
      });
    };

    const handleSentAck = (savedMsg: ChatMessage) => {
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
  }, [user?.id, selectedConversation]);

  // Scroll to top of window on page mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  // Scroll ONLY the internal chat container to bottom on new messages
  useEffect(() => {
    if (chatStreamRef.current) {
      chatStreamRef.current.scrollTop = chatStreamRef.current.scrollHeight;
    }
  }, [messages, isLoadingMessages]);

  // Handle Send Message
  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || !user?.id || !selectedConversation) return;

    const socket = getSocket();
    const peerId = selectedConversation.peerUser.id;

    // Optimistic message
    const tempMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      senderId: user.id,
      receiverId: peerId,
      productId: selectedConversation.productId,
      message: text,
      read: false,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);
    setInputValue('');

    // Emit live over socket
    socket.emit('send_chat_message', {
      senderId: user.id,
      receiverId: peerId,
      productId: selectedConversation.productId,
      message: text,
    });

    // Update conversation list preview
    setConversations((prev) => {
      const idx = prev.findIndex((c) => c.peerUser.id === peerId);
      if (idx !== -1) {
        const updated = [...prev];
        const target = {
          ...updated[idx],
          lastMessage: text,
          lastMessageAt: new Date().toISOString(),
        };
        updated.splice(idx, 1);
        return [target, ...updated];
      }
      return prev;
    });
  };

  const filteredConversations = conversations.filter((c) => {
    const nameMatch = c.peerUser.name.toLowerCase().includes(searchQuery.toLowerCase());
    const prodMatch = c.product?.title?.toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch || prodMatch;
  });

  const formatMessageTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const diffMs = Date.now() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return 'Yesterday';
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div className="w-full">
      {/* Page Title & Breadcrumb */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-indigo-600" />
            Messages & Conversations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Chat in real-time with verified buyers and sellers across DealKart
          </p>
        </div>

        {conversations.length > 0 && (
          <button
            type="button"
            onClick={handleClearAllChats}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-slate-600 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All Chats</span>
          </button>
        )}
      </div>

      {/* Main Dual-Pane Inbox Card */}
      <div className="w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex h-[740px]">
        {/* Left Column: Conversations List */}
        <div
          className={`w-full md:w-[320px] lg:w-[360px] flex-shrink-0 border-r border-slate-100 flex flex-col bg-white transition-all ${
            mobileShowChat ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Search Header */}
          <div className="p-3.5 border-b border-slate-100 bg-slate-50/50">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full text-xs pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
            {isLoadingConversations ? (
              <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs">Loading conversations...</span>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 mb-1">No Conversations Yet</h3>
                <p className="text-xs text-slate-500 max-w-xs mb-4">
                  Browse products and click "Chat with Seller" to start negotiating directly!
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/products')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Explore Products
                </button>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = selectedConversation?.peerUser.id === conv.peerUser.id;
                return (
                  <div
                    key={conv.peerUser.id}
                    onClick={() => {
                      setSelectedConversation(conv);
                      setMobileShowChat(true);
                    }}
                    className={`w-full text-left p-3.5 transition-colors flex items-start gap-3 hover:bg-slate-50 cursor-pointer group relative ${
                      isSelected ? 'bg-indigo-50/70 border-r-4 border-indigo-600' : ''
                    }`}
                  >
                    {/* Peer Avatar */}
                    <div className="relative flex-shrink-0">
                      {conv.peerUser.avatarUrl ? (
                        <img
                          src={conv.peerUser.avatarUrl}
                          alt={conv.peerUser.name}
                          className="w-11 h-11 rounded-2xl object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-black text-sm flex items-center justify-center shadow-sm">
                          {conv.peerUser.name?.charAt(0) || 'U'}
                        </div>
                      )}
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                    </div>

                    {/* Meta info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h3 className="text-xs font-bold text-slate-900 truncate">
                          {conv.peerUser.name}
                        </h3>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">
                            {formatRelativeTime(conv.lastMessageAt)}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteConversation(conv.peerUser.id, e)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all ml-1"
                            title="Delete conversation"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Product snapshot chip if available */}
                      {conv.product && (
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[9.5px] bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-md truncate max-w-[190px] flex items-center gap-1 border border-indigo-100">
                            <Tag className="w-2.5 h-2.5 text-indigo-600 flex-shrink-0" />
                            <span className="truncate">{conv.product.title}</span>
                          </span>
                        </div>
                      )}

                      <p
                        className={`text-xs truncate ${
                          conv.unread ? 'font-bold text-slate-900' : 'text-slate-500'
                        }`}
                      >
                        {conv.lastMessage}
                      </p>
                    </div>

                    {/* Unread badge */}
                    {conv.unread && (
                      <span className="flex-shrink-0 w-2.5 h-2.5 bg-indigo-600 rounded-full mt-2"></span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat View */}
        <div
          className={`flex-1 flex flex-col bg-[#f8fafc] min-w-0 ${
            !mobileShowChat ? 'hidden md:flex' : 'flex'
          }`}
        >
          {selectedConversation ? (
            <>
              {/* Chat Top Bar */}
              <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setMobileShowChat(false)}
                    className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div className="relative">
                    {selectedConversation.peerUser.avatarUrl ? (
                      <img
                        src={selectedConversation.peerUser.avatarUrl}
                        alt={selectedConversation.peerUser.name}
                        className="w-11 h-11 rounded-2xl object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-black text-sm flex items-center justify-center shadow-md">
                        {selectedConversation.peerUser.name?.charAt(0) || 'U'}
                      </div>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-slate-900">
                        {selectedConversation.peerUser.name}
                      </h2>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                        Online
                      </span>
                    </div>
                    {selectedConversation.peerUser.location && (
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {selectedConversation.peerUser.location}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Header Actions */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDeleteConversation(selectedConversation.peerUser.id)}
                    className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-red-50 hover:border-red-200 text-slate-500 hover:text-red-600 text-xs font-bold flex items-center gap-1.5 transition-all"
                    title="Delete this conversation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Delete Chat</span>
                  </button>

                  {selectedConversation.product && (
                    <button
                      type="button"
                      onClick={() => navigate(`/products/${selectedConversation.product?.id}`)}
                      className="px-3.5 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <span>View Listing</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Product Reference Sticky Banner */}
              {selectedConversation.product && (
                <div className="px-6 py-2.5 bg-indigo-50/40 border-b border-indigo-100/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedConversation.product.imageUrl}
                      alt={selectedConversation.product.title}
                      className="w-10 h-10 object-cover rounded-xl border border-indigo-200"
                    />
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 truncate max-w-sm">
                        {selectedConversation.product.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-extrabold text-indigo-600">
                          {formatINR(selectedConversation.product.price)}
                        </span>
                        <span className="text-[10px] bg-white text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 font-medium">
                          {selectedConversation.product.condition}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold bg-white px-2.5 py-1 rounded-lg border border-slate-200/60">
                    Product In Discussion
                  </span>
                </div>
              )}

              {/* Messages Thread Stream */}
              <div ref={chatStreamRef} className="flex-1 p-6 overflow-y-auto space-y-4">
                {/* Safety Tips Banner */}
                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-amber-50 border border-amber-200/60 text-amber-900 text-xs shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>
                    DealKart Safety Tip: Meet in public places and inspect the product in person before making full payment.
                  </span>
                </div>

                {isLoadingMessages ? (
                  <div className="flex flex-col items-center justify-center h-64 space-y-2 text-slate-400">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs">Loading secure message history...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center px-6">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 shadow-sm">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h3 className="text-xs font-bold text-slate-800 mb-1">Start chatting with {selectedConversation.peerUser.name}</h3>
                    <p className="text-xs text-slate-500 max-w-sm">
                      Send a message or select one of the quick suggestions below to begin the conversation.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine =
                      msg.senderId === user?.id ||
                      (selectedConversation && msg.senderId !== selectedConversation.peerUser.id);

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[70%] px-4 py-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                            isMine
                              ? 'bg-indigo-600 text-white rounded-tr-none'
                              : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                          }`}
                        >
                          {msg.message}
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 px-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{formatMessageTime(msg.createdAt)}</span>
                          {isMine && <CheckCheck className="w-3.5 h-3.5 text-indigo-500 ml-1" />}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-4 bg-white border-t border-slate-100 flex items-center gap-3"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={`Write a message to ${selectedConversation.peerUser.name}...`}
                  className="flex-1 text-xs px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="px-5 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white text-xs font-bold rounded-2xl shadow-md transition-all active:scale-95 flex items-center gap-2"
                >
                  <span>Send</span>
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 shadow-sm">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h2 className="text-base font-bold text-slate-900 mb-1">Your Inbox</h2>
              <p className="text-xs text-slate-500 max-w-sm">
                Select an active conversation from the left to read messages and reply in real-time.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
