import React, { useEffect, useCallback, useState, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useWeather } from './context/WeatherContext';
import SearchBar from './components/SearchBar';
import WeatherDisplay from './components/WeatherDisplay';
import ForecastDisplay from './components/ForecastDisplay';
import WeatherAISummary, { WeatherAssistantButton } from './components/WeatherAISummary';

import {
  Cloud,
  Moon,
  Sun,
  Sparkles,
  Brain,
  ShieldCheck,
  Plane,
  Heart,
  ArrowDown,
  CloudSun,
  Menu,
  X,
} from 'lucide-react';

/* ═══════════════════════════════════════════
   FEATURE CARDS
   ═══════════════════════════════════════════ */
const AI_FEATURES = [
  {
    icon: Brain,
    title: 'Smart Summaries',
    desc: 'Get AI-generated natural language weather briefings instead of raw data.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: ShieldCheck,
    title: 'Safety Alerts',
    desc: 'Instant risk analysis for extreme temps, storms, flooding, and visibility.',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
  {
    icon: Plane,
    title: 'Travel Advisory',
    desc: 'Driving conditions, best travel windows, and packing recommendations.',
    color: 'text-teal-500',
    bg: 'bg-teal-500/10',
  },
  {
    icon: Heart,
    title: 'Health Insights',
    desc: 'Heat/cold stress, exercise guidance, hydration needs, and allergy alerts.',
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
  },
];

function AppContent() {
  const {
    weather,
    forecast,
    loading,
    error,
    unit,
    theme,
    fetchWeatherByCity,
    toggleTheme,
    toggleUnit,
    resetWeather,
  } = useWeather();

  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchRef = useRef(null);

  const handleCitySelect = useCallback(
    (city) => {
      fetchWeatherByCity(city);
      toast.success(`Weather updated: ${city}`, { icon: '✓' });
    },
    [fetchWeatherByCity]
  );

  useEffect(() => {
    const lastCity = localStorage.getItem('lastCity');
    if (lastCity) fetchWeatherByCity(lastCity);
  }, [fetchWeatherByCity]);

  useEffect(() => {
    if (error) toast.error(`Failed to load weather data: ${error}`);
  }, [error]);

  const scrollToSearch = () => {
    searchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    searchRef.current?.querySelector('input')?.focus();
  };

  const goHome = () => {
    resetWeather();
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasWeatherData = weather && !loading && !error;

  return (
    <div className={`min-h-screen bg-background transition-colors duration-300 ${theme}`}>

      {/* ═══════ NAV ═══════ */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-background/85 border-b border-outline-variant/20">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-16 xl:px-24">
          <div className="flex items-center justify-between h-16">

            {/* Brand */}
            <button
              onClick={goHome}
              className="flex items-center gap-3 group"
              aria-label="Go to home"
            >
              <div className="flex items-center justify-center w-9 h-9 bg-primary rounded-xl transition-transform group-hover:scale-105 shadow-md shadow-primary/30">
                <CloudSun className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-on-background leading-none">
                  Weather<span className="text-primary">Scope</span>
                </h1>
                <p className="text-[10px] text-on-surface-variant/60 font-medium leading-none mt-0.5">AI Weather Intelligence</p>
              </div>
            </button>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={scrollToSearch}
                className="px-4 py-2 rounded-xl text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                Search
              </button>

              <div className="w-px h-6 bg-outline-variant/30 mx-1" />

              <button
                onClick={toggleUnit}
                className="px-3 py-2 bg-surface-container hover:bg-surface-container-high rounded-xl text-sm font-semibold text-primary hover:text-primary transition-colors"
              >
                {unit === 'metric' ? '°C' : '°F'}
              </button>

              <button
                onClick={toggleTheme}
                className="p-2 bg-surface-container hover:bg-surface-container-high rounded-xl text-on-surface-variant hover:text-on-surface transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 bg-surface-container rounded-xl text-on-surface-variant"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-1 animate-fadeIn">
              <button
                onClick={() => { scrollToSearch(); setMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                Search a city
              </button>
              <div className="flex gap-2 pt-2">
                <button onClick={toggleUnit} className="flex-1 py-2.5 bg-surface-container rounded-xl text-sm font-semibold text-primary">
                  {unit === 'metric' ? '°C · m/s' : '°F · mph'}
                </button>
                <button onClick={toggleTheme} className="px-4 py-2.5 bg-surface-container rounded-xl text-on-surface-variant">
                  {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="px-5 sm:px-8 lg:px-16 xl:px-24 py-6 lg:py-10">
        <div className="max-w-[1400px] mx-auto space-y-10 lg:space-y-14">

          {/* ═══════ HERO ═══════ */}
          {!hasWeatherData && !loading && (
            <section className="relative py-12 lg:py-20 animate-fadeIn">
              {/* Emerald background glow */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                <div className="w-[700px] h-[400px] bg-primary/8 rounded-full blur-[140px]" />
              </div>

              <div className="relative max-w-3xl mx-auto text-center space-y-6">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/25 rounded-full text-sm font-medium text-primary">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI-Powered Weather Intelligence
                </div>

                {/* Headline */}
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-on-background tracking-tight leading-[1.1]">
                  Weather Intelligence,{' '}
                  <span className="text-primary">
                    Powered by AI
                  </span>
                </h2>

                <p className="text-lg sm:text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
                  Don't just check the weather — <strong className="text-on-background">understand it</strong>.
                  AI summaries, safety alerts, travel advisories, and health insights for any city worldwide.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                  <button
                    onClick={scrollToSearch}
                    className="flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-2xl font-semibold text-base transition-all hover:shadow-xl hover:shadow-primary/30 hover:translate-y-[-2px]"
                  >
                    <Sparkles className="w-5 h-5" />
                    Search a city
                  </button>
                </div>
              </div>

              <div className="flex justify-center pt-12">
                <button onClick={scrollToSearch} className="animate-bounce text-on-surface-variant/30 hover:text-on-surface-variant/60 transition-colors">
                  <ArrowDown className="w-5 h-5" />
                </button>
              </div>
            </section>
          )}

          {/* ═══════ SEARCH ═══════ */}
          <section ref={searchRef}>
            <div className="flex flex-col lg:flex-row gap-4 items-stretch">
              <div className="flex-1">
                <SearchBar onSelect={handleCitySelect} />
              </div>
              {hasWeatherData && (
                <div className="flex items-center">
                  <WeatherAssistantButton onClick={() => setIsAIModalOpen(true)} />
                </div>
              )}
            </div>
          </section>

          {/* ═══════ FEATURE CARDS ═══════ */}
          {!hasWeatherData && !loading && (
            <section className="animate-fadeIn">
              <div className="text-center mb-8">
                <h3 className="text-sm font-semibold text-on-surface-variant/60 uppercase tracking-wider">What WeatherScope AI can do</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {AI_FEATURES.map((feature) => (
                  <div
                    key={feature.title}
                    className="group p-6 bg-surface-container/60 hover:bg-surface-container border border-outline-variant/20 hover:border-primary/20 rounded-2xl transition-all hover:translate-y-[-3px] hover:shadow-lg hover:shadow-primary/10"
                  >
                    <div className={`inline-flex p-3 ${feature.bg} rounded-xl mb-4`}>
                      <feature.icon className={`w-5 h-5 ${feature.color}`} />
                    </div>
                    <h4 className="font-semibold text-on-background mb-1.5">{feature.title}</h4>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ═══════ WEATHER DATA ═══════ */}
          <main className="min-h-[200px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-6 animate-fadeIn">
                <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                <div className="text-center space-y-1">
                  <p className="text-lg font-semibold text-on-background">Analyzing weather data</p>
                  <p className="text-sm text-on-surface-variant">Fetching conditions & preparing AI…</p>
                </div>
              </div>
            ) : hasWeatherData ? (
              <div className="space-y-12 lg:space-y-16 animate-fadeIn">
                <WeatherDisplay weather={weather} />
                <ForecastDisplay forecast={forecast} />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="p-5 bg-error/10 rounded-2xl mb-6">
                  <Cloud className="w-10 h-10 text-error opacity-50" />
                </div>
                <h3 className="text-lg font-semibold text-on-background">Connection Error</h3>
                <p className="text-sm text-on-surface-variant mt-1.5">Unable to load weather data. Please try again.</p>
              </div>
            ) : null}
          </main>

          {/* ═══════ FOOTER ═══════ */}
          <footer className="pt-8 pb-4 border-t border-outline-variant/20">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-center sm:text-left">
              <span className="text-xs text-on-surface-variant/60">
                © {new Date().getFullYear()}{' '}
                <span className="text-primary font-semibold">WeatherScope</span> · Built by Pankaj Kumar
              </span>
              <p className="text-xs text-on-surface-variant/40">
                Powered by OpenWeather + GPT-OSS-120B via OpenRouter
              </p>
            </div>
          </footer>
        </div>
      </div>

      {/* ═══════ WATERMARK ═══════ */}
      <div className="pk-watermark">
        Pankaj Kumar
      </div>

      {/* ═══════ AI MODAL ═══════ */}
      <WeatherAISummary isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeOnClick
        theme={theme}
        toastClassName={() => "bg-surface-container-high text-on-surface rounded-2xl border border-outline-variant/20 shadow-lg shadow-primary/10 mb-3 mr-3"}
        bodyClassName={() => "flex text-sm font-medium p-4"}
      />
    </div>
  );
}

export default AppContent;
