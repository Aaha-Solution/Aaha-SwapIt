import React from 'react';
import { MapPin, Navigation, ExternalLink, ShieldCheck } from 'lucide-react';
import { LocationShare } from '../../types/chat.types';

interface ChatLocationCardProps {
  location: LocationShare;
}

export const ChatLocationCard: React.FC<ChatLocationCardProps> = ({ location }) => {
  const query = encodeURIComponent(`${location.name}, ${location.address}, ${location.city || ''}`);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;

  return (
    <div className="my-2 p-3.5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-200/80 shadow-sm max-w-[320px] text-slate-800 hover:shadow-md transition-all">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
          <MapPin className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-blue-950">Shared Meetup Spot</h4>
          <span className="text-[10px] text-blue-600 font-semibold">Public Safe Zone</span>
        </div>
      </div>

      <div className="bg-white p-2.5 rounded-xl border border-blue-100 mb-2.5">
        <div className="font-bold text-xs text-slate-900">{location.name}</div>
        <div className="text-[11px] text-slate-600 mt-0.5 leading-snug">{location.address}</div>
        {location.landmark && (
          <div className="text-[10px] text-indigo-600 font-medium mt-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-indigo-500" />
            <span>Landmark: {location.landmark}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 pt-0.5">
        <div className="flex items-center gap-1 text-[10px] text-slate-500">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          <span>Recommended meetup point</span>
        </div>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-100/80 hover:bg-blue-200 px-2.5 py-1 rounded-lg transition-colors"
        >
          <Navigation className="w-3 h-3" />
          <span>Map</span>
          <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
        </a>
      </div>
    </div>
  );
};
