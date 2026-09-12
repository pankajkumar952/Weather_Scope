import React from 'react';
import Card from './Card';
import { Sun, Cloud, CloudRain, CloudSnow, CloudDrizzle, CloudLightning, CloudFog, Droplets } from 'lucide-react';

const getWeatherIcon = (code) => {
  const iconMap = {
    Clear: Sun,
    Clouds: Cloud,
    Rain: CloudRain,
    Drizzle: CloudDrizzle,
    Thunderstorm: CloudLightning,
    Snow: CloudSnow,
    Mist: CloudFog,
    Fog: CloudFog,
    Haze: CloudFog,
  };
  const colorMap = {
    Clear: 'text-amber-400',
    Clouds: 'text-on-surface-variant',
    Rain: 'text-tertiary',
    Drizzle: 'text-tertiary',
    Thunderstorm: 'text-amber-400',
    Snow: 'text-blue-400',
  };
  const IconComponent = iconMap[code] || Cloud;
  const colorClass = colorMap[code] || 'text-on-surface-variant';
  return <IconComponent className={`w-10 h-10 ${colorClass}`} />;
};

const getDailyForecasts = (list) => {
  const daily = {};
  list.forEach((item) => {
    const date = new Date(item.dt * 1000).toLocaleDateString('en-US');
    const hour = new Date(item.dt * 1000).getHours();
    if (!daily[date] || (hour >= 11 && hour <= 13)) {
      daily[date] = item;
    }
  });
  return Object.values(daily).slice(0, 5);
};

function ForecastDisplay({ forecast }) {
  if (!forecast?.list) return null;

  const dailyForecasts = getDailyForecasts(forecast.list);

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <h2 className="text-lg font-bold text-on-background">5-Day Forecast</h2>

      {/* Forecast Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {dailyForecasts.map((item, index) => {
          const date = new Date(item.dt * 1000);
          const isToday = index === 0;
          const rain = item.pop > 0.05;

          return (
            <Card
              key={index}
              variant="default"
              className={`p-5 text-center card-hover ${
                isToday ? 'ring-1 ring-primary-container/30' : ''
              }`}
            >
              {/* Day */}
              <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-4">
                {isToday ? (
                  <span className="text-primary-container">Today</span>
                ) : (
                  date.toLocaleDateString('en-US', { weekday: 'short' })
                )}
              </p>

              {/* Icon */}
              <div className="flex justify-center mb-4">
                {getWeatherIcon(item.weather[0].main)}
              </div>

              {/* Temperature */}
              <div className="space-y-1 mb-3">
                <p className="text-2xl font-bold text-on-background">
                  {Math.round(item.main.temp)}°
                </p>
                <div className="flex justify-center gap-2 text-xs text-on-surface-variant">
                  <span>{Math.round(item.main.temp_max)}°</span>
                  <span className="opacity-50">{Math.round(item.main.temp_min)}°</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs capitalize text-on-surface-variant leading-snug mb-2">
                {item.weather[0].description}
              </p>

              {/* Rain probability */}
              {rain && (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-tertiary/10 rounded-full text-xs font-medium text-tertiary">
                  <Droplets className="w-3 h-3" />
                  {Math.round(item.pop * 100)}%
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default ForecastDisplay;