import React, { useState, useEffect, useRef } from 'react';
import { Send, X, ShieldCheck, CheckCheck, Sparkles, Tag } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { Product } from '../../types/product.types';
import { ChatMessage, parseOfferFromMessage, ChatOffer } from '../../types/chat.types';
import { chatApi } from '../../api/chat.api';
import { getSocket, joinUserRoom } from '../../api/socket';
import { formatINR } from '../../utils/helpers';
import { MakeOfferModal } from '../MakeOfferModal/MakeOfferModal';
import { ChatOfferCard } from '../ChatOfferCard/ChatOfferCard';

interface ChatModalProps {
  product: Product;
  onClose: () => void;
  onOpenOffer?: boolean;
}

export const ChatModal: React.FC<ChatModalProps> = ({ product, onClose, onOpenOffer = false }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isMakeOfferOpen, setIsMakeOfferOpen] = useState(onOpenOffer);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const sellerId = product.seller?.id || (product as any).sellerId;
  const sellerName = product.seller?.name || 'Seller';

  // 1. Initial connection & loading chat history
  useEffect(() => {
    if (!user?.id || !sellerId) return;

    joinUserRoom(user.id);

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

    const socket = getSocket();

    const handleIncomingMessage = (newMsg: ChatMessage) => {
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

    socket.on('receive_chat_message', handleIncomingMessage);
    socket.on('message_sent_ack', handleSentAck);
    socket.on('offer_status_changed', handleOfferStatusChanged);

    return () => {
      socket.off('receive_chat_message', handleIncomingMessage);
      socket.off('message_sent_ack', handleSentAck);
      socket.off('offer_status_changed', handleOfferStatusChanged);
    };
  }, [user?.id, sellerId, product.id]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || !user?.id || !sellerId) return;

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
    if (!textToSend) setInputValue('');

    const socket = getSocket();
    socket.emit('send_chat_message', {
      senderId: user.id,
      receiverId: sellerId,
      productId: product.id,
      message: text,
    });
  };

  const handleSendOffer = (amount: number, note?: string) => {
    const offerPayload: ChatOffer = {
      amount,
      originalPrice: product.price,
      status: 'pending',
      productId: product.id,
      productTitle: product.title,
      note,
    };

    const offerMessage = `[OFFER:${JSON.stringify(offerPayload)}] ${
      note ? note : `I'd like to make an offer of ${formatINR(amount)} for this item.`
    }`;

    handleSendMessage(offerMessage);
  };

  const handleAcceptOffer = (offer: ChatOffer) => {
    const msg = messages.find((m) => m.message.includes(`"amount":${offer.amount}`));
    if (msg) {
      const socket = getSocket();
      socket.emit('update_offer_status', {
        messageId: msg.id,
        newStatus: 'accepted',
        senderId: user?.id,
        receiverId: sellerId,
      });

      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === msg.id) {
            const acceptedOffer = { ...offer, status: 'accepted' as const };
            const updatedMsg = m.message.replace(/\[OFFER:.*?\]/, `[OFFER:${JSON.stringify(acceptedOffer)}]`);
            return { ...m, message: updatedMsg };
          }
          return m;
        })
      );
    }
  };

  const handleDeclineOffer = (offer: ChatOffer) => {
    const msg = messages.find((m) => m.message.includes(`"amount":${offer.amount}`));
    if (msg) {
      const socket = getSocket();
      socket.emit('update_offer_status', {
        messageId: msg.id,
        newStatus: 'declined',
        senderId: user?.id,
        receiverId: sellerId,
      });

      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === msg.id) {
            const declinedOffer = { ...offer, status: 'declined' as const };
            const updatedMsg = m.message.replace(/\[OFFER:.*?\]/, `[OFFER:${JSON.stringify(declinedOffer)}]`);
            return { ...m, message: updatedMsg };
          }
          return m;
        })
      );
    }
  };

  return (
    <div className="modal-backdrop show active" style={{ zIndex: 1100 }} onClick={onClose}>
      <div
        className="chat-modal-box"
        style={{
          width: '100%',
          maxWidth: '520px',
          height: '620px',
          background: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#eef2ff',
                color: '#4f46e5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '15px',
              }}
            >
              {sellerName.charAt(0)}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>{sellerName}</span>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#10b981',
                  }}
                />
              </div>
              <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                {product.seller?.memberSince || 'Verified Seller'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setIsMakeOfferOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '9999px',
                background: '#eef2ff',
                color: '#4f46e5',
                border: 'none',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Tag style={{ width: '13px', height: '13px' }} />
              <span>Make Offer</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: '#f8fafc',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b',
                cursor: 'pointer',
              }}
            >
              <X style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
        </div>

        {/* Product Snapshot Bar */}
        <div
          style={{
            padding: '10px 18px',
            background: '#f8fafc',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            {product.imageUrl && (
              <img
                src={product.imageUrl}
                alt={product.title}
                style={{ width: '34px', height: '34px', borderRadius: '8px', objectFit: 'cover' }}
              />
            )}
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {product.title}
              </p>
              <span style={{ fontSize: '11px', color: '#64748b' }}>{formatINR(product.price)}</span>
            </div>
          </div>
          <span style={{ fontSize: '10.5px', background: '#eef2ff', color: '#4f46e5', fontWeight: 700, padding: '2px 8px', borderRadius: '6px' }}>
            {product.condition}
          </span>
        </div>

        {/* Message Thread */}
        <div ref={chatContainerRef} style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', background: '#f8fafc' }}>
          {/* Security Banner */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '12px', background: '#fef3c7', color: '#92400e', fontSize: '11px', border: '1px solid #fde68a' }}>
            <ShieldCheck style={{ width: '16px', height: '16px', color: '#d97706', flexShrink: 0 }} />
            <span>Never transfer money before inspecting the product in person.</span>
          </div>

          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '180px', color: '#94a3b8' }}>
              <div style={{ width: '24px', height: '24px', border: '2px solid #4f46e5', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <span style={{ fontSize: '12px', marginTop: '8px' }}>Connecting to secure chat...</span>
            </div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 16px', color: '#64748b' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: '#eef2ff',
                  color: '#4f46e5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                }}
              >
                <Sparkles style={{ width: '22px', height: '22px' }} />
              </div>
              <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                Start a Conversation
              </h4>
              <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
                Ask {sellerName} about availability, condition, or make a price offer.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.senderId === user?.id;
              const { offer, cleanText } = parseOfferFromMessage(msg.message);

              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMine ? 'flex-end' : 'flex-start',
                  }}
                >
                  {offer ? (
                    <div>
                      <ChatOfferCard
                        offer={offer}
                        isSender={isMine}
                        onAcceptOffer={handleAcceptOffer}
                        onDeclineOffer={handleDeclineOffer}
                        onCounterOffer={() => setIsMakeOfferOpen(true)}
                      />
                      {cleanText && (
                        <div
                          style={{
                            marginTop: '4px',
                            padding: '8px 14px',
                            borderRadius: '16px',
                            background: isMine ? '#4f46e5' : '#ffffff',
                            color: isMine ? '#ffffff' : '#1e293b',
                            fontSize: '12px',
                            maxWidth: '320px',
                            border: isMine ? 'none' : '1px solid #e2e8f0',
                          }}
                        >
                          {cleanText}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        background: isMine ? '#4f46e5' : '#ffffff',
                        color: isMine ? '#ffffff' : '#0f172a',
                        fontSize: '13px',
                        maxWidth: '78%',
                        lineHeight: 1.45,
                        wordBreak: 'break-word',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        border: isMine ? 'none' : '1px solid #f1f5f9',
                      }}
                    >
                      {msg.message}
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px', fontSize: '10px', color: '#94a3b8' }}>
                    <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {isMine && <CheckCheck style={{ width: '13px', height: '13px', color: '#6366f1' }} />}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div style={{ padding: '6px 14px', background: '#ffffff', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '6px', overflowX: 'auto' }}>
          {['Is this still available?', 'What is your lowest price?', 'Can I inspect before buying?'].map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => handleSendMessage(chip)}
              style={{
                padding: '4px 10px',
                borderRadius: '9999px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                fontSize: '11px',
                color: '#475569',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Bottom Input Area */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          style={{ padding: '12px 16px', background: '#ffffff', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Message ${sellerName}...`}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '9999px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              fontSize: '13px',
              outline: 'none',
              color: '#0f172a',
            }}
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: inputValue.trim() ? '#4f46e5' : '#e2e8f0',
              color: '#ffffff',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: inputValue.trim() ? 'pointer' : 'default',
            }}
          >
            <Send style={{ width: '16px', height: '16px' }} />
          </button>
        </form>
      </div>

      {/* Make Offer Modal */}
      {isMakeOfferOpen && (
        <MakeOfferModal
          product={product}
          sellerName={sellerName}
          onClose={() => setIsMakeOfferOpen(false)}
          onSubmitOffer={handleSendOffer}
        />
      )}
    </div>
  );
};
