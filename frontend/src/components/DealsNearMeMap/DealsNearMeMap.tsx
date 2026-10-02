import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { setSelectedCategory as setReduxCategory } from '../../store/slices/userSlice';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Navigation,
  Search,
  CheckCircle2,
  Compass,
  ArrowRight,
  ChevronDown,
  Car,
  Bike,
  Smartphone,
  Laptop,
  Building2,
  Armchair,
  Shirt,
  Dog,
  BookOpen,
  Briefcase,
  Wrench,
  SlidersHorizontal,
  Zap,
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

const CATEGORY_ITEMS = [
  { id: 'all', name: 'All Categories' },
  { id: 'cars', name: 'Cars', icon: Car },
  { id: 'bikes', name: 'Bikes', icon: Bike },
  { id: 'mobiles', name: 'Mobiles', icon: Smartphone },
  { id: 'electronics', name: 'Electronics', icon: Laptop },
  { id: 'properties', name: 'Property', icon: Building2 },
  { id: 'furniture', name: 'Furniture', icon: Armchair },
  { id: 'fashion', name: 'Fashion', icon: Shirt },
  { id: 'pets', name: 'Pets', icon: Dog },
  { id: 'books', name: 'Books', icon: BookOpen },
  { id: 'services', name: 'Services', icon: Wrench },
];

export const DealsNearMeMap: React.FC<DealsNearMeMapProps> = ({ products, onSelectProduct }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const reduxCategory = useSelector((state: RootState) => state.user.selectedCategory);

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
  const [selectedCategory, setSelectedCategory] = useState<string>(reduxCategory || 'all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [locationStatusMessage, setLocationStatusMessage] = useState<string>('');

  // Synchronize with Redux category
  useEffect(() => {
    if (reduxCategory) {
      setSelectedCategory(reduxCategory);
    }
  }, [reduxCategory]);

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    dispatch(setReduxCategory(catId));
  };

  // Auto-detect browser geolocation
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatusMessage('Geolocation not supported by browser');
      return;
    }

    setIsLocating(true);
    setLocationStatusMessage('Finding your location...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserCoords({
          lat: latitude,
          lng: longitude,
          name: 'Current Location',
        });
        setIsLocating(false);
        setLocationStatusMessage('Located');
        setTimeout(() => setLocationStatusMessage(''), 3000);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 13, { duration: 1.2 });
        }
      },
      (err) => {
        setIsLocating(false);
        setLocationStatusMessage('Using default location');
        setTimeout(() => setLocationStatusMessage(''), 3000);
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

  // Assign realistic local coordinates around the current reference point if not provided
  const productsWithCoords = useMemo(() => {
    return products.map((p, idx) => {
      let lat = p.latitude;
      let lng = p.longitude;

      if (!lat || !lng) {
        const angle = (idx * 137.5 * Math.PI) / 180;
        const radiusOffset = 0.01 + ((idx % 6) * 0.008);
        lat = Number((userCoords.lat + radiusOffset * Math.cos(angle)).toFixed(4));
        lng = Number((userCoords.lng + radiusOffset * Math.sin(angle)).toFixed(4));
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
    const normalizedSelected = (selectedCategory || 'all').toLowerCase().trim();

    return productsWithCoords
      .filter((p) => {
        const matchesRadius = p.distanceKm <= radiusKm;

        const pCat = (p.category || '').toLowerCase().trim();
        const pCatId = (p.categoryId || '').toLowerCase().trim();
        const pCatName = ((p as any).categoryName || '').toLowerCase().trim();

        const matchesCat =
          normalizedSelected === 'all' ||
          pCat === normalizedSelected ||
          pCatId === normalizedSelected ||
          pCatId === `cat-${normalizedSelected}` ||
          pCatName === normalizedSelected ||
          pCat.includes(normalizedSelected) ||
          normalizedSelected.includes(pCat);

        const matchesSearch =
          !searchQuery.trim() ||
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.city.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesRadius && matchesCat && matchesSearch;
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [productsWithCoords, radiusKm, selectedCategory, searchQuery]);

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

    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
    }
    if (radiusCircleRef.current) {
      map.removeLayer(radiusCircleRef.current);
    }

    const userIcon = L.divIcon({
      className: 'custom-user-pin',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 32px; height: 32px; background: rgba(79, 70, 229, 0.2); border-radius: 50%;"></div>
          <div style="width: 16px; height: 16px; background: #4f46e5; border: 2.5px solid #ffffff; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.25);"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    userMarkerRef.current = L.marker([userCoords.lat, userCoords.lng], { icon: userIcon })
      .addTo(map)
      .bindPopup(
        `<div style="font-family: inherit; padding: 4px; text-align: center;">
          <p style="font-size: 11px; font-weight: 700; color: #4f46e5; margin: 0;">📍 Location</p>
          <p style="font-size: 12px; font-weight: 700; color: #0f172a; margin: 2px 0 0;">${userCoords.name}</p>
        </div>`
      );

    radiusCircleRef.current = L.circle([userCoords.lat, userCoords.lng], {
      radius: radiusKm * 1000,
      color: '#6366f1',
      weight: 1.5,
      opacity: 0.7,
      fillColor: '#6366f1',
      fillOpacity: 0.06,
      dashArray: '4, 4',
    }).addTo(map);
  }, [userCoords, radiusKm]);

  // Update Deal Markers on the Map
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const markersLayer = markersLayerRef.current;
    markersLayer.clearLayers();

    nearbyProducts.forEach((product) => {
      const isSelected = selectedProduct?.id === product.id;

      const priceMarkerHtml = `
        <div class="deal-map-marker ${isSelected ? 'selected' : ''}" style="
          background: ${isSelected ? '#4338ca' : '#0f172a'};
          color: #ffffff;
          padding: 3px 8px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 4px;
          box-shadow: 0 3px 10px rgba(0,0,0,0.2);
          border: 2px solid ${isSelected ? '#818cf8' : '#ffffff'};
          cursor: pointer;
          white-space: nowrap;
          transform: ${isSelected ? 'scale(1.1)' : 'scale(1)'};
          transition: all 0.15s ease;
        ">
          <span style="display: inline-block; width: 5px; height: 5px; border-radius: 50%; background: #10b981;"></span>
          <span>${formatShortPrice(product.price)}</span>
        </div>
      `;

      const markerIcon = L.divIcon({
        className: 'custom-deal-marker',
        html: priceMarkerHtml,
        iconSize: [58, 24],
        iconAnchor: [29, 12],
      });

      const marker = L.marker([product.latitude, product.longitude], { icon: markerIcon })
        .addTo(markersLayer)
        .on('click', () => {
          setSelectedProduct(product);
          if (onSelectProduct) {
            onSelectProduct(product);
          }
        });

      marker.bindPopup(`
        <div style="font-family: inherit; width: 170px; padding: 2px;">
          <img src="${product.imageUrl}" style="width: 100%; height: 85px; object-fit: cover; border-radius: 8px; margin-bottom: 6px;" />
          <h4 style="font-size: 12px; font-weight: 700; color: #0f172a; margin: 0 0 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${product.title}</h4>
          <p style="font-size: 13px; font-weight: 800; color: #4f46e5; margin: 0 0 3px;">${formatINR(product.price)}</p>
          <div style="display: flex; justify-content: space-between; font-size: 10px; color: #64748b;">
            <span>📍 ${formatDistance(product.distanceKm)}</span>
            <span>⭐ ${product.seller.rating || 5.0}</span>
          </div>
        </div>
      `);
    });
  }, [nearbyProducts, selectedProduct, onSelectProduct]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* 1. Human Clean Control Bar */}
      <div className="p-4 bg-white border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Location details and picker */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Location Picker Pill */}
          <div className="relative inline-flex items-center">
            <MapPin className="w-4 h-4 text-indigo-600 absolute left-3 pointer-events-none" />
            <select
              value={userCoords.name}
              onChange={(e) => {
                const landmark = KNOWN_CITY_LANDMARKS.find(
                  (l) => `${l.name}, ${l.city}` === e.target.value || l.name === e.target.value
                );
                if (landmark) handleSelectLandmark(landmark);
              }}
              className="text-xs font-semibold pl-9 pr-8 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-800 transition-colors cursor-pointer appearance-none focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            >
              {KNOWN_CITY_LANDMARKS.map((l) => (
                <option key={l.id} value={`${l.name}, ${l.city}`}>
                  {l.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
          </div>

          {/* Near Me GPS Button */}
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={isLocating}
            className="text-xs font-semibold px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            title="Locate around my current position"
          >
            <Navigation className={`w-3.5 h-3.5 text-indigo-600 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Detecting...' : 'Near Me'}</span>
          </button>

          {locationStatusMessage && (
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {locationStatusMessage}
            </span>
          )}
        </div>

        {/* Right: Clean Segmented Distance Radius */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Distance:</span>
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            {[5, 10, 25, 50].map((km) => (
              <button
                key={km}
                type="button"
                onClick={() => setRadiusKm(km)}
                className={`text-xs font-semibold px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  radiusKm === km
                    ? 'bg-white text-indigo-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {km} km
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Clean Category Pills & Search */}
      <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {CATEGORY_ITEMS.map((cat) => {
            const IconComp = (cat as any).icon;
            const isActive = selectedCategory.toLowerCase() === cat.id.toLowerCase();
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.id)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all whitespace-nowrap cursor-pointer inline-flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {IconComp && (
                  <IconComp className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                )}
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-56">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search in this area..."
            className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 text-slate-800 transition-colors"
          />
        </div>
      </div>

      {/* 3. Main View: 65% Interactive Map + 35% Nearest Deals Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 h-[560px]">
        {/* Left Map View */}
        <div className="lg:col-span-8 relative h-[320px] lg:h-full border-b lg:border-b-0 lg:border-r border-slate-100 bg-slate-50">
          <div ref={mapContainerRef} className="w-full h-full z-10" />

          {/* Simple Clean Floating Badge */}
          <div className="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-xs px-3 py-1 rounded-full shadow-xs border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>
              {nearbyProducts.length} {nearbyProducts.length === 1 ? 'item' : 'items'} found within {radiusKm} km
            </span>
          </div>
        </div>

        {/* Right Sidebar: Closest Deals List */}
        <div className="lg:col-span-4 flex flex-col bg-white h-[240px] lg:h-full overflow-hidden">
          <div className="p-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800">Nearby Listings</h3>
            <span className="text-[11px] text-slate-400">Closest first</span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {nearbyProducts.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-2">
                  <Compass className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-800">No items within {radiusKm} km</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Try increasing your distance or picking another landmark.
                </p>
                <button
                  type="button"
                  onClick={() => setRadiusKm(25)}
                  className="mt-2.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
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
                    onClick={() => {
                      setSelectedProduct(p);
                      if (mapInstanceRef.current) {
                        mapInstanceRef.current.flyTo([p.latitude, p.longitude], 14, { duration: 1 });
                      }
                      if (onSelectProduct) {
                        onSelectProduct(p);
                      }
                    }}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex gap-3 ${
                      isSelected
                        ? 'bg-indigo-50/50 border-indigo-300'
                        : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
                    }`}
                  >
                    <img
                      src={p.imageUrl}
                      alt={p.title}
                      className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border border-slate-100"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{p.title}</h4>
                          <span className="text-[10px] font-semibold text-slate-500 flex-shrink-0">
                            {formatDistance(p.distanceKm)}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-indigo-600 mt-0.5">
                          {formatINR(p.price)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="truncate">{p.city}</span>
                        <span className="text-indigo-600 font-medium hover:underline flex items-center gap-0.5 text-[11px]">
                          Details <ArrowRight className="w-2.5 h-2.5" />
                        </span>
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
