import React from 'react';

interface LoaderProps {
  count?: number;
}

export const Loader: React.FC<LoaderProps> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-slate-100 p-3 flex flex-col space-y-3"
        >
          <div className="w-full h-40 bg-slate-100 rounded-xl"></div>
          <div className="space-y-2">
            <div className="h-4 bg-slate-200 rounded w-2/3"></div>
            <div className="h-3 bg-slate-100 rounded w-full"></div>
            <div className="h-2.5 bg-slate-100 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
};
