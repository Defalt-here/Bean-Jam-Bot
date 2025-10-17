import { SpeechClient } from '@google-cloud/speech';

const credentialsJSON = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
let credentials;

if (credentialsJSON) {
  try {
    credentials = JSON.parse(credentialsJSON);
  } catch (e) {
    console.error('Failed to parse credentials JSON', e);
  }
}

const client = new SpeechClient(credentials ? { credentials } : {});

function mimeToEncoding(mimeType) {
  if (!mimeType) return 'LINEAR16';
  const mt = mimeType.toLowerCase();
  if (mt.includes('webm') || mt.includes('opus')) return 'WEBM_OPUS';
  if (mt.includes('ogg') || mt.includes('opus')) return 'OGG_OPUS';
  if (mt.includes('wav')) return 'LINEAR16';
  if (mt.includes('flac')) return 'FLAC';
  return 'LINEAR16';
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { audioBase64, mimeType, languageCode = 'en-US' } = JSON.parse(event.body);

    if (!audioBase64) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'audioBase64 required' }),
      };
    }

    const base64 = audioBase64.replace(/^data:.*;base64,/, '');
    const encoding = mimeToEncoding(mimeType);

    const config = {
      encoding,
      languageCode,
      enableAutomaticPunctuation: true,
    };

    // For WEBM_OPUS and OGG_OPUS, we must specify a sample rate
    if (encoding === 'WEBM_OPUS' || encoding === 'OGG_OPUS') {
      config.sampleRateHertz = 48000; // WebM/Opus typically uses 48kHz
    }

    const request = {
      audio: { content: base64 },
      config,
    };

    const [response] = await client.recognize(request);

    const transcript = (response.results || [])
      .map(r => (r.alternatives && r.alternatives[0] && r.alternatives[0].transcript) || '')
      .filter(Boolean)
      .join(' ');

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transcript, raw: response }),
    };
  } catch (err) {
    console.error('Transcribe error', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || String(err) }),
    };
  }
}
