# Bean Jam Bot - Technical Documentation

## 1. Project Overview

### 1.1. Purpose

Bean Jam Bot is an enterprise-grade, bilingual (English/Japanese) AI chat assistant designed for date and restaurant planning. It features a modern, "brutalist" user interface with sophisticated voice input capabilities. The application leverages a suite of Google Cloud AI services to provide natural, context-aware interactions, including location-based weather information to enhance its recommendations.

### 1.2. Architecture Summary

The system is architected as a modern JAMstack application. The frontend is a single-page application (SPA) built with **React** and **Vite**. All backend logic, including API key management and communication with third-party services, is handled by serverless functions. This decoupling ensures security, scalability, and platform flexibility.

The architecture supports multiple deployment targets, including Vercel, Netlify, and AWS Lambda, with configurations provided for each. This allows the application to be deployed across various cloud infrastructures seamlessly.

### 1.3. Technology Stack

| Category               | Technology                                                                                                  |
| ---------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Core Framework**     | React 18, TypeScript                                                                                        |
| **Build Tool**         | Vite                                                                                                        |
| **State Management**   | React Context API (for language), TanStack Query (for server state caching), Component State (`useState`) |
| **Routing**            | React Router v6                                                                                             |
| **Styling**            | Tailwind CSS, `tailwindcss-animate`                                                                         |
| **UI Components**      | `shadcn/ui` (built on Radix UI)                                                                             |
| **API Services**       | • **AI Chat**: Google Gemini (`gemini-2.5-flash`) <br> • **Speech-to-Text**: Google Cloud Speech-to-Text <br> • **Weather**: WeatherAPI.com <br> • **Geolocation**: Browser Geolocation API, ipapi.co (fallback) |
| **Backend**            | Serverless Functions (Node.js) on Vercel, Netlify, or AWS Lambda; Express.js for local development.           |
| **Deployment**         | Vercel, Netlify, AWS, Docker                                                                                |
| **Linting**            | ESLint with TypeScript ESLint                                                                               |

## 2. Code Structure Overview

The repository is organized to separate concerns between the frontend application, serverless functions for different platforms, and configuration files.

```
/
├── api/                    # Vercel Serverless Functions
│   └── transcribe.js
├── aws-lambda/             # AWS Lambda Functions (Gemini, Transcribe, Weather)
│   ├── gemini/
│   ├── transcribe/
│   └── weather/
├── netlify/                # Netlify Serverless Functions
│   └── functions/
│       └── transcribe.js
├── public/                 # Static assets (icons, robots.txt)
├── server/                 # Local Express.js server for development proxy
│   └── index.js
├── src/                    # Main frontend application source
│   ├── components/         # Reusable React components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── BlobAnimation.tsx # Core visual feedback component
│   │   ├── ChatMessage.tsx   # Renders a single chat message
│   │   └── ...
│   ├── contexts/           # React Context providers (e.g., LanguageContext)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Core business logic, API clients, and utilities
│   ├── pages/              # Top-level route components
│   └── ...
├── .gitignore
├── Dockerfile              # Docker configuration for containerization
├── netlify.toml            # Netlify deployment configuration
├── package.json            # Project dependencies and scripts
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
├── vercel.json             # Vercel deployment configuration
└── vite.config.ts          # Vite build configuration
```

## 3. Core Modules & Components

### 3.1. Pages

#### `src/pages/Index.tsx`
This is the main component, orchestrating the entire chat experience.

*   **State Management**: Manages chat messages, user input, loading states (`isLoading`, `isCreating`), and user location via `useState` and `useRef`.
*   **Core Logic**:
    *   Handles form submission for text-based messages.
    *   Integrates `useAudioRecorder` and `useAudioLevel` hooks to manage voice input, recording state, and visual feedback.
    *   Coordinates API calls to the Gemini service for generating responses.
    *   Manages the display of the `WeatherCard` based on Gemini's response.
*   **Dependencies**: `BlobAnimation`, `ChatMessage`, `LanguageToggle`, `WeatherCard`, `useAudioRecorder`, `useAudioLevel`, `getGeminiService`, `getUserLocation`, `getWeather`.

#### `src/pages/NotFound.tsx`
A standard 404 page displayed for any route not explicitly defined.

### 3.2. Custom Components

#### `src/components/BlobAnimation.tsx`
A critical UI component providing visual feedback to the user.

*   **Props**:
    *   `isLoading: boolean`: Indicates a pending operation (recording or waiting for AI).
    *   `isBehind: boolean`: Renders the animation behind the chat UI if `true`.
    *   `mode: 'normal' | 'create'`: Alters the color and intensity of the animation.
    *   `levels: Float32Array | null`: Real-time audio frequency data to drive animation responsiveness.
*   **Functionality**: Uses `requestAnimationFrame` to create a dynamic, "gooey" blob effect that reacts to audio input and loading states, enhancing user engagement.

#### `src/components/ChatMessage.tsx`
Renders a single message bubble in the chat interface.

*   **Props**:
    *   `content: string`: The text content of the message.
    *   `isUser: boolean`: Determines styling (e.g., alignment, color).
    *   `language: 'en' | 'jp'`: Used for language-specific rendering if needed.
*   **Functionality**: Includes a `formatMessageContent` utility to parse and render Gemini's markdown-like responses into structured HTML (lists, paragraphs).

#### `src/components/WeatherCard.tsx`
A dedicated component to display weather information.

*   **Props**: A `WeatherCardProps` object containing `location`, `temperature`, `condition`, `humidity`, etc.
*   **Functionality**: Renders a "brutalist"-styled card with formatted weather data. It uses the `LanguageContext` to display labels in either English or Japanese.

### 3.3. Hooks

#### `src/hooks/use-audio-recorder.ts`
Encapsulates all logic for recording audio from the user's microphone.

*   **Exports**: `start`, `stop`, `sendToServer`, and `isRecording`.
*   **Browser Compatibility**: Intelligently detects the best supported audio MIME type (`audio/webm`, `audio/ogg`, or `audio/wav`) to ensure cross-browser functionality.
*   **Functionality**: Manages `MediaRecorder` state, captures audio into a `Blob`, and provides a function to send the base64-encoded audio to the transcription backend.

#### `src/hooks/use-audio-level.ts`
Provides real-time audio frequency data from the microphone.

*   **Functionality**: Uses the Web Audio API (`AudioContext`, `AnalyserNode`) to capture microphone input levels. The output is consumed by `BlobAnimation` for visualization.

### 3.4. Libraries & Utilities (`src/lib`)

*   **`gemini.ts`**: A service class that abstracts communication with the Google Gemini API. It constructs the request payload, including system instructions and conversation history, and can route requests through a serverless proxy to protect the API key.
*   **`weather.ts`**: A service for fetching data from WeatherAPI.com. It includes logic to format requests based on user location and parse the response into structured data, including the `WeatherCardData` format.
*   **`location.ts`**: Manages user location detection. It first attempts to use the high-accuracy browser Geolocation API (GPS) and gracefully falls back to a lower-accuracy IP-based location service (`ipapi.co`) if GPS is unavailable or denied.
*   **`browser-compat.ts`**: A crucial utility module that detects browser features (`MediaRecorder`, `getUserMedia`, etc.) and provides user-friendly error messages if a feature is unsupported. This enables graceful degradation for older browsers.
*   **`utils.ts`**: Contains the `cn` utility for merging Tailwind CSS classes and a `sanitizeMarkdown` function to strip markdown syntax from AI responses.

## 4. State Management

The application employs a hybrid state management strategy suitable for its complexity.

*   **Global State**: A single global state, **Language**, is managed via React's Context API (`src/contexts/LanguageContext.tsx`). This allows any component to access the current language (`en` or `jp`) and toggle it.
*   **Server State & Caching**: **TanStack Query** (`@tanstack/react-query`) is integrated at the root of the application (`App.tsx`). While the primary chat flow uses direct `fetch` calls, TanStack Query is available for caching, refetching, and managing the state of asynchronous data from backend services.
*   **Component State**: The majority of the application's state (chat history, input values, loading status) is managed locally within the `Index.tsx` page using React hooks (`useState`, `useRef`). This colocation of state with its view logic simplifies the data flow for the application's primary feature.

## 5. Routing & Navigation

Routing is handled by **React Router v6**. The configuration in `src/App.tsx` is straightforward:

*   `/`: Maps to the main `Index` page component.
*   `*`: A catch-all route that directs any unmatched URL to the `NotFound` page.

The application does not currently implement protected routes or complex lazy-loading, as its primary functionality is contained within a single view.

## 6. Styling System

The UI is built on a robust and modern styling system.

*   **Framework**: **Tailwind CSS** is used for all styling, enabling a utility-first workflow. The configuration is located in `tailwind.config.ts`.
*   **Component Library**: The project uses **`shadcn/ui`**, a collection of accessible and composable components built on Radix UI and styled with Tailwind CSS. These components are not imported as a library but are co-located within the codebase at `src/components/ui/`, allowing for full customization.
*   **Theming**: A theming system based on CSS variables is defined in `src/index.css`, following `shadcn/ui` conventions. This allows for centralized control over the color palette, typography (`IBM Plex Mono`), and other design tokens. The aesthetic is intentionally "brutalist," characterized by sharp edges, high contrast, and a monospaced font.
*   **Responsive Design**: The utility-first nature of Tailwind CSS facilitates a fully responsive, mobile-first design.

## 7. APIs and Data Handling

The frontend interacts with backend services through a secure proxy layer implemented as serverless functions. This prevents exposure of sensitive API keys on the client-side.

*   **Transcription API (`/api/transcribe`)**:
    *   The frontend captures audio, encodes it as a base64 string, and sends it along with its MIME type to this endpoint.
    *   The serverless function forwards the request to the Google Cloud Speech-to-Text API and returns the transcript.
*   **Gemini API (via `GeminiService`)**:
    *   The `GeminiService` constructs a detailed prompt including the user's message, conversation history, language preference, and contextual data (location, weather).
    *   It sends this payload to a serverless proxy (`VITE_GEMINI_PROXY_URL`) or directly to the Gemini API if no proxy is configured.
    *   The service parses the response, checking for a special `[SHOW_WEATHER_CARD]` marker that dictates whether the weather card should be displayed.
*   **Weather API (via `getWeather`)**:
    *   Fetches weather data from a proxy (`VITE_WEATHER_PROXY_URL`) which in turn calls WeatherAPI.com. This keeps the Weather API key secure.
*   **Error Handling**: All asynchronous operations are wrapped in `try...catch` blocks. User-facing errors are displayed using the custom `useToast` hook, providing clear and non-disruptive feedback.
*   **Loading States**: The UI provides comprehensive feedback for all loading states. The `isLoading` and `isCreating` flags control the `BlobAnimation` and disable UI elements to prevent duplicate submissions.

## 8. Testing Strategy

The current version of the codebase does not have an integrated testing framework (`Jest`, `Vitest`, `Cypress`, etc.) configured in `package.json`.

**Recommendation**: For an enterprise-level system, implementing a comprehensive testing strategy is a critical next step. The recommended approach would be:
*   **Unit & Integration Tests**: Use **Vitest** with **React Testing Library** to test individual components, hooks, and utility functions in isolation.
*   **End-to-End (E2E) Tests**: Use **Cypress** or **Playwright** to test critical user flows, such as submitting a text message, completing a voice recording session, and verifying the AI response.
*   **Code Coverage**: Aim for a minimum of 80% test coverage across all critical modules.

## 10. Developer Onboarding Guide

### 10.1. Welcome

Welcome to the Bean Jam Bot project! This guide will help you get your development environment set up and running quickly.

### 10.2. Prerequisites

1.  **Node.js**: Version 18.x or later.
2.  **API Keys**: You will need to obtain the following API keys:
    *   Google Cloud Service Account JSON (for Speech-to-Text).
    *   Google Gemini API Key.
    *   WeatherAPI.com API Key.
3.  **Vercel CLI (Optional)**: `npm install -g vercel` for easy deployment.

### 10.3. Local Development Setup

1.  **Clone the Repository**:
    ```bash
    git clone <repository-url>
    cd bean-jam-bot
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**:
    Create a new file named `.env` in the root of the project and add your API keys. Use the `.gitignore` file as a reference for the variable names. It should look like this:
    ```env
    # Path to your Google Cloud service account JSON file
    GOOGLE_APPLICATION_CREDENTIALS=./src/Keys/your-service-account-file.json

    # API key for Google Gemini
    VITE_GEMINI_API_KEY=AIzaSy...

    # API key for WeatherAPI.com
    VITE_WEATHER_API_KEY=your_weather_api_key
    ```
    *Note: Place your Google Cloud JSON key file in the `src/Keys/` directory.*

4.  **Run the Application**:
    You need to run two processes in separate terminals:
    *   **Terminal 1 (Backend Server)**: Starts the local Express.js proxy for transcription.
        ```bash
        npm run start:server
        ```
    *   **Terminal 2 (Frontend Server)**: Starts the Vite development server.
        ```bash
        npm run dev
        ```

5.  **Access the Application**: Open your browser and navigate to `http://localhost:8080`.

### 10.4. Key Files and Modules

*   **Main UI Logic**: `src/pages/Index.tsx` - This is the heart of the application.
*   **Voice Recording**: `src/hooks/use-audio-recorder.ts` - All microphone and recording logic lives here.
*   **AI Integration**: `src/lib/gemini.ts` - This service class handles all interactions with the Gemini AI.
*   **Backend Proxy (Local)**: `server/index.js` - The Express server that runs locally to proxy transcription requests.
*   **Backend Proxy (Production)**: `api/transcribe.js` (Vercel), `netlify/functions/transcribe.js` (Netlify), `aws-lambda/transcribe/index.js` (AWS).

### 10.5. Contribution Workflow

1.  Create a new feature branch from `main`.
2.  Implement your changes.
3.  **(Action Required)**: Add relevant unit or integration tests for your changes using Vitest and React Testing Library.
4.  Ensure the linter passes: `npm run lint`.
5.  Submit a Pull Request for review.