import React, { useState } from 'react';
import { X, MapPin, Navigation, Building2, Train, Coffee } from 'lucide-react';
import { LocationShare } from '../../types/chat.types';

interface ShareLocationModalProps {
  onClose: () => void;
  onShareLocation: (location: LocationShare) => void;
}

const PRESET_PLACES: LocationShare[] = [
  {
    name: 'Phoenix Marketcity (Main Gate)',
    address: '142, Velachery Main Rd, Indira Gandhi Nagar, Velachery',
    landmark: 'Near Main Entrance Starbucks',
    city: 'Chennai',
  },
  {
    name: 'Express Avenue Mall',
    address: 'Club House Rd, Express Estate, Royapettah',
    landmark: 'Central Atrium Floor 1',
    city: 'Chennai',
  },
  {
    name: 'Anna Nagar Tower Metro Station',
    address: '2nd Avenue, Block Y, Anna Nagar',
    landmark: 'Gate 2 Ticket Counter',
    city: 'Chennai',
  },
  {
    name: 'Forum Vijaya Mall',
    address: '183, Great Southern Trunk Rd, Arcot Rd, Vadapalani',
    landmark: 'Near Food Court Level 3',
    city: 'Chennai',
  },
  {
    name: 'T. Nagar Panagal Park',
    address: 'Prakasam Rd, Parthasarathi Puram, T. Nagar',
    landmark: 'Opposite GRT Jewellers',
    city: 'Chennai',
  },
];

export const ShareLocationModal: React.FC<ShareLocationModalProps> = ({
  onClose,
  onShareLocation,
}) => {
  const [customName, setCustomName] = useState('');
  const [customAddress, setCustomAddress] = useState('');
  const [customLandmark, setCustomLandmark] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);

  const handleSelectPreset = (place: LocationShare) => {
    onShareLocation(place);
    onClose();
  };

  const handleSubmitCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customAddress.trim()) return;

    onShareLocation({
      name: customName.trim(),
      address: customAddress.trim(),
      landmark: customLandmark.trim() || undefined,
      city: 'Chennai',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight">Share Meetup Location</h3>
              <p className="text-[11px] text-blue-100">Select a safe public landmark or custom address</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {!isCustomMode ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-700">Recommended Public Safe Spots</span>
                <button
                  type="button"
                  onClick={() => setIsCustomMode(true)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  + Custom Address
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {PRESET_PLACES.map((place, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectPreset(place)}
                    className="p-3 rounded-2xl border border-slate-200/80 hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer transition-all flex items-start justify-between group"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 group-hover:bg-blue-600 group-hover:text-white text-blue-600 flex items-center justify-center flex-shrink-0 transition-colors mt-0.5">
                        {idx % 2 === 0 ? <Building2 className="w-4 h-4" /> : <Train className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                          {place.name}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{place.address}</div>
                        {place.landmark && (
                          <div className="text-[10px] text-indigo-600 font-semibold mt-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-indigo-500" />
                            <span>{place.landmark}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Navigation className="w-4 h-4 text-slate-300 group-hover:text-blue-600 flex-shrink-0 mt-2 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitCustom} className="space-y-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-700">Enter Custom Meetup Details</span>
                <button
                  type="button"
                  onClick={() => setIsCustomMode(false)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-700"
                >
                  ← Back to Presets
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location Name</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Starbucks Coffee, Velachery"
                  required
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address</label>
                <input
                  type="text"
                  value={customAddress}
                  onChange={(e) => setCustomAddress(e.target.value)}
                  placeholder="e.g. 100 Feet Bypass Road, Velachery"
                  required
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Landmark (Optional)</label>
                <input
                  type="text"
                  value={customLandmark}
                  onChange={(e) => setCustomLandmark(e.target.value)}
                  placeholder="e.g. Next to Grand Mall entrance"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCustomMode(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20"
                >
                  Share Location
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
