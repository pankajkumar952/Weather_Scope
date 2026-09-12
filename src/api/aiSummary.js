// aiSummary.js — OpenRouter AI integration with streaming
// Primary: openrouter/free — OpenRouter's own router that auto-selects
//          whichever free model currently has an available provider,
//          since specific free model IDs rotate in/out with little notice.
// Fallbacks: a few known-good free models, tried in order if the router itself fails.
// Streaming: SSE-based for real-time token delivery

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const MODELS = [
  'openrouter/free',
  'openai/gpt-oss-120b:free',
  'google/gemma-3-27b-it:free',
  'meta-llama/llama-3.3-8b-instruct:free',
];

if (!OPENROUTER_KEY) {
  console.error(
    '[aiSummary] VITE_OPENROUTER_API_KEY is missing. AI Insights and Chat will not work until ' +
    'this is set in .env (as plain UTF-8, no quotes) and the dev server is restarted.'
  );
}

// Statuses where it's worth trying the next model in the fallback chain
// rather than failing the whole request outright.
const RETRYABLE_STATUSES = [400, 401, 402, 404, 429, 503];

/**
 * Build a structured weather context string from raw API data.
 */
const buildWeatherContext = (weather, forecast) => {
  const current = weather ? {
    city: weather.name,
    country: weather.sys?.country,
    temp: weather.main?.temp,
    feels_like: weather.main?.feels_like,
    temp_min: weather.main?.temp_min,
    temp_max: weather.main?.temp_max,
    humidity: weather.main?.humidity,
    pressure: weather.main?.pressure,
    condition: weather.weather?.[0]?.main,
    description: weather.weather?.[0]?.description,
    wind_speed: weather.wind?.speed,
    wind_deg: weather.wind?.deg,
    visibility: weather.visibility,
    clouds: weather.clouds?.all,
    sunrise: weather.sys?.sunrise ? new Date(weather.sys.sunrise * 1000).toLocaleTimeString() : null,
    sunset: weather.sys?.sunset ? new Date(weather.sys.sunset * 1000).toLocaleTimeString() : null,
  } : null;

  const forecastDays = forecast?.list ? getDailySnapshots(forecast.list) : [];

  return { current, forecast: forecastDays };
};

const getDailySnapshots = (list) => {
  const daily = {};
  list.forEach((item) => {
    const dateStr = new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const hour = new Date(item.dt * 1000).getHours();
    if (!daily[dateStr] || (hour >= 11 && hour <= 14)) {
      daily[dateStr] = {
        date: dateStr,
        temp: Math.round(item.main.temp),
        feels_like: Math.round(item.main.feels_like),
        temp_min: Math.round(item.main.temp_min),
        temp_max: Math.round(item.main.temp_max),
        humidity: item.main.humidity,
        condition: item.weather[0].main,
        description: item.weather[0].description,
        wind_speed: item.wind?.speed,
        rain_probability: Math.round((item.pop || 0) * 100),
      };
    }
  });
  return Object.values(daily).slice(0, 5);
};

/**
 * System prompt that gives the AI a clear role and formatting instructions.
 */
const SYSTEM_PROMPT = `You are SkyCast AI — an expert weather assistant built into a weather dashboard. Your job is to analyze real-time weather data and give users clear, actionable insights.

Rules:
- Be concise but thorough. Use short paragraphs.
- Use weather-appropriate emoji sparingly (☀️ 🌧️ 💨 ❄️ 🌡️) for visual clarity.
- Structure responses with clear sections when appropriate.
- Give specific, practical advice (not generic).
- When discussing temperatures, include both the actual and "feels like" values.
- For forecasts, identify trends (warming, cooling, rain approaching, etc.).
- Always mention safety concerns if conditions warrant it (extreme heat, storms, icy roads, etc.).`;

/**
 * Generate a prompt based on the request type.
 */
const buildPrompt = (type, weatherContext, questionText = '') => {
  const contextStr = JSON.stringify(weatherContext, null, 2);

  const prompts = {
    today: `Analyze the current weather conditions for ${weatherContext.current?.city}. Provide:
1. A brief overview of current conditions
2. How it "feels" outdoors right now
3. Key things to be aware of (UV, wind, humidity)
4. Practical recommendations for the day

Weather Data:
${contextStr}`,

    forecast: `Analyze the 5-day weather forecast for ${weatherContext.current?.city}. Provide:
1. Overall trend summary (getting warmer/cooler, rain expected, etc.)
2. Day-by-day highlights (just the notable changes)
3. Best and worst days for outdoor activities
4. Any weather alerts or preparation advice

Weather Data:
${contextStr}`,

    alerts: `Based on this weather data, identify any potential weather hazards or concerns for ${weatherContext.current?.city}. Check for:
1. Extreme temperatures (heat/cold advisories)
2. High winds or storm potential
3. Heavy rain or flooding risk
4. Poor visibility conditions
5. Any safety recommendations

If conditions are safe and normal, say so clearly and give a brief "all clear" summary.

Weather Data:
${contextStr}`,

    travel: `Provide a travel advisory for ${weatherContext.current?.city} based on current and upcoming weather. Include:
1. Current driving/commute conditions
2. Whether outdoor plans should be adjusted
3. Best time window for travel today
4. What to pack/prepare for the next few days
5. Airport/transit considerations if applicable

Weather Data:
${contextStr}`,

    health: `Provide health and wellness advice based on the current weather in ${weatherContext.current?.city}. Consider:
1. Heat/cold stress risk and prevention
2. Air quality implications from the conditions
3. Exercise and outdoor activity recommendations
4. Hydration and sun protection needs
5. Allergy or respiratory considerations

Weather Data:
${contextStr}`,

    question: `The user has a specific question about the weather in ${weatherContext.current?.city}. Answer it clearly and concisely using the data provided.

Weather Data:
${contextStr}

User's Question: "${questionText}"`,

    chat: `Answer the user's weather-related question about ${weatherContext.current?.city || 'their location'} using the real-time data below. Be conversational but informative.

Weather Data:
${contextStr}

User: "${questionText}"`,
  };

  return prompts[type] || prompts.today;
};

/**
 * Stream a weather AI response using OpenRouter's SSE streaming.
 * Tries models in priority order; falls back to the next on auth/rate errors.
 * @param {Object} weather - Current weather data
 * @param {Object} forecast - 5-day forecast data
 * @param {string} type - Request type: 'today', 'forecast', 'alerts', 'travel', 'health', 'question', 'chat'
 * @param {string} questionText - User's question (for 'question' and 'chat' types)
 * @param {Function} onToken - Callback fired with each new token (for real-time UI updates)
 * @returns {Promise<string>} Full response text
 */
export const streamWeatherSummary = async (weather, forecast, type = 'today', questionText = '', onToken = null) => {
  if (!OPENROUTER_KEY) {
    throw new Error('AI features are not configured: VITE_OPENROUTER_API_KEY is missing from .env.');
  }

  const weatherContext = buildWeatherContext(weather, forecast);
  const userPrompt = buildPrompt(type, weatherContext, questionText);

  let lastError = null;

  for (const model of MODELS) {
    try {
      const result = await _tryStreamModel(model, userPrompt, onToken);
      return result;
    } catch (err) {
      console.warn(`Model ${model} failed:`, err.message);
      lastError = err;
      // On 401/402/429/503, try the next model
      if (err.status && RETRYABLE_STATUSES.includes(err.status)) {
        continue;
      }
      // On other errors, don't retry
      throw err;
    }
  }

  throw lastError || new Error('All models failed. Please check your API key.');
};

/**
 * Internal: attempt a single streaming request with a specific model.
 */
const _tryStreamModel = async (model, userPrompt, onToken) => {
  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'SkyCast Weather Dashboard',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const err = new Error(errorData?.error?.message || `API error: ${response.status}`);
    err.status = response.status;
    throw err;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Process complete SSE lines
    const lines = buffer.split('\n');
    buffer = lines.pop() || ''; // Keep incomplete line in buffer

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;

      const data = trimmed.slice(6);
      if (data === '[DONE]') continue;

      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) {
          fullText += content;
          if (onToken) onToken(content, fullText);
        }
      } catch {
        // Skip malformed JSON chunks
      }
    }
  }

  return fullText || 'No response generated. Please try again.';
};

/**
 * Non-streaming fallback (for backwards compatibility).
 * Also uses model fallback chain.
 */
export const generateWeatherSummary = async (weather, forecast, type = 'today', questionText = '') => {
  if (!OPENROUTER_KEY) {
    throw new Error('AI features are not configured: VITE_OPENROUTER_API_KEY is missing from .env.');
  }

  const weatherContext = buildWeatherContext(weather, forecast);
  const userPrompt = buildPrompt(type, weatherContext, questionText);
  let lastError = null;

  for (const model of MODELS) {
    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'SkyCast Weather Dashboard',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const err = new Error(errorData?.error?.message || `API error: ${response.status}`);
        err.status = response.status;
        if (RETRYABLE_STATUSES.includes(response.status)) {
          lastError = err;
          continue;
        }
        throw err;
      }

      const data = await response.json();
      return data?.choices?.[0]?.message?.content || 'No summary generated.';
    } catch (err) {
      lastError = err;
      if (err.status && RETRYABLE_STATUSES.includes(err.status)) continue;
      throw err;
    }
  }

  throw lastError || new Error('All models failed. Please check your API key.');
};