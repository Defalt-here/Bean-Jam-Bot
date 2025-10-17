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

exports.handler = async (event) => {
  console.log('Transcribe Lambda invoked');
  
  // CORS headers for browser requests
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Only accept POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse request body
    const body = JSON.parse(event.body || '{}');
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
