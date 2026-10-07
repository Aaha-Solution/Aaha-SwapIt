import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Tag, MapPin, CheckCircle, X, AlertCircle } from 'lucide-react';
import { CATEGORIES, CITIES } from '../../utils/constants';
import { productApi } from '../../api/product.api';
import { closePostAdModal, triggerProductsRefresh } from '../../store/slices/userSlice';
import { ImageUploader } from '../../components/ImageUploader/ImageUploader';
import { useAuth } from '../../hooks/useAuth';

interface SellProps {
  isModal?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

export const Sell: React.FC<SellProps> = ({ isModal = false, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('mobiles');
  const [price, setPrice] = useState('');
  const [city, setCity] = useState(user?.location || 'Chennai');
  const [condition, setCondition] = useState<'Brand New' | 'Like New' | 'Good' | 'Fair'>('Like New');
  const [phone, setPhone] = useState(user?.phone || '+91 98401 23456');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // Automatically scroll up to show the error message when an error occurs
  useEffect(() => {
    if (error) {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || title.length < 4) {
      setError('Please enter a descriptive ad title (at least 4 characters)');
      return;
    }
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setError('Please enter a valid price in INR');
      return;
    }
    if (!description.trim()) {
      setError('Please provide a brief description');
      return;
    }
    if (images.length < 5) {
      setError(`Please upload at least 5 photos for your listing (currently ${images.length} of 5 uploaded)`);
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await productApi.createProduct({
        title: title.trim(),
        category,
        price: numPrice,
        city,
        condition,
        description: description.trim(),
        imageUrl: images[0],
        images,
        phone,
        seller: {
          id: user?.id || 'usr-demo-iyyanar',
          name: user?.name || 'Iyyanar',
          phone: phone || user?.phone || '+91 98401 23456',
          memberSince: user?.memberSince || 'Sep 2026',
          rating: 5.0,
          verified: user?.verified ?? true,
        },
      });

      dispatch(triggerProductsRefresh());
      setIsSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
        dispatch(closePostAdModal());
        navigate('/products');
      }, 1200);
    } catch (err: any) {
      setError(err?.message || 'Failed to post ad. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const content = (
    <div
      ref={scrollContainerRef}
      className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto scroll-smooth"
    >
      {isModal && onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors z-20 cursor-pointer"
          title="Close"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {isSuccess ? (
        <div className="py-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Your Ad is Live!</h2>
          <p className="text-xs text-slate-500">
            "{title}" has been successfully published to the SwapIt marketplace.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Tag className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-extrabold text-slate-900">Post an Ad on SwapIt</h2>
            </div>
            <p className="text-xs text-slate-500">
              Reach thousands of buyers in your city with verified listings.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2.5 shadow-sm">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ad Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (error) setError('');
                }}
                placeholder="e.g. iPhone 13 128GB Midnight Purple"
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white outline-none transition-colors ${
                  error && (!title.trim() || title.length < 4)
                    ? 'border-red-400 bg-red-50/40 focus:border-red-500'
                    : 'border-slate-200 focus:border-indigo-500'
                }`}
              />
            </div>

            {/* Category & Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Price in INR (₹) *
                </label>
                <div className="relative flex items-center">
                  <span className="text-slate-400 absolute left-3 text-xs font-bold">₹</span>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => {
                      setPrice(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="25000"
                    className={`w-full pl-7 pr-3 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-800 focus:bg-white outline-none transition-colors ${
                      error && (isNaN(parseFloat(price)) || parseFloat(price) <= 0)
                        ? 'border-red-400 bg-red-50/40 focus:border-red-500'
                        : 'border-slate-200 focus:border-indigo-500'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* City & Condition */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  City Location *
                </label>
                <div className="relative flex items-center">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Item Condition *
                </label>
                <select
                  value={condition}
                  onChange={(e) =>
                    setCondition(e.target.value as 'Brand New' | 'Like New' | 'Good' | 'Fair')
                  }
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
                >
                  <option value="Brand New">Brand New (Unopened/Unused)</option>
                  <option value="Like New">Like New (Mint Condition)</option>
                  <option value="Good">Good (Minor signs of use)</option>
                  <option value="Fair">Fair (Fully functional)</option>
                </select>
              </div>
            </div>

            {/* Direct Multi-Image Uploader */}
            <div className="pt-1">
              <ImageUploader
                images={images}
                onChange={(newImages) => {
                  setImages(newImages);
                  if (error && newImages.length >= 5) {
                    setError('');
                  }
                }}
                minImages={5}
                maxImages={10}
                maxSizeMB={5}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Detailed Description *
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Include details about brand, model, purchase date, warranty, accessories included, reason for selling..."
                className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white outline-none resize-none transition-colors ${
                  error && !description.trim()
                    ? 'border-red-400 bg-red-50/40 focus:border-red-500'
                    : 'border-slate-200 focus:border-indigo-500'
                }`}
              />
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
              />
            </div>

            {/* Bottom inline error banner */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2 shadow-sm">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span className="font-semibold">{error}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              {isModal && onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-50"
              >
                {isSubmitting ? 'Publishing...' : 'Publish Ad Now'}
              </button>
            </div>
          </form>
        </>
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
