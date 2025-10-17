# Bean Jam Bot 🤖

AI chat assistant with voice input support in English and Japanese.

## Features

✨ **Voice Input** - Speak in English or Japanese, powered by Google Cloud Speech-to-Text  
🌐 **Bilingual** - Full UI translation (EN/JP)  
🌦️ **Weather Integration** - Location-aware weather information  
💬 **Gemini AI** - Powered by Google's Gemini API  
🎨 **Modern UI** - Brutalist design with smooth animations

## Quick Start (Development)

### Prerequisites
- Node.js 18+
- Google Cloud Speech-to-Text API key (service account JSON)
- Google Gemini API key
- Weather API key

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env` file:
```env
GOOGLE_APPLICATION_CREDENTIALS=./src/Keys/your-service-account.json
VITE_GEMINI_API_KEY=your_gemini_key
VITE_WEATHER_API_KEY=your_weather_key
```

### 3. Run Development Servers

**Terminal 1 - Backend (STT server):**
```bash
npm run start:server
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Open http://localhost:8080

## Production Deployment

### Quick Deploy (Vercel - Recommended)

```powershell
# Windows
.\deploy-prod.ps1

# Or manually
npm run build
vercel --prod
```

Then set environment variables in Vercel dashboard.

📖 **Full deployment guide:** See [DEPLOY.md](./DEPLOY.md)

## Voice Input Usage

1. Click the microphone button
2. Grant browser microphone permission
3. Speak in English or Japanese
4. Click stop
5. Transcript appears and is sent to bot automatically

## Tech Stack

**Frontend:** React 18, TypeScript, Vite, TailwindCSS, Radix UI  
**Backend:** Express (dev), Serverless Functions (prod)  
**APIs:** Google Cloud Speech-to-Text, Google Gemini

## Development Scripts

```bash
npm run dev          # Start frontend dev server
npm run start:server # Start backend STT server
npm run build        # Build for production
npm run lint         # Run ESLint
```

## License

MIT

---

Built with ❤️ using React, TypeScript, and Google Cloud AI
