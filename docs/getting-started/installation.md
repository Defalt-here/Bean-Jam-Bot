# Installation Guide

This guide will help you set up Bean Jam Bot for local development.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher
- **npm** or **bun** package manager
- **Git** for version control
- **Google Cloud Account** (for Speech-to-Text API)
- **Google AI Studio Account** (for Gemini API)
- **WeatherAPI.com Account** (for weather data)

## Step 1: Clone the Repository

```bash
git clone https://github.com/Defalt-here/Bean-Jam-Bot.git
cd Bean-Jam-Bot
```

## Step 2: Install Dependencies

Using npm:
```bash
npm install
```

Or using bun (faster):
```bash
bun install
```

## Step 3: Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
# Google Gemini API Key (Required)
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Weather API Key (Required)
VITE_WEATHER_API_KEY=your_weatherapi_key_here

# Google Cloud Speech-to-Text API Key (Required for voice features)
VITE_GOOGLE_CLOUD_API_KEY=your_google_cloud_api_key_here

# Backend URLs (for production)
VITE_TRANSCRIBE_API_URL=your_lambda_function_url_here
VITE_WEATHER_PROXY_URL=your_weather_proxy_url_here
```

### Getting API Keys

#### 1. Google Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Get API Key"
3. Create a new API key
4. Copy and paste into `.env`

#### 2. WeatherAPI.com API Key
1. Sign up at [WeatherAPI.com](https://www.weatherapi.com/)
2. Go to your dashboard
3. Copy your API key
4. Paste into `.env`

#### 3. Google Cloud Speech-to-Text API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Cloud Speech-to-Text API"
4. Create credentials (API Key)
5. Copy and paste into `.env`

## Step 4: Run Development Server

Start the development server:

```bash
npm run dev
```

Or with bun:
```bash
bun run dev
```

The application will be available at `http://localhost:5173`

## Step 5: Build for Production

To create a production build:

```bash
npm run build
```

Or:
```bash
bun run build
```

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
Bean-Jam-Bot/
├── src/
│   ├── components/      # React components
│   │   ├── BlobAnimation.tsx
│   │   ├── ChatMessage.tsx
│   │   ├── LanguageToggle.tsx
│   │   └── WeatherCard.tsx
│   ├── hooks/          # Custom React hooks
│   │   ├── use-audio-level.ts
│   │   └── use-audio-recorder.ts
│   ├── lib/            # Utility libraries
│   │   ├── gemini.ts   # Gemini AI integration
│   │   ├── location.ts # Location services
│   │   └── weather.ts  # Weather API integration
│   └── pages/          # Page components
│       └── Index.tsx   # Main chat interface
├── aws-lambda/         # AWS Lambda functions
├── public/             # Static assets
├── docs/              # Documentation
└── package.json
```

## Troubleshooting

### Issue: API Key Not Working

**Solution:** 
- Double-check your API keys in `.env`
- Ensure `.env` is in the root directory
- Restart the development server after changing `.env`

### Issue: Voice Recording Not Working

**Solution:**
- Check browser compatibility (Chrome/Edge recommended)
- Ensure HTTPS or localhost (required for microphone access)
- Grant microphone permissions when prompted

### Issue: Location Not Detected

**Solution:**
- Grant location permissions in browser
- Ensure HTTPS or localhost (required for geolocation)
- Check that OpenStreetMap Nominatim is accessible

### Issue: Build Errors

**Solution:**
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear cache: `npm cache clean --force`
- Check Node.js version: `node --version` (should be 18+)

## Next Steps

- [System Design](../architecture/system-design.md) - Understand the architecture
- [Frontend Details](../architecture/frontend.md) - Learn about frontend implementation
- [Backend Details](../architecture/backend.md) - Learn about backend services
- [Deployment Guide](../deployment/quick-deploy.md) - Deploy your application

## Development Tips

1. **Hot Module Replacement (HMR)** is enabled - changes reflect instantly
2. **TypeScript** strict mode is enabled - helps catch errors early
3. **ESLint** is configured - run `npm run lint` to check code quality
4. **Prettier** formatting - use VS Code extension for auto-formatting

## Contributing

Contributions are welcome! Please see our contributing guidelines in the main README.
