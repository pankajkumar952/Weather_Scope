
import { useState, useEffect } from 'react';

const API_KEY = import.meta.env.VITE_API_KEY
const API_URL = 'https://api.openweathermap.org/geo/1.0/direct';

if (!API_KEY) {
  console.error(
    '[useCitySuggestions] VITE_API_KEY is missing. Check that .env exists in the project root, ' +
    'the variable is named exactly VITE_API_KEY, and you restarted `npm run dev` after adding it.'
  );
}

export function useCitySuggestions(query, limit = 5) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const url = `${API_URL}?q=${encodeURIComponent(query)}&limit=${limit}&appid=${API_KEY}`;
        const response = await fetch(url, { signal });
        const data = await response.json();

        if (!response.ok) {
          // OpenWeather returns a JSON error body (e.g. invalid/inactive key)
          // instead of throwing, so we surface it explicitly here.
          console.error(
            `City suggestions API error (${response.status}):`,
            data?.message || data
          );
          setSuggestions([]);
          return;
        }

        if (Array.isArray(data)) {
          setSuggestions(
            data.map(({ name, state, country }) => ({
              name,
              state: state || '',
              country,
            }))
          );
        } else {
          console.warn('Unexpected city suggestions response shape:', data);
          setSuggestions([]);
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error fetching city suggestions:', error);
          setSuggestions([]);
        }
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);

    return () => {
      clearTimeout(debounce);
      controller.abort();
    };
  }, [query, limit]);

  return { suggestions, loading };
}
