import React from 'react';
import { Tag, Check, X, ArrowRight, CheckCircle2, XCircle, Clock, ShoppingCart } from 'lucide-react';
import { ChatOffer } from '../../types/chat.types';
import { formatINR } from '../../utils/helpers';

interface ChatOfferCardProps {
  offer: ChatOffer;
  isSender: boolean;
  onAcceptOffer?: (offer: ChatOffer) => void;
  onDeclineOffer?: (offer: ChatOffer) => void;
  onCounterOffer?: () => void;
  onPayAgreedPrice?: (offer: ChatOffer) => void;
}

export const ChatOfferCard: React.FC<ChatOfferCardProps> = ({
  offer,
  isSender,
  onAcceptOffer,
  onDeclineOffer,
  onCounterOffer,
  onPayAgreedPrice,
}) => {
  const isAccepted = offer.status === 'accepted';
  const isDeclined = offer.status === 'declined';
  const isPending = offer.status === 'pending';

  const savings = (offer.originalPrice || offer.amount) - offer.amount;

  return (
    <div
      style={{
        margin: '6px 0',
        padding: '16px',
        borderRadius: '18px',
        background: isAccepted
          ? '#f0fdf4'
          : isDeclined
          ? '#fef2f2'
          : '#f8fafc',
        border: isAccepted
          ? '1.5px solid #86efac'
          : isDeclined
          ? '1.5px solid #fca5a5'
          : '1.5px solid #e2e8f0',
        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)',
        maxWidth: '340px',
        width: '100%',
      }}
    >
      {/* Header Tag */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Tag style={{ width: '14px', height: '14px', color: isAccepted ? '#16a34a' : isDeclined ? '#dc2626' : '#6366f1' }} />
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.4px',
              color: isAccepted ? '#16a34a' : isDeclined ? '#dc2626' : '#6366f1',
            }}
          >
            {isAccepted ? 'Offer Accepted' : isDeclined ? 'Offer Declined' : 'Price Offer'}
          </span>
        </div>

        {/* Status Badge */}
        <span
          style={{
            fontSize: '10.5px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '9999px',
            background: isAccepted
              ? '#dcfce7'
              : isDeclined
              ? '#fee2e2'
              : '#e0e7ff',
            color: isAccepted
              ? '#15803d'
              : isDeclined
              ? '#b91c1c'
              : '#4338ca',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {isAccepted ? (
            <>
              <CheckCircle2 style={{ width: '11px', height: '11px' }} />
              <span>Accepted</span>
            </>
          ) : isDeclined ? (
            <>
              <XCircle style={{ width: '11px', height: '11px' }} />
              <span>Declined</span>
            </>
          ) : (
            <>
              <Clock style={{ width: '11px', height: '11px' }} />
              <span>Pending</span>
            </>
          )}
        </span>
      </div>

      {/* Product & Price Info */}
      {offer.productTitle && (
        <p
          style={{
            margin: '0 0 8px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#64748b',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          For: {offer.productTitle}
        </p>
      )}

      {/* Price Amount */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
        <span
          style={{
            fontSize: '22px',
            fontWeight: 900,
            color: isAccepted ? '#15803d' : isDeclined ? '#991b1b' : '#0f172a',
            letterSpacing: '-0.5px',
          }}
        >
          {formatINR(offer.amount)}
        </span>
        {offer.originalPrice > offer.amount && (
          <span
            style={{
              fontSize: '12px',
              color: '#94a3b8',
              textDecoration: 'line-through',
            }}
          >
            {formatINR(offer.originalPrice)}
          </span>
        )}
      </div>

      {/* Savings note */}
      {savings > 0 && isPending && (
        <div
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: '#059669',
            marginBottom: '10px',
          }}
        >
          🏷️ {formatINR(savings)} below original listing price
        </div>
      )}

      {/* Seller Actions (If received by seller & pending) */}
      {!isSender && isPending && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
          <button
            type="button"
            onClick={() => onAcceptOffer && onAcceptOffer(offer)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: '12px',
              background: '#16a34a',
              color: '#ffffff',
              fontSize: '11.5px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)',
            }}
          >
            <Check style={{ width: '13px', height: '13px' }} />
            <span>Accept Offer</span>
          </button>

          <button
            type="button"
            onClick={() => onDeclineOffer && onDeclineOffer(offer)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: '12px',
              background: '#ffffff',
              color: '#dc2626',
              border: '1px solid #fca5a5',
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <X style={{ width: '13px', height: '13px' }} />
            <span>Decline</span>
          </button>
        </div>
      )}

      {/* Buyer Actions: Pay Now when Accepted */}
      {isAccepted && isSender && (
        <div style={{ marginTop: '12px' }}>
          <button
            type="button"
            onClick={() => onPayAgreedPrice && onPayAgreedPrice(offer)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px',
              borderRadius: '12px',
              background: '#16a34a',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 3px 10px rgba(22, 163, 74, 0.3)',
            }}
          >
            <ShoppingCart style={{ width: '14px', height: '14px' }} />
            <span>Proceed to Buy for {formatINR(offer.amount)}</span>
          </button>
        </div>
      )}

      {/* Counter-Offer Button if Declined */}
      {isDeclined && isSender && onCounterOffer && (
        <div style={{ marginTop: '10px' }}>
          <button
            type="button"
            onClick={onCounterOffer}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px',
              borderRadius: '10px',
              background: '#eef2ff',
              color: '#4f46e5',
              fontSize: '11.5px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <span>Make a Counter-Offer</span>
            <ArrowRight style={{ width: '12px', height: '12px' }} />
          </button>
        </div>
      )}
    </div>
  );
};
