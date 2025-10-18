// AWS Lambda: Gemini proxy
// Accepts POST with { message, language, conversationHistory, userLocation, weatherData }
// Uses server-side GEMINI_API_KEY to call Google Generative Language API.

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const MODEL = 'gemini-2.5-flash';

function buildSystemInstruction(language, userLocation, weatherData) {
  let systemInstruction = language === 'en'
    ? 'You are a helpful and friendly AI restaurant/dating spot recommending assistant. Respond in English with clear, concise, and natural language. Dont ask too many questions about exact preferences and try to reply with general responses unless asked otherwise. Be conversational and engaging. Help with date/outing planning itinerary planning. Dont use any markdown formatting like **'
    : 'あなたは親切でフレンドリーなレストラン・デートスポット推薦AIアシスタントです。明確で簡潔な自然な日本語で応答してください。具体的な好みについて多くの質問をせず、特に求められない限り一般的な回答を心がけてください。会話的で魅力的であるように。デート・お出かけの計画や旅程計画のサポートを行ってください。**のようなマークダウン形式は使用しないでください。';

  if (userLocation) {
    systemInstruction += language === 'en'
      ? ` The user is located in ${userLocation}. You can reference their location when relevant.`
      : ` ユーザーは${userLocation}にいます。関連する場合は、その場所を参照できます。`;
  }
  if (weatherData) {
    systemInstruction += language === 'en'
      ? ` Current weather data: ${weatherData}. Use this information to answer weather-related questions naturally. IMPORTANT: If the user asks about weather, temperature, forecast, or any weather-related question, you MUST start your response with the exact marker "[SHOW_WEATHER_CARD]" (without quotes) on its own line, followed by your natural language response. This marker tells the system to display a weather card with detailed information.`
      : ` 現在の天気データ: ${weatherData}。天気に関する質問に自然に答えるために、この情報を使用してください。重要: ユーザーが天気、気温、予報、またはその他の天気関連の質問をした場合、応答の最初に正確なマーカー「[SHOW_WEATHER_CARD]」（引用符なし）を単独の行に配置し、その後に自然な言語応答を続ける必要があります。このマーカーは、システムに詳細情報を含む天気カードを表示するように指示します。`;
  }
  return systemInstruction;
}

exports.handler = async (event) => {
  // For API Gateway HTTP API v2, method is in requestContext.http.method
  const method = (event && event.requestContext && event.requestContext.http && event.requestContext.http.method) || event.httpMethod || (event.body ? 'POST' : undefined);
  const headers = { 'Content-Type': 'application/json' };

  if (method === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }
  if (method !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

    const raw = event.isBase64Encoded ? Buffer.from(event.body || '', 'base64').toString('utf8') : (event.body || '{}');
    const body = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const { message, language = 'en', conversationHistory = [], userLocation, weatherData } = body || {};
    if (!message) return { statusCode: 400, headers, body: JSON.stringify({ error: 'message required' }) };

    const systemInstruction = buildSystemInstruction(language, userLocation, weatherData);
    const contents = [];
    contents.push({ role: 'user', parts: [{ text: systemInstruction }] });
    contents.push({ role: 'model', parts: [{ text: language === 'en' ? 'Understood. I will respond in English.' : '承知しました。日本語で応答します。' }] });
    (conversationHistory || []).forEach((msg) => {
      contents.push({ role: msg.isUser ? 'user' : 'model', parts: [{ text: msg.content }] });
    });
    contents.push({ role: 'user', parts: [{ text: message }] });

    const requestBody = {
      contents,
      generationConfig: { temperature: 0.9, topK: 40, topP: 0.95, maxOutputTokens: 1024 }
    };

    const resp = await fetch(`${BASE_URL}/models/${MODEL}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      return { statusCode: resp.status, headers, body: JSON.stringify({ error: err.error?.message || resp.statusText }) };
    }
    const data = await resp.json();
    const parts = data?.candidates?.[0]?.content?.parts || [];
    let responseText = parts.map(p => p.text || '').join('');
    const weatherMarker = '[SHOW_WEATHER_CARD]';
    const showWeatherCard = responseText.includes(weatherMarker);
    if (showWeatherCard) responseText = responseText.replace(weatherMarker, '').trim();

    return { statusCode: 200, headers, body: JSON.stringify({ response: responseText, showWeatherCard }) };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message || 'Internal error' }) };
  }
};
