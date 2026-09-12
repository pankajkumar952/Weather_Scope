import React, { useState, useEffect } from 'react';
import { Search, Clock, MapPin, X } from 'lucide-react';
import { useCitySuggestions } from '../api/useCitySuggestions';
import Card from './Card';

const SearchBar = ({ onSelect }) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [lastCities, setLastCities] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const { suggestions, loading } = useCitySuggestions(inputValue);

  useEffect(() => {
    const storedCities = localStorage.getItem('lastCities');
    if (storedCities) setLastCities(JSON.parse(storedCities));
  }, []);

  const getLastCities = () => {
    const cities = localStorage.getItem('lastCities');
    return cities ? JSON.parse(cities) : [];
  };

  const saveLastCity = (cityName) => {
    let cities = getLastCities();
    cities = cities.filter((c) => c.toLowerCase() !== cityName.toLowerCase());
    cities.unshift(cityName);
    if (cities.length > 5) cities = cities.slice(0, 5);
    localStorage.setItem('lastCities', JSON.stringify(cities));
    setLastCities(cities);
  };

  const removeLastCity = (cityToRemove, e) => {
    e.stopPropagation();
    const cities = getLastCities().filter(city => city !== cityToRemove);
    localStorage.setItem('lastCities', JSON.stringify(cities));
    setLastCities(cities);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (city) => {
    const cityDisplay = `${city.name}${city.state ? ', ' + city.state : ''}, ${city.country}`;
    setInputValue(cityDisplay);
    setShowSuggestions(false);
    onSelect(city.name);
    saveLastCity(city.name);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() !== '') {
      onSelect(inputValue.trim());
      saveLastCity(inputValue.trim());
      setShowSuggestions(false);
    }
  };

  const handleLastCityClick = (city) => {
    setInputValue(city);
    onSelect(city);
    setShowSuggestions(false);
  };

  const clearInput = () => {
    setInputValue('');
    setShowSuggestions(false);
  };

  return (
    <div className="space-y-3 z-50 relative">
      {/* Search Input */}
      <div className={`relative rounded-xl transition-all duration-200 ${
        isFocused 
          ? 'bg-surface-container-low ring-2 ring-primary/30' 
          : 'bg-surface-container-low'
      }`}>
        <form onSubmit={handleSubmit} className="flex items-center px-4 py-1">
          <Search className={`w-5 h-5 shrink-0 ${isFocused ? 'text-primary' : 'text-on-surface-variant/50'} transition-colors`} />
          
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => { setIsFocused(true); setShowSuggestions(true); }}
            onBlur={() => { setIsFocused(false); setTimeout(() => setShowSuggestions(false), 200); }}
            placeholder="Search for a city..."
            className="flex-1 py-3 px-3 bg-transparent text-on-background placeholder-on-surface-variant/40 focus:outline-none text-base font-medium"
            autoComplete="off"
          />
          
          {inputValue && (
            <button type="button" onClick={clearInput} className="p-2 hover:bg-surface-container-highest rounded-lg transition-colors">
              <X className="w-4 h-4 text-on-surface-variant" />
            </button>
          )}
        </form>

        {/* Suggestions Dropdown */}
        {showSuggestions && (inputValue.length > 0 || lastCities.length > 0) && (
          <div className="absolute top-full left-0 right-0 mt-2 z-50 animate-slideDown">
            <Card variant="solid" className="max-h-72 overflow-y-auto p-1.5 shadow-xl border border-outline-variant/15 custom-scrollbar">
              
              {/* Loading */}
              {loading && inputValue && (
                <div className="p-6 text-center">
                  <div className="w-5 h-5 border-2 border-primary-container/20 border-t-primary-container rounded-full animate-spin mx-auto mb-2" />
                  <span className="text-xs text-on-surface-variant">Searching...</span>
                </div>
              )}

              {/* Recent Cities */}
              {!inputValue && lastCities.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 px-3 py-2">
                    <Clock className="w-3.5 h-3.5 text-on-surface-variant/50" />
                    <span className="text-xs font-semibold text-on-surface-variant/50 uppercase tracking-wider">Recent</span>
                  </div>
                  {lastCities.map((city, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleLastCityClick(city)}
                      className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-surface-container-highest rounded-lg transition-colors group text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <MapPin className="w-4 h-4 text-on-surface-variant/30 group-hover:text-primary-container" />
                        <span className="text-sm text-on-surface group-hover:text-on-background font-medium">{city}</span>
                      </div>
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => removeLastCity(city, e)}
                        onKeyDown={(e) => { if (e.key === 'Enter') removeLastCity(city, e); }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-error/10 hover:text-error rounded transition-all cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Results */}
              {!loading && inputValue && suggestions.length > 0 && (
                <div>
                  {suggestions.map((city, index) => (
                    <button
                      key={`${city.name}-${index}`}
                      onClick={() => handleSuggestionClick(city)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-surface-container-highest rounded-lg transition-colors group text-left"
                    >
                      <MapPin className="w-4 h-4 text-primary-container/60 shrink-0" />
                      <div>
                        <div className="text-sm font-semibold text-on-surface group-hover:text-on-background">
                          {city.name}
                        </div>
                        <div className="text-xs text-on-surface-variant">
                          {city.state ? `${city.state}, ` : ''}{city.country}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* No Results */}
              {!loading && inputValue && suggestions.length === 0 && (
                <div className="p-8 text-center text-on-surface-variant">
                  <MapPin className="w-8 h-8 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium">No results found</p>
                  <p className="text-xs mt-1 opacity-60">Try a different search term</p>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>

      {/* Quick Access Chips */}
      {!isFocused && lastCities.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {lastCities.slice(0, 4).map((city, idx) => (
            <button
              key={idx}
              onClick={() => handleLastCityClick(city)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-container rounded-lg text-xs font-medium text-on-surface-variant hover:text-on-background hover:bg-surface-container-high transition-colors"
            >
              <MapPin className="w-3 h-3 opacity-40" />
              {city}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;