import React, { useState } from 'react';
import { X, Tag, Sparkles, Check, ArrowRight } from 'lucide-react';
import { formatINR } from '../../utils/helpers';

interface MakeOfferModalProps {
  product: {
    id: string;
    title: string;
    price: number;
    imageUrl?: string;
    condition?: string;
  };
  sellerName?: string;
  onClose: () => void;
  onSubmitOffer: (amount: number, note?: string) => void;
}

export const MakeOfferModal: React.FC<MakeOfferModalProps> = ({
  product,
  sellerName = 'the seller',
  onClose,
  onSubmitOffer,
}) => {
  const [offerAmount, setOfferAmount] = useState<number>(() => Math.round(product.price * 0.9));
  const [customInput, setCustomInput] = useState<string>(() => String(Math.round(product.price * 0.9)));
  const [note, setNote] = useState<string>('Ready to pick up today!');

  const discountPercent = Math.round(((product.price - offerAmount) / product.price) * 100);
  const savings = product.price - offerAmount;

  const handleSelectDiscount = (pct: number) => {
    const calculated = Math.round(product.price * (1 - pct / 100));
    setOfferAmount(calculated);
    setCustomInput(String(calculated));
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomInput(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      setOfferAmount(num);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (offerAmount > 0 && offerAmount <= product.price * 1.5) {
      onSubmitOffer(offerAmount, note.trim() || undefined);
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          background: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px 16px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '12px',
                background: '#eef2ff',
                color: '#4f46e5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Tag style={{ width: '18px', height: '18px' }} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                Make an Offer
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                Negotiate price directly with {sellerName}
              </p>
            </div>
          </div>
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

        {/* Product Summary Mini Card */}
        <div style={{ padding: '16px 24px 0' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              borderRadius: '16px',
              background: '#f8fafc',
              border: '1px solid #f1f5f9',
            }}
          >
            {product.imageUrl && (
              <img
                src={product.imageUrl}
                alt={product.title}
                style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover' }}
              />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  margin: '0 0 2px',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#0f172a',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {product.title}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11.5px', color: '#64748b' }}>Listed Price:</span>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                  {formatINR(product.price)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px 24px' }}>
          {/* Quick Discount Presets */}
          <div style={{ marginBottom: '18px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.4px',
                marginBottom: '8px',
              }}
            >
              Suggested Offers
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {[5, 10, 15, 20].map((pct) => {
                const calculated = Math.round(product.price * (1 - pct / 100));
                const isSelected = offerAmount === calculated;
                return (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handleSelectDiscount(pct)}
                    style={{
                      padding: '8px 4px',
                      borderRadius: '12px',
                      border: isSelected ? '2px solid #6366f1' : '1px solid #e2e8f0',
                      background: isSelected ? '#eef2ff' : '#ffffff',
                      color: isSelected ? '#4f46e5' : '#334155',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div>-{pct}%</div>
                    <div style={{ fontSize: '10px', color: isSelected ? '#4f46e5' : '#94a3b8', fontWeight: 600 }}>
                      ₹{Math.round(calculated / 1000)}k
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Offer Input */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                }}
              >
                Your Offer Amount (₹)
              </label>
              {savings > 0 && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#059669',
                    background: '#ecfdf5',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                  }}
                >
                  Save {formatINR(savings)} ({discountPercent}%)
                </span>
              )}
            </div>

            <div style={{ position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '18px',
                  fontWeight: 800,
                  color: '#64748b',
                }}
              >
                ₹
              </span>
              <input
                type="number"
                value={customInput}
                onChange={handleCustomInputChange}
                min={1}
                max={product.price * 2}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 34px',
                  borderRadius: '14px',
                  background: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  fontSize: '18px',
                  fontWeight: 800,
                  color: '#0f172a',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                required
              />
            </div>
          </div>

          {/* Optional Note */}
          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.4px',
                marginBottom: '6px',
              }}
            >
              Add a quick note
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Ready to pick up in person today"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '12px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                fontSize: '12.5px',
                color: '#334155',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!offerAmount || offerAmount <= 0}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: '14px',
              background: '#4f46e5',
              color: '#ffffff',
              fontSize: '13.5px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
              transition: 'all 0.2s ease',
            }}
          >
            <span>Send Offer of {formatINR(offerAmount)}</span>
            <ArrowRight style={{ width: '16px', height: '16px' }} />
          </button>
        </form>
      </div>
    </div>
  );
};
