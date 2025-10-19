# Gemini-Driven Weather Card Display

## Overview
The weather card display is now controlled by Gemini AI, allowing it to intelligently decide when weather information is relevant to show the user.

## How It Works

### 1. Weather Data Collection
- Weather data is **always fetched** when a user sends a message (if location is available)
- The app passes current weather information to Gemini as context
- Date parsing still extracts forecast days from user messages (today, tomorrow, etc.)

### 2. Gemini Decision Making
Gemini receives weather data in its system instruction:
```
Current weather data: [detailed weather info]
IMPORTANT: If the user asks about weather-related questions, 
you MUST start your response with [SHOW_WEATHER_CARD] marker.
```

### 3. Response Parsing
When Gemini responds:
- The app checks for the `[SHOW_WEATHER_CARD]` marker in the response
- If found: Display the weather card + Gemini's commentary
- If not found: Display only Gemini's response (no card)

### 4. Smart Detection
Gemini can now detect weather-related questions more intelligently:
- Direct: "What's the weather today?"
- Indirect: "Should I bring an umbrella?"
- Contextual: "Is it a good day for a picnic?"
- Multi-language: "今日の天気はどうですか？"

## Architecture

```
User Message
    ↓
[Always fetch weather data if location available]
    ↓
Pass weather + location to Gemini
    ↓
Gemini analyzes if weather card is relevant
    ↓
    ├─ Weather relevant → Response includes [SHOW_WEATHER_CARD]
    │                     → Display card + commentary
    │
    └─ Not relevant → Normal response
                     → Display only text
```

## Benefits

### 1. **Smarter Detection**
- Gemini understands context better than keyword matching
- Can detect indirect weather questions
- Works across different phrasings and languages

### 2. **No False Positives**
- Keywords like "cloud" in "cloud storage" won't trigger weather card
- Gemini uses context to determine relevance

### 3. **Better UX**
- Weather card only shows when actually needed
- Natural conversation flow
- AI decides best presentation

### 4. **Flexibility**
- Gemini can show weather for:
  - Direct weather questions
  - Activity planning questions
  - Travel advice
  - Any context where weather matters

## Example Interactions

### Weather Relevant (Card Shows)
**User:** "Should I bring a jacket today?"
**Gemini Response:** 
```
[SHOW_WEATHER_CARD]
It's 15°C and cloudy today, so I'd recommend bringing a light jacket. 
There's a 30% chance of rain, so you might want to grab an umbrella too!
```
**Display:** Weather card + commentary

### Not Weather Relevant (No Card)
**User:** "What's cloud computing?"
**Gemini Response:**
```
Cloud computing refers to the delivery of computing services...
```
**Display:** Text only (even though "cloud" mentioned)

## Technical Implementation

### Modified Files

1. **`src/lib/gemini.ts`**
   - Changed return type to `{ response: string; showWeatherCard: boolean }`
   - Added `[SHOW_WEATHER_CARD]` marker detection
   - Updated system instruction with card display rules

2. **`src/pages/Index.tsx`**
   - Removed keyword-based weather detection
   - Always fetch weather data when location available
   - Check `result.showWeatherCard` flag to determine card display
   - Pass weatherCardData only when Gemini indicates

### Marker Protocol
- **Marker:** `[SHOW_WEATHER_CARD]`
- **Position:** Anywhere in Gemini's response
- **Processing:** Removed from final display text
- **Action:** Triggers weather card rendering

## Future Enhancements

1. **Multiple Card Types**
   - Add markers for different data visualizations
   - `[SHOW_MAP]`, `[SHOW_CHART]`, etc.

2. **Card Configuration**
   - Let Gemini specify which weather details to emphasize
   - `[SHOW_WEATHER_CARD:forecast=3days]`

3. **Dynamic Updates**
   - Real-time weather updates in conversation
   - Automatic refresh for long conversations

4. **Historical Context**
   - Remember when weather was last shown
   - Avoid redundant card displays
