# 🫘 Bean Jam Bot

<div align="center">

**A Modern Bilingual AI Restaurant & Dating Assistant**

*Powered by Google Gemini AI with Voice Recognition & Dynamic UI*

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Google Cloud](https://img.shields.io/badge/Google_Cloud-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white)](https://cloud.google.com/)
[![AWS](https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white)](https://aws.amazon.com/)

</div>

---

## ✨ Features

### 🤖 AI-Powered Conversations
- **Google Gemini Pro** integration for intelligent, context-aware restaurant and dating spot recommendations
- Natural language understanding for planning dates, restaurant hopping sessions, or getting quick recommendations
- Conversation history tracking for coherent, multi-turn dialogues
- Smart itinerary planning assistance

### 🗺️ Restaurant & Dating Planning Intelligence
- Curates date ideas based on vibe (cozy, adventurous, budget, premium) and time of day
- Builds restaurant-hopping routes with proximity awareness and cuisine diversity
- Adjusts plans using live weather context (e.g., indoor/outdoor, sunset views)
- Bilingual recommendations (EN/JP) with culturally relevant suggestions

### 🎤 Advanced Voice Input
- **Google Cloud Speech-to-Text** integration with 48kHz WEBM_OPUS encoding
- Real-time voice transcription in **English** and **Japanese**
- Visual feedback during recording with reactive blob animation
- Automatic audio level detection and visualization with 8-band equalizer
- Helpful toast notifications guiding users through the recording process

### � Bilingual Support
- Seamless language switching between **English (EN)** and **Japanese (JP)**
- Language-specific AI prompts and responses
- Fully localized UI strings and error messages
- Cultural context awareness in recommendations

### 🌊 Dynamic Blob Animation
- **Organic, living blob** that reacts to user interactions
- Voice-reactive animation with real-time audio level visualization
- Smooth state transitions between idle and active modes
- Different visual modes:
  - **Normal Mode**: Teal/blue gradient for standard conversations
  - **Create Mode**: Purple/pink gradient when AI is generating responses
- Gradual rotation and morphing effects
- Adjustable blur and saturation based on activity
- Hardware-accelerated animations for smooth 60fps performance

### 🌤️ Weather Integration
- **Context-aware weather detection** - Gemini AI decides when to show weather cards
- Real-time weather data from **WeatherAPI.com**
- Multi-day forecast support (current + up to 7 days)
- Location-based recommendations using browser geolocation
- IP-based fallback using OpenStreetMap for reverse geocoding
- Beautiful weather card UI with temperature, conditions, and forecasts

### 🎨 Modern UI/UX
- **Brutalist design** aesthetic with bold borders and sharp edges
- Glassmorphism chat panel with adjustable transparency
- Smooth animations and transitions (1s opacity fades, 0.8s transforms)
- Custom scrollbar styling for chat history
- Responsive layout optimized for all screen sizes
- Brutalist shadow effects for depth
- Audio level equalizer overlay during voice input

### 🏗️ Architecture (Production)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              Browser Client                              │
│  React + Vite UI  •  Voice (MediaRecorder)  •  Blob Animation  •  EN/JP │
└───────────────┬───────────────────────────────┬──────────────────────────┘
    │                               │
    │ fetch(JSON)                   │ Geolocation / Forecast
    ▼                               ▼
      ┌──────────────────────────┐      ┌───────────────────────┐
      │  AWS API Gateway (HTTP) │      │  WeatherAPI.com       │
      │  Route: POST /transcribe│      │  (Direct from client) │
      └──────────────┬───────────┘      └───────────┬───────────┘
         │ Integration (v2.0)            │
         ▼                                ▼
       ┌────────────────┐               ┌────────────────────┐
       │  AWS Lambda    │               │ Google Gemini API   │
       │  Node.js 20    │               │ (Direct from client)│
       └──────┬─────────┘               └────────────────────┘
        │
        ▼
    ┌────────────────────────┐
    │ Google Cloud STT (v2) │
    │ Speech-to-Text API    │
    └────────────────────────┘
```

Mermaid view

```mermaid
flowchart LR
    subgraph Client[Browser Client]
      UI[React + Vite UI]\nEN/JP Toggle
      REC[MediaRecorder]\nVoice Capture
      UI -->|fetch JSON| APIGW
      REC -->|webm/opus| UI
    end
    APIGW[API Gateway HTTP API\nPOST /transcribe]\nCORS @ Edge
    LAMBDA[AWS Lambda\nNode.js 20]
    GCSTT[Google Cloud Speech-to-Text]
    GEMINI[Google Gemini API]
    WEATHER[WeatherAPI.com]
    UI --> |Direct| GEMINI
    UI --> |Direct| WEATHER
    APIGW --> |v2.0 Integration| LAMBDA
    LAMBDA --> GCSTT
```

## 🚀 Technology Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | React 18, TypeScript, Vite |
| **UI Framework** | Tailwind CSS, Shadcn/ui, Radix UI |
| **State Management** | React Context API, TanStack Query |
| **Routing** | React Router |
| **AI Services** | Google Gemini 2.5 Flash, Google Cloud Speech-to-Text |
| **APIs** | WeatherAPI.com, OpenStreetMap Nominatim |
| **Backend (Dev)** | Node.js, Express |
| **Backend (Prod)** | AWS API Gateway (HTTP) + AWS Lambda (Node.js 20) |
| **Animation** | CSS Keyframes, RequestAnimationFrame, Web Audio API |
| **Deployment** | AWS Lambda/API Gateway, Docker (optional) |

## 📁 Project Structure

```
bean-jam-bot/
├── aws-lambda/
│   └── transcribe/              # AWS Lambda (production)
│       ├── index.js             # Handler (Google STT)
│       ├── package.json
│       └── function.zip         # Deployment artifact
├── server/                      # Local development server (optional)
│   └── index.js
├── src/
│   ├── components/
│   │   ├── ui/                 # Shadcn/ui components
│   │   ├── BlobAnimation.tsx   # 🌊 Voice-reactive blob
│   │   ├── ChatMessage.tsx     # Chat bubble component
│   │   ├── WeatherCard.tsx     # Weather display card
│   │   └── LanguageToggle.tsx  # EN/JP switcher
│   ├── contexts/
│   │   └── useLanguage.tsx     # Language context
│   ├── hooks/
│   │   ├── use-audio-recorder.ts  # 🎤 Voice recording
│   │   ├── use-audio-level.ts     # Audio visualization
│   │   └── use-toast.ts
│   ├── lib/
│   │   ├── gemini.ts           # Gemini API client
│   │   ├── location.ts         # Geolocation service
│   │   ├── weather.ts          # Weather API client
│   │   └── utils.ts
│   ├── pages/
│   │   └── Index.tsx           # Main chat interface
│   ├── App.tsx
│   └── main.tsx
├── .env                         # Environment variables
└── Dockerfile                   # Docker containerization (optional)
```

## 🛠️ Installation & Setup

### Prerequisites

- Node.js v18+
- Google Cloud Platform account (for Speech-to-Text)
- Google Gemini API key
- WeatherAPI.com API key

### 1. Clone Repository

```bash
git clone https://github.com/Defalt-here/Bean-Jam-Bot.git
cd Bean-Jam-Bot
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file:

```env
# Google Cloud Speech-to-Text (absolute path to service account JSON)
GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\your\service-account.json

# Google Gemini API Key
VITE_GEMINI_API_KEY=AIzaSy...

# WeatherAPI.com API Key
VITE_WEATHER_API_KEY=your_weatherapi_key

# Transcription API (API Gateway invoke URL)
VITE_TRANSCRIBE_API_URL=https://<api-id>.execute-api.eu-north-1.amazonaws.com/transcribe
```

### 4. Run Development Servers

**Terminal 1 - Backend Server:**
```bash
npm run start:server
# or use the PowerShell script:
.\start-server.ps1
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Open `http://localhost:8080` in your browser! 🎉

## 🎮 Usage

### Text Chat
1. Type your message in the input field
2. Press Enter or click **SEND**
3. AI responds with restaurant/dating recommendations

### Voice Input
1. Click the **Mic** button
2. Grant microphone permissions
3. Speak your question (in English or Japanese)
4. Click **Stop** to transcribe
5. Message automatically sends to AI

### Language Switching
- Click the **EN** / **🇯🇵** toggle at the top
- Switches both UI and AI response language
- All prompts and responses adapt automatically

### Weather Queries
- Ask about weather: "What's the weather like?"
- AI automatically shows weather card with forecast
- Location-based using your IP or GPS

## 🌍 Deployment

### AWS (Production)

1) Package Lambda

```powershell
cd aws-lambda/transcribe
npm install --omit=dev
Compress-Archive -Path @("index.js","package.json","node_modules") -DestinationPath function.zip -Force
```

2) Create/Configure Lambda (BeanJamTranscribe)
- Runtime: Node.js 20.x
- Memory: 512 MB • Timeout: 30s
- Environment variable: `GOOGLE_SERVICE_ACCOUNT_KEY` = entire JSON of your Google service account (paste the JSON)
- Upload `function.zip`

3) Create API Gateway (HTTP API)
- Route: `POST /transcribe`
- Integration: Lambda → BeanJamTranscribe • Payload format: `2.0`
- CORS:
  - Allow origins: `http://localhost:8080` (add prod domain later)
  - Allow headers: `content-type`
  - Allow methods: `POST`
- Stage: `$default` with Auto-deploy ON

4) Frontend config
- Set `.env` → `VITE_TRANSCRIBE_API_URL=https://<api-id>.execute-api.eu-north-1.amazonaws.com/transcribe`
- Restart Vite dev server and hard-refresh the browser

5) Optional: Health Check Route (no Lambda)
- API Gateway → Routes → Create → GET /health
- Integration: Mock Response
- Response: 200 with body `{ "ok": true }`
- Great for uptime dashboards and quick smoke tests

### Docker (optional)

```bash
docker build -t bean-jam-bot .
docker run -p 3000:3000 bean-jam-bot
```

## 🎨 Blob Animation Technical Details

The blob animation is a sophisticated visual element that enhances user engagement:

- **Interpolated Loading States**: Smooth transitions using lerp (linear interpolation) with 0.05 speed
- **Audio Reactivity**: Real-time FFT analysis creates 8-band equalizer visualization
- **Dynamic Properties**:
  - Blur: 8-26px based on state
  - Saturation: 120-200% during activity
  - Rotation: 60s slow (idle) to 8s fast (loading)
  - Scale: Pulsing 1.0-1.08x
  - Movement: Sine/cosine wave patterns
- **Color Modes**:
  - Normal: `#3B82F6` → `#10B981` → `#22D3EE` (blue-teal)
  - Create: `#6366F1` → `#A855F7` → `#EC4899` (purple-pink)
- **Performance**: Hardware-accelerated with `will-change` transforms

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Google Gemini AI for conversational intelligence
- Google Cloud Speech-to-Text for voice recognition
- WeatherAPI.com for weather data
- Shadcn/ui for beautiful components
- The React and Vite communities

---

<div align="center">

**Made with 💜 by [Defalt-here](https://github.com/Defalt-here)**

*Bean Jam Bot - Where AI meets beautiful design* ✨

</div>

## 🧰 Troubleshooting (AWS)

- 405 Method Not Allowed
  - Ensure route `POST /transcribe` is attached to your Lambda integration
  - Toggle `$default` stage Auto-deploy OFF → ON to redeploy
  - Verify you’re calling `/transcribe` path (not base URL)

- CORS blocked (No/duplicate Access-Control-Allow-Origin)
  - Let API Gateway own CORS; remove `Access-Control-*` headers from Lambda
  - CORS in API: origins = your exact origin(s), methods = POST, headers = content-type

- Function URL vs API Gateway
  - Prefer API Gateway for production (auth, observability, routes)
  - If using Function URL temporarily, set CORS there and avoid duplicate headers in Lambda

## 🎤 Interview Talking Points

- Designed a bilingual Restaurant & Dating Assistant that blends LLM reasoning (Gemini) with real-world context (weather, location, time)
- Voice UX with MediaRecorder → AWS → Google STT for accurate, low-latency transcription
- Production-grade serverless backend using AWS API Gateway (HTTP) + Lambda (Node 20), CORS handled at the edge
- Clear separation of concerns: client calls AI/weather directly, serverless only handles audio STT for security and cost control
- Robust CORS/HTTP handling (payload v2.0, OPTIONS, 405s) and environment-based routing via `VITE_TRANSCRIBE_API_URL`

## 🎬 Demo

Show the full flow in 15–30 seconds:

- Start recording → speak a query (e.g., “Plan a cozy dinner date near Shibuya on Saturday”) → stop
- Transcription appears, Gemini responds with plan + optional weather card
- Blob animation reacts throughout

Tips to capture a crisp GIF/video:
- macOS: QuickTime → New Screen Recording → trim in Photos → convert to GIF (ezgif.com)
- Windows: Xbox Game Bar (Win+G) or Clipchamp → export as MP4 → convert to GIF

Add the GIF to this repo (e.g., `docs/demo.gif`) and embed:

```markdown
![Bean Jam Bot Demo](docs/demo.gif)
```
