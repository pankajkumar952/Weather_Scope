import axios from 'axios';

const API_KEY =import.meta.env.VITE_API_KEY
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_API_URL = 'https://api.openweathermap.org/data/2.5/forecast';

export const getCurrentWeather = async (city, unit = 'metric') => {
  try {
    const response = await axios.get(WEATHER_API_URL, {
      params: {
        q: city,
        appid: API_KEY,
        units: unit,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching current weather:', error.message);
    throw error;
  }
};

export const getForecast = async (city, unit = 'metric') => {
  try {
    const response = await axios.get(FORECAST_API_URL, {
      params: {
        q: city,
        appid: API_KEY,
        units: unit,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching forecast:', error.message);
    throw error;
  }
};