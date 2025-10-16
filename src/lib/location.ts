/**
 * Location service - Gets user location via GPS or IP address fallback
 */

export interface LocationData {
  city?: string;
  region?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  source: 'gps' | 'ip' | 'unknown';
}

/**
 * Try to get precise location using browser's Geolocation API (GPS)
 */
async function getGPSLocation(): Promise<LocationData | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Reverse geocode using OpenStreetMap Nominatim (free, no API key)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
            {
              headers: {
                'User-Agent': 'BeanJamBot-ChatApp',
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            const address = data.address || {};
            
            resolve({
              city: address.city || address.town || address.village || address.hamlet,
              region: address.state || address.province || address.region,
              country: address.country,
              latitude,
              longitude,
              source: 'gps',
            });
          } else {
            // GPS coords but no reverse geocoding
            resolve({
              latitude,
              longitude,
              source: 'gps',
            });
          }
        } catch (error) {
          console.warn('Reverse geocoding failed:', error);
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            source: 'gps',
          });
        }
      },
      (error) => {
        console.warn('GPS location denied or unavailable:', error.message);
        resolve(null);
      },
      {
        timeout: 10000,
        maximumAge: 300000, // Cache for 5 minutes
      }
    );
  });
}

/**
 * Fallback: Get approximate location using IP address
 */
async function getIPLocation(): Promise<LocationData | null> {
  try {
    // Using ipapi.co (free tier, no API key needed for basic info)
    const response = await fetch('https://ipapi.co/json/');
    
    if (!response.ok) {
      throw new Error('IP location service unavailable');
    }

    const data = await response.json();
    
    return {
      city: data.city,
      region: data.region,
      country: data.country_name,
      latitude: data.latitude,
      longitude: data.longitude,
      source: 'ip',
    };
  } catch (error) {
    console.warn('IP location lookup failed:', error);
    return null;
  }
}

/**
 * Get user location - tries GPS first, falls back to IP
 */
export async function getUserLocation(): Promise<LocationData> {
  // Try GPS first
  const gpsLocation = await getGPSLocation();
  if (gpsLocation) {
    return gpsLocation;
  }

  // Fallback to IP
  const ipLocation = await getIPLocation();
  if (ipLocation) {
    return ipLocation;
  }

  // If all fails
  return {
    source: 'unknown',
  };
}


export function formatLocation(location: LocationData): string {
  const parts: string[] = [];
  
  if (location.city) parts.push(location.city);
  if (location.region) parts.push(location.region);
  if (location.country) parts.push(location.country);
  
  if (parts.length > 0) {
    return parts.join(', ');
  }
  
  if (location.latitude && location.longitude) {
    return `${location.latitude.toFixed(2)}°, ${location.longitude.toFixed(2)}°`;
  }
  
  return 'Unknown location';
}
