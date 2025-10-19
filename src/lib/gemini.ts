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
      ? 'You are a helpful and friendly AI restaurant/dating spot recommending assistant. Respond in English with clear, concise, and natural language. Dont ask too many questions about exact preferences and try to reply with general responses unless asked otherwise. Be conversational and engaging. Help with date/outing planning itinerary planning. Dont use any markdown formatting like **. When providing multiple recommendations or options, format them as a numbered list (1. 2. 3.) or bullet points (- or •). Break long paragraphs into shorter, readable sections with blank lines between them.'
      : 'あなたは親切でフレンドリーなレストラン・デートスポット推薦AIアシスタントです。明確で簡潔な自然な日本語で応答してください。具体的な好みについて多くの質問をせず、特に求められない限り一般的な回答を心がけてください。会話的で魅力的であるように。デート・お出かけの計画や旅程計画のサポートを行ってください。**のようなマークダウン形式は使用しないでください。複数の推薦やオプションを提供する場合は、番号付きリスト（1. 2. 3.）または箇条書き（- または •）として書式設定してください。長い段落は、空白行で区切られた短い読みやすいセクションに分割してください。';

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
      // If a proxy URL is configured, use it (API Gateway + Lambda); otherwise call Google directly
      const proxyUrl = (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_GEMINI_PROXY_URL;
      let response: Response;
      if (proxyUrl) {
        const proxyBody = {
          message,
          language,
          conversationHistory,
          userLocation,
          weatherData,
        };
        response = await fetch(proxyUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(proxyBody),
        });
      } else {
        response = await fetch(
          `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          }
        );
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message || `Gemini API error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      // If using proxy, response is already formatted { response, showWeatherCard }
      if (proxyUrl) {
        if (!data.response) {
          throw new Error('No response from proxy');
        }
        // Sanitize markdown-like formatting to avoid stray * or code fences in UI
        const { sanitizeMarkdown } = await import('./utils');
        const cleanText = sanitizeMarkdown(data.response);
        return {
          response: cleanText,
          showWeatherCard: data.showWeatherCard || false
        };
      }

      // Direct Gemini API response shape
      const geminiData = data as GeminiResponse;
      if (geminiData.error) {
        throw new Error(geminiData.error.message);
      }

      if (!geminiData.candidates || geminiData.candidates.length === 0) {
        throw new Error('No response generated from Gemini');
      }

      const textParts = geminiData.candidates[0].content.parts;
      let responseText = textParts.map(part => part.text).join('');

      // Check if Gemini wants to show the weather card
      const weatherMarker = '[SHOW_WEATHER_CARD]';
      const showWeatherCard = responseText.includes(weatherMarker);
      
      // Remove the marker from the response text
      if (showWeatherCard) {
        responseText = responseText.replace(weatherMarker, '').trim();
      }

      // Sanitize markdown-like formatting to avoid stray * or code fences in UI
      const { sanitizeMarkdown } = await import('./utils');
      const cleanText = sanitizeMarkdown(responseText);

      return {
        response: cleanText,
        showWeatherCard
      };
    } catch (error) {
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
