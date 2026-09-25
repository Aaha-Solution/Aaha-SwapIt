import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Heart,
  MapPin,
  Clock,
  ShieldCheck,
  Phone,
  MessageCircle,
  Eye,
  CheckCircle2,
  X,
  Star,
  MessageSquarePlus,
  Sparkles,
  Award,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from 'lucide-react';
import { Product } from '../../types/product.types';
import { formatINR } from '../../utils/helpers';
import { productApi } from '../../api/product.api';
import { ratingApi } from '../../api/rating.api';
import { Review, RatingSummary } from '../../types/rating.types';
import { useWishlist } from '../../hooks/useWishlist';
import { useAuth } from '../../hooks/useAuth';
import { ChatModal } from '../../components/ChatModal/ChatModal';
import { SellerReviewsModal } from '../../components/Rating/SellerReviewsModal';
import { WriteReviewModal } from '../../components/Rating/WriteReviewModal';
import { StarRating } from '../../components/Rating/StarRating';
import { ReviewCard } from '../../components/Rating/ReviewCard';

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
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [openWithOffer, setOpenWithOffer] = useState(false);

  // Multi-image gallery states
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Reviews & Rating states
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
  const [isWriteReviewModalOpen, setIsWriteReviewModalOpen] = useState(false);
  const [sellerReviews, setSellerReviews] = useState<Review[]>([]);
  const [sellerRatingSummary, setSellerRatingSummary] = useState<RatingSummary | null>(null);

  const { isWishlisted, toggle } = useWishlist();
  const { isAuthenticated, openLoginModal } = useAuth();

  useEffect(() => {
    async function loadProduct() {
      if (!id) return;
      setIsLoading(true);
      const res = await productApi.getProductById(id);
      if (res.success && res.data) {
        setProduct(res.data);
        setActiveImageIndex(0);
        // Load seller ratings
        if (res.data.seller?.id) {
          const ratingRes = await ratingApi.getUserReviews(res.data.seller.id);
          if (ratingRes.success && ratingRes.data) {
            setSellerReviews(ratingRes.data.reviews);
            setSellerRatingSummary(ratingRes.data.summary);
          }
        }
      }
      setIsLoading(false);
    }
    loadProduct();
  }, [id]);

  const handleChatSeller = () => {
    if (!isAuthenticated) {
      openLoginModal();
    } else {
      setOpenWithOffer(false);
      setIsChatOpen(true);
    }
  };

  const handleMakeOffer = () => {
    if (!isAuthenticated) {
      openLoginModal();
    } else {
      setOpenWithOffer(true);
      setIsChatOpen(true);
    }
  };

  const handleOpenWriteReview = () => {
    if (!isAuthenticated) {
      openLoginModal();
    } else {
      setIsWriteReviewModalOpen(true);
    }
  };

  const handleReviewSuccess = (data: { review: Review; summary: RatingSummary }) => {
    setSellerReviews((prev) => [data.review, ...prev]);
    setSellerRatingSummary(data.summary);
  };

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
          className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl cursor-pointer"
        >
          Back to Listings
        </button>
      </div>
    );
  }

  const wishlisted = isWishlisted(product.id);
  const averageRating = sellerRatingSummary?.averageRating || product.seller.rating || 4.9;
  const totalReviewsCount = sellerRatingSummary?.totalReviews ?? sellerReviews.length;
  const galleryImages =
    product.images && product.images.length > 0 ? product.images : [product.imageUrl];
  const activeImage = galleryImages[activeImageIndex] || product.imageUrl;

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
  };

  const content = (
    <div className="w-full max-w-4xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto space-y-8">
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

      {/* Main Product Two-Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Multi-Image Interactive Gallery */}
        <div className="space-y-3">
          {/* Active Main Viewport */}
          <div
            onClick={() => setIsLightboxOpen(true)}
            className="group relative w-full h-80 bg-slate-50 rounded-2xl overflow-hidden flex items-center justify-center p-6 border border-slate-100 cursor-zoom-in transition-all shadow-inner"
          >
            <img
              src={activeImage}
              alt={product.title}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 select-none"
            />

            {/* Top Controls: Lightbox indicator & Wishlist */}
            <div className="absolute top-3 left-3 bg-slate-900/60 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
              <Maximize2 className="w-3 h-3" />
              <span>Click to Expand</span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggle(product.id);
              }}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center transition-all cursor-pointer"
            >
              <Heart
                className={`w-5 h-5 ${
                  wishlisted ? 'fill-red-500 text-red-500' : 'text-slate-400'
                }`}
              />
            </button>

            {/* Left / Right Carousel Arrows */}
            {galleryImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity active:scale-95"
                  title="Previous image"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity active:scale-95"
                  title="Next image"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Counter Pill */}
                <div className="absolute bottom-3 right-3 bg-slate-900/70 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {activeImageIndex + 1} / {galleryImages.length}
                </div>
              </>
            )}
          </div>

          {/* Thumbnail Strip */}
          {galleryImages.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
              {galleryImages.map((thumbUrl, idx) => (
                <button
                  key={`${thumbUrl}-${idx}`}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-16 h-16 rounded-xl border-2 overflow-hidden bg-slate-50 flex items-center justify-center p-1 transition-all shrink-0 cursor-pointer ${
                    activeImageIndex === idx
                      ? 'border-indigo-600 ring-2 ring-indigo-200 scale-105 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={thumbUrl}
                    alt={`Thumb ${idx + 1}`}
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
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

              {/* Clickable Rating Badge */}
              <button
                type="button"
                onClick={() => setIsReviewsModalOpen(true)}
                className="flex items-center gap-1 text-xs font-extrabold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-full border border-amber-200 transition-all cursor-pointer"
                title="View Seller Feedback & Reviews"
              >
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{averageRating.toFixed(1)}</span>
                <span className="text-[10px] text-amber-600 font-semibold">({totalReviewsCount})</span>
              </button>
            </div>

            {/* Contact & Offer Actions */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleMakeOffer}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                <span>🤝 Make an Offer</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleChatSeller}
                  className="flex items-center justify-center gap-2 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat with Seller</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowPhone(!showPhone)}
                  className="flex items-center justify-center gap-2 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>{showPhone ? product.seller.phone || '+91 98401 23456' : 'Show Phone'}</span>
                </button>
              </div>
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

      {/* Seller Reviews & Trust Reputation Section */}
      <div className="pt-6 border-t border-slate-100 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                Seller Trust & Ratings
              </h3>
              <p className="text-[11px] text-slate-400">
                Verified feedback from past buyers and swappers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenWriteReview}
              className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-indigo-100"
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              <span>Rate Seller</span>
            </button>

            <button
              type="button"
              onClick={() => setIsReviewsModalOpen(true)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>View All ({totalReviewsCount})</span>
            </button>
          </div>
        </div>

        {/* Quick Reputation Summary Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Rating Score</span>
            <div className="flex items-center justify-center gap-1 mt-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-base font-black text-slate-900">{averageRating.toFixed(1)}</span>
              <span className="text-[11px] text-slate-400">/ 5.0</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Verified Reviews</span>
            <span className="text-base font-black text-slate-900 mt-1 block">{totalReviewsCount}</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Response Rate</span>
            <span className="text-base font-black text-emerald-600 mt-1 block">100%</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Identity Trust</span>
            <span className="text-xs font-bold text-indigo-600 mt-1.5 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Verified
            </span>
          </div>
        </div>

        {/* Reviews List Preview (Recent 2) */}
        {sellerReviews.length > 0 ? (
          <div className="space-y-3">
            {sellerReviews.slice(0, 2).map((rev) => (
              <ReviewCard key={rev.id} review={rev} />
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-xs text-slate-400">No reviews yet for this seller.</p>
            <button
              type="button"
              onClick={handleOpenWriteReview}
              className="mt-2 text-xs text-indigo-600 font-bold hover:underline"
            >
              Be the first to review
            </button>
          </div>
        )}
      </div>

      {/* Real-time Interactive Chat Modal */}
      {isChatOpen && (
        <ChatModal
          product={product}
          onClose={() => setIsChatOpen(false)}
          onOpenOffer={openWithOffer}
        />
      )}

      {/* Seller Reviews & Trust Modal */}
      {isReviewsModalOpen && (
        <SellerReviewsModal
          sellerId={product.seller.id}
          sellerName={product.seller.name}
          sellerAvatar={product.seller.avatarUrl}
          verified={product.seller.verified}
          memberSince={product.seller.memberSince}
          productId={product.id}
          productTitle={product.title}
          onClose={() => setIsReviewsModalOpen(false)}
        />
      )}

      {/* Write Review Direct Modal */}
      {isWriteReviewModalOpen && (
        <WriteReviewModal
          targetUserId={product.seller.id}
          targetUserName={product.seller.name}
          targetUserAvatar={product.seller.avatarUrl}
          productId={product.id}
          productTitle={product.title}
          onClose={() => setIsWriteReviewModalOpen(false)}
          onSuccess={handleReviewSuccess}
        />
      )}
      {/* Fullscreen High-Resolution Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 animate-fade-in"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Lightbox Top Header */}
          <div
            className="w-full max-w-5xl flex items-center justify-between text-white pb-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h3 className="text-sm font-bold truncate max-w-md">{product.title}</h3>
              <span className="text-xs text-slate-400">
                Photo {activeImageIndex + 1} of {galleryImages.length}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Close Fullscreen (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Lightbox Main Image & Arrows */}
          <div
            className="relative flex-1 w-full max-w-5xl flex items-center justify-center p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activeImage}
              alt={product.title}
              className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl transition-all"
            />

            {galleryImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-2 sm:left-4 p-3 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white shadow-xl transition-all active:scale-95"
                  title="Previous photo"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-2 sm:right-4 p-3 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white shadow-xl transition-all active:scale-95"
                  title="Next photo"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Lightbox Bottom Thumbnail Strip */}
          {galleryImages.length > 1 && (
            <div
              className="flex items-center gap-2 overflow-x-auto py-2 px-4 bg-slate-900/80 rounded-2xl border border-slate-800"
              onClick={(e) => e.stopPropagation()}
            >
              {galleryImages.map((thumb, idx) => (
                <button
                  key={`lightbox-${thumb}-${idx}`}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-14 h-14 rounded-xl border-2 overflow-hidden bg-slate-900 flex items-center justify-center p-1 transition-all ${
                    activeImageIndex === idx
                      ? 'border-indigo-500 scale-105 ring-2 ring-indigo-400'
                      : 'border-slate-700 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={thumb}
                    alt={`Thumb ${idx + 1}`}
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
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
