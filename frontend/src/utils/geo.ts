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
  { id: 'chn-center', name: 'Chennai Central', city: 'Chennai', latitude: 13.0827, longitude: 80.2707 },
  { id: 'chn-tnagar', name: 'T. Nagar', city: 'Chennai', latitude: 13.0418, longitude: 80.2341 },
  { id: 'chn-velachery', name: 'Velachery / Phoenix Mall', city: 'Chennai', latitude: 12.9815, longitude: 80.2180 },
  { id: 'chn-annanagar', name: 'Anna Nagar', city: 'Chennai', latitude: 13.0850, longitude: 80.2101 },
  { id: 'chn-adyar', name: 'Adyar / Besant Nagar', city: 'Chennai', latitude: 13.0012, longitude: 80.2565 },
  { id: 'chn-omr', name: 'OMR / Thoraipakkam', city: 'Chennai', latitude: 12.9352, longitude: 80.2289 },
  { id: 'chn-guindy', name: 'Guindy', city: 'Chennai', latitude: 13.0067, longitude: 80.2025 },
  { id: 'chn-porur', name: 'Porur', city: 'Chennai', latitude: 13.0382, longitude: 80.1565 },
  { id: 'chn-tambaram', name: 'Tambaram', city: 'Chennai', latitude: 12.9249, longitude: 80.1000 },
  { id: 'blr-koramangala', name: 'Koramangala, Bangalore', city: 'Bangalore', latitude: 12.9352, longitude: 77.6245 },
  { id: 'blr-indiranagar', name: 'Indiranagar, Bangalore', city: 'Bangalore', latitude: 12.9784, longitude: 77.6408 },
  { id: 'mum-bandra', name: 'Bandra West, Mumbai', city: 'Mumbai', latitude: 19.0596, longitude: 72.8295 },
  { id: 'del-cp', name: 'Connaught Place, Delhi', city: 'Delhi NCR', latitude: 28.6315, longitude: 77.2167 },
  { id: 'hyd-hitech', name: 'HITEC City, Hyderabad', city: 'Hyderabad', latitude: 17.4435, longitude: 78.3772 },
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
 * Default initial location (Chennai Center)
 */
export const DEFAULT_USER_LOCATION: GeoPoint & { name: string } = {
  latitude: 13.0418,
  longitude: 80.2341,
  name: 'T. Nagar, Chennai',
};
