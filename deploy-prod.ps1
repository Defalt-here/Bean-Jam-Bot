# Quick Production Deployment Script

Write-Host "Bean Jam Bot - Production Deployment" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelInstalled) {
    Write-Host "Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

Write-Host ""
Write-Host "IMPORTANT: Before deploying, ensure you:" -ForegroundColor Yellow
Write-Host "1. Have a Vercel account (https://vercel.com)" -ForegroundColor White
Write-Host "2. Have your Google Cloud service account JSON ready" -ForegroundColor White
Write-Host ""

$continue = Read-Host "Continue with deployment? (y/n)"

if ($continue -ne "y") {
    Write-Host "Deployment cancelled." -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "Step 1: Building production bundle..." -ForegroundColor Green
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed! Fix errors before deploying." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 2: Deploying to Vercel..." -ForegroundColor Green
vercel --prod

Write-Host ""
Write-Host "Step 3: Set environment variables in Vercel Dashboard:" -ForegroundColor Yellow
Write-Host "https://vercel.com/[your-project]/settings/environment-variables" -ForegroundColor Cyan
Write-Host ""
Write-Host "Add these variables:" -ForegroundColor White
Write-Host "  - GOOGLE_APPLICATION_CREDENTIALS_JSON = (paste entire JSON content)" -ForegroundColor White
Write-Host "  - VITE_GEMINI_API_KEY = (your Gemini API key)" -ForegroundColor White
Write-Host "  - VITE_WEATHER_API_KEY = (your Weather API key)" -ForegroundColor White
Write-Host ""
Write-Host "After setting env vars, redeploy with: vercel --prod" -ForegroundColor Yellow
Write-Host ""
Write-Host "Deployment complete! Test your voice input in production." -ForegroundColor Green
