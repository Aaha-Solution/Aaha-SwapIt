export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface CityLandmark {
  id: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
}

/**
 * Puducherry & Immediate surroundings geographic bounding box
 * Covers Puducherry Urban, Suburbs, Auroville, Kalapet, Villianur, Bahour, Ariankuppam, Chunnambar, etc.
 */
export const PUDUCHERRY_BOUNDS = {
  southWest: [11.75, 79.60] as [number, number],
  northEast: [12.18, 80.05] as [number, number],
};

/**
 * High-precision locality GPS coordinate dictionary for Puducherry and Surroundings
 */
export const PUDUCHERRY_LOCALITY_COORDINATES: Record<string, GeoPoint & { canonicalName: string }> = {
  'white town': { latitude: 11.9338, longitude: 79.8359, canonicalName: 'White Town (French Quarter)' },
  'french quarter': { latitude: 11.9338, longitude: 79.8359, canonicalName: 'White Town (French Quarter)' },
  'promenade': { latitude: 11.9316, longitude: 79.8358, canonicalName: 'Promenade Beach / Beach Road' },
  'rock beach': { latitude: 11.9316, longitude: 79.8358, canonicalName: 'Promenade Beach / Beach Road' },
  'heritage town': { latitude: 11.9372, longitude: 79.8302, canonicalName: 'Heritage Town / Mission Street' },
  'mission st': { latitude: 11.9372, longitude: 79.8302, canonicalName: 'Heritage Town / Mission Street' },
  'lawspet': { latitude: 11.9660, longitude: 79.8180, canonicalName: 'Lawspet' },
  'muthialpet': { latitude: 11.9540, longitude: 79.8310, canonicalName: 'Muthialpet' },
  'reddiarpalayam': { latitude: 11.9380, longitude: 79.7990, canonicalName: 'Reddiarpalayam' },
  'villianur': { latitude: 11.9167, longitude: 79.7556, canonicalName: 'Villianur' },
  'gorimedu': { latitude: 11.9560, longitude: 79.8020, canonicalName: 'Gorimedu / JIPMER' },
  'jipmer': { latitude: 11.9560, longitude: 79.8020, canonicalName: 'Gorimedu / JIPMER' },
  'indira gandhi sq': { latitude: 11.9280, longitude: 79.8100, canonicalName: 'Indira Gandhi Sq / New Bus Stand' },
  'bus stand': { latitude: 11.9280, longitude: 79.8100, canonicalName: 'Indira Gandhi Sq / New Bus Stand' },
  'auroville': { latitude: 12.0070, longitude: 79.8105, canonicalName: 'Auroville / Kuilapalayam' },
  'kuilapalayam': { latitude: 12.0070, longitude: 79.8105, canonicalName: 'Auroville / Kuilapalayam' },
  'kalapet': { latitude: 12.0150, longitude: 79.8550, canonicalName: 'Kalapet / Pondicherry University' },
  'pondy univ': { latitude: 12.0150, longitude: 79.8550, canonicalName: 'Kalapet / Pondicherry University' },
  'chunnambar': { latitude: 11.8820, longitude: 79.8050, canonicalName: 'Nonankuppam / Chunnambar' },
  'nonankuppam': { latitude: 11.8820, longitude: 79.8050, canonicalName: 'Nonankuppam / Chunnambar' },
  'paradise beach': { latitude: 11.8820, longitude: 79.8050, canonicalName: 'Nonankuppam / Chunnambar' },
  'mudaliarpet': { latitude: 11.9180, longitude: 79.8130, canonicalName: 'Mudaliarpet' },
  'ariankuppam': { latitude: 11.9020, longitude: 79.8090, canonicalName: 'Ariankuppam' },
  'thavalakuppam': { latitude: 11.8680, longitude: 79.7990, canonicalName: 'Thavalakuppam' },
  'bahour': { latitude: 11.8020, longitude: 79.7420, canonicalName: 'Bahour' },
  'kottakuppam': { latitude: 11.9680, longitude: 79.8370, canonicalName: 'Kottakuppam / ECR Border' },
  'ecr': { latitude: 11.9680, longitude: 79.8370, canonicalName: 'Kottakuppam / ECR Border' },
  'sedarapet': { latitude: 11.9850, longitude: 79.7430, canonicalName: 'Sedarapet Industrial Area' },
  'ousteri': { latitude: 11.9450, longitude: 79.7480, canonicalName: 'Ousteri Lake (Osudu)' },
  'osudu': { latitude: 11.9450, longitude: 79.7480, canonicalName: 'Ousteri Lake (Osudu)' },
  'nellithope': { latitude: 11.9310, longitude: 79.8170, canonicalName: 'Nellithope' },
  'saram': { latitude: 11.9410, longitude: 79.8180, canonicalName: 'Saram' },
  'thilaspet': { latitude: 11.9440, longitude: 79.8080, canonicalName: 'Thilaspet / Kathirkamam' },
  'kathirkamam': { latitude: 11.9440, longitude: 79.8080, canonicalName: 'Thilaspet / Kathirkamam' },
  'rainbow nagar': { latitude: 11.9430, longitude: 79.8240, canonicalName: 'Rainbow Nagar' },
  'kurusukuppam': { latitude: 11.9460, longitude: 79.8340, canonicalName: 'Kurusukuppam' },
};

export const KNOWN_CITY_LANDMARKS: CityLandmark[] = [
  { id: 'pdy-whitetown', name: 'White Town (French Quarter)', city: 'Puducherry', latitude: 11.9338, longitude: 79.8359 },
  { id: 'pdy-promenade', name: 'Promenade Beach / Beach Rd', city: 'Puducherry', latitude: 11.9316, longitude: 79.8358 },
  { id: 'pdy-heritagetown', name: 'Heritage Town / Mission St', city: 'Puducherry', latitude: 11.9372, longitude: 79.8302 },
  { id: 'pdy-lawspet', name: 'Lawspet', city: 'Puducherry', latitude: 11.9660, longitude: 79.8180 },
  { id: 'pdy-muthialpet', name: 'Muthialpet', city: 'Puducherry', latitude: 11.9540, longitude: 79.8310 },
  { id: 'pdy-reddiarpalayam', name: 'Reddiarpalayam', city: 'Puducherry', latitude: 11.9380, longitude: 79.7990 },
  { id: 'pdy-villianur', name: 'Villianur', city: 'Puducherry', latitude: 11.9167, longitude: 79.7556 },
  { id: 'pdy-jipmer', name: 'Gorimedu / JIPMER', city: 'Puducherry', latitude: 11.9560, longitude: 79.8020 },
  { id: 'pdy-busstand', name: 'Indira Gandhi Sq / New Bus Stand', city: 'Puducherry', latitude: 11.9280, longitude: 79.8100 },
  { id: 'pdy-auroville', name: 'Auroville / Kuilapalayam', city: 'Puducherry', latitude: 12.0070, longitude: 79.8105 },
  { id: 'pdy-kalapet', name: 'Kalapet / Pondy Univ', city: 'Puducherry', latitude: 12.0150, longitude: 79.8550 },
  { id: 'pdy-chunnambar', name: 'Nonankuppam / Chunnambar', city: 'Puducherry', latitude: 11.8820, longitude: 79.8050 },
  { id: 'pdy-mudaliarpet', name: 'Mudaliarpet', city: 'Puducherry', latitude: 11.9180, longitude: 79.8130 },
  { id: 'pdy-ariankuppam', name: 'Ariankuppam', city: 'Puducherry', latitude: 11.9020, longitude: 79.8090 },
  { id: 'pdy-thavalakuppam', name: 'Thavalakuppam', city: 'Puducherry', latitude: 11.8680, longitude: 79.7990 },
  { id: 'pdy-bahour', name: 'Bahour', city: 'Puducherry', latitude: 11.8020, longitude: 79.7420 },
  { id: 'pdy-kottakuppam', name: 'Kottakuppam / ECR', city: 'Puducherry Surroundings', latitude: 11.9680, longitude: 79.8370 },
  { id: 'pdy-sedarapet', name: 'Sedarapet Industrial Area', city: 'Puducherry', latitude: 11.9850, longitude: 79.7430 },
  { id: 'pdy-ousteri', name: 'Ousteri Lake (Osudu)', city: 'Puducherry', latitude: 11.9450, longitude: 79.7480 },
  { id: 'pdy-rainbow', name: 'Rainbow Nagar / Venkata Nagar', city: 'Puducherry', latitude: 11.9430, longitude: 79.8240 },
  { id: 'pdy-nellithope', name: 'Nellithope', city: 'Puducherry', latitude: 11.9310, longitude: 79.8170 },
  { id: 'pdy-saram', name: 'Saram / Kamaraj Salai', city: 'Puducherry', latitude: 11.9410, longitude: 79.8180 },
];

/**
 * Check if given coordinates are within Puducherry / Pondicherry bounds
 */
export function isWithinPuducherry(lat: number, lng: number): boolean {
  return (
    lat >= PUDUCHERRY_BOUNDS.southWest[0] &&
    lat <= PUDUCHERRY_BOUNDS.northEast[0] &&
    lng >= PUDUCHERRY_BOUNDS.southWest[1] &&
    lng <= PUDUCHERRY_BOUNDS.northEast[1]
  );
}

/**
 * Place-accurate coordinate resolver for any product or place query
 */
export function resolvePuducherryCoordinates(
  item: {
    id?: string;
    latitude?: number;
    longitude?: number;
    neighborhood?: string;
    location?: string;
    city?: string;
    title?: string;
  },
  seedIndex: number = 0
): { latitude: number; longitude: number; areaName: string } {
  // 1. If explicit valid coordinates already exist within Puducherry bounds, preserve them
  if (
    item.latitude &&
    item.longitude &&
    isWithinPuducherry(item.latitude, item.longitude)
  ) {
    return {
      latitude: item.latitude,
      longitude: item.longitude,
      areaName: item.neighborhood || item.city || 'Puducherry',
    };
  }

  // 2. Search against locality dictionary using neighborhood, location, city, or title
  const searchCorpus = [
    item.neighborhood || '',
    item.location || '',
    item.city || '',
    item.title || '',
  ]
    .join(' ')
    .toLowerCase();

  for (const [key, loc] of Object.entries(PUDUCHERRY_LOCALITY_COORDINATES)) {
    if (searchCorpus.includes(key)) {
      // Deterministic small micro-offset (~40-80m) based on item ID so multiple pins in the same neighborhood don't stack directly
      const hash = (item.id || String(seedIndex))
        .split('')
        .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
      const angle = (hash * 47) % 360;
      const offsetMeters = 0.0006 + ((hash % 5) * 0.0003); // ~50m - 120m
      const latOffset = offsetMeters * Math.cos((angle * Math.PI) / 180);
      const lngOffset = offsetMeters * Math.sin((angle * Math.PI) / 180);

      return {
        latitude: Number((loc.latitude + latOffset).toFixed(5)),
        longitude: Number((loc.longitude + lngOffset).toFixed(5)),
        areaName: loc.canonicalName,
      };
    }
  }

  // 3. Fallback to assigned Puducherry landmark
  const landmark = KNOWN_CITY_LANDMARKS[seedIndex % KNOWN_CITY_LANDMARKS.length];
  const offsetLat = ((seedIndex % 5) - 2) * 0.001;
  const offsetLng = (((seedIndex * 3) % 5) - 2) * 0.001;

  return {
    latitude: Number((landmark.latitude + offsetLat).toFixed(5)),
    longitude: Number((landmark.longitude + offsetLng).toFixed(5)),
    areaName: landmark.name,
  };
}

/**
 * Calculate Great-Circle Distance between two coordinates in Kilometers (Haversine formula)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10; // 1 decimal place
}

/**
 * Format distance string nicely (e.g., "850 m away", "2.4 km away")
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m away`;
  }
  return `${distanceKm.toFixed(1)} km away`;
}

/**
 * Default initial location (Puducherry Center / White Town)
 */
export const DEFAULT_USER_LOCATION: GeoPoint & { name: string } = {
  latitude: 11.9338,
  longitude: 79.8359,
  name: 'White Town, Puducherry',
};
