/**
 * Google Gemini API integration
 * Uses the Gemini API to generate chat responses
 */

interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

interface GeminiRequest {
  contents: GeminiMessage[];
  generationConfig?: {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
  };
}

interface GeminiResponse {
  candidates?: Array<{
    content: {
      parts: Array<{ text: string }>;
      role: string;
    };
    finishReason: string;
  }>;
  error?: {
    message: string;
    code: number;
  };
}

export class GeminiService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
  private model = 'gemini-2.5-flash';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Generate a chat response from Gemini
   * @param message - The user's message
   * @param language - Language preference ('en' or 'jp')
   * @param conversationHistory - Previous messages for context
   * @param userLocation - Optional user location for context
   * @param weatherData - Optional weather data for context
   * @returns Object containing response text and whether to show weather card
   */
  async generateResponse(
    message: string,
    language: 'en' | 'jp',
    conversationHistory: Array<{ content: string; isUser: boolean }> = [],
    userLocation?: string,
    weatherData?: string
  ): Promise<{ response: string; showWeatherCard: boolean }> {
    if (!this.apiKey || this.apiKey === '') {
      throw new Error('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
    }

    // Build system instruction based on language
    let systemInstruction = language === 'en'
      ? 'You are a helpful and friendly AI assistant. Respond in English with clear, concise, and natural language. Be conversational and engaging. Dont use any markdown formatting like **'
      : 'あなたは親切でフレンドリーなAIアシスタントです。日本語で明確で簡潔な自然な言葉で応答してください。会話的で魅力的であるように心がけてください。';

    // Add location context if available
    if (userLocation) {
      systemInstruction += language === 'en'
        ? ` The user is located in ${userLocation}. You can reference their location when relevant.`
        : ` ユーザーは${userLocation}にいます。関連する場合は、その場所を参照できます。`;
    }

    // Add weather context if available with special instruction for card display
    if (weatherData) {
      systemInstruction += language === 'en'
        ? ` Current weather data: ${weatherData}. Use this information to answer weather-related questions naturally. IMPORTANT: If the user asks about weather, temperature, forecast, or any weather-related question, you MUST start your response with the exact marker "[SHOW_WEATHER_CARD]" (without quotes) on its own line, followed by your natural language response. This marker tells the system to display a weather card with detailed information.`
        : ` 現在の天気データ: ${weatherData}。天気に関する質問に自然に答えるために、この情報を使用してください。重要: ユーザーが天気、気温、予報、またはその他の天気関連の質問をした場合、応答の最初に正確なマーカー「[SHOW_WEATHER_CARD]」（引用符なし）を単独の行に配置し、その後に自然な言語応答を続ける必要があります。このマーカーは、システムに詳細情報を含む天気カードを表示するように指示します。`;
    }

    // Build conversation history for context
    const contents: GeminiMessage[] = [];

    // Add system instruction as first user message (Gemini doesn't have system role)
    contents.push({
      role: 'user',
      parts: [{ text: systemInstruction }],
    });

    contents.push({
      role: 'model',
      parts: [{ text: language === 'en' ? 'Understood. I will respond in English.' : '承知しました。日本語で応答します。' }],
    });

    // Add conversation history
    conversationHistory.forEach((msg) => {
      contents.push({
        role: msg.isUser ? 'user' : 'model',
        parts: [{ text: msg.content }],
      });
    });

    // Add current message
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const requestBody: GeminiRequest = {
      contents,
      generationConfig: {
        temperature: 0.9,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    };

    try {
      const response = await fetch(
        `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message || `Gemini API error: ${response.status} ${response.statusText}`
        );
      }

      const data: GeminiResponse = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response generated from Gemini');
      }

      const textParts = data.candidates[0].content.parts;
      let responseText = textParts.map(part => part.text).join('');

      // Check if Gemini wants to show the weather card
      const weatherMarker = '[SHOW_WEATHER_CARD]';
      const showWeatherCard = responseText.includes(weatherMarker);
      
      // Remove the marker from the response text
      if (showWeatherCard) {
        responseText = responseText.replace(weatherMarker, '').trim();
      }

      return {
        response: responseText,
        showWeatherCard
      };
    } catch (error) {
      console.error('Gemini API Error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to communicate with Gemini API');
    }
  }
}

// Singleton instance
let geminiInstance: GeminiService | null = null;

export const getGeminiService = (): GeminiService => {
  if (!geminiInstance) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    geminiInstance = new GeminiService(apiKey);
  }
  return geminiInstance;
};
