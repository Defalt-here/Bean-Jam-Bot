# Mermaid Diagram Examples

This page demonstrates various Mermaid diagrams supported in the documentation.

## System Architecture

```mermaid
graph TB
    User[User Browser] --> React[React Frontend]
    React --> Lambda[AWS Lambda Functions]
    Lambda --> Gemini[Google Gemini API]
    Lambda --> Speech[Google Speech-to-Text]
    Lambda --> Weather[WeatherAPI.com]
    React --> Location[Location Services]
    Location --> GPS[GPS/Geolocation]
    Location --> IP[IP-based Location]
```

## Request Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant L as Lambda
    participant G as Gemini AI
    
    U->>F: Voice Input
    F->>L: Transcribe Audio
    L->>F: Return Text
    F->>L: Send Message + Context
    L->>G: Generate Response
    G->>L: AI Response
    L->>F: Formatted Response
    F->>U: Display + Weather Card
```

## Component Structure

```mermaid
graph LR
    Index[Index Page] --> Blob[BlobAnimation]
    Index --> Chat[ChatMessage]
    Index --> Lang[LanguageToggle]
    Index --> Weather[WeatherCard]
    Index --> Hooks[Custom Hooks]
    Hooks --> Audio[use-audio-recorder]
    Hooks --> Level[use-audio-level]
```

## Deployment Pipeline

```mermaid
graph LR
    A[Code Push] --> B[GitHub]
    B --> C[GitHub Actions]
    C --> D{Build Success?}
    D -->|Yes| E[Deploy to GitHub Pages]
    D -->|No| F[Notify Developer]
    E --> G[Live Documentation]
```

## State Management

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Recording: Start Recording
    Recording --> Processing: Stop Recording
    Processing --> Transcribing: Upload Audio
    Transcribing --> Responding: Send to Gemini
    Responding --> DisplayResult: Receive Response
    DisplayResult --> Idle: Complete
    Recording --> Idle: Cancel
    Processing --> Idle: Error
```

## API Integration Flow

```mermaid
flowchart TD
    Start([User Interaction]) --> Input{Input Type?}
    Input -->|Text| TextMsg[Text Message]
    Input -->|Voice| VoiceRec[Voice Recording]
    
    VoiceRec --> Transcribe[AWS Lambda Transcribe]
    Transcribe --> TextMsg
    
    TextMsg --> Location[Get Location]
    Location --> Weather[Fetch Weather Data]
    Weather --> Context[Build Context]
    
    Context --> Gemini[Send to Gemini AI]
    Gemini --> Parse[Parse Response]
    Parse --> Display[Display to User]
    Display --> End([Complete])
```

## Tech Stack

```mermaid
mindmap
  root((Bean Jam Bot))
    Frontend
      React 18
      TypeScript
      Vite
      Tailwind CSS
      Framer Motion
    Backend
      AWS Lambda
      Node.js 20.x
      Serverless
    APIs
      Google Gemini Pro
      Google Speech-to-Text
      WeatherAPI.com
      OpenStreetMap
    Features
      Voice Recognition
      Bilingual Support
      Weather Integration
      Location Services
```

## Class Diagram

```mermaid
classDiagram
    class GeminiService {
        -apiKey: string
        -model: GenerativeModel
        +generateResponse()
        +sanitizeMarkdown()
    }
    
    class LocationService {
        +getUserLocation()
        +getGPSLocation()
        +getIPLocation()
    }
    
    class WeatherService {
        +getWeather()
        +formatWeatherSummary()
        +extractWeatherCardData()
    }
    
    class AudioRecorder {
        -mediaRef: MediaRecorder
        +start()
        +stop()
        +sendToServer()
    }
    
    GeminiService --> WeatherService: uses
    GeminiService --> LocationService: uses
    AudioRecorder --> GeminiService: transcribed text
```

## Gantt Chart - Development Timeline

```mermaid
gantt
    title Bean Jam Bot Development
    dateFormat  YYYY-MM-DD
    section Phase 1
    Core Chat Interface           :2025-01-01, 7d
    Gemini Integration           :2025-01-08, 5d
    section Phase 2
    Voice Recording              :2025-01-13, 7d
    Speech-to-Text              :2025-01-20, 5d
    section Phase 3
    Location Services            :2025-01-25, 5d
    Weather Integration          :2025-01-30, 5d
    section Phase 4
    Bilingual Support            :2025-02-04, 7d
    UI Polish                    :2025-02-11, 7d
    section Deployment
    AWS Lambda Setup             :2025-02-18, 5d
    Production Deployment        :2025-02-23, 3d
```

## Entity Relationship

```mermaid
erDiagram
    USER ||--o{ MESSAGE : sends
    MESSAGE ||--|| RESPONSE : receives
    RESPONSE ||--o| WEATHER_CARD : includes
    USER ||--|| LOCATION : has
    LOCATION ||--|| WEATHER : fetches
    
    USER {
        string language
        array messages
        boolean isRecording
    }
    
    MESSAGE {
        string content
        boolean isUser
        datetime timestamp
    }
    
    RESPONSE {
        string text
        boolean showWeatherCard
    }
    
    WEATHER_CARD {
        string location
        float temperature
        string condition
        int humidity
    }
```

---

**Note:** All these diagrams are rendered using Mermaid.js, which is now fully supported in the documentation!
