Bean Jam Bot is a modern, bilingual AI chat assistant designed with a minimalist brutalist aesthetic. It offers a conversational interface powered by Google's Gemini AI, enhanced with real-time voice-to-text transcription, context-aware weather reporting, and a unique reactive UI that responds to user input.

This project serves as a robust boilerplate for building sophisticated, AI-driven web applications that require complex integrations with third-party services, real-time user interaction, and a polished, modern user experience.

## Key Features and Capabilities

*   **Bilingual Interface:** Seamlessly switch between English (EN) and Japanese (JP) for both the UI and AI responses.
*   **Voice-to-Text Transcription:** Utilizes Google Cloud Speech-to-Text for high-accuracy, real-time voice input in multiple languages.
*   **AI-Powered Conversations:** Leverages Google's Gemini Pro for natural, context-aware, and engaging chat sessions.
*   **Context-Aware Weather Integration:** Intelligently detects user intent to provide location-based weather forecasts, powered by WeatherAPI and driven by Gemini's decision-making.
*   **Location Services:** Uses browser Geolocation with an IP-based fallback to provide personalized, location-aware responses.
*   **Reactive UI Animation:** Features a dynamic blob animation that visually reacts to voice input levels, enhancing user engagement.
*   **Modern & Performant Stack:** Built with React, Vite, and TypeScript for a fast, type-safe, and scalable frontend.
*   **Deploy-Ready:** Pre-configured for seamless deployment to Vercel, Netlify, or containerized environments with Docker.

## 🏛️ Architecture Overview

Bean Jam Bot is built on a **Jamstack architecture**, emphasizing performance, security, and scalability. The system is decoupled into a static frontend application and a serverless backend for dynamic operations.

*   **Frontend Application:** A Single-Page Application (SPA) built with **React** and **Vite**. It manages all UI components, state, and user interactions. It communicates directly with the Gemini and Weather APIs.
*   **Serverless Backend:** A set of serverless functions responsible for handling sensitive or compute-intensive tasks. The primary function is **audio transcription**, which processes audio data and forwards it to the Google Cloud Speech-to-Text API. This approach keeps API credentials secure and off the client.
*   **External Services:**
    *   **Google Gemini:** The core conversational AI engine.
    *   **Google Cloud Speech-to-Text:** Handles all voice-to-text processing.
    *   **WeatherAPI:** Provides real-time weather and forecast data.
*   **Data Flow (Voice Input):**
    1.  The user records audio in the browser.
    2.  The audio blob is sent to the serverless backend endpoint (`/api/transcribe`).
    3.  The serverless function authenticates and sends the audio to the Google Speech-to-Text API.
    4.  The transcribed text is returned to the frontend.
    5.  The frontend sends the text to the Gemini API, along with conversation history and contextual data (location, weather), to generate a response.

This architecture ensures the frontend remains lightweight and fast, while securely offloading specialized tasks to scalable, on-demand serverless infrastructure.

## Technology Stack

The project leverages a modern, robust technology stack for both frontend and backend development.

| Category                | Technology / Library                                                                                                |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Languages**           | TypeScript, JavaScript                                                                                              |
| **Frontend Framework**  | React 18, Vite                                                                                                      |
| **UI Components**       | Shadcn/ui, Radix UI, Tailwind CSS                                                                                   |
| **State Management**    | React Context API, TanStack Query                                                                                   |
| **Routing**             | React Router                                                                                                        |
| **Backend (Dev)**       | Node.js, Express                                                                                                    |
| **Backend (Prod)**      | Vercel Serverless Functions, Netlify Functions                                                                      |
| **AI & ML Services**    | Google Gemini API, Google Cloud Speech-to-Text API                                                                  |
| **Third-Party APIs**    | WeatherAPI.com, OpenStreetMap (for reverse geocoding)                                                               |
| **Styling**             | Tailwind CSS, PostCSS                                                                                               |
| **Linting & Formatting**| ESLint                                                                                                              |
| **Deployment**          | Vercel, Netlify, Docker                                                                                             |

## Folder Structure

The codebase is organized logically to separate concerns and improve maintainability.

```
.
├── api/                    # Vercel Serverless Functions
│   └── transcribe.js
├── netlify/                # Netlify Serverless Functions
│   └── functions/
│       └── transcribe.js
├── public/                 # Static assets (icons, robots.txt)
├── server/                 # Local Node.js/Express server for development
│   └── index.js
├── src/
│   ├── components/         # Reusable React components
│   │   ├── ui/             # Shadcn/ui components
│   │   ├── BlobAnimation.tsx # Voice-reactive UI animation
│   │   ├── ChatMessage.tsx # Individual chat bubble
│   │   └── ...
│   ├── contexts/           # React Context for global state (e.g., Language)
│   ├── hooks/              # Custom React hooks (e.g., useAudioRecorder, useAudioLevel)
│   ├── lib/                # Core business logic and API clients
│   │   ├── gemini.ts       # Gemini API service
│   │   ├── location.ts     # Location detection service
│   │   ├── weather.ts      # Weather API service
│   │   └── utils.ts        # Utility functions (e.g., cn)
│   ├── pages/              # Top-level page components
│   │   ├── Index.tsx       # Main chat interface
│   │   └── NotFound.tsx    # 404 page
│   ├── App.tsx             # Main application component with routing
│   └── main.tsx            # Application entry point
├── .env.example            # Template for environment variables
├── Dockerfile              # Docker configuration for containerization
├── vercel.json             # Vercel deployment configuration
└── netlify.toml            # Netlify deployment configuration
```

## Installation and Setup

Follow these steps to set up and run the project locally for development.

### 1. Prerequisites

*   Node.js (v18 or higher)
*   `npm` or a compatible package manager
*   Access to Google Cloud Platform to create a service account for Speech-to-Text.
*   A Google Gemini API Key.
*   A WeatherAPI.com API Key.

### 2. Clone the Repository

```bash
git clone https://github.com/your-username/bean-jam-bot.git
cd bean-jam-bot
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the root of the project by copying the example file:

```bash
cp .env.example .env
```

Now, open `.env` and fill in the required values:

```env
# Path to your Google Cloud service account JSON key file
# Place your key file in `src/Keys/`
GOOGLE_APPLICATION_CREDENTIALS=./src/Keys/your-service-account-file.json

# Your API key for the Google Gemini API
VITE_GEMINI_API_KEY=AIzaSy...

# Your API key from WeatherAPI.com
VITE_WEATHER_API_KEY=your_weatherapi_key
```

### 5. Run the Development Servers

The local environment requires two separate processes: the backend transcription server and the frontend Vite server.

**Terminal 1: Start the Backend Server**

```bash
npm run start:server
```
This will start the local Express server on `http://localhost:3001`.

**Terminal 2: Start the Frontend Application**

```bash
npm run dev
```
This will start the Vite development server, typically on `http://localhost:8080`.

Open your browser and navigate to `http://localhost:8080` to use the application.

## Usage Guide

*   **Text Input:** Type a message in the input field and press Enter or click "SEND".
*   **Voice Input:**
    1.  Click the "Mic" button. Your browser will ask for microphone permission.
    2.  Once recording starts, the button will change to "Stop" and the blob animation will react to your voice.
    3.  Click "Stop" to finish recording.
    4.  The audio will be transcribed, and the text will be sent to the AI automatically.
*   **Language Switching:** Click the "EN" / "JP" toggle at the top of the screen to switch the interface language and the AI's response language.

## Configuration & Deployment

This project is optimized for serverless deployments. The recommended provider is **Vercel**.

### Recommended: Vercel Deployment

1.  **Install Vercel CLI:**
    ```bash
    npm install -g vercel
    ```
2.  **Run the Deploy Command:**
    ```bash
    vercel --prod
    ```
    Follow the prompts to link your project.
3.  **Set Environment Variables:**
    In your Vercel project dashboard, navigate to **Settings -> Environment Variables** and add the following:
    *   `GOOGLE_APPLICATION_CREDENTIALS_JSON`: Paste the **entire content** of your Google Cloud service account JSON file here.
    *   `VITE_GEMINI_API_KEY`: Your Gemini API key.
    *   `VITE_WEATHER_API_KEY`: Your WeatherAPI key.
4.  **Redeploy:** Trigger a new deployment from the Vercel dashboard to apply the environment variables.

##  Testing

The project is configured with **ESLint** for static code analysis and maintaining code quality.

To run the linter, use the following command:

```bash
npm run lint
```

Currently, there is no dedicated unit or end-to-end testing suite. Adding frameworks like Vitest or Playwright would be a valuable contribution.
