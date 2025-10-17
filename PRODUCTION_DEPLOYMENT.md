# Production Deployment Guide

## Overview
This app has two components that need to be deployed:
1. **Frontend**: React/Vite static site
2. **Backend**: Express server for Google Cloud Speech-to-Text

## Deployment Options

### Option 1: Vercel (Frontend) + Vercel Serverless Function (Backend)
**Best for**: Simple, managed deployment

#### Setup Steps:

1. **Install Vercel CLI**
```powershell
npm install -g vercel
```

2. **Create `api/transcribe.js` for Vercel Serverless**
(Already created - see file below)

3. **Update `vercel.json` configuration**
(Already created - see file below)

4. **Set Environment Variables in Vercel Dashboard**
- Go to your Vercel project → Settings → Environment Variables
- Add: `GOOGLE_APPLICATION_CREDENTIALS_JSON` = (paste entire JSON content from your key file)

5. **Deploy**
```powershell
vercel --prod
```

---

### Option 2: Netlify (Frontend) + Netlify Functions (Backend)
**Best for**: Similar to Vercel, alternative platform

#### Setup Steps:

1. **Install Netlify CLI**
```powershell
npm install -g netlify-cli
```

2. **Create `netlify/functions/transcribe.js`**
(Already created - see file below)

3. **Update `netlify.toml`**
(Already created - see file below)

4. **Set Environment Variables**
```powershell
netlify env:set GOOGLE_APPLICATION_CREDENTIALS_JSON "paste-json-here"
```

5. **Deploy**
```powershell
netlify deploy --prod
```

---

### Option 3: Traditional VPS/Cloud (Frontend + Backend Separate)
**Best for**: Full control, existing infrastructure

#### Backend (Express Server on Cloud VM)

1. **Deploy to VM (AWS EC2, Google Cloud VM, Azure VM, DigitalOcean, etc.)**

```bash
# On your server:
git clone <your-repo>
cd Bean-Jam-Bot
npm install --production

# Upload your service account JSON to secure location
# Set environment variable
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

# Start with PM2 (process manager)
npm install -g pm2
pm2 start server/index.js --name bean-jam-server
pm2 save
pm2 startup
```

2. **Configure Nginx reverse proxy**
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Frontend (Static Site)

1. **Build**
```powershell
npm run build
```

2. **Deploy `dist/` folder to:**
- **Vercel**: `vercel --prod`
- **Netlify**: `netlify deploy --prod --dir=dist`
- **AWS S3 + CloudFront**: Upload `dist/` to S3 bucket, configure CloudFront
- **Traditional server**: Copy `dist/` to `/var/www/html`

3. **Update frontend to point to backend**
Create `.env.production`:
```env
VITE_API_BASE_URL=https://api.yourdomain.com
```

Update `src/hooks/use-audio-recorder.ts`:
```typescript
const apiUrl = import.meta.env.VITE_API_BASE_URL || '';
const resp = await fetch(`${apiUrl}/api/transcribe`, { ... });
```

---

### Option 4: Docker (Containerized)
**Best for**: Kubernetes, container orchestration

#### Dockerfile (Backend)
(Already created - see file below)

#### Deploy to Cloud Run (Google Cloud)
```bash
# Build and push
gcloud builds submit --tag gcr.io/YOUR_PROJECT/bean-jam-server

# Deploy
gcloud run deploy bean-jam-server \
  --image gcr.io/YOUR_PROJECT/bean-jam-server \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_APPLICATION_CREDENTIALS=/app/service-account.json
```

---

## Security Checklist for Production

✅ **Never commit service account JSON to git**
- Already in `.gitignore`
- Use environment variables or secrets manager

✅ **Use HTTPS**
- Vercel/Netlify provide this automatically
- For VPS: Use Let's Encrypt (certbot)

✅ **Set CORS properly**
Update `server/index.js`:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://yourdomain.com',
  credentials: true
}));
```

✅ **Rate limiting**
```bash
npm install express-rate-limit
```

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

✅ **Authenticate users**
- Add API keys or OAuth
- Validate requests before transcription

✅ **Monitor costs**
- Google Cloud STT charges per second
- Set up billing alerts in Google Cloud Console

---

## Environment Variables Summary

### Development (.env)
```env
GOOGLE_APPLICATION_CREDENTIALS=./src/Keys/service-account.json
VITE_GEMINI_API_KEY=your_key
VITE_WEATHER_API_KEY=your_key
```

### Production (Vercel/Netlify)
```env
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account",...}
VITE_GEMINI_API_KEY=your_key
VITE_WEATHER_API_KEY=your_key
```

### Production (VPS)
```bash
export GOOGLE_APPLICATION_CREDENTIALS=/secure/path/service-account.json
export PORT=3001
export NODE_ENV=production
```

---

## Quick Deploy Commands

### Vercel (Recommended for beginners)
```powershell
# First time
vercel

# Set env vars in dashboard: https://vercel.com/[your-project]/settings/environment-variables

# Deploy
vercel --prod
```

### Netlify
```powershell
netlify init
netlify env:set GOOGLE_APPLICATION_CREDENTIALS_JSON "paste-json-content"
netlify deploy --prod
```

### Docker + Cloud Run
```bash
gcloud run deploy bean-jam-api --source . --region us-central1
```

---

## Troubleshooting Production Issues

### "Could not load credentials"
- Ensure `GOOGLE_APPLICATION_CREDENTIALS_JSON` is set in platform dashboard
- For Vercel/Netlify functions, parse JSON from env var (see api/transcribe.js)

### CORS errors
- Update `cors()` origin to match your frontend domain
- Check browser console for exact error

### 404 on /api/transcribe
- Vercel: Ensure `api/transcribe.js` exists
- Netlify: Ensure `netlify/functions/transcribe.js` exists
- VPS: Check nginx proxy configuration

### High latency
- Use streaming recognition for real-time (not implemented in this basic version)
- Deploy backend in same region as frontend
- Consider CDN for frontend assets

---

## Cost Estimation

**Google Cloud Speech-to-Text Pricing:**
- Standard: $0.006 per 15 seconds ($0.024/minute)
- Enhanced: $0.009 per 15 seconds ($0.036/minute)

**Example:** 1000 users, 2 minutes audio/day = $48-72/month

**Free tier:** 60 minutes/month

Monitor usage: https://console.cloud.google.com/billing

---

## Next Steps

1. Choose deployment option (I recommend Vercel for simplicity)
2. Set up environment variables in platform dashboard
3. Deploy with one command
4. Test microphone functionality in production
5. Set up monitoring and alerts

Need help with a specific platform? Let me know!
