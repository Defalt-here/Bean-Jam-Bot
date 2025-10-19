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

    // Check if we're on a secure context (HTTPS or localhost)
    if (!window.isSecureContext) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Use OpenStreetMap Nominatim for reverse geocoding
          const osmResponse = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
            {
              headers: {
                'User-Agent': 'BeanJamBot-ChatApp',
              },
            }
          );

          if (osmResponse.ok) {
            const osmData = await osmResponse.json();
            const address = osmData.address || {};
            
            const city = address.city || address.town || address.village || address.hamlet || 
                        address.municipality || address.county;
            const region = address.state || address.province || address.region;
            const country = address.country;
            
            if (city) {
              resolve({
                city,
                region,
                country,
                latitude,
                longitude,
                source: 'gps',
              });
              return;
            }
          }
          
          // If no city found but we have coords, return with coords only
          resolve({
            latitude,
            longitude,
            source: 'gps',
          });
          
        } catch (error) {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            source: 'gps',
          });
        }
      },
      () => {
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
    const response = await fetch('https://ipapi.co/json/');
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.city) {
        return {
          city: data.city,
          region: data.region,
          country: data.country_name,
          latitude: data.latitude,
          longitude: data.longitude,
          source: 'ip',
        };
      }
    }
  } catch (error) {
    // Silent fail
  }
  
  return null;
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
