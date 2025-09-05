# EdenOS MCP Control Panel - Firebase Hosting Deployment Script (PowerShell)
# This script builds and deploys the control panel to Firebase Hosting

param(
    [switch]$SkipBuild,
    [switch]$SkipDeploy
)

Write-Host "🚀 Starting EdenOS Control Panel deployment..." -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from the control-panel directory." -ForegroundColor Red
    exit 1
}

# Check if Firebase CLI is installed
try {
    firebase --version | Out-Null
} catch {
    Write-Host "❌ Error: Firebase CLI not found. Please install it with:" -ForegroundColor Red
    Write-Host "   npm install -g firebase-tools" -ForegroundColor Yellow
    exit 1
}

# Check if user is logged in to Firebase
try {
    firebase projects:list | Out-Null
} catch {
    Write-Host "❌ Error: Not logged in to Firebase. Please run:" -ForegroundColor Red
    Write-Host "   firebase login" -ForegroundColor Yellow
    exit 1
}

if (-not $SkipBuild) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
    npm install

    Write-Host "🔨 Building the application..." -ForegroundColor Blue
    npm run build
}

if (-not $SkipDeploy) {
    Write-Host "🌐 Deploying to Firebase Hosting..." -ForegroundColor Blue
    firebase deploy --only hosting
}

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 Your control panel is now live!" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Quick setup:" -ForegroundColor Yellow
Write-Host "   1. Add your MCP bridge endpoint in the control panel" -ForegroundColor White
Write-Host "   2. Configure CORS on your bridge to allow this domain" -ForegroundColor White
Write-Host "   3. Start managing your MCP services!" -ForegroundColor White


