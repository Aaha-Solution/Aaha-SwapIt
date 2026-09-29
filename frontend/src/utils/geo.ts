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
];

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
