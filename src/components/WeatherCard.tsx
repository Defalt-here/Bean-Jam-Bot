import { Card } from '@/components/ui/card';

export interface WeatherCardProps {
  location: string;
  temperature: number;
  feelsLike: number;
  condition: string;
  precipitation: number;
  humidity: number;
  windSpeed: number;
  icon?: string; // Placeholder for future icon implementation
}

export function WeatherCard({
  location,
  temperature,
  feelsLike,
  condition,
  precipitation,
  humidity,
  windSpeed,
  icon,
}: WeatherCardProps) {
  return (
    <Card className="w-full max-w-md p-6 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-4">
      {/* Location Header */}
      <div className="mb-4">
        <h3 className="text-2xl font-bold font-mono uppercase tracking-tight">
          {location}
        </h3>
      </div>

      {/* Main Weather Display */}
      <div className="flex items-start justify-between mb-6">
        {/* Temperature Section */}
        <div className="flex-1">
          <div className="flex items-baseline">
            <span className="text-6xl font-bold font-mono">
              {Math.round(temperature)}°
            </span>
            <span className="text-2xl font-mono ml-2 text-gray-600">C</span>
          </div>
          <div className="mt-2 text-sm font-mono text-gray-600">
            FEELS LIKE {Math.round(feelsLike)}°C
          </div>
        </div>

        {/* Icon Placeholder */}
        <div className="w-24 h-24 border-4 border-black bg-gray-100 flex items-center justify-center">
          {icon ? (
            <img src={icon} alt={condition} className="w-full h-full object-cover" />
          ) : (
            <span className="text-4xl">☀️</span>
          )}
        </div>
      </div>

      {/* Condition */}
      <div className="mb-4">
        <div className="text-xl font-bold font-mono uppercase tracking-wide">
          {condition}
        </div>
      </div>

      {/* Weather Stats Grid */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t-4 border-black">
        {/* Precipitation */}
        <div>
          <div className="text-xs font-mono text-gray-600 uppercase mb-1">
            PRECIP
          </div>
          <div className="text-2xl font-bold font-mono">
            {precipitation}%
          </div>
        </div>

        {/* Humidity */}
        <div>
          <div className="text-xs font-mono text-gray-600 uppercase mb-1">
            HUMIDITY
          </div>
          <div className="text-2xl font-bold font-mono">
            {humidity}%
          </div>
        </div>

        {/* Wind Speed */}
        <div>
          <div className="text-xs font-mono text-gray-600 uppercase mb-1">
            WIND
          </div>
          <div className="text-2xl font-bold font-mono">
            {Math.round(windSpeed)}
          </div>
          <div className="text-xs font-mono text-gray-600">
            km/h
          </div>
        </div>
      </div>
    </Card>
  );
}
