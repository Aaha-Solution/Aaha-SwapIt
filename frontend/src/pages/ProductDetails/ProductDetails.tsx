import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Heart,
  Share2,
  MapPin,
  Clock,
  ShieldCheck,
  Phone,
  MessageCircle,
  Eye,
  CheckCircle2,
  X,
} from 'lucide-react';
import { Product } from '../../types/product.types';
import { formatINR } from '../../utils/helpers';
import { productApi } from '../../api/product.api';
import { useWishlist } from '../../hooks/useWishlist';
import { useAuth } from '../../hooks/useAuth';

interface ProductDetailsProps {
  productId?: string;
  isModal?: boolean;
  onClose?: () => void;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({
  productId: propId,
  isModal = false,
  onClose,
}) => {
  const { id: routeId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const id = propId || routeId;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPhone, setShowPhone] = useState(false);
  const [chatMessageSent, setChatMessageSent] = useState(false);

  const { isWishlisted, toggle } = useWishlist();
  const { isAuthenticated, openLoginModal } = useAuth();

  useEffect(() => {
    async function loadProduct() {
      if (!id) return;
      setIsLoading(true);
      const res = await productApi.getProductById(id);
      if (res.success && res.data) {
        setProduct(res.data);
      }
      setIsLoading(false);
    }
    loadProduct();
  }, [id]);

  if (isLoading) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-100 animate-pulse">
        <div className="w-full h-64 bg-slate-100 rounded-2xl mb-4"></div>
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-slate-100 rounded w-1/4"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-100">
        <h3 className="text-base font-bold text-slate-800">Product not found</h3>
        <button
          type="button"
          onClick={onClose || (() => navigate('/products'))}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl"
        >
          Back to Listings
        </button>
      </div>
    );
  }

  const wishlisted = isWishlisted(product.id);

  const handleChatSeller = () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    setChatMessageSent(true);
    setTimeout(() => setChatMessageSent(false), 3000);
  };

  const content = (
    <div className="w-full max-w-4xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
      {/* Close button if modal */}
      {isModal && onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 z-10 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Images */}
        <div className="space-y-3">
          <div className="relative w-full h-80 bg-slate-50 rounded-2xl overflow-hidden flex items-center justify-center p-6 border border-slate-100">
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
            />
            <button
              type="button"
              onClick={() => toggle(product.id)}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white shadow-md hover:bg-slate-50 flex items-center justify-center transition-all"
            >
              <Heart
                className={`w-5 h-5 ${
                  wishlisted ? 'fill-red-500 text-red-500' : 'text-slate-400'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Right Column: Details & Actions */}
        <div className="flex flex-col justify-between space-y-6">
          <div>
            {/* Category & Views */}
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="uppercase font-bold tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                {product.category}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                <span>{product.views || 120} views</span>
              </span>
            </div>

            {/* Title */}
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
              {product.title}
            </h1>

            {/* Location & Time */}
            <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {product.location || product.city}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {product.postedAt}
              </span>
            </div>

            {/* Price */}
            <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">Asking Price</span>
                <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {formatINR(product.price)}
                </span>
              </div>
              <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">
                {product.condition}
              </span>
            </div>

            {/* Description */}
            <div className="mt-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Description
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          </div>

          {/* Seller Card */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">
                  {product.seller.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">{product.seller.name}</span>
                    {product.seller.verified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 fill-indigo-100" />
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Member since {product.seller.memberSince}
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                ★ {product.seller.rating || '4.9'}
              </span>
            </div>

            {/* Contact Actions */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleChatSeller}
                className="flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-[0.98]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{chatMessageSent ? 'Message Sent!' : 'Chat with Seller'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPhone(!showPhone)}
                className="flex items-center justify-center gap-2 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl shadow-sm transition-all"
              >
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>{showPhone ? product.seller.phone || '+91 98401 23456' : 'Show Phone'}</span>
              </button>
            </div>
          </div>

          {/* Safety Notice */}
          <div className="flex items-start gap-2.5 text-[11px] text-slate-400 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <ShieldCheck className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
            <span>
              Always meet in a public location and verify the item thoroughly before making payment.
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return content;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {content}
    </div>
  );
};
