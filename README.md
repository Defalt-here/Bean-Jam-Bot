# 🫘 Bean Jam Bot

<div align="center">

**A Modern Bilingual AI Restaurant & Dating Spot Recommender**

*Powered by Google Gemini AI with Voice Recognition & Dynamic UI*

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Google Cloud](https://img.shields.io/badge/Google_Cloud-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white)](https://cloud.google.com/)

</div>

---

## ✨ Features

### 🤖 AI-Powered Conversations
- **Google Gemini Pro** integration for intelligent, context-aware restaurant and dating spot recommendations
- Natural language understanding for planning dates, restaurant hopping sessions, or getting quick recommendations
- Conversation history tracking for coherent, multi-turn dialogues
- Smart itinerary planning assistance

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

### 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser Client                       │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   React UI  │  │ Voice Input  │  │ Blob Anim.   │  │
│  │   + Vite    │  │ MediaRecorder│  │ Canvas/CSS   │  │
│  └─────────────┘  └──────────────┘  └──────────────┘  │
└─────────────┬───────────────┬───────────────┬──────────┘
              │               │               │
              ▼               ▼               ▼
    ┌─────────────────┐ ┌────────────┐ ┌────────────┐
    │  Gemini API     │ │ Weather API│ │  /api/     │
    │  (Direct)       │ │ (Direct)   │ │ transcribe │
    └─────────────────┘ └────────────┘ └─────┬──────┘
                                              │
                                              ▼
                                    ┌──────────────────┐
                                    │ Google Cloud STT │
                                    │   (Serverless)   │
                                    └──────────────────┘
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
| **Backend (Prod)** | Vercel Functions / Netlify Functions |
| **Animation** | CSS Keyframes, RequestAnimationFrame, Web Audio API |
| **Deployment** | Vercel, Netlify, Docker |

## 📁 Project Structure

```
bean-jam-bot/
├── api/                          # Vercel serverless functions
│   └── transcribe.js            # Speech-to-text endpoint
├── netlify/functions/           # Netlify serverless functions
│   └── transcribe.js
├── server/                      # Local development server
│   └── index.js                # Express server for STT
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
├── vercel.json                  # Vercel config
├── netlify.toml                 # Netlify config
└── Dockerfile                   # Docker containerization
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

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Environment Variables in Vercel:**
- `GOOGLE_APPLICATION_CREDENTIALS_JSON`: Paste entire service account JSON content
- `VITE_GEMINI_API_KEY`: Your Gemini key
- `VITE_WEATHER_API_KEY`: Your Weather API key

### Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

Set the same environment variables in Netlify dashboard.

### Docker

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
