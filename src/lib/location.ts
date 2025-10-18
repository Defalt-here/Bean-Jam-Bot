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
      console.warn('Geolocation API not available in this browser');
      resolve(null);
      return;
    }

    // Check if we're on a secure context (HTTPS or localhost)
    if (!window.isSecureContext) {
      console.warn('Geolocation requires HTTPS or localhost. Current context is not secure.');
      resolve(null);
      return;
    }

    console.log('Requesting GPS location permission...');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log('GPS location granted:', { latitude, longitude });
        
        try {
          // Try multiple reverse geocoding services for better accuracy
          
          // Method 1: Try OpenStreetMap Nominatim (primary - more accurate for most locations)
          try {
            console.log('Attempting reverse geocoding with OpenStreetMap...');
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
              console.log('OpenStreetMap response:', osmData);
              const address = osmData.address || {};
              
              const city = address.city || address.town || address.village || address.hamlet || 
                          address.municipality || address.county;
              const region = address.state || address.province || address.region;
              const country = address.country;
              
              if (city) {
                console.log('✅ City found via OpenStreetMap:', city);
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
          } catch (error) {
            console.warn('OpenStreetMap geocoding failed:', error);
          }
          
          // Method 2: Try BigDataCloud as fallback
          try {
            console.log('Attempting reverse geocoding with BigDataCloud...');
            const bdcResponse = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            
            if (bdcResponse.ok) {
              const bdcData = await bdcResponse.json();
              console.log('BigDataCloud response:', bdcData);
              
              const city = bdcData.city || bdcData.locality || bdcData.principalSubdivision;
              const region = bdcData.principalSubdivision || bdcData.principalSubdivisionCode;
              const country = bdcData.countryName;
              
              if (city) {
                console.log('✅ City found via BigDataCloud:', city);
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
          } catch (error) {
            console.warn('BigDataCloud geocoding failed:', error);
          }
          
          // If no city found but we have coords, return with coords only
          console.warn('⚠️ Could not determine city name from coordinates');
          resolve({
            latitude,
            longitude,
            source: 'gps',
          });
          
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            source: 'gps',
          });
        }
      },
      (error) => {
        console.warn('GPS location denied or unavailable:', error.message, error.code);
        if (error.code === 1) {
          console.log('User denied location permission');
        } else if (error.code === 2) {
          console.log('Location unavailable (GPS disabled or no signal)');
        } else if (error.code === 3) {
          console.log('Location request timed out');
        }
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
  // Try multiple IP geolocation services for reliability
  
  // Method 1: Try ipapi.co (accurate, free tier)
  try {
    console.log('Attempting IP location with ipapi.co...');
    const response = await fetch('https://ipapi.co/json/');
    
    if (response.ok) {
      const data = await response.json();
      console.log('ipapi.co response:', data);
      
      if (data.city) {
        console.log('✅ City found via ipapi.co:', data.city);
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
    console.warn('ipapi.co failed:', error);
  }
  
  // Method 2: Try ip-api.com as fallback (free, unlimited for non-commercial)
  try {
    console.log('Attempting IP location with ip-api.com...');
    const response = await fetch('http://ip-api.com/json/');
    
    if (response.ok) {
      const data = await response.json();
      console.log('ip-api.com response:', data);
      
      if (data.status === 'success' && data.city) {
        console.log('✅ City found via ip-api.com:', data.city);
        return {
          city: data.city,
          region: data.regionName,
          country: data.country,
          latitude: data.lat,
          longitude: data.lon,
          source: 'ip',
        };
      }
    }
  } catch (error) {
    console.warn('ip-api.com failed:', error);
  }
  
  console.warn('⚠️ All IP location services failed');
  return null;
}

/**
 * Get user location - tries GPS first, falls back to IP
 */
export async function getUserLocation(): Promise<LocationData> {
  console.log('🌍 Starting location detection...');
  
  // Try GPS first
  console.log('Attempting GPS location...');
  const gpsLocation = await getGPSLocation();
  if (gpsLocation) {
    console.log('✅ GPS location acquired:', gpsLocation);
    return gpsLocation;
  }

  // Fallback to IP
  console.log('GPS unavailable, falling back to IP location...');
  const ipLocation = await getIPLocation();
  if (ipLocation) {
    console.log('✅ IP location acquired:', ipLocation);
    return ipLocation;
  }

  // If all fails
  console.warn('⚠️ Could not determine location');
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
