import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCurrentWeather, getForecast } from '../api/weatherApi';
import { toast } from 'react-toastify';

const WeatherContext = createContext();

export function WeatherProvider({ children }) {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState('metric');
  const [city, setCity] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const fetchWeatherByCity = useCallback(async (cityName, forceFetch = false) => {
    if (!cityName) return;

    const storageKey = `${cityName}_${unit}`;
    const cachedData = !forceFetch ? JSON.parse(localStorage.getItem(storageKey)) : null;

    if (cachedData) {
      setWeather(cachedData.weather);
      setForecast(cachedData.forecast);
      setCity(cityName);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [weatherData, forecastData] = await Promise.all([
        getCurrentWeather(cityName, unit),
        getForecast(cityName, unit),
      ]);
      setWeather(weatherData);
      setForecast(forecastData);
      setCity(cityName);
      localStorage.setItem('lastCity', cityName);
      localStorage.setItem(storageKey, JSON.stringify({ weather: weatherData, forecast: forecastData }));
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch weather data';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [unit]);

  useEffect(() => {
    if (city) fetchWeatherByCity(city, true); // Force refetch when unit or city changes
  }, [unit, city, fetchWeatherByCity]);

  const toggleUnit = () => {
    setUnit((prev) => (prev === 'metric' ? 'imperial' : 'metric'));
  };

  /**
   * Reset back to the landing page state (used when the user clicks
   * the brand/logo in the navbar) without touching cached data or
   * the persisted last-searched city.
   */
  const resetWeather = () => {
    setWeather(null);
    setForecast(null);
    setCity(null);
    setError(null);
  };

  return (
    <WeatherContext.Provider
      value={{ weather, forecast, loading, error, unit, theme, fetchWeatherByCity, toggleUnit, toggleTheme, resetWeather }}
    >
      {children}
    </WeatherContext.Provider>
  );
}

export const useWeather = () => useContext(WeatherContext);
