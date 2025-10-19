# Overview

## What is Bean Jam Bot?

Bean Jam Bot is a modern bilingual AI-powered restaurant and dating assistant that helps users plan perfect dates, discover great restaurants, and create memorable experiences. Built with cutting-edge technologies, it combines the power of Google Gemini AI with voice recognition and dynamic UI elements.

## Key Features

### 🤖 AI-Powered Intelligence
- **Google Gemini Pro** integration for context-aware recommendations
- Natural language understanding for restaurant and dating planning
- Multi-turn conversation support with history tracking
- Smart itinerary planning assistance

### 🎤 Voice Input
- Google Cloud Speech-to-Text with 48kHz WEBM_OPUS encoding
- Bilingual support (English & Japanese)
- Real-time audio visualization with 8-band equalizer
- Visual feedback with reactive blob animation

### 🌍 Location & Weather Aware
- GPS and IP-based location detection
- Real-time weather integration
- Context-aware recommendations (indoor/outdoor based on weather)
- Supports both city names and GPS coordinates

### 🎨 Modern UI/UX
- Responsive design with Tailwind CSS
- Dynamic blob animation that reacts to voice input
- Smooth transitions and animations
- Dark/light mode support

### 🌐 Bilingual Support
- Seamless language switching (EN ↔ JP)
- Culturally relevant recommendations
- Localized UI strings and error messages
- Language-specific AI prompts

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for blazing-fast builds
- **Tailwind CSS** for styling
- **Framer Motion** for animations

### Backend
- **AWS Lambda** (Node.js 20.x) for serverless functions
- **Google Cloud Speech-to-Text** for transcription
- **Google Gemini Pro** for AI responses
- **WeatherAPI.com** for weather data

### APIs Used
- Google Gemini Pro API
- Google Cloud Speech-to-Text API
- WeatherAPI.com
- OpenStreetMap Nominatim (geocoding)
- ipapi.co (IP-based location)

## Use Cases

1. **Date Planning** - Get personalized date ideas based on preferences, weather, and location
2. **Restaurant Discovery** - Find the perfect restaurant for any occasion
3. **Restaurant Hopping** - Plan multi-restaurant routes with cuisine diversity
4. **Quick Recommendations** - Voice-activated instant suggestions
5. **Bilingual Support** - Communicate in English or Japanese seamlessly

## Architecture

Bean Jam Bot follows a modern serverless architecture:

```
User Interface (React + Vite)
        ↓
AWS Lambda Functions
        ↓
External APIs (Gemini, Speech-to-Text, Weather)
```

For detailed architecture information, see the [System Design](../architecture/system-design.md) page.

## Next Steps

- [Installation Guide](installation.md) - Set up your development environment
- [System Design](../architecture/system-design.md) - Understand the architecture
- [Deployment](../deployment/quick-deploy.md) - Deploy your own instance
