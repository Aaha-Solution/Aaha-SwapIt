import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Handshake,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  MessageSquare,
  MapPin,
  Calendar,
  AlertCircle,
  Sparkles,
  Repeat,
} from 'lucide-react';
import { offerApi } from '../../api/offer.api';
import { Offer, OfferStatus } from '../../types/offer.types';
import { formatINR } from '../../utils/helpers';
import { getSocket } from '../../api/socket';

export const ProfileDeals: React.FC = () => {
  const navigate = useNavigate();
  const [dealTab, setDealTab] = useState<'received' | 'sent'>('received');
  const [sellerOffers, setSellerOffers] = useState<Offer[]>([]);
  const [buyerOffers, setBuyerOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Counter offer modal state
  const [counterModalOffer, setCounterModalOffer] = useState<Offer | null>(null);
  const [counterPrice, setCounterPrice] = useState<number>(0);

  const fetchOffers = async () => {
    setIsLoading(true);
    try {
      const [receivedRes, sentRes] = await Promise.all([
        offerApi.getSellerOffers(),
        offerApi.getBuyerOffers(),
      ]);

      if (receivedRes.data) setSellerOffers(receivedRes.data);
      if (sentRes.data) setBuyerOffers(sentRes.data);
    } catch {
      // Fallback sample offers if database is offline
      setSellerOffers([
        {
          id: 'offer-mock-1',
          buyerId: 'usr-buyer-priya',
          sellerId: 'usr-demo-iyyanar',
          productId: 'prod-1',
          offerAmount: 42000,
          originalPrice: 48000,
          status: 'pending',
          pickupLocation: 'White Town, Puducherry',
          pickupTime: 'Tomorrow at 5:00 PM',
          notes: 'Can pay in cash immediately on pickup',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          product: {
            id: 'prod-1',
            title: 'Apple MacBook Air M1',
            imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&auto=format&fit=crop&q=80',
            price: 48000,
          },
          buyer: {
            id: 'usr-buyer-priya',
            name: 'Priya Sharma',
            phone: '+91 98401 23456',
          },
        },
      ]);
      setBuyerOffers([
        {
          id: 'offer-mock-2',
          buyerId: 'usr-demo-iyyanar',
          sellerId: 'usr-seller-karthik',
          productId: 'prod-2',
          offerAmount: 18000,
          originalPrice: 22000,
          status: 'accepted',
          exchangeItem: 'Sony WH-1000XM3 + Cash ₹6,000',
          pickupLocation: 'Lawspet, Puducherry',
          pickupTime: 'This Saturday',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
          product: {
            id: 'prod-2',
            title: 'Sony WH-1000XM4 Headphones',
            imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80',
            price: 22000,
          },
          seller: {
            id: 'usr-seller-karthik',
            name: 'Karthik Raja',
            phone: '+91 94432 12345',
          },
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();

    // Listen to live socket events for real-time deal status updates
    const socket = getSocket();
    const handleStatusChanged = (updatedOffer: Offer) => {
      setSellerOffers((prev) =>
        prev.map((o) => (o.id === updatedOffer.id ? { ...o, ...updatedOffer } : o))
      );
      setBuyerOffers((prev) =>
        prev.map((o) => (o.id === updatedOffer.id ? { ...o, ...updatedOffer } : o))
      );
    };

    const handleNewOffer = (newOffer: Offer) => {
      setSellerOffers((prev) => [newOffer, ...prev]);
    };

    socket.on('deal:status_changed', handleStatusChanged);
    socket.on('deal:offer_received', handleNewOffer);

    return () => {
      socket.off('deal:status_changed', handleStatusChanged);
      socket.off('deal:offer_received', handleNewOffer);
    };
  }, []);

  const handleUpdateStatus = async (offerId: string, newStatus: OfferStatus, counterAmt?: number) => {
    setActionLoadingId(offerId);
    try {
      await offerApi.updateOfferStatus(offerId, newStatus, counterAmt);

      setSellerOffers((prev) =>
        prev.map((o) =>
          o.id === offerId
            ? { ...o, status: newStatus, ...(counterAmt ? { counterAmount: counterAmt } : {}) }
            : o
        )
      );
      setBuyerOffers((prev) =>
        prev.map((o) =>
          o.id === offerId
            ? { ...o, status: newStatus, ...(counterAmt ? { counterAmount: counterAmt } : {}) }
            : o
        )
      );
      if (counterModalOffer) setCounterModalOffer(null);
    } catch {
      // Offline fallback
      setSellerOffers((prev) =>
        prev.map((o) =>
          o.id === offerId
            ? { ...o, status: newStatus, ...(counterAmt ? { counterAmount: counterAmt } : {}) }
            : o
        )
      );
      if (counterModalOffer) setCounterModalOffer(null);
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusBadge = (status: OfferStatus, counterAmount?: number | null) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Deal Accepted
          </span>
        );
      case 'rejected':
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/60">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Declined
          </span>
        );
      case 'countered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
            <Repeat className="w-3.5 h-3.5 text-amber-600" />
            Countered ({counterAmount ? formatINR(counterAmount) : 'Pending'})
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            Pending Response
          </span>
        );
    }
  };

  const displayedOffers = dealTab === 'received' ? sellerOffers : buyerOffers;

  return (
    <div className="space-y-6">
      {/* Deals Header Sub-tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDealTab('received')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              dealTab === 'received'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Offers Received (As Seller)</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                dealTab === 'received' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {sellerOffers.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setDealTab('sent')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              dealTab === 'sent'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Offers Made (As Buyer)</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                dealTab === 'sent' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {buyerOffers.length}
            </span>
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-xl">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Real-time Deal Lock & Swap Guarantee</span>
        </div>
      </div>

      {/* Offers List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="p-6 bg-white rounded-3xl border border-slate-100 animate-pulse space-y-3"
            >
              <div className="h-5 bg-slate-100 rounded w-1/3"></div>
              <div className="h-4 bg-slate-50 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : displayedOffers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100">
          <div className="w-14 h-14 mx-auto rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
            <Handshake className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            {dealTab === 'received' ? 'No offers received yet' : 'You haven’t made any offers yet'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {dealTab === 'received'
              ? 'When buyers send price offers or swap proposals on your items, they will appear here.'
              : 'Browse products and click "Make Offer" or negotiate with sellers in real time.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedOffers.map((offer) => {
            const isSellerView = dealTab === 'received';
            const peerName = isSellerView
              ? offer.buyer?.name || 'SwapIt Buyer'
              : offer.seller?.name || 'SwapIt Seller';

            const discount = offer.originalPrice
              ? Math.round(((offer.originalPrice - offer.offerAmount) / offer.originalPrice) * 100)
              : 0;

            return (
              <div
                key={offer.id}
                className="bg-white rounded-3xl border border-slate-100/80 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all space-y-4"
              >
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        offer.product?.imageUrl ||
                        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&auto=format&fit=crop&q=80'
                      }
                      alt={offer.product?.title || 'Product'}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-100"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 tracking-tight">
                        {offer.product?.title || 'Marketplace Item'}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span>Original: <del>{formatINR(offer.originalPrice)}</del></span>
                        <span className="text-slate-300">•</span>
                        <span>{isSellerView ? `From: ${peerName}` : `To: ${peerName}`}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(offer.status, offer.counterAmount)}
                  </div>
                </div>

                {/* Offer amount details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Offered Price
                    </span>
                    <span className="text-lg font-black text-indigo-600 mt-0.5 block">
                      {formatINR(offer.offerAmount)}
                      {discount > 0 && (
                        <span className="ml-1.5 text-xs font-bold text-emerald-600">
                          ({discount}% off)
                        </span>
                      )}
                    </span>
                  </div>

                  {offer.exchangeItem && (
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Swap Exchange Item
                      </span>
                      <span className="text-xs font-semibold text-slate-800 mt-0.5 block">
                        🔄 {offer.exchangeItem}
                      </span>
                    </div>
                  )}

                  {offer.pickupLocation && (
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Proposed Meetup
                      </span>
                      <span className="text-xs font-semibold text-slate-800 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {offer.pickupLocation}
                      </span>
                    </div>
                  )}
                </div>

                {offer.notes && (
                  <div className="text-xs text-slate-600 bg-indigo-50/40 p-3 rounded-xl border border-indigo-100/50">
                    <span className="font-bold text-indigo-900">Buyer Note: </span>
                    {offer.notes}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(offer.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigate('/messages')}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                      Chat with {isSellerView ? 'Buyer' : 'Seller'}
                    </button>

                    {isSellerView && offer.status === 'pending' && (
                      <>
                        <button
                          type="button"
                          disabled={actionLoadingId === offer.id}
                          onClick={() => {
                            setCounterModalOffer(offer);
                            setCounterPrice(offer.offerAmount + 1000);
                          }}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/60 transition-all cursor-pointer"
                        >
                          Counter Offer
                        </button>

                        <button
                          type="button"
                          disabled={actionLoadingId === offer.id}
                          onClick={() => handleUpdateStatus(offer.id, 'rejected')}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/60 transition-all cursor-pointer"
                        >
                          Decline
                        </button>

                        <button
                          type="button"
                          disabled={actionLoadingId === offer.id}
                          onClick={() => handleUpdateStatus(offer.id, 'accepted')}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all cursor-pointer"
                        >
                          Accept Offer ({formatINR(offer.offerAmount)})
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Counter Offer Modal */}
      {counterModalOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-5">
            <h3 className="text-base font-black text-slate-900">
              Counter Offer for {counterModalOffer.product?.title}
            </h3>
            <p className="text-xs text-slate-500">
              Buyer offered <span className="font-bold text-slate-800">{formatINR(counterModalOffer.offerAmount)}</span>. Propose your counter price:
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your Counter Price (₹)
              </label>
              <input
                type="number"
                value={counterPrice}
                onChange={(e) => setCounterPrice(Number(e.target.value))}
                min={counterModalOffer.offerAmount}
                max={counterModalOffer.originalPrice}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCounterModalOffer(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus(counterModalOffer.id, 'countered', counterPrice)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer"
              >
                Send Counter Offer ({formatINR(counterPrice)})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
