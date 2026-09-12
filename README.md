# 🌦️ WeatherScope

**AI-powered weather intelligence — not just data, but understanding.**

🔗 **Live Demo:** [weatherscope-fpw9zzhkx-pankaj-20b2.vercel.app](https://weatherscope-fpw9zzhkx-pankaj-20b2.vercel.app/)

WeatherScope is a modern React + Vite weather dashboard that pairs real-time forecasts with an AI assistant. Instead of dumping raw numbers on the screen, it explains what the weather actually *means* for your day: whether it's safe to travel, how to dress, and what health precautions to take.

> Built and maintained by **Pankaj Kumar**. See [LICENSE](./LICENSE) before reusing any part of this project.

---

## ✨ Features

- **🔍 Smart City Search** — Debounced autocomplete powered by the OpenWeather Geocoding API, with city/state/country disambiguation.
- **🕐 Recent Searches** — Your last few cities are cached locally for one-tap access.
- **🌡️ Live Conditions & 5-Day Forecast** — Temperature, wind, humidity, pressure, and conditions, refreshed on demand.
- **🤖 AI Weather Summary** — A natural-language briefing generated from live conditions via an LLM (Meta LLaMA 3.3 through OpenRouter).
- **❓ Smart Climate Q&A** — Ask follow-up questions about the weather and get context-aware answers.
- **🛡️ Safety Alerts** — Flags extreme heat/cold, storms, poor visibility, and flooding risk.
- **✈️ Travel Advisory** — Driving conditions and best travel windows.
- **❤️ Health Insights** — Heat/cold stress, hydration, and exercise guidance based on current conditions.
- **🌗 Light/Dark Mode** and **°C/°F Toggle**, both persisted across sessions.

---

## 🛠️ Tech Stack

| Layer              | Technology                                    |
| ------------------ | ---------------------------------------------- |
| Frontend Framework | React 19 + Vite 6                              |
| Styling            | Tailwind CSS v4                                |
| Weather Data       | OpenWeatherMap (Current, Forecast, Geocoding)  |
| AI Integration     | OpenRouter (Meta LLaMA 3.3)                    |
| State Management   | React Context API                              |
| Notifications      | react-toastify                                 |
| Persistence        | localStorage (theme, units, recent cities)     |

---

## 🚀 Getting Started

### 1. Clone and install

```bash
git clone https://github.com/<your-username>/weatherscope.git
cd weatherscope/Live-WeatherDashBoard
npm install
```

### 2. Configure environment variables

Create a file named **`.env`** in the project root (same folder as `package.json`), saved as **plain UTF-8** (not UTF-16, not "UTF-8 with BOM"):

```env
VITE_API_KEY=your_openweathermap_api_key
VITE_OPENROUTER_API_KEY=your_openrouter_api_key
```

Both keys are free to generate:

| Key | Where to get it | Notes |
| --- | ---------------- | ----- |
| `VITE_API_KEY` | [Sign up & generate an OpenWeatherMap API key](https://home.openweathermap.org/users/sign_up) | Free tier is enough. New keys can take up to ~2 hours to activate. |
| `VITE_OPENROUTER_API_KEY` | [Sign up & generate an OpenRouter API key](https://openrouter.ai/settings/keys) | No credit card required. Key must start with `sk-or-v1-`. |

After creating your OpenRouter key, also visit [openrouter.ai/settings/privacy](https://openrouter.ai/settings/privacy) and enable **"Enable free endpoints that may train on inputs"** and **"Enable free endpoints that may publish prompts"** — the free AI models used by this app require these to be turned on.

### 3. Run the dev server

```bash
npm run dev
```

Vite only reads `.env` at startup — restart the dev server after any change to it.

### 4. Build for production

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
Live-WeatherDashBoard/
├── src/
│   ├── api/            # OpenWeather + OpenRouter API calls, city suggestions hook
│   ├── components/     # SearchBar, WeatherDisplay, ForecastDisplay, AI summary modal
│   ├── context/         # Global weather/theme/unit state
│   ├── Appcontent.jsx   # Main layout and page composition
│   └── index.css        # Design tokens (colors, typography, animations)
├── public/
└── package.json
```

---

## 🧭 Troubleshooting

| Symptom                              | Likely Cause                                                                                |
| ------------------------------------- | --------------------------------------------------------------------------------------------- |
| "No results found" for every search   | `.env` missing, misnamed variable, or saved in the wrong encoding                              |
| Console: `VITE_API_KEY is missing`    | `.env` not in project root, wrong variable name, or dev server not restarted after adding it   |
| Console: `401 Invalid API key`        | Key mistyped, or a brand-new key still activating (can take up to ~2 hours)                    |

---

## 📄 License

This project is licensed under a proprietary license — see [LICENSE](./LICENSE) for details. All rights reserved by Pankaj Kumar.

## 👤 Author

**Pankaj Kumar**
Feel free to reach out for collaboration or feedback on this project.
