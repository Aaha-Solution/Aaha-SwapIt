import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Search,
  Send,
  MessageSquare,
  ShieldCheck,
  CheckCheck,
  Check,
  Clock,
  ArrowLeft,
  ExternalLink,
  Tag,
  MapPin,
  Sparkles,
  ShoppingBag,
  Trash2,
  Image as ImageIcon,
  Handshake,
  Zap,
  Smile,
  X,
  Plus,
} from 'lucide-react';
import { RootState } from '../../store/store';
import { setMessagesCount } from '../../store/slices/userSlice';
import {
  Conversation,
  ChatMessage,
  parseOfferFromMessage,
  parseDealAgreedFromMessage,
  parseLocationFromMessage,
  parseImageFromMessage,
  ChatOffer,
  DealAgreement,
  LocationShare,
  ImageAttachment,
} from '../../types/chat.types';
import { chatApi } from '../../api/chat.api';
import { getSocket, joinUserRoom } from '../../api/socket';
import { formatINR } from '../../utils/helpers';
import { INITIAL_PRODUCTS } from '../../utils/constants';
import { MakeOfferModal } from '../../components/MakeOfferModal/MakeOfferModal';
import { ChatOfferCard } from '../../components/ChatOfferCard/ChatOfferCard';
import { ChatDealAgreedCard } from '../../components/ChatDealCards/ChatDealAgreedCard';
import { ChatLocationCard } from '../../components/ChatDealCards/ChatLocationCard';
import { ChatImageCard } from '../../components/ChatDealCards/ChatImageCard';
import { AgreeDealModal } from '../../components/ChatDealCards/AgreeDealModal';
import { ShareLocationModal } from '../../components/ChatDealCards/ShareLocationModal';
import { DealPipelineBar, DealStage } from '../../components/DealPipeline/DealPipelineBar';
import { WriteReviewModal } from '../../components/Rating/WriteReviewModal';

const QUICK_INQUIRIES = [
  'Is this still available?',
  'What is your final price?',
  'Can we meet today?',
  'Is condition like new?',
];

const EMOJI_REACTIONS = ['👍', '❤️', '🤝', '🔥', '💰', '❓'];

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

  // Modals & interactive panels
  const [isMakeOfferOpen, setIsMakeOfferOpen] = useState(false);
  const [isCounterOfferMode, setIsCounterOfferMode] = useState(false);
  const [counterOfferAmount, setCounterOfferAmount] = useState<number | undefined>(undefined);
  const [isAgreeDealOpen, setIsAgreeDealOpen] = useState(false);
  const [isShareLocationOpen, setIsShareLocationOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState<string | null>(null); // messageId or null

  // Typing state
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const [typingPeerName, setTypingPeerName] = useState('Seller');
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Image Attachment preview state
  const [selectedImageFile, setSelectedImageFile] = useState<string | null>(null);
  const [imageCaption, setImageCaption] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatStreamRef = useRef<HTMLDivElement>(null);

  const handleDeleteConversation = async (peerId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
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

          // If navigated with query params, select matching conversation
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

  // 2. Fetch messages when selectedConversation changes & mark as read
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

          // Mark current conversation as read in state & notify server over socket
          setConversations((prev) =>
            prev.map((c) =>
              c.peerUser.id === selectedConversation!.peerUser.id
                ? { ...c, unread: false, unreadCount: 0 }
                : c
            )
          );

          if (user?.id) {
            const socket = getSocket();
            socket.emit('mark_messages_read', {
              readerId: user.id,
              senderId: selectedConversation!.peerUser.id,
            });
          }
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
      } finally {
        setIsLoadingMessages(false);
      }
    }

    loadMessages();
    setIsPeerTyping(false);
  }, [selectedConversation?.peerUser?.id, selectedConversation?.productId, user?.id]);

  // 3. Socket.IO Real-Time incoming message listeners, typing indicators, read receipts & reactions
  useEffect(() => {
    if (!user?.id) return;

    const socket = getSocket();

    const handleIncomingMessage = (newMsg: ChatMessage) => {
      // If message is for currently active chat thread, append to messages only if unique
      if (
        selectedConversation &&
        (newMsg.senderId === selectedConversation.peerUser.id || newMsg.senderId === user.id)
      ) {
        setIsPeerTyping(false);
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id || (m.id.startsWith('temp-') && m.message === newMsg.message))) {
            return prev.map((m) =>
              m.id.startsWith('temp-') && m.message === newMsg.message ? newMsg : m
            );
          }
          return [...prev, newMsg];
        });

        // If from peer while chat is open, immediately mark as read
        if (newMsg.senderId === selectedConversation.peerUser.id) {
          socket.emit('mark_messages_read', {
            readerId: user.id,
            senderId: newMsg.senderId,
          });
        }
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

    const handleOfferStatusChanged = (data: { messageId: string; newStatus: 'accepted' | 'declined' }) => {
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === data.messageId) {
            const match = m.message.match(/\[OFFER:(.*?)\]/);
            if (match && match[1]) {
              try {
                const offerObj = JSON.parse(match[1]);
                offerObj.status = data.newStatus;
                const updatedMsg = m.message.replace(/\[OFFER:.*?\]/, `[OFFER:${JSON.stringify(offerObj)}]`);
                return { ...m, message: updatedMsg };
              } catch {}
            }
          }
          return m;
        })
      );
    };

    // Typing handlers
    const handleUserTypingStart = (data: { userId: string; userName: string }) => {
      if (selectedConversation && data.userId === selectedConversation.peerUser.id) {
        setIsPeerTyping(true);
        setTypingPeerName(data.userName || selectedConversation.peerUser.name);
      }
    };

    const handleUserTypingStop = (data: { userId: string }) => {
      if (selectedConversation && data.userId === selectedConversation.peerUser.id) {
        setIsPeerTyping(false);
      }
    };

    // Read receipt update handler
    const handleMessagesReadUpdate = (data: { readerId: string }) => {
      if (selectedConversation && data.readerId === selectedConversation.peerUser.id) {
        setMessages((prev) => prev.map((m) => ({ ...m, read: true })));
      }
    };

    // Reaction update handler
    const handleReactionUpdate = (data: { messageId: string; emoji: string; userId: string }) => {
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === data.messageId) {
            const currentReactions = { ...(m.reactions || {}) };
            const users = currentReactions[data.emoji] || [];
            if (users.includes(data.userId)) {
              // Remove reaction if already reacted
              currentReactions[data.emoji] = users.filter((u) => u !== data.userId);
              if (currentReactions[data.emoji].length === 0) {
                delete currentReactions[data.emoji];
              }
            } else {
              currentReactions[data.emoji] = [...users, data.userId];
            }
            return { ...m, reactions: currentReactions };
          }
          return m;
        })
      );
    };

    socket.on('receive_chat_message', handleIncomingMessage);
    socket.on('message_sent_ack', handleSentAck);
    socket.on('offer_status_changed', handleOfferStatusChanged);
    socket.on('user_typing_start', handleUserTypingStart);
    socket.on('user_typing_stop', handleUserTypingStop);
    socket.on('messages_read_update', handleMessagesReadUpdate);
    socket.on('message_reaction_update', handleReactionUpdate);

    return () => {
      socket.off('receive_chat_message', handleIncomingMessage);
      socket.off('message_sent_ack', handleSentAck);
      socket.off('offer_status_changed', handleOfferStatusChanged);
      socket.off('user_typing_start', handleUserTypingStart);
      socket.off('user_typing_stop', handleUserTypingStop);
      socket.off('messages_read_update', handleMessagesReadUpdate);
      socket.off('message_reaction_update', handleReactionUpdate);
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
  }, [messages, isLoadingMessages, isPeerTyping]);

  // Handle Typing event emitter
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);

    if (!user?.id || !selectedConversation) return;
    const socket = getSocket();

    socket.emit('typing_start', {
      senderId: user.id,
      receiverId: selectedConversation.peerUser.id,
      senderName: user.name || 'User',
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing_stop', {
        senderId: user.id,
        receiverId: selectedConversation.peerUser.id,
      });
    }, 1500);
  };

  // Handle Send Message
  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text && !selectedImageFile) return;
    if (!user?.id || !selectedConversation) return;

    const socket = getSocket();
    const peerId = selectedConversation.peerUser.id;

    // If an image is attached, format as [IMAGE:...] tag
    let finalPayloadText = text;
    if (selectedImageFile) {
      const imgPayload: ImageAttachment = {
        url: selectedImageFile,
        caption: imageCaption.trim() || undefined,
      };
      finalPayloadText = `[IMAGE:${JSON.stringify(imgPayload)}] ${text}`.trim();
      setSelectedImageFile(null);
      setImageCaption('');
    }

    // Clear typing
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    socket.emit('typing_stop', { senderId: user.id, receiverId: peerId });

    // Optimistic message
    const tempMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      senderId: user.id,
      receiverId: peerId,
      productId: selectedConversation.productId,
      message: finalPayloadText,
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
      message: finalPayloadText,
    });

    // Update conversation list preview
    setConversations((prev) => {
      const idx = prev.findIndex((c) => c.peerUser.id === peerId);
      if (idx !== -1) {
        const updated = [...prev];
        const target = {
          ...updated[idx],
          lastMessage: finalPayloadText,
          lastMessageAt: new Date().toISOString(),
        };
        updated.splice(idx, 1);
        return [target, ...updated];
      }
      return prev;
    });
  };

  // Compute latest offer & deal status for the selected conversation
  const { latestOffer, latestDeal, dealStage } = React.useMemo(() => {
    let foundOffer: ChatOffer | null = null;
    let foundDeal: DealAgreement | null = null;
    let isCompleted = false;

    // Scan backwards
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (!foundDeal) {
        const { deal } = parseDealAgreedFromMessage(msg.message);
        if (deal) {
          foundDeal = deal;
          if (deal.status === 'completed') isCompleted = true;
        }
      }
      if (!foundOffer) {
        const { offer } = parseOfferFromMessage(msg.message);
        if (offer) {
          foundOffer = offer;
        }
      }
    }

    let stage: DealStage = 'inquiry';
    if (isCompleted) {
      stage = 'completed';
    } else if (foundDeal || foundOffer?.status === 'accepted') {
      stage = 'deal_agreed';
    } else if (foundOffer && foundOffer.status === 'pending') {
      stage = 'offer_pending';
    }

    return { latestOffer: foundOffer, latestDeal: foundDeal, dealStage: stage };
  }, [messages]);

  // Open Standard Offer Modal
  const handleOpenStandardOffer = () => {
    setCounterOfferAmount(undefined);
    setIsCounterOfferMode(false);
    setIsMakeOfferOpen(true);
  };

  // Open Counter-Offer Modal
  const handleOpenCounterOffer = (amount?: number) => {
    setCounterOfferAmount(amount);
    setIsCounterOfferMode(true);
    setIsMakeOfferOpen(true);
  };

  // Handle Offer creation
  const handleSendOffer = (amount: number, note?: string) => {
    if (!selectedConversation?.product) return;
    const offerPayload: ChatOffer = {
      amount,
      originalPrice: selectedConversation.product.price,
      status: 'pending',
      productId: selectedConversation.product.id,
      productTitle: selectedConversation.product.title,
      note,
    };

    const offerMessage = `[OFFER:${JSON.stringify(offerPayload)}] ${
      note ? note : `I'd like to make an offer of ${formatINR(amount)} for this item.`
    }`;

    handleSendMessage(offerMessage);
  };

  // Handle Offer Acceptance
  const handleAcceptOffer = (offer: ChatOffer) => {
    if (!user?.id || !selectedConversation) return;
    const socket = getSocket();

    const targetMsg = messages.find(
      (m) => m.message.includes('[OFFER:') && m.message.includes(`"amount":${offer.amount}`)
    );
    if (targetMsg) {
      socket.emit('update_offer_status', {
        messageId: targetMsg.id,
        newStatus: 'accepted',
        senderId: user.id,
        receiverId: selectedConversation.peerUser.id,
      });
    }

    // Auto-create a Deal Agreement with a generated 4-digit handshake pin
    const handshakePin = Math.floor(1000 + Math.random() * 9000).toString();
    const dealAgreement: DealAgreement = {
      agreedPrice: offer.amount,
      meetLocation: selectedConversation.peerUser.location || 'Central Metro / Public Mall',
      meetTime: 'Today or Tomorrow by mutual convenience',
      handshakeCode: handshakePin,
      status: 'agreed',
      productId: offer.productId,
      productTitle: offer.productTitle || selectedConversation.product?.title,
    };

    handleSendDealAgreement(dealAgreement);
  };

  // Handle Offer Decline
  const handleDeclineOffer = (offer: ChatOffer) => {
    if (!user?.id || !selectedConversation) return;
    const socket = getSocket();
    const targetMsg = messages.find(
      (m) => m.message.includes('[OFFER:') && m.message.includes(`"amount":${offer.amount}`)
    );
    if (targetMsg) {
      socket.emit('update_offer_status', {
        messageId: targetMsg.id,
        newStatus: 'declined',
        senderId: user.id,
        receiverId: selectedConversation.peerUser.id,
      });
    }
    handleSendMessage(`Offer of ${formatINR(offer.amount)} declined. Feel free to make a counter-offer.`);
  };

  // Quick Preset Offers (-5%, -10%, -15%)
  const handleQuickPresetOffer = (discountPercent: number) => {
    if (!selectedConversation?.product) return;
    const basePrice = selectedConversation.product.price;
    const discountedPrice = Math.round(basePrice * (1 - discountPercent / 100));
    handleSendOffer(
      discountedPrice,
      `Quick Offer: ${discountPercent}% discount (${formatINR(discountedPrice)})`
    );
  };

  // Handle Deal Agreement Locking
  const handleSendDealAgreement = (deal: DealAgreement) => {
    const dealMsg = `[DEAL_AGREED:${JSON.stringify(deal)}] Deal locked for ${formatINR(
      deal.agreedPrice
    )} at ${deal.meetLocation}!`;
    handleSendMessage(dealMsg);
  };

  // Handle Location Sharing
  const handleSendLocation = (loc: LocationShare) => {
    const locMsg = `[LOCATION:${JSON.stringify(loc)}] Shared meetup location: ${loc.name}`;
    handleSendMessage(locMsg);
  };

  // Handle Message Reactions
  const handleToggleReaction = (messageId: string, emoji: string) => {
    if (!user?.id || !selectedConversation) return;
    const socket = getSocket();
    socket.emit('message_reaction', {
      messageId,
      emoji,
      userId: user.id,
      receiverId: selectedConversation.peerUser.id,
    });
    setIsEmojiPickerOpen(null);
  };

  // Handle Image File selection
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setSelectedImageFile(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
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
            Messages & Live Deal Negotiations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time chat, in-chat offers, deal locking, and secure exchange verification
          </p>
        </div>

        {conversations.length > 0 && (
          <button
            type="button"
            onClick={handleClearAllChats}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-slate-600 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All Chats</span>
          </button>
        )}
      </div>

      {/* Main Dual-Pane Inbox Card */}
      <div className="w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex h-[760px]">
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
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
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
                        <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
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

                      {/* Product snapshot chip */}
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
                        {conv.lastMessage.includes('[OFFER:')
                          ? '🏷️ Price Offer'
                          : conv.lastMessage.includes('[DEAL_AGREED:')
                          ? '🤝 Deal Locked'
                          : conv.lastMessage.includes('[LOCATION:')
                          ? '📍 Meetup Location'
                          : conv.lastMessage.includes('[IMAGE:')
                          ? '📸 Shared Image'
                          : conv.lastMessage}
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
              <div className="px-6 py-3.5 bg-white border-b border-slate-100 flex items-center justify-between">
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
                      <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-md">
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
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
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
                    onClick={() => setIsAgreeDealOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <Handshake className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Lock Deal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsShareLocationOpen(true)}
                    className="px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Share Spot</span>
                  </button>

                  {selectedConversation.product && (
                    <button
                      type="button"
                      onClick={() => navigate(`/products/${selectedConversation.product?.id}`)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      title="View Product Details"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Real-Time Deal & Offer Stepper Bar */}
              <DealPipelineBar
                stage={dealStage}
                latestOffer={latestOffer}
                dealAgreement={latestDeal}
                isSeller={selectedConversation.peerUser.id !== user?.id}
                onMakeOffer={handleOpenStandardOffer}
                onCounterOffer={handleOpenCounterOffer}
                onLockDeal={() => setIsAgreeDealOpen(true)}
                onCompleteAndReview={() => setIsReviewModalOpen(true)}
              />

              {/* Product Reference Sticky Banner */}
              {selectedConversation.product && (
                <div className="px-6 py-2.5 bg-indigo-50/50 border-b border-indigo-100/70 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedConversation.product.imageUrl}
                      alt={selectedConversation.product.title}
                      className="w-10 h-10 object-cover rounded-xl border border-indigo-200"
                    />
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 truncate max-w-xs">
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

                  {/* Quick Offer Presets */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-500 hidden sm:inline">Quick Offer:</span>
                    <button
                      type="button"
                      onClick={() => handleQuickPresetOffer(5)}
                      className="text-[11px] font-bold text-indigo-700 bg-white hover:bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-200 transition-colors cursor-pointer"
                      title="Offer 5% off"
                    >
                      -5%
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickPresetOffer(10)}
                      className="text-[11px] font-bold text-indigo-700 bg-white hover:bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-200 transition-colors cursor-pointer"
                      title="Offer 10% off"
                    >
                      -10%
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenStandardOffer}
                      className="text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-1"
                    >
                      <Tag className="w-3 h-3" />
                      <span>Custom Offer</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Messages Thread Stream */}
              <div ref={chatStreamRef} className="flex-1 p-6 overflow-y-auto space-y-4">
                {/* Safety Tips Banner */}
                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-amber-50 border border-amber-200/60 text-amber-900 text-xs shadow-xs">
                  <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>
                    SwapIt Trust Tip: Meet at verified public landmarks, inspect item condition in person, and use the 4-digit handshake code upon exchange.
                  </span>
                </div>

                {isLoadingMessages ? (
                  <div className="flex flex-col items-center justify-center h-64 space-y-2 text-slate-400">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs">Loading secure message history...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center px-6">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 shadow-xs">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h3 className="text-xs font-bold text-slate-800 mb-1">
                      Start chatting with {selectedConversation.peerUser.name}
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm">
                      Send a message or select one of the quick suggestions below to begin negotiating.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine =
                      msg.senderId === user?.id ||
                      (selectedConversation && msg.senderId !== selectedConversation.peerUser.id);

                    // Parse rich payload cards
                    const { offer, cleanText: offerCleanText } = parseOfferFromMessage(msg.message);
                    const { deal, cleanText: dealCleanText } = parseDealAgreedFromMessage(msg.message);
                    const { location, cleanText: locCleanText } = parseLocationFromMessage(msg.message);
                    const { imageAttachment, cleanText: imgCleanText } = parseImageFromMessage(msg.message);

                    const effectiveText = offer
                      ? offerCleanText
                      : deal
                      ? dealCleanText
                      : location
                      ? locCleanText
                      : imageAttachment
                      ? imgCleanText
                      : msg.message;

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col group relative ${isMine ? 'items-end' : 'items-start'}`}
                      >
                        {/* Hover Emoji Reaction Trigger */}
                        <div
                          className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mb-1 ${
                            isMine ? 'flex-row-reverse' : 'flex-row'
                          }`}
                        >
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setIsEmojiPickerOpen(isEmojiPickerOpen === msg.id ? null : msg.id)
                              }
                              className="p-1 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-slate-600 shadow-xs text-xs"
                              title="React to message"
                            >
                              <Smile className="w-3.5 h-3.5" />
                            </button>

                            {/* Floating Emoji Picker */}
                            {isEmojiPickerOpen === msg.id && (
                              <div
                                className={`absolute z-30 bottom-full mb-1 bg-white p-1.5 rounded-2xl shadow-xl border border-slate-200 flex items-center gap-1 animate-scale-in ${
                                  isMine ? 'right-0' : 'left-0'
                                }`}
                              >
                                {EMOJI_REACTIONS.map((emoji) => (
                                  <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => handleToggleReaction(msg.id, emoji)}
                                    className="text-base p-1.5 hover:bg-slate-100 rounded-xl transition-transform hover:scale-125 cursor-pointer"
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Rich Offer Card */}
                        {offer && (
                          <ChatOfferCard
                            offer={offer}
                            isSender={isMine}
                            onAcceptOffer={handleAcceptOffer}
                            onDeclineOffer={handleDeclineOffer}
                            onCounterOffer={handleOpenCounterOffer}
                          />
                        )}

                        {/* Rich Deal Agreement Card */}
                        {deal && (
                          <ChatDealAgreedCard
                            deal={deal}
                            isSender={isMine}
                            onCompleteAndReview={() => setIsReviewModalOpen(true)}
                          />
                        )}

                        {/* Rich Location Card */}
                        {location && <ChatLocationCard location={location} />}

                        {/* Rich Image Attachment Card */}
                        {imageAttachment && (
                          <ChatImageCard imageAttachment={imageAttachment} isMine={isMine} />
                        )}

                        {/* Standard Message Bubble */}
                        {effectiveText && (
                          <div
                            className={`max-w-[75%] px-4 py-3 rounded-2xl text-xs leading-relaxed shadow-xs ${
                              isMine
                                ? 'bg-indigo-600 text-white rounded-tr-none font-medium'
                                : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none font-medium'
                            }`}
                          >
                            {effectiveText}
                          </div>
                        )}

                        {/* Message Reactions Badges */}
                        {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {Object.entries(msg.reactions).map(([emoji, userIds]) => (
                              <span
                                key={emoji}
                                onClick={() => handleToggleReaction(msg.id, emoji)}
                                className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border cursor-pointer transition-all ${
                                  user?.id && userIds.includes(user.id)
                                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold'
                                    : 'bg-white border-slate-200 text-slate-600'
                                }`}
                              >
                                <span>{emoji}</span>
                                <span className="text-[9.5px] font-bold">{userIds.length}</span>
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Message Meta / Timestamp & Read Receipt */}
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 px-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{formatMessageTime(msg.createdAt)}</span>
                          {isMine && (
                            <span title={msg.read ? 'Seen' : 'Sent'}>
                              {msg.read ? (
                                <CheckCheck className="w-3.5 h-3.5 text-blue-500 ml-1" />
                              ) : (
                                <Check className="w-3.5 h-3.5 text-slate-400 ml-1" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Real-time Typing Indicator Bubble */}
                {isPeerTyping && (
                  <div className="flex items-center gap-2 animate-fade-in">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                      {typingPeerName.charAt(0)}
                    </div>
                    <div className="px-4 py-2.5 bg-white border border-slate-200/80 rounded-2xl rounded-tl-none shadow-xs flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-semibold">{typingPeerName} is typing</span>
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Inquiry Suggestions */}
              <div className="px-4 py-2 bg-slate-50/80 border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex-shrink-0 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-500" />
                  Quick Ask:
                </span>
                {QUICK_INQUIRIES.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(q)}
                    className="text-xs text-slate-600 hover:text-indigo-600 bg-white hover:bg-indigo-50 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-indigo-200 whitespace-nowrap transition-all shadow-2xs font-medium cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Image Preview Box if attached */}
              {selectedImageFile && (
                <div className="p-3 bg-indigo-50/60 border-t border-indigo-100 flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={selectedImageFile}
                      alt="Attachment preview"
                      className="w-14 h-14 object-cover rounded-xl border-2 border-indigo-300"
                    />
                    <button
                      type="button"
                      onClick={() => setSelectedImageFile(null)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs shadow-xs"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={imageCaption}
                      onChange={(e) => setImageCaption(e.target.value)}
                      placeholder="Add an optional caption for this photo..."
                      className="w-full text-xs px-3 py-2 bg-white border border-indigo-200 rounded-xl focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              {/* Input Form & Action Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-3.5 bg-white border-t border-slate-100 flex items-center gap-2"
              >
                {/* Image Upload Button */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 rounded-2xl bg-slate-100 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 transition-all cursor-pointer"
                  title="Attach Photo"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>

                {/* Lock Deal Quick Trigger */}
                <button
                  type="button"
                  onClick={() => setIsAgreeDealOpen(true)}
                  className="p-3 rounded-2xl bg-slate-100 hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 transition-all cursor-pointer"
                  title="Lock Deal Agreement"
                >
                  <Handshake className="w-4 h-4" />
                </button>

                {/* Location Quick Trigger */}
                <button
                  type="button"
                  onClick={() => setIsShareLocationOpen(true)}
                  className="p-3 rounded-2xl bg-slate-100 hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition-all cursor-pointer"
                  title="Share Meetup Location"
                >
                  <MapPin className="w-4 h-4" />
                </button>

                {/* Message Input */}
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder={`Write a message to ${selectedConversation.peerUser.name}...`}
                  className="flex-1 text-xs px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800"
                />

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!inputValue.trim() && !selectedImageFile}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white text-xs font-bold rounded-2xl shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <span>Send</span>
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 shadow-xs">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h2 className="text-base font-bold text-slate-900 mb-1">Your Inbox</h2>
              <p className="text-xs text-slate-500 max-w-sm">
                Select an active conversation from the left to read messages and negotiate in real-time.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Make Offer Modal */}
      {isMakeOfferOpen && selectedConversation?.product && (
        <MakeOfferModal
          product={selectedConversation.product}
          sellerName={selectedConversation.peerUser.name}
          initialAmount={counterOfferAmount}
          isCounterOffer={isCounterOfferMode}
          onClose={() => setIsMakeOfferOpen(false)}
          onSubmitOffer={handleSendOffer}
        />
      )}

      {/* Lock Deal Agreement Modal */}
      {isAgreeDealOpen && (
        <AgreeDealModal
          product={selectedConversation?.product}
          peerName={selectedConversation?.peerUser?.name || 'Seller'}
          onClose={() => setIsAgreeDealOpen(false)}
          onSubmitDeal={handleSendDealAgreement}
        />
      )}

      {/* Share Location Modal */}
      {isShareLocationOpen && (
        <ShareLocationModal
          onClose={() => setIsShareLocationOpen(false)}
          onShareLocation={handleSendLocation}
        />
      )}

      {/* Deal Completed & Write Review Modal */}
      {isReviewModalOpen && selectedConversation && (
        <WriteReviewModal
          targetUserId={selectedConversation.peerUser.id}
          targetUserName={selectedConversation.peerUser.name}
          targetUserAvatar={selectedConversation.peerUser.avatarUrl}
          productId={selectedConversation.productId || undefined}
          productTitle={selectedConversation.product?.title}
          onClose={() => setIsReviewModalOpen(false)}
          onSuccess={() => {
            setIsReviewModalOpen(false);
            handleSendMessage('🎉 Deal completed and verified review submitted! Thank you for the smooth swap.');
          }}
        />
      )}
    </div>
  );
};
