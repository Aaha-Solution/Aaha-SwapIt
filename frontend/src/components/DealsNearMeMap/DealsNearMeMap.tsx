import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Navigation,
  Sliders,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  MessageSquare,
  Search,
  CheckCircle2,
  Maximize2,
  Compass,
  ArrowRight,
  ShieldCheck,
  Tag,
  Zap,
  ChevronDown,
  Car,
  Bike,
  Smartphone,
  Laptop,
  Building2,
  Armchair,
} from 'lucide-react';
import { Product } from '../../types/product.types';
import { formatINR } from '../../utils/helpers';
import {
  calculateDistance,
  formatDistance,
  KNOWN_CITY_LANDMARKS,
  DEFAULT_USER_LOCATION,
  CityLandmark,
} from '../../utils/geo';

interface DealsNearMeMapProps {
  products: Product[];
  onSelectProduct?: (product: Product) => void;
}

export const DealsNearMeMap: React.FC<DealsNearMeMapProps> = ({ products, onSelectProduct }) => {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Geo & Filter States
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number; name: string }>({
    lat: DEFAULT_USER_LOCATION.latitude,
    lng: DEFAULT_USER_LOCATION.longitude,
    name: DEFAULT_USER_LOCATION.name,
  });
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [locationStatusMessage, setLocationStatusMessage] = useState<string>('');

  // Auto-detect browser geolocation
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatusMessage('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationStatusMessage('Detecting your GPS position...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserCoords({
          lat: latitude,
          lng: longitude,
          name: 'My Current GPS Location',
        });
        setIsLocating(false);
        setLocationStatusMessage('Location detected successfully!');
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 13, { duration: 1.2 });
        }
      },
      (err) => {
        setIsLocating(false);
        setLocationStatusMessage('Unable to retrieve position. Using default city location.');
        console.warn('Geolocation error:', err.message);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleSelectLandmark = (landmark: CityLandmark) => {
    setUserCoords({
      lat: landmark.latitude,
      lng: landmark.longitude,
      name: `${landmark.name}, ${landmark.city}`,
    });
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([landmark.latitude, landmark.longitude], 13, { duration: 1.2 });
    }
  };

  // Assign fallback coordinates if a product is missing explicit coordinates
  const productsWithCoords = useMemo(() => {
    return products.map((p, idx) => {
      let lat = p.latitude;
      let lng = p.longitude;

      if (!lat || !lng) {
        // Fallback offset around Chennai Central
        const offsets = [
          { lat: 13.0418, lng: 80.2341, name: 'T. Nagar' },
          { lat: 12.9815, lng: 80.2180, name: 'Velachery' },
          { lat: 13.0850, lng: 80.2101, name: 'Anna Nagar' },
          { lat: 13.0012, lng: 80.2565, name: 'Adyar' },
          { lat: 12.9352, lng: 80.2289, name: 'OMR' },
          { lat: 13.0382, lng: 80.1565, name: 'Porur' },
          { lat: 13.0569, lng: 80.2425, name: 'Nungambakkam' },
          { lat: 13.0067, lng: 80.2025, name: 'Guindy' },
        ];
        const chosen = offsets[idx % offsets.length];
        lat = chosen.lat;
        lng = chosen.lng;
      }

      const dist = calculateDistance(userCoords.lat, userCoords.lng, lat, lng);
      return {
        ...p,
        latitude: lat,
        longitude: lng,
        distanceKm: dist,
      };
    });
  }, [products, userCoords]);

  // Filter products by distance radius, category, and search query
  const nearbyProducts = useMemo(() => {
    return productsWithCoords
      .filter((p) => {
        const matchesRadius = p.distanceKm <= radiusKm;
        const matchesCat = selectedCategory === 'all' || p.category === selectedCategory || p.categoryId === selectedCategory;
        const matchesSearch =
          !searchQuery.trim() ||
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.city.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesRadius && matchesCat && matchesSearch;
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [productsWithCoords, radiusKm, selectedCategory, searchQuery]);

  // Format short price (e.g. ₹4.5L, ₹85K)
  const formatShortPrice = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(val % 100000 === 0 ? 0 : 1)}L`;
    if (val >= 1000) return `₹${Math.round(val / 1000)}k`;
    return `₹${val}`;
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [userCoords.lat, userCoords.lng],
        zoom: 12,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // OpenStreetMap Tiles with crisp styling
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update User Marker and Radius Circle
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Remove existing user marker
    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
    }
    // Remove existing radius circle
    if (radiusCircleRef.current) {
      map.removeLayer(radiusCircleRef.current);
    }

    // Custom pulsing user icon
    const userIcon = L.divIcon({
      className: 'custom-user-pin',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 36px; height: 36px; background: rgba(79, 70, 229, 0.25); border-radius: 50%; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 20px; height: 20px; background: #4f46e5; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 4px 12px rgba(79,70,229,0.5);"></div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    userMarkerRef.current = L.marker([userCoords.lat, userCoords.lng], { icon: userIcon })
      .addTo(map)
      .bindPopup(`
        <div style="font-family: inherit; padding: 4px;">
          <div style="font-weight: 800; font-size: 12px; color: #1e1b4b; display: flex; align-items: center; gap: 5px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
            <span>${userCoords.name}</span>
          </div>
          <div style="font-size: 10.5px; color: #64748b; margin-top: 2px;">Your active search center</div>
        </div>
      `);

    // Add search radius boundary circle
    radiusCircleRef.current = L.circle([userCoords.lat, userCoords.lng], {
      radius: radiusKm * 1000,
      color: '#4f46e5',
      weight: 1.5,
      opacity: 0.8,
      fillColor: '#6366f1',
      fillOpacity: 0.08,
      dashArray: '6, 6',
    }).addTo(map);
  }, [userCoords, radiusKm]);

  // Update Product Markers on Map
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const markersLayer = markersLayerRef.current;
    markersLayer.clearLayers();

    nearbyProducts.forEach((p) => {
      const isSelected = selectedProduct?.id === p.id;
      const shortPrice = formatShortPrice(p.price);

      const markerHtml = `
        <div class="product-map-pill" style="
          background: ${isSelected ? '#1e1b4b' : '#ffffff'};
          color: ${isSelected ? '#ffffff' : '#0f172a'};
          border: 2px solid ${isSelected ? '#6366f1' : '#e2e8f0'};
          padding: 3px 8px;
          border-radius: 12px;
          font-weight: 800;
          font-size: 11px;
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.15);
          display: flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
        ">
          <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${p.featured ? '#10b981' : '#6366f1'};"></span>
          <span>${shortPrice}</span>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-product-marker',
        html: markerHtml,
        iconSize: [60, 26],
        iconAnchor: [30, 13],
      });

      const marker = L.marker([p.latitude!, p.longitude!], { icon: customIcon });

      // Popup Content Card
      const popupContent = `
        <div style="font-family: inherit; width: 220px; border-radius: 16px; overflow: hidden; padding: 0;">
          <div style="position: relative; height: 110px; background: #f1f5f9;">
            <img src="${p.imageUrl}" alt="${p.title}" style="width: 100%; height: 100%; object-fit: cover;" />
            <div style="position: absolute; top: 6px; right: 6px; background: rgba(15, 23, 42, 0.85); color: #ffffff; font-size: 9.5px; font-weight: 700; padding: 2px 6px; border-radius: 6px;">
              ${formatDistance(p.distanceKm)}
            </div>
          </div>
          <div style="padding: 10px 12px;">
            <div style="font-weight: 800; font-size: 12.5px; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${p.title}
            </div>
            <div style="display: flex; align-items: baseline; justify-content: space-between; margin-top: 4px;">
              <span style="font-size: 15px; font-weight: 900; color: #4f46e5;">${formatINR(p.price)}</span>
              <span style="font-size: 10px; color: #64748b; background: #f1f5f9; padding: 1px 6px; border-radius: 4px;">${p.condition}</span>
            </div>
            <div style="font-size: 10.5px; color: #64748b; margin-top: 4px; display: flex; align-items: center; gap: 4px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
              <span>${p.neighborhood || p.city}</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-top: 10px;">
              <button id="view-prod-${p.id}" style="
                background: #4f46e5;
                color: #ffffff;
                font-size: 11px;
                font-weight: 700;
                padding: 6px 0;
                border: none;
                border-radius: 8px;
                cursor: pointer;
              ">
                View Details
              </button>
              <button id="chat-prod-${p.id}" style="
                background: #f1f5f9;
                color: #334155;
                font-size: 11px;
                font-weight: 700;
                padding: 6px 0;
                border: 1px solid #cbd5e1;
                border-radius: 8px;
                cursor: pointer;
              ">
                Chat
              </button>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 240, className: 'deal-map-popup' });

      marker.on('click', () => {
        setSelectedProduct(p);
      });

      marker.on('popupopen', () => {
        const viewBtn = document.getElementById(`view-prod-${p.id}`);
        const chatBtn = document.getElementById(`chat-prod-${p.id}`);

        if (viewBtn) {
          viewBtn.onclick = () => {
            navigate(`/products/${p.id}`);
          };
        }
        if (chatBtn) {
          chatBtn.onclick = () => {
            navigate(`/messages?userId=${p.seller.id}&productId=${p.id}`);
          };
        }
      });

      markersLayer.addLayer(marker);
    });
  }, [nearbyProducts, selectedProduct, navigate]);

  // Click handler for sidebar product card to focus on map
  const handleFocusProductOnMap = (p: Product & { distanceKm: number }) => {
    setSelectedProduct(p);
    if (mapInstanceRef.current && p.latitude && p.longitude) {
      mapInstanceRef.current.flyTo([p.latitude, p.longitude], 14, { duration: 0.8 });
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col">
      {/* Top Filter & Radius Control Bar */}
      <div className="p-4 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Location Picker & GPS Trigger */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={isLocating}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Locating...' : 'Use My GPS Location'}</span>
          </button>

          {/* Quick Landmark Presets */}
          <div className="relative flex items-center">
            <MapPin className="w-3.5 h-3.5 text-indigo-600 absolute left-2.5 pointer-events-none z-10" />
            <select
              value={userCoords.name}
              onChange={(e) => {
                const landmark = KNOWN_CITY_LANDMARKS.find(
                  (l) => `${l.name}, ${l.city}` === e.target.value
                );
                if (landmark) handleSelectLandmark(landmark);
              }}
              className="text-xs font-bold pl-7 pr-7 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 cursor-pointer shadow-2xs appearance-none"
            >
              {KNOWN_CITY_LANDMARKS.map((l) => (
                <option key={l.id} value={`${l.name}, ${l.city}`}>
                  {l.name} ({l.city})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-none" />
          </div>

          {locationStatusMessage && (
            <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              {locationStatusMessage}
            </span>
          )}
        </div>

        {/* Right: Radius Slider Control */}
        <div className="flex items-center gap-3 bg-white px-4 py-1.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Compass className="w-4 h-4 text-indigo-600" />
            <span>Radius:</span>
            <span className="text-indigo-600 font-black">{radiusKm} km</span>
          </div>
          <input
            type="range"
            min={2}
            max={50}
            step={1}
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
            className="w-28 sm:w-36 accent-indigo-600 cursor-pointer"
          />
          <div className="flex gap-1">
            {[5, 10, 25].map((km) => (
              <button
                key={km}
                type="button"
                onClick={() => setRadiusKm(km)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-colors ${
                  radiusKm === km
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {km}k
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category Pills & Search Filter */}
      <div className="px-4 py-2.5 bg-white border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {[
            { id: 'all', name: 'All' },
            { id: 'cars', name: 'Cars', icon: Car },
            { id: 'bikes', name: 'Bikes', icon: Bike },
            { id: 'mobiles', name: 'Mobiles', icon: Smartphone },
            { id: 'electronics', name: 'Electronics', icon: Laptop },
            { id: 'properties', name: 'Properties', icon: Building2 },
            { id: 'furniture', name: 'Furniture', icon: Armchair },
          ].map((cat) => {
            const IconComp = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all whitespace-nowrap cursor-pointer inline-flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {IconComp && (
                  <IconComp className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                )}
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-60">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search nearby items..."
            className="w-full text-xs pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800"
          />
        </div>
      </div>

      {/* Main Dual View: 65% Interactive Map + 35% Nearest Deals Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 h-[580px]">
        {/* Left Map View (8 cols) */}
        <div className="lg:col-span-8 relative h-[340px] lg:h-full border-b lg:border-b-0 lg:border-r border-slate-100 bg-slate-100">
          <div ref={mapContainerRef} className="w-full h-full z-10" />

          {/* Map Overlay Badge */}
          <div className="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl shadow-md border border-slate-200/80 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-800">
              {nearbyProducts.length} {nearbyProducts.length === 1 ? 'deal' : 'deals'} found within {radiusKm} km
            </span>
          </div>
        </div>

        {/* Right Sidebar: Closest Deals List (4 cols) */}
        <div className="lg:col-span-4 flex flex-col bg-white h-[240px] lg:h-full overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold text-slate-900">Closest Deals First</h3>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold">Sorted by distance</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
            {nearbyProducts.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
                  <Compass className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-slate-800 mb-1">No deals within {radiusKm} km</h4>
                <p className="text-[11px] text-slate-500 max-w-xs mb-3">
                  Try expanding the distance radius slider or switching to another landmark.
                </p>
                <button
                  type="button"
                  onClick={() => setRadiusKm(25)}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Expand to 25 km
                </button>
              </div>
            ) : (
              nearbyProducts.map((p) => {
                const isSelected = selectedProduct?.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => handleFocusProductOnMap(p)}
                    className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                      isSelected
                        ? 'bg-indigo-50/80 border-indigo-300 shadow-xs'
                        : 'bg-white border-transparent hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <img
                      src={p.imageUrl}
                      alt={p.title}
                      className="w-14 h-14 object-cover rounded-xl border border-slate-200 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                          {formatDistance(p.distanceKm)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {p.neighborhood || p.city}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 truncate">{p.title}</h4>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs font-black text-slate-900">
                          {formatINR(p.price)}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/messages?userId=${p.seller.id}&productId=${p.id}`);
                          }}
                          className="text-[10.5px] font-bold text-indigo-700 hover:text-indigo-800 flex items-center gap-0.5"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Chat</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
