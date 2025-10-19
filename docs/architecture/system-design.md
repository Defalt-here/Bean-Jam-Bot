# System Architecture & Design: Bean Jam Bot

**Version:** 1.0
**Date:** October 18, 2023
**Author:** System Architect AI

## 1. System Overview

Bean Jam Bot is a modern, full-stack AI chat assistant designed for date and restaurant planning. It provides a conversational interface with bilingual (English/Japanese) support, leveraging voice-to-text transcription for user input. The architecture is built on a serverless-first, multi-cloud model, prioritizing scalability, maintainability, and security by isolating third-party API interactions into a dedicated backend layer.

The system's core purpose is to offer users intelligent recommendations by integrating a powerful language model (Google Gemini) with real-time, location-aware data services like weather and geolocation. The frontend is a responsive React/Vite single-page application (SPA), while the backend consists of a suite of independent, single-purpose serverless functions acting as secure proxies to external APIs.

**High-Level Technologies:**

*   **Frontend**: React, Vite, TypeScript, TailwindCSS
*   **Backend**: Node.js, Serverless Functions (AWS Lambda, Vercel Functions, Netlify Functions)
*   **AI & ML Services**: Google Gemini (Chat), Google Cloud Speech-to-Text (Transcription)
*   **Third-Party Services**: WeatherAPI.com (Weather Data), OpenStreetMap (Reverse Geocoding)
*   **Deployment**: Vercel, Netlify, AWS, Docker

## 2. Architecture Diagram & Data Flow

The system follows a decoupled, microservices-like architecture where the frontend orchestrates calls to various specialized serverless backends. This design ensures that sensitive API keys are never exposed to the client.
![[Pasted image 20251018132113.png]]
### Data Flow Description:

1.  **Voice Transcription**:
    *   The user initiates voice input on the **React SPA**. The browser's `MediaRecorder` API captures audio.
    *   The captured audio is Base64 encoded and sent via an HTTPS POST request to the **Transcribe API** (`/api/transcribe`).
    *   The serverless function receives the audio data and securely calls the **Google Speech-to-Text API**.
    *   Google's API returns the transcript, which the serverless function relays back to the frontend.

2.  **Chat & Weather Integration**:
    *   The frontend first attempts to get the user's location via the browser's Geolocation API, with fallback to an IP-based lookup. If GPS coordinates are obtained, it uses **OpenStreetMap** for reverse geocoding.
    *   If location is available, the frontend calls the **Weather Proxy API** to fetch current weather from **WeatherAPI.com**.
    *   The user's message, conversation history, and the fetched weather data (as a string summary) are sent in a single POST request to the **Gemini Proxy API**.
    *   The Gemini proxy constructs a detailed prompt and securely calls the **Google Gemini API**.
    *   Gemini's response, which may include a special `[SHOW_WEATHER_CARD]` marker, is returned to the frontend.
    *   The frontend parses the response, displaying the text and a weather card if the marker is present.

## 3. Frontend-Backend Interface

The interface between the frontend and backend is a set of RESTful APIs served by serverless functions. Communication is exclusively over HTTPS using JSON payloads.

*   **Transcription Endpoint**: `POST /api/transcribe`
    *   **Request Body**: `{ audioBase64: string, mimeType: string, languageCode: 'en-US' | 'ja-JP' }`
    *   **Response Body**: `{ transcript: string, raw: object }`
*   **Gemini Chat Endpoint**: `POST /api/gemini` (via proxy)
    *   **Request Body**: `{ message: string, language: 'en' | 'jp', conversationHistory: Message[], userLocation?: string, weatherData?: string }`
    *   **Response Body**: `{ response: string, showWeatherCard: boolean }`
*   **Weather Endpoint**: `POST /api/weather` (via proxy)
    *   **Request Body**: `{ q: string, days: number }`
    *   **Response Body**: WeatherAPI.com forecast JSON object.

**Latency Optimization**:
*   The frontend provides immediate user feedback with loading indicators and animations (`isLoading`, `BlobAnimation`).
*   The entire conversation history is passed in each request, making the backend stateless but increasing payload size.
*   Serverless "cold starts" may introduce initial latency, but subsequent requests are fast.

## 4. Infrastructure & Deployment

The system is designed with a flexible, multi-cloud deployment strategy, leveraging serverless computing to minimize operational overhead and scale on demand.

*   **Hosting Model**: The primary model is serverless, with documented support for Vercel, Netlify, and AWS Lambda + API Gateway. This avoids vendor lock-in and allows deployment on the platform that best fits the operational need.
*   **Scaling**: All backend services (transcription, chat, weather) are hosted on serverless platforms, which automatically scale horizontally based on incoming traffic. This is a highly cost-effective and resilient approach.
*   **Monitoring & Logging**:
    *   **AWS**: Detailed execution logs, metrics (invocations, duration, errors), and traces are available via AWS CloudWatch.
    *   **Vercel/Netlify**: Provide built-in dashboards for function logs, invocation analytics, and performance monitoring.
    *   **Frontend**: No explicit client-side logging service is integrated, but browser console logs provide debugging information.
*   **CI/CD**: The repository includes a PowerShell script (`deploy-prod.ps1`) for streamlined Vercel deployments. However, a formal CI/CD pipeline (e.g., GitHub Actions) is not yet configured.

## 5. Security & Compliance

Security is architected around the principle of least privilege and protecting sensitive credentials.

*   **Data Protection**: All API keys and the Google Cloud Service Account JSON are stored as environment variables in the secure configuration of the deployment platform (Vercel, Netlify, AWS). They are never exposed to the frontend client.
*   **Encryption**: All data in transit between the client, backend functions, and third-party APIs is encrypted via HTTPS/TLS.
*   **Authentication**: The system currently operates without user authentication, making it a public-facing service. Access is not restricted.
*   **Backend for Frontend (BFF)**: The serverless functions act as a BFF/Proxy layer, abstracting the complex and sensitive interactions with third-party services from the client.

## 6. Performance & Reliability

The serverless architecture provides a strong foundation for reliability and performance.

*   **Load Balancing**: Handled natively by the serverless provider (AWS ALB, Vercel/Netlify edge network), distributing traffic across function instances.
*   **Redundancy & Failure Recovery**: Serverless functions are inherently fault-tolerant. If an instance fails, the provider automatically provisions a new one to handle subsequent requests. The frontend includes error handling to display toast notifications if an API call fails.
*   **SLA Considerations**: The overall system uptime is a composite of the SLAs of the frontend host (e.g., Vercel) and the third-party APIs (Google Cloud, WeatherAPI.com). High availability is expected due to the reliance on major cloud providers.

## 7. Scalability & Extensibility

The architecture is highly modular and designed for growth.

*   **Scalability**: The use of independent serverless functions for distinct business logic (transcribe, chat, weather) allows each component to scale independently based on its specific load.
*   **Extensibility**: Adding new functionality is straightforward. For example, to add image analysis, a new serverless function (`/api/analyze-image`) could be created and called from the frontend without modifying any existing services. The component-based React architecture on the frontend also allows for easy addition of new UI features.

## 8. Dependencies & Integrations

The system relies on several key external services to deliver its functionality.

*   **Google Cloud Speech-to-Text**: Core service for voice input transcription.
*   **Google Gemini API**: Core service for generating intelligent, conversational responses.
*   **WeatherAPI.com**: Provides real-time and forecast weather data.
*   **OpenStreetMap Nominatim**: A free service used for reverse geocoding to convert GPS coordinates into human-readable city/region names.

## 9. Future Recommendations

While the current architecture is robust and scalable, the following improvements could enhance it further:

1.  **State Management & Caching**:
    *   **Implement Server-Side State**: Instead of passing conversation history on every request, store it server-side using a low-latency database like Redis or DynamoDB, linked to a user session. This will reduce request payload size and improve performance for long conversations.
    *   **Cache Weather Data**: Cache weather API responses for a short TTL (e.g., 15 minutes) based on location query to reduce redundant API calls and lower costs.

2.  **User Authentication & Authorization**:
    *   Integrate an authentication provider (e.g., Auth0, Firebase Auth) to manage users.
    *   This would enable personalized experiences, persistent chat history, and the ability to implement rate limiting on a per-user basis to prevent abuse.

3.  **Real-Time Experience**:
    *   For voice input, migrate from a "record-then-send" model to a streaming model using WebSockets and the Google Speech-to-Text streaming API. This would provide real-time transcription and a more interactive user experience.

4.  **Infrastructure Consolidation & CI/CD**:
    *   While multi-platform support is flexible, for a production system, standardizing on a single cloud provider (e.g., AWS for all functions) would simplify IAM, security policies, and monitoring.
    *   Implement a formal CI/CD pipeline using GitHub Actions to automate testing, building, and deploying both the frontend and serverless functions.

5.  **Enhanced Observability**:
    *   Integrate a dedicated logging and error tracking service like Sentry or Datadog for both frontend and backend to proactively monitor for issues in production.

