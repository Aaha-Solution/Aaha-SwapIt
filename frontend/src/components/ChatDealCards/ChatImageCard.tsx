import React, { useState } from 'react';
import { ImageAttachment } from '../../types/chat.types';
import { Maximize2, X } from 'lucide-react';

interface ChatImageCardProps {
  imageAttachment: ImageAttachment;
  isMine: boolean;
}

export const ChatImageCard: React.FC<ChatImageCardProps> = ({ imageAttachment, isMine }) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  return (
    <>
      <div className="my-1.5 max-w-[280px] rounded-2xl overflow-hidden shadow-sm border border-slate-200/80 bg-white">
        <div
          className="relative group cursor-pointer overflow-hidden bg-slate-100"
          onClick={() => setIsLightboxOpen(true)}
        >
          <img
            src={imageAttachment.url}
            alt={imageAttachment.caption || 'Shared photo'}
            className="w-full h-44 object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
            <span className="p-2 bg-black/60 rounded-xl backdrop-blur-xs flex items-center gap-1.5 text-xs font-semibold">
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Preview</span>
            </span>
          </div>
        </div>

        {imageAttachment.caption && (
          <div className="p-2.5 bg-white text-xs text-slate-800 border-t border-slate-100 font-medium">
            {imageAttachment.caption}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div className="relative max-w-3xl max-h-[90vh] flex flex-col items-center">
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={imageAttachment.url}
              alt={imageAttachment.caption || 'Full view'}
              className="max-h-[80vh] max-w-full rounded-2xl object-contain shadow-2xl border border-white/20"
              onClick={(e) => e.stopPropagation()}
            />
            {imageAttachment.caption && (
              <p className="text-white text-sm mt-3 font-medium bg-black/40 px-4 py-1.5 rounded-full">
                {imageAttachment.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};
