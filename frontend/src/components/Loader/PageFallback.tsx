import React from 'react';

export const PageFallback: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[55vh] w-full py-16">
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin"></div>
        <div className="absolute w-4 h-4 bg-emerald-500 rounded-full animate-ping opacity-60"></div>
      </div>
      <p className="mt-4 text-xs font-semibold text-slate-400 tracking-wider uppercase animate-pulse">
        Loading...
      </p>
    </div>
  );
};
