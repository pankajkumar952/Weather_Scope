import React from 'react';
import Card from './Card';
import { Droplets, Gauge, Wind, Eye, Thermometer } from 'lucide-react';
import { useWeather } from '../context/WeatherContext';

/* ── Simple Weather Icons using Lucide (clean, accessible) ── */
import { Sun, Cloud, CloudRain, CloudSnow, CloudDrizzle, CloudLightning, CloudFog } from 'lucide-react';

const getWeatherIcon = (code) => {
  const iconProps = { className: 'w-16 h-16 sm:w-20 sm:h-20' };
  const colorMap = {
    Clear: 'text-amber-400',
    Clouds: 'text-on-surface-variant',
    Rain: 'text-tertiary',
    Drizzle: 'text-tertiary',
    Thunderstorm: 'text-amber-400',
    Snow: 'text-blue-400',
    Mist: 'text-on-surface-variant/60',
    Fog: 'text-on-surface-variant/60',
    Haze: 'text-on-surface-variant/60',
  };

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

  const IconComponent = iconMap[code] || Cloud;
  const colorClass = colorMap[code] || 'text-on-surface-variant';

  return <IconComponent {...iconProps} className={`${iconProps.className} ${colorClass}`} />;
};

function WeatherDisplay({ weather }) {
  const { unit } = useWeather();

  if (!weather) {
    return null;
  }

  const { main, weather: weatherData, wind, visibility, name } = weather;
  const condition = weatherData?.[0];
  const windSpeed = unit === 'metric' ? `${main?.speed || wind?.speed || 0} m/s` : `${main?.speed || wind?.speed || 0} mph`;
  const visibilityKm = visibility ? (visibility / 1000).toFixed(1) : '--';

  const metrics = [
    { label: 'Humidity', value: `${main?.humidity}`, suffix: '%', icon: Droplets, color: 'text-tertiary' },
    { label: 'Pressure', value: `${main?.pressure}`, suffix: 'hPa', icon: Gauge, color: 'text-primary' },
    { label: 'Wind', value: `${wind?.speed || 0}`, suffix: unit === 'metric' ? 'm/s' : 'mph', icon: Wind, color: 'text-secondary' },
    { label: 'Visibility', value: visibilityKm, suffix: 'km', icon: Eye, color: 'text-on-surface-variant' },
  ];

  return (
    <div className="space-y-8">
      {/* ─── Hero Weather Card ─── */}
      <Card variant="elevated" className="p-8 sm:p-10 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          {/* Left: Location & Temperature */}
          <div className="space-y-6">
            {/* Location */}
            <div className="flex items-center gap-2 text-primary-container">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" opacity="0.7">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <span className="text-sm font-semibold uppercase tracking-wider">{name}</span>
            </div>

            {/* Temperature */}
            <div className="flex items-baseline gap-3">
              <span className="text-7xl sm:text-8xl font-extrabold tracking-tighter text-on-background leading-none">
                {Math.round(main?.temp)}°
              </span>
            </div>

            {/* Condition */}
            <div className="space-y-2">
              <p className="text-lg font-semibold capitalize text-on-background/80">
                {condition?.description}
              </p>
              <div className="flex items-center gap-4 text-sm text-on-surface-variant">
                <span className="flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 opacity-50" />
                  Feels {Math.round(main?.feels_like)}°
                </span>
                <span>H {Math.round(main?.temp_max)}° · L {Math.round(main?.temp_min)}°</span>
              </div>
            </div>
          </div>

          {/* Right: Weather Icon */}
          <div className="flex items-center justify-center md:justify-end">
            <div className="p-6 bg-surface-container rounded-2xl">
              {getWeatherIcon(condition?.main)}
            </div>
          </div>
        </div>
      </Card>

      {/* ─── Metrics Grid ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} variant="default" className="p-5 sm:p-6 card-hover">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-surface-container-high rounded-lg">
                  <Icon className={`w-5 h-5 ${metric.color} opacity-70`} />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  {metric.label}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold text-on-background tracking-tight">
                  {metric.value}
                </span>
                <span className="text-sm text-on-surface-variant font-medium">
                  {metric.suffix}
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default WeatherDisplay;