import { SpeechClient } from '@google-cloud/speech';

// Parse credentials from environment variable (Vercel stores as string)
const credentialsJSON = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
let credentials;

if (credentialsJSON) {
  try {
    credentials = JSON.parse(credentialsJSON);
  } catch (e) {
    console.error('Failed to parse credentials JSON', e);
  }
}

// Initialize client with inline credentials
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

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { audioBase64, mimeType, languageCode = 'en-US' } = req.body;
    
    if (!audioBase64) {
      return res.status(400).json({ error: 'audioBase64 required' });
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

    res.status(200).json({ transcript, raw: response });
  } catch (err) {
    console.error('Transcribe error', err);
    res.status(500).json({ error: err.message || String(err) });
  }
}
