import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useWeather } from '../context/WeatherContext';
import { streamWeatherSummary } from '../api/aiSummary';
import Card from './Card';
import {
  X,
  Umbrella,
  Shirt,
  Car,
  Coffee,
  Sparkles,
  Calendar,
  Clock,
  ArrowLeft,
  RefreshCw,
  Bot,
  ShieldAlert,
  Plane,
  Heart,
  Send,
  MessageSquare,
  Loader2,
  Zap,
} from 'lucide-react';

const WeatherAISummary = ({ isOpen, onClose }) => {
  const { weather, forecast } = useWeather();
  const [streamedText, setStreamedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [selectedItem, setSelectedItem] = useState(null);
  const [error, setError] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const resultRef = useRef(null);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll as tokens stream in
  useEffect(() => {
    if (resultRef.current) {
      resultRef.current.scrollTop = resultRef.current.scrollHeight;
    }
  }, [streamedText]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, streamedText]);

  // Focus input when switching to chat
  useEffect(() => {
    if (activeSection === 'chat' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeSection]);

  const analysisCards = [
    {
      id: 'today', label: "Today's Summary", desc: 'Current conditions & advice',
      icon: <Clock className="w-5 h-5" />, color: 'text-primary', bg: 'bg-primary/10 group-hover:bg-primary/20',
    },
    {
      id: 'forecast', label: '5-Day Forecast', desc: 'Trends & outlook',
      icon: <Calendar className="w-5 h-5" />, color: 'text-tertiary', bg: 'bg-tertiary/10 group-hover:bg-tertiary/20',
    },
    {
      id: 'alerts', label: 'Weather Alerts', desc: 'Hazards & safety checks',
      icon: <ShieldAlert className="w-5 h-5" />, color: 'text-amber-500', bg: 'bg-amber-500/10 group-hover:bg-amber-500/20',
    },
    {
      id: 'travel', label: 'Travel Advisory', desc: 'Commute & travel conditions',
      icon: <Plane className="w-5 h-5" />, color: 'text-blue-500', bg: 'bg-blue-500/10 group-hover:bg-blue-500/20',
    },
    {
      id: 'health', label: 'Health & Wellness', desc: 'Activity & comfort guidance',
      icon: <Heart className="w-5 h-5" />, color: 'text-rose-500', bg: 'bg-rose-500/10 group-hover:bg-rose-500/20',
    },
  ];

  const quickQuestions = [
    { id: 'rain', text: "Should I carry an umbrella today?", icon: <Umbrella className="w-4 h-4" /> },
    { id: 'clothing', text: "What should I wear today?", icon: <Shirt className="w-4 h-4" /> },
    { id: 'outdoor', text: "Is it good for outdoor activities?", icon: <Coffee className="w-4 h-4" /> },
    { id: 'driving', text: "How are driving conditions?", icon: <Car className="w-4 h-4" /> },
  ];

  /**
   * Run a streaming analysis and display tokens in real-time.
   */
  const handleAnalysis = async (type, questionText = '') => {
    if (!weather || !forecast) return;
    setSelectedItem({ type, question: questionText });
    setStreamedText('');
    setError(null);
    setLoading(true);
    setActiveSection('result');

    try {
      await streamWeatherSummary(
        weather, forecast, type, questionText,
        (_token, fullText) => setStreamedText(fullText)
      );
    } catch (err) {
      console.error('AI stream error:', err);
      setError(err.message || 'Failed to generate response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Chat mode: send a message and stream the reply.
   */
  const handleChatSend = async () => {
    const msg = chatInput.trim();
    if (!msg || loading || !weather) return;

    const userMsg = { role: 'user', text: msg };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');
    setError(null);
    setLoading(true);

    // Add a placeholder for the assistant's reply
    const assistantMsg = { role: 'assistant', text: '' };
    setChatHistory(prev => [...prev, assistantMsg]);

    try {
      await streamWeatherSummary(
        weather, forecast, 'chat', msg,
        (_token, fullText) => {
          setChatHistory(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: 'assistant', text: fullText };
            return updated;
          });
        }
      );
    } catch (err) {
      console.error('Chat error:', err);
      setChatHistory(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'assistant', text: '⚠️ ' + (err.message || 'Something went wrong. Please try again.') };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (selectedItem?.type === 'question') {
      handleAnalysis('question', selectedItem.question);
    } else if (selectedItem?.type) {
      handleAnalysis(selectedItem.type);
    }
  };

  const resetToHome = () => {
    setActiveSection('home');
    setSelectedItem(null);
    setStreamedText('');
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-background/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface-container-low rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden animate-slideUp flex flex-col border border-outline-variant/15">
        
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-outline-variant/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-container rounded-lg">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-on-background">SkyCast AI</h2>
              <p className="text-xs text-on-surface-variant flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                {weather?.name ? `Live data · ${weather.name}` : 'Weather intelligence'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Nav Tabs */}
            {activeSection !== 'result' && (
              <>
                <button
                  onClick={() => setActiveSection('home')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeSection === 'home' ? 'bg-primary-container text-white' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
                >
                  Analysis
                </button>
                <button
                  onClick={() => setActiveSection('chat')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${activeSection === 'chat' ? 'bg-primary-container text-white' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Chat
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-surface-container-high rounded-lg transition-colors ml-2"
              aria-label="Close AI Assistant"
            >
              <X className="w-5 h-5 text-on-surface-variant" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          
          {/* ═══════ HOME: Analysis cards + Quick questions ═══════ */}
          {activeSection === 'home' && (
            <div className="p-6 space-y-6 animate-fadeIn">
              {/* Analysis Cards */}
              <div>
                <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5" /> AI Analysis
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {analysisCards.map((card) => (
                    <button
                      key={card.id}
                      onClick={() => handleAnalysis(card.id)}
                      className="flex items-start gap-3 p-4 bg-surface-container hover:bg-surface-container-high rounded-xl transition-all text-left group hover:shadow-md"
                    >
                      <div className={`p-2 rounded-lg transition-colors ${card.bg}`}>
                        <span className={card.color}>{card.icon}</span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-on-background text-sm">{card.label}</h4>
                        <p className="text-xs text-on-surface-variant mt-0.5">{card.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Questions */}
              <div>
                <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">
                  Quick Questions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {quickQuestions.map((q) => (
                    <button
                      key={q.id}
                      onClick={() => handleAnalysis('question', q.text)}
                      className="flex items-center gap-3 p-3.5 bg-surface-container/50 hover:bg-surface-container rounded-lg transition-colors text-left group"
                    >
                      <span className="text-on-surface-variant/40 group-hover:text-primary transition-colors">{q.icon}</span>
                      <span className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors font-medium">
                        {q.text}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Model Badge */}
              <div className="flex items-center justify-center gap-2 pt-2">
                <span className="text-[10px] text-on-surface-variant/40 font-mono">
                  Powered by GPT-OSS-120B via OpenRouter
                </span>
              </div>
            </div>
          )}

          {/* ═══════ RESULT: Streamed analysis ═══════ */}
          {activeSection === 'result' && (
            <div className="p-6 flex flex-col h-full animate-fadeIn">
              {/* Back + Title */}
              <div className="flex items-center gap-3 mb-4">
                <button onClick={resetToHome} className="p-2 hover:bg-surface-container-high rounded-lg transition-colors">
                  <ArrowLeft className="w-5 h-5 text-on-surface-variant" />
                </button>
                <h3 className="font-semibold text-on-background">
                  {selectedItem?.type === 'question' ? 'Response' : analysisCards.find(c => c.id === selectedItem?.type)?.label || 'Analysis'}
                </h3>
                {loading && (
                  <Loader2 className="w-4 h-4 text-primary animate-spin ml-auto" />
                )}
              </div>

              {/* Streamed Output */}
                <Card variant="elevated" className="flex-1 p-6 min-h-[280px] max-h-[55vh] overflow-y-auto custom-scrollbar" >
                <div ref={resultRef} className="text-on-background/90 text-sm leading-relaxed ai-markdown-content">
                  {error ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-8">
                      <ShieldAlert className="w-8 h-8 text-amber-500" />
                      <p className="text-on-surface-variant font-medium">{error}</p>
                    </div>
                  ) : streamedText ? (
                    <>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{streamedText}</ReactMarkdown>
                      {loading && <span className="inline-block w-1.5 h-4 bg-primary-container ml-0.5 animate-pulse rounded-sm" />}
                    </>
                  ) : loading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4 py-8">
                      <div className="w-10 h-10 rounded-full border-2 border-primary-container/20 border-t-primary-container animate-spin" />
                      <div className="text-center">
                        <p className="font-semibold text-on-background">Analyzing</p>
                        <p className="text-sm text-on-surface-variant">Streaming response...</p>
                      </div>
                    </div>
                  ) : null}
                </div>
              </Card>

              {/* Actions */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={resetToHome}
                  className="flex-1 py-3 bg-surface-container hover:bg-surface-container-high text-on-surface-variant rounded-lg transition-colors font-medium text-sm flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={handleRetry}
                  disabled={loading}
                  className="py-3 px-6 bg-primary-container hover:bg-primary-container/90 text-white rounded-lg transition-colors font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Regenerate
                </button>
              </div>
            </div>
          )}

          {/* ═══════ CHAT: Free-form conversation ═══════ */}
          {activeSection === 'chat' && (
            <div className="flex flex-col h-[60vh]">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                {chatHistory.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-8 animate-fadeIn">
                    <div className="p-3 bg-primary-container/10 rounded-full">
                      <MessageSquare className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-on-background">Ask me anything</h3>
                    <p className="text-sm text-on-surface-variant max-w-sm">
                      Ask about weather conditions, travel plans, what to wear, outdoor activities — anything weather-related for {weather?.name || 'your city'}.
                    </p>
                  </div>
                )}

                {chatHistory.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-primary-container text-white rounded-br-md'
                        : 'bg-surface-container text-on-background rounded-bl-md'
                    }`}>
                      <div className={msg.role === 'assistant' ? 'ai-markdown-content' : ''}>
                        {msg.role === 'assistant' ? (
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                        ) : (
                          msg.text
                        )}
                        {i === chatHistory.length - 1 && msg.role === 'assistant' && loading && (
                          <span className="inline-block w-1.5 h-4 bg-primary-container ml-0.5 animate-pulse rounded-sm" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-outline-variant/10 shrink-0">
                <form
                  onSubmit={(e) => { e.preventDefault(); handleChatSend(); }}
                  className="flex items-center gap-3"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={loading ? 'AI is responding...' : 'Ask about the weather...'}
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-surface-container rounded-xl text-sm text-on-background placeholder:text-on-surface-variant/40 outline-none focus:ring-2 focus:ring-primary/30 transition-all disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim() || loading}
                    className="p-3 bg-primary-container hover:bg-primary-container/90 text-white rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </button>
                </form>
                <p className="text-[10px] text-on-surface-variant/40 text-center mt-2 font-mono">
                  GPT-OSS-120B · Responses may vary
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const WeatherAssistantButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-5 py-3 bg-primary-container hover:bg-primary-container/90 rounded-xl text-white font-semibold text-sm transition-all hover:shadow-lg hover:shadow-primary-container/25"
    >
      <Sparkles className="w-4 h-4" />
      AI Insights
    </button>
  );
};

export default WeatherAISummary;