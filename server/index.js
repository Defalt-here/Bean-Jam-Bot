import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { SpeechClient } from '@google-cloud/speech';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '30mb' }));

const client = new SpeechClient();

function mimeToEncoding(mimeType) {
  if (!mimeType) return 'LINEAR16';
  const mt = mimeType.toLowerCase();
  if (mt.includes('webm') || mt.includes('opus')) return 'WEBM_OPUS';
  if (mt.includes('ogg') || mt.includes('opus')) return 'OGG_OPUS';
  if (mt.includes('wav')) return 'LINEAR16';
  if (mt.includes('flac')) return 'FLAC';
  return 'LINEAR16';
}

app.post('/api/transcribe', async (req, res) => {
  try {
    const { audioBase64, mimeType, languageCode = 'en-US' } = req.body;
    if (!audioBase64) return res.status(400).json({ error: 'audioBase64 required' });

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

    res.json({ transcript, raw: response });
  } catch (err) {
    console.error('Transcribe error', err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Transcribe API running on ${port}`));
