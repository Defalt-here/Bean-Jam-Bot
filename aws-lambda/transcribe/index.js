// AWS Lambda function for Google Cloud Speech-to-Text transcription
// This replaces the Express /api/transcribe endpoint with a serverless function

const { SpeechClient } = require('@google-cloud/speech');

// Initialize Google Speech client with credentials from environment variable
let speechClient;

function getSpeechClient() {
  if (!speechClient) {
    const credentialsJSON = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    if (!credentialsJSON) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY environment variable not set');
    }
    
    try {
      const credentials = JSON.parse(credentialsJSON);
      speechClient = new SpeechClient({ credentials });
    } catch (error) {
      throw new Error('Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY JSON: ' + error.message);
    }
  }
  return speechClient;
}

function mimeToEncoding(mimeType) {
  if (!mimeType) return 'LINEAR16';
  const mt = mimeType.toLowerCase();
  if (mt.includes('webm') || mt.includes('opus')) return 'WEBM_OPUS';
  if (mt.includes('ogg')) return 'OGG_OPUS';
  if (mt.includes('wav')) return 'LINEAR16';
  if (mt.includes('flac')) return 'FLAC';
  return 'LINEAR16';
}

// Normalize method and body across API Gateway REST (v1), HTTP API (v2), and Lambda URLs
function getHttpMethod(event) {
  // REST API / Lambda URL style
  if (event.httpMethod) return event.httpMethod;
  // HTTP API (payload v2.0)
  if (event.requestContext && event.requestContext.http && event.requestContext.http.method) {
    return event.requestContext.http.method;
  }
  return undefined;
}

function getJsonBody(event) {
  if (!event || event.body == null) return {};
  try {
    const raw = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64').toString('utf8')
      : event.body;
    return typeof raw === 'string' ? JSON.parse(raw || '{}') : raw;
  } catch (e) {
    // Fallback to empty object if parsing fails
    return {};
  }
}

exports.handler = async (event) => {
  console.log('Transcribe Lambda invoked');
  
  // CORS headers for browser requests
  // IMPORTANT: For Lambda Function URLs, configure CORS in the Function URL settings.
  // Do not set Access-Control-* headers here to avoid duplicate headers.
  const headers = {
    'Content-Type': 'application/json',
  };

  // Derive HTTP method; if missing but a body exists, assume POST (some integrations omit method)
  let method = getHttpMethod(event);
  method = method ? method.toUpperCase() : (event && event.body ? 'POST' : undefined);

  // Handle preflight OPTIONS request
  if (method === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: '',
    };
  }

  // Only accept POST requests
  if (method !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse request body
    const body = getJsonBody(event);
    const { audioBase64, mimeType, languageCode = 'en-US' } = body;

    if (!audioBase64) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'audioBase64 required' }),
      };
    }

    // Clean base64 string (remove data URI prefix if present)
    const base64 = audioBase64.replace(/^data:.*;base64,/, '');

    // Determine audio encoding from MIME type
    const encoding = mimeToEncoding(mimeType);

    // Configure Google Speech recognition
    const config = {
      encoding,
      languageCode,
      enableAutomaticPunctuation: true,
    };

    // WEBM_OPUS and OGG_OPUS require explicit sample rate
    if (encoding === 'WEBM_OPUS' || encoding === 'OGG_OPUS') {
      config.sampleRateHertz = 48000;
    }

    const request = {
      audio: { content: base64 },
      config,
    };

    // Call Google Cloud Speech-to-Text API
    const client = getSpeechClient();
    console.log('Calling Google Speech-to-Text API...');
    const [response] = await client.recognize(request);

    // Extract transcript from response
    const transcript = (response.results || [])
      .map(r => (r.alternatives && r.alternatives[0] && r.alternatives[0].transcript) || '')
      .filter(Boolean)
      .join(' ');

    console.log('Transcription successful:', transcript.substring(0, 50) + '...');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ transcript, raw: response }),
    };

  } catch (error) {
    console.error('Transcription error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error.message || 'Internal server error',
        type: error.name || 'Error',
      }),
    };
  }
};
