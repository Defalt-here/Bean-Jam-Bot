import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { SpeechClient } from '@google-cloud/speech';
import { Storage } from '@google-cloud/storage';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '30mb' }));

const client = new SpeechClient();
const storage = new Storage();

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
    // Accept either direct base64 or a GCS key (gcsKey)
    const { audioBase64, mimeType, languageCode = 'en-US', gcsKey } = req.body;

    let base64 = audioBase64;

    if (!base64 && gcsKey) {
      // Download object from GCS and convert to base64
      const bucketName = process.env.AUDIO_BUCKET;
      if (!bucketName) return res.status(500).json({ error: 'AUDIO_BUCKET env required' });
      const file = storage.bucket(bucketName).file(gcsKey);
      const [exists] = await file.exists();
      if (!exists) return res.status(404).json({ error: 'gcsKey not found' });
      const [contents] = await file.download();
      base64 = contents.toString('base64');
      // Try to infer mimeType if not provided
    }

    if (!base64) return res.status(400).json({ error: 'audioBase64 or gcsKey required' });

    const encoding = mimeToEncoding(mimeType);

    const config = {
      encoding,
      languageCode,
      enableAutomaticPunctuation: true,
    };

    if (encoding === 'WEBM_OPUS' || encoding === 'OGG_OPUS') {
      config.sampleRateHertz = 48000;
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

// Presign endpoint for direct browser upload to GCS
app.post('/api/presign', async (req, res) => {
  try {
    const { fileName, contentType } = req.body;
    if (!fileName || !contentType) return res.status(400).json({ error: 'fileName & contentType required' });
    const bucketName = process.env.AUDIO_BUCKET;
    if (!bucketName) return res.status(500).json({ error: 'AUDIO_BUCKET env required' });

    const file = storage.bucket(bucketName).file(`uploads/${Date.now()}-${fileName}`);
    const expires = Date.now() + 5 * 60 * 1000; // 5 minutes
    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires,
      contentType,
    });

    res.json({ url, key: file.name, expires });
  } catch (err) {
    console.error('Presign error', err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Transcribe API running on ${port}`));
