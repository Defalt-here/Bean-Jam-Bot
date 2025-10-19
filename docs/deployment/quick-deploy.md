# 🚀 Production Deployment - Quick Start

## Easiest Option: Vercel (Recommended)

### 1️⃣ One-Command Deploy

```powershell
# Windows PowerShell
.\deploy-prod.ps1
```

Or manually:

```powershell
# Install Vercel CLI
npm install -g vercel

# Build and deploy
npm run build
vercel --prod
```

### 2️⃣ Set Environment Variables

After first deploy, go to:
**https://vercel.com/[your-project]/settings/environment-variables**

Add these three variables:

| Variable Name | Value | Where to get it |
|--------------|-------|-----------------|
| `GOOGLE_APPLICATION_CREDENTIALS_JSON` | Entire JSON content from `src/Keys/gen-lang-client-0056136731-d83579575479.json` | Copy & paste the full JSON |
| `VITE_GEMINI_API_KEY` | Your Gemini API key | Already in your `.env` |
| `VITE_WEATHER_API_KEY` | Your Weather API key | Already in your `.env` |

**Important:** For `GOOGLE_APPLICATION_CREDENTIALS_JSON`:
1. Open your service account JSON file
2. Copy the **entire contents** (it should start with `{"type":"service_account",...}`)
3. Paste it as the value (Vercel will handle it correctly)

### 3️⃣ Redeploy

```powershell
vercel --prod
```

### 4️⃣ Test

Visit your production URL and click the microphone button!

---

## Alternative: Netlify

```powershell
# Install Netlify CLI
npm install -g netlify-cli

# Login and initialize
netlify login
netlify init

# Set environment variables
netlify env:set GOOGLE_APPLICATION_CREDENTIALS_JSON "paste-json-here"
netlify env:set VITE_GEMINI_API_KEY "your-key"
netlify env:set VITE_WEATHER_API_KEY "your-key"

# Deploy
netlify deploy --prod
```

---

## Alternative: Docker + Cloud Run

```bash
# Build Docker image
docker build -t bean-jam-server .

# Test locally
docker run -p 3001:3001 \
  -e GOOGLE_APPLICATION_CREDENTIALS=/app/service-account.json \
  bean-jam-server

# Deploy to Google Cloud Run
gcloud builds submit --tag gcr.io/YOUR_PROJECT/bean-jam-server
gcloud run deploy bean-jam-server \
  --image gcr.io/YOUR_PROJECT/bean-jam-server \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

## Files Created for Production

✅ `api/transcribe.js` - Vercel serverless function
✅ `netlify/functions/transcribe.js` - Netlify function
✅ `vercel.json` - Vercel configuration
✅ `netlify.toml` - Netlify configuration
✅ `Dockerfile` - Docker container
✅ `.dockerignore` - Docker ignore rules
✅ `deploy-prod.ps1` - Quick deploy script
✅ `PRODUCTION_DEPLOYMENT.md` - Full deployment guide

---

## Troubleshooting

### "Could not load credentials"
- Make sure you pasted the **entire** JSON content (not just the file path)
- Check that the JSON is valid (use a JSON validator)

### CORS errors
- Vercel and Netlify handle CORS automatically
- If using custom domain, update CORS settings in serverless function

### Voice recording doesn't work
- Ensure HTTPS (Vercel/Netlify provide this automatically)
- Browser requires HTTPS for microphone access
- Check browser console for errors

### High costs
- Monitor Google Cloud billing dashboard
- Each transcription costs ~$0.024 per minute
- Free tier: 60 minutes/month

---

## Security Checklist

✅ Service account JSON is in `.gitignore`
✅ Environment variables set in platform (not in code)
✅ HTTPS enabled (automatic on Vercel/Netlify)
✅ Consider adding rate limiting for production

---

## What's Next?

- [ ] Set up custom domain
- [ ] Add authentication (protect API)
- [ ] Add rate limiting
- [ ] Monitor usage and costs
- [ ] Set up error tracking (Sentry)
- [ ] Add analytics

---

## Cost Monitoring

**Google Cloud Console:**
https://console.cloud.google.com/billing

Set up billing alerts to avoid surprises!

**Estimated costs:**
- 100 users/day, 2 min each = ~$14/month
- 1000 users/day, 2 min each = ~$140/month

---

Need help? Check `PRODUCTION_DEPLOYMENT.md` for detailed guide.
