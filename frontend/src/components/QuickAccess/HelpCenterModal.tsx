import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  HelpCircle,
  Search,
  ShieldCheck,
  ShoppingBag,
  Tag,
  PhoneCall,
  Mail,
  ChevronDown,
  ExternalLink,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react';

interface HelpCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FAQItem {
  id: string;
  category: 'safety' | 'buying' | 'selling' | 'account';
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'safety',
    question: 'How do I ensure a safe trade when meeting a seller?',
    answer:
      'Always meet in a well-lit, public place like a café, shopping mall, or metro station. Never transfer money in advance before inspecting the item in person. We recommend using UPI or cash only upon item verification.',
  },
  {
    id: 'faq-2',
    category: 'safety',
    question: 'What should I do if a deal or seller feels suspicious?',
    answer:
      'If a seller asks for upfront advance deposits, courier fees, or sends dubious QR codes requesting payment, do not proceed. Immediately click the "Report" button on the listing or contact SwapIt Safety Support.',
  },
  {
    id: 'faq-3',
    category: 'buying',
    question: 'How do I make an offer or negotiate with a seller?',
    answer:
      'Open the product details page and click the "Make Offer" or "Chat with Seller" button. You can propose a fair counter-offer directly inside the in-app chat.',
  },
  {
    id: 'faq-4',
    category: 'buying',
    question: 'Can I test electronics or gadgets before paying?',
    answer:
      'Yes! Always request the seller to demonstrate laptops, mobiles, or gadgets working in front of you. Check IMEI, battery health, and warranty documents.',
  },
  {
    id: 'faq-5',
    category: 'selling',
    question: 'How do I get more inquiries on my posted ads?',
    answer:
      'Upload clear, well-lit photos from multiple angles, set a competitive price, provide an honest description of condition, and respond promptly to buyer messages.',
  },
  {
    id: 'faq-6',
    category: 'selling',
    question: 'Is there any fee to post ads on SwapIt?',
    answer:
      'SwapIt is 100% free for individual buyers and sellers. There are zero listing fees for standard classified ads.',
  },
  {
    id: 'faq-7',
    category: 'account',
    question: 'How can I get the Verified Seller badge?',
    answer:
      'Complete your profile with a verified phone number, profile picture, and link your email. Sellers with high ratings and 3+ successful deals receive the Verified Community badge automatically.',
  },
];

export const HelpCenterModal: React.FC<HelpCenterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<
    'all' | 'safety' | 'buying' | 'selling' | 'account'
  >('all');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>('faq-1');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  if (!isOpen) return null;

  const filteredFaqs = FAQS.filter((faq) => {
    const matchesCat =
      activeCategory === 'all' || faq.category === activeCategory;
    const matchesQuery =
      searchQuery.trim() === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return createPortal(
    <div
      className="modal-backdrop show active"
      onClick={onClose}
      style={{
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
        style={{ border: '1px solid #e2e8f0' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                SwapIt Help Center &amp; Support
              </h3>
              <p className="text-xs text-slate-500">
                Answers, safety guidelines, and 24/7 community assistance
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar & Categories */}
        <div className="p-4 sm:p-6 border-b border-slate-100 space-y-3 bg-white">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search help topics, e.g. safe payment, making offers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-slate-700 placeholder-slate-400"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'All Topics' },
              { id: 'safety', label: '🛡️ Safety & Scams' },
              { id: 'buying', label: '🛍️ Buying Tips' },
              { id: 'selling', label: '🏷️ Selling Guide' },
              { id: 'account', label: '👤 Account & Badges' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* FAQs Accordion */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2.5">
          {filteredFaqs.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm font-bold text-slate-700">No questions found</p>
              <p className="text-xs text-slate-500 mt-1">
                Try searching for keywords like "safe", "price", "seller", or "fees".
              </p>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isExpanded = expandedFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="rounded-xl border border-slate-200/90 overflow-hidden bg-white transition-all"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedFaqId(isExpanded ? null : faq.id)
                    }
                    className="w-full flex items-center justify-between p-3.5 text-left text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        isExpanded ? 'rotate-180 text-blue-600' : ''
                      }`}
                    />
                  </button>
                  {isExpanded && (
                    <div className="px-3.5 pb-3.5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Quick Contact Box */}
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h5 className="text-xs font-extrabold text-blue-900">
                Still need help?
              </h5>
              <p className="text-[11px] text-blue-700">
                Our support team is available Mon–Sat (9 AM – 8 PM IST).
              </p>
            </div>
            {contactSubmitted ? (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-lg">
                ✓ Support request received!
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setContactSubmitted(true)}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm shadow-blue-500/20 whitespace-nowrap"
              >
                Connect with Support
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50 text-xs">
          <span className="text-slate-500">
            SwapIt Trust &amp; Safety Policy v2.4
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
