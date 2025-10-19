# Bean Jam Bot - Technical Documentation

## 1. System Overview

The Bean Jam Bot backend is a modern, serverless-first system designed as a **Backend-for-Frontend (BFF)** and secure proxy layer. It orchestrates communication between the client-side application and various third-party AI and data services.

### 1.1. Architecture

The architecture is built on **Node.js** and embraces a microservices-oriented approach, with core functionalities encapsulated into distinct, independently deployable services. The system is designed for high scalability and flexibility, supporting multiple deployment targets:

*   **Serverless Functions**: The primary deployment strategy, with support for Vercel, Netlify, and AWS Lambda. This approach offers pay-per-use scalability and minimal operational overhead.
*   **Containerization**: A Dockerized Node.js/Express application is available for traditional container orchestration platforms like Google Cloud Run, AWS ECS, or Kubernetes.
*   **Local Development**: A simple Express server mirrors the production API, enabling seamless local development and testing.

### 1.2. Core Responsibilities

The backend is stateless and serves three primary functions:

1.  **Secure Credential Management**: It securely stores and utilizes API keys and service account credentials for third-party services, preventing their exposure on the client side.
2.  **API Proxying**: It acts as a proxy to external APIs (Google Gemini, WeatherAPI.com), simplifying client-side logic and managing CORS.
3.  **Business Logic & Data Processing**: It handles logic that is unsuitable for the client, such as audio data formatting for transcription and constructing complex prompts for the Gemini AI.

## 2. Project Structure

The backend code is organized by deployment target, with shared logic patterns across each implementation.

```plaintext
.
├── api/                    # Vercel Serverless Functions
│   └── transcribe.js       # Transcription endpoint for Vercel
├── aws-lambda/             # AWS Lambda Functions (most complete implementation)
│   ├── gemini/             # Gemini AI Proxy Service
│   │   └── index.js
│   ├── transcribe/         # Transcription Service
│   │   ├── index.js
│   │   └── package.json
│   ├── weather/            # Weather API Proxy Service
│   │   └── index.js
│   └── DEPLOY.md           # AWS deployment guide
├── netlify/                # Netlify Functions
│   └── functions/
│       └── transcribe.js   # Transcription endpoint for Netlify
├── server/                 # Local/Docker Express Server
│   └── index.js
└── Dockerfile              # Docker configuration for the Express server
```

*   **`aws-lambda/`**: Contains the most comprehensive set of backend services, each as a separate Lambda function. This represents the full microservices architecture.
*   **`api/` & `netlify/`**: Provide simplified, single-function implementations for easy deployment on Vercel and Netlify platforms, respectively.
*   **`server/`**: A monolithic Express server for local development that mimics the `transcribe` API.
*   **`Dockerfile`**: Packages the `server/` application for container-based deployments.

## 3. Core Modules and Services

The backend consists of three main services, each with a dedicated responsibility.

### 3.1. Transcription Service

This service processes audio data from the client and transcribes it into text using Google Cloud Speech-to-Text.

*   **Implementations**:
    *   `aws-lambda/transcribe/index.js`
    *   `api/transcribe.js` (Vercel)
    *   `netlify/functions/transcribe.js`
    *   `server/index.js` (Express)
*   **Key Logic**:
    1.  Receives a POST request with base64-encoded audio, its MIME type, and a language code.
    2.  Initializes the `@google-cloud/speech` client using credentials stored securely in environment variables.
    3.  A `mimeToEncoding` helper function intelligently maps browser-specific audio MIME types (e.g., `audio/webm;codecs=opus`, `audio/wav`) to the corresponding encoding format required by the Google Cloud API (e.g., `WEBM_OPUS`, `LINEAR16`).
    4.  It correctly configures the `sampleRateHertz` for Opus-based codecs, which is a critical requirement for accurate transcription.
    5.  The audio content is sent to the Google Cloud `recognize` endpoint.
    6.  The response is parsed to extract and concatenate the final transcript, which is returned to the client.

### 3.2. Gemini AI Proxy Service

This service provides a secure interface to the Google Gemini API, constructing context-rich prompts to generate intelligent chat responses.

*   **Implementation**: `aws-lambda/gemini/index.js`
*   **Key Logic**:
    1.  Receives the user's message, conversation history, language, and optional context (location, weather).
    2.  Authenticates with the Gemini API using a server-side `GEMINI_API_KEY`.
    3.  Dynamically builds a detailed system instruction that defines the AI's persona, language, and includes the user's current location and weather data.
    4.  **UI Control Logic**: The system instruction includes a special directive for the AI to prepend its response with the marker `[SHOW_WEATHER_CARD]` if the user's query is weather-related. This allows the AI to control UI components on the frontend.
    5.  The full conversation history is formatted and sent along with the new message to maintain context.
    6.  The response from Gemini is parsed, the `[SHOW_WEATHER_CARD]` marker is removed from the text, and the final payload `{ response: string, showWeatherCard: boolean }` is returned to the client.

### 3.3. Weather API Proxy Service

This service securely fetches weather data from WeatherAPI.com based on the user's location.

*   **Implementation**: `aws-lambda/weather/index.js`
*   **Key Logic**:
    1.  Accepts a location query (`q`) and number of forecast days (`days`) via GET or POST methods.
    2.  Uses a server-side `WEATHER_API_KEY` to authenticate with WeatherAPI.com.
    3.  Forwards the request to the `forecast.json` endpoint of the WeatherAPI.
    4.  Returns the unmodified JSON response from the WeatherAPI directly to the client.

## 4. API Documentation

### Transcription Endpoint

*   **Endpoint**: `POST /api/transcribe` (Vercel/Netlify/Local) or `POST /transcribe` (AWS API Gateway)
*   **Description**: Transcribes a base64-encoded audio clip into text.
*   **Request Body**: `application/json`

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `audioBase64` | `string` | Yes | The raw base64-encoded audio data. |
| `mimeType` | `string` | Yes | The MIME type of the audio (e.g., `audio/webm;codecs=opus`). |
| `languageCode` | `string` | No | BCP-47 language code (e.g., `en-US`, `ja-JP`). Defaults to `en-US`. |

*   **Success Response (200 OK)**:

```json
{
  "transcript": "hello world",
  "raw": { ... }
}
```

*   **Error Response (4xx/5xx)**:

```json
{
  "error": "A detailed error message."
}
```

*   **Example `curl` Request**:

```bash
curl -X POST https://<your-api-url>/transcribe \
-H "Content-Type: application/json" \
-d '{
  "audioBase64": "UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACAB...",
  "mimeType": "audio/wav",
  "languageCode": "en-US"
}'
```

---
### Gemini AI Endpoint

*   **Endpoint**: `POST /gemini` (AWS API Gateway)
*   **Description**: Generates a chat response from the Gemini AI model.
*   **Request Body**: `application/json`

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `message` | `string` | Yes | The user's current text message. |
| `language` | `string` | No | `en` or `jp`. Defaults to `en`. |
| `conversationHistory` | `Array<object>` | No | Array of `{ content: string, isUser: boolean }` objects. |
| `userLocation` | `string` | No | Formatted location string for AI context. |
| `weatherData` | `string` | No | Formatted weather summary for AI context. |

*   **Success Response (200 OK)**:

```json
{
  "response": "Here are some great spots for a date...",
  "showWeatherCard": false
}
```

---
### Weather Endpoint

*   **Endpoint**: `GET|POST /weather` (AWS API Gateway)
*   **Description**: Fetches weather forecast data.
*   **GET Request Query Parameters**:

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `q` | `string` | Yes | Location query (e.g., "Paris" or "48.85,2.35"). |
| `days` | `string` | No | Number of forecast days. Defaults to `1`. |

*   **POST Request Body**: `application/json`

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `q` | `string` | Yes | Location query. |
| `days` | `number` | No | Number of forecast days. Defaults to `1`. |

*   **Success Response (200 OK)**:
    *   Returns the raw JSON response directly from the WeatherAPI.com service.

## 5. Database Layer

The backend is **stateless**. There is no database, as all conversation history and state are managed on the client side and passed with each API request as needed.

## 6. Error Handling & Logging

*   **Error Handling**: Each service uses standard `try...catch` blocks. On failure, the error is logged to the console, and a standardized JSON error object `{ "error": "message" }` is returned to the client with an appropriate HTTP status code (typically `400` for client errors or `500` for server errors).
*   **Logging**: The system uses `console.log` and `console.error` for logging. In serverless environments, these outputs are automatically captured by the platform's logging solution (e.g., AWS CloudWatch, Vercel Logs), providing centralized monitoring and debugging capabilities.

## 7. Configuration & Environment Variables

The backend is configured entirely through environment variables, ensuring no sensitive information is hardcoded.

| Variable Name | Service(s) Used | Description |
| :--- | :--- | :--- |
| `GOOGLE_APPLICATION_CREDENTIALS_JSON` or `GOOGLE_SERVICE_ACCOUNT_KEY` | Transcription | The complete JSON content of the Google Cloud service account key. |
| `GEMINI_API_KEY` | Gemini AI | The API key for the Google Gemini service. |
| `WEATHER_API_KEY` | Weather | The API key for the WeatherAPI.com service. |
| `PORT` | Local Express Server | The port for the local development server to run on. Defaults to `3001`. |

## 8. Background Jobs & Queues

The system does not currently implement any asynchronous background jobs or message queues. All API requests are processed synchronously.

## 9. Testing & QA

The provided codebase does not include automated test suites. For production readiness, the following should be implemented:

*   **Unit Tests**: For helper functions like `mimeToEncoding` and `buildSystemInstruction` using a framework like Jest or Vitest.
*   **Integration Tests**: To validate the entire request/response flow of each API endpoint, mocking the external service calls.
*   **CI/CD**: A pipeline should be configured to automatically run linting and testing on every pull request.

## 10. Deployment

The backend is architected for flexible deployment. The repository contains detailed guides and configuration files for multiple targets.

*   **Vercel: The simplest deployment method. The frontend and transcription service are deployed together from a single repository. Configuration is managed by `vercel.json` and `netlify.toml`.
*   **AWS Lambda**: The most robust and scalable option, deploying each service as an independent Lambda function behind an API Gateway. The `aws-lambda/DEPLOY.md` file contains a comprehensive guide for this setup.
*   **Docker: The `Dockerfile` allows for packaging the Express server. This container can be deployed to any platform that supports Docker, such as Google Cloud Run, AWS ECS, or a traditional VM.

## 11. Developer Guide

### 11.1. Local Setup and Onboarding

1.  **Clone the Repository**:
    ```bash
    git clone <repository_url>
    cd bean-jam-bot
    ```
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Configure Environment**:
    *   Create a `.env` file in the root directory.
    *   Copy the contents of `.env.example` (if available) or add the variables listed in Section 8.
    *   For `GOOGLE_APPLICATION_CREDENTIALS`, provide the local file path to your service account key.
4.  **Run the Services**:
    *   **Terminal 1 (Backend)**: Start the local transcription server.
        ```bash
        npm run start:server
        ```
    *   **Terminal 2 (Frontend)**: Start the Vite development server.
        ```bash
        npm run dev
        ```
5.  **Access the Application**: Open `http://localhost:8080` in your browser.

### 11.2. Contribution Standards

*   **Code Style**: The project uses ESLint. Please run `npm run lint` and resolve any issues before submitting code.
*   **Branching Strategy**: Use a feature-branching workflow.
    *   Create branches from `main` using a convention like `feature/new-chat-ui` or `bugfix/transcription-error`.
*   **Pull Request (PR) Process**:
    1.  Create your feature branch and commit your changes.
    2.  Push your branch to the remote repository.
    3.  Open a Pull Request against the `main` branch.
    4.  Provide a clear title and a detailed description of the changes.
    5.  (Future) Await for CI checks (linting, testing) to pass.
    6.  Request a review from at least one other team member.
    7.  Once approved and all checks have passed, the PR can be merged.