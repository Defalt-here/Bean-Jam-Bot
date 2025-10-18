/**
 * Weather service - Fetches weather data using WeatherAPI.com
 */

import type { LocationData } from './location';

export interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
    localtime: string;
  };
  current: {
    temp_c: number;
    temp_f: number;
    condition: {
      text: string;
      icon: string;
    };
    wind_kph: number;
    wind_mph: number;
    humidity: number;
    feelslike_c: number;
    feelslike_f: number;
    uv: number;
  };
  forecast?: {
    forecastday: Array<{
      date: string;
      day: {
        maxtemp_c: number;
        maxtemp_f: number;
        mintemp_c: number;
        mintemp_f: number;
        avgtemp_c: number;
        avgtemp_f: number;
        condition: {
          text: string;
          icon: string;
        };
        daily_chance_of_rain: number;
        daily_chance_of_snow: number;
        avghumidity: number;
        maxwind_kph: number;
      };
    }>;
  };
}

export interface WeatherRequestPayload {
  q: string; // location query (lat,lon or city name)
  days?: number; // number of days (1-10)
  aqi?: 'yes' | 'no'; // air quality data
  alerts?: 'yes' | 'no'; // weather alerts
}

/**
 * Format location data as REST API payload for weather service
 */
export function formatWeatherPayload(location: LocationData, days: number = 1): WeatherRequestPayload {
  // Prefer lat,lon for accuracy (WeatherAPI.com accepts coordinates)
  let query: string;
  
  if (location.latitude && location.longitude) {
    query = `${location.latitude},${location.longitude}`;
    console.log('📍 Using GPS coordinates for weather:', query);
  } else if (location.city) {
    query = location.city;
    console.log('📍 Using city name for weather:', query);
  } else {
    query = 'London'; // Ultimate fallback
    console.warn('⚠️ No location data available, using default: London');
  }

  return {
    q: query,
    days: Math.min(Math.max(days, 1), 10), // clamp between 1-10
    aqi: 'no',
    alerts: 'yes',
  };
}

/**
 * Fetch weather data from WeatherAPI.com
 */
export async function getWeather(location: LocationData, days: number = 1): Promise<WeatherData> {
  const proxyUrl = (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_WEATHER_PROXY_URL;
  const apiKey = import.meta.env.VITE_WEATHER_API_KEY || '';

  const payload = formatWeatherPayload(location, days);
  
  // Build query string
  const params = new URLSearchParams({
    key: apiKey,
    q: payload.q,
    days: payload.days.toString(),
    aqi: payload.aqi,
    alerts: payload.alerts,
  });

  try {
    let response: Response;
    if (proxyUrl) {
      // Call our proxy (API Gateway + Lambda) so the API key stays server-side
      const body = { q: payload.q, days: payload.days };
      response = await fetch(proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } else {
      if (!apiKey) {
        throw new Error('Weather API key is not configured. Please add VITE_WEATHER_API_KEY to your .env file.');
      }
      response = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?${params.toString()}`
      );
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || `Weather API error: ${response.status} ${response.statusText}`
      );
    }

    const data: WeatherData = await response.json();
    return data;
  } catch (error) {
    console.error('Weather API Error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch weather data');
  }
}

/**
 * Format weather data into a natural language summary
 */
export function formatWeatherSummary(weather: WeatherData, language: 'en' | 'jp' = 'en'): string {
  const { location, current, forecast } = weather;
  
  if (language === 'jp') {
    let summary = `📍 ${location.name}, ${location.region}, ${location.country}\n`;
    summary += `🌡️ 現在の気温: ${current.temp_c}°C (体感 ${current.feelslike_c}°C)\n`;
    summary += `☁️ 天気: ${current.condition.text}\n`;
    summary += `💨 風速: ${current.wind_kph} km/h\n`;
    summary += `💧 湿度: ${current.humidity}%\n`;
    
    if (forecast && forecast.forecastday.length > 0) {
      summary += `\n📅 予報:\n`;
      forecast.forecastday.forEach((day) => {
        summary += `${day.date}: ${day.day.condition.text}, `;
        summary += `最高 ${day.day.maxtemp_c}°C / 最低 ${day.day.mintemp_c}°C`;
        if (day.day.daily_chance_of_rain > 0) {
          summary += ` (降水確率 ${day.day.daily_chance_of_rain}%)`;
        }
        summary += `\n`;
      });
    }
    
    return summary;
  }
  
  // English format
  let summary = `📍 ${location.name}, ${location.region}, ${location.country}\n`;
  summary += `🌡️ Current: ${current.temp_c}°C (feels like ${current.feelslike_c}°C)\n`;
  summary += `☁️ Conditions: ${current.condition.text}\n`;
  summary += `💨 Wind: ${current.wind_kph} km/h\n`;
  summary += `💧 Humidity: ${current.humidity}%\n`;
  
  if (forecast && forecast.forecastday.length > 0) {
    summary += `\n📅 Forecast:\n`;
    forecast.forecastday.forEach((day) => {
      summary += `${day.date}: ${day.day.condition.text}, `;
      summary += `High ${day.day.maxtemp_c}°C / Low ${day.day.mintemp_c}°C`;
      if (day.day.daily_chance_of_rain > 0) {
        summary += ` (${day.day.daily_chance_of_rain}% chance of rain)`;
      }
      summary += `\n`;
    });
  }
  
  return summary;
}

/**
 * Parse a relative date string (today, tomorrow, day after tomorrow, etc.)
 * Returns number of days from today (0 = today, 1 = tomorrow, etc.)
 */
export function parseDateFromMessage(message: string, language: 'en' | 'jp' = 'en'): number {
  const lowerMessage = message.toLowerCase();
  
  if (language === 'jp') {
    if (lowerMessage.includes('今日') || lowerMessage.includes('きょう')) return 0;
    if (lowerMessage.includes('明日') || lowerMessage.includes('あした')) return 1;
    if (lowerMessage.includes('明後日') || lowerMessage.includes('あさって')) return 2;
  } else {
    if (lowerMessage.includes('today')) return 0;
    if (lowerMessage.includes('tomorrow')) return 1;
    if (lowerMessage.includes('day after tomorrow')) return 2;
  }
  
  // Default to today
  return 0;
}

/**
 * Extract weather card data from WeatherData response
 * For a specific day (0 = today/current, 1+ = forecast days)
 */
export interface WeatherCardData {
  location: string;
  temperature: number;
  feelsLike: number;
  condition: string;
  precipitation: number;
  humidity: number;
  windSpeed: number;
  icon?: string;
}

export function extractWeatherCardData(weather: WeatherData, dayIndex: number = 0): WeatherCardData {
  const { location, current, forecast } = weather;
  
  // Format location string
  const locationStr = location.region 
    ? `${location.name}, ${location.region}` 
    : `${location.name}, ${location.country}`;
  
  // If requesting current weather (today, dayIndex 0)
  if (dayIndex === 0) {
    return {
      location: locationStr,
      temperature: current.temp_c,
      feelsLike: current.feelslike_c,
      condition: current.condition.text,
      precipitation: 0, // Current weather doesn't have precipitation percentage
      humidity: current.humidity,
      windSpeed: current.wind_kph,
      icon: current.condition.icon,
    };
  }
  
  // For forecast days
  if (forecast && forecast.forecastday[dayIndex]) {
    const forecastDay = forecast.forecastday[dayIndex];
    return {
      location: locationStr,
      temperature: forecastDay.day.avgtemp_c,
      feelsLike: forecastDay.day.avgtemp_c, // Forecast doesn't have feels like, use avg
      condition: forecastDay.day.condition.text,
      precipitation: forecastDay.day.daily_chance_of_rain || forecastDay.day.daily_chance_of_snow || 0,
      humidity: forecastDay.day.avghumidity,
      windSpeed: forecastDay.day.maxwind_kph,
      icon: forecastDay.day.condition.icon,
    };
  }
  
  // Fallback to current if forecast not available
  return {
    location: locationStr,
    temperature: current.temp_c,
    feelsLike: current.feelslike_c,
    condition: current.condition.text,
    precipitation: 0,
    humidity: current.humidity,
    windSpeed: current.wind_kph,
    icon: current.condition.icon,
  };
}
