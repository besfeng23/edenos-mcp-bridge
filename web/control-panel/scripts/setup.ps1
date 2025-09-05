# EdenOS MCP Control Panel - Complete Setup Script
# This script sets up everything needed for the control panel

param(
    [string]$ProjectId = "",
    [switch]$SkipFirebaseInit,
    [switch]$SkipBuild,
    [switch]$SkipDeploy
)

Write-Host "🎭 EdenOS MCP Control Panel Setup" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from the control-panel directory." -ForegroundColor Red
    exit 1
}

# Check Node.js version
$nodeVersion = node --version
Write-Host "📦 Node.js version: $nodeVersion" -ForegroundColor Green

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
npm install

# Firebase setup
if (-not $SkipFirebaseInit) {
    Write-Host "🔥 Setting up Firebase..." -ForegroundColor Blue
    
    # Check if Firebase CLI is installed
    try {
        firebase --version | Out-Null
        Write-Host "✅ Firebase CLI found" -ForegroundColor Green
    } catch {
        Write-Host "❌ Firebase CLI not found. Installing..." -ForegroundColor Yellow
        npm install -g firebase-tools
    }
    
    # Login to Firebase
    Write-Host "🔐 Logging in to Firebase..." -ForegroundColor Blue
    firebase login
    
    # Initialize Firebase project
    if ($ProjectId) {
        Write-Host "🎯 Using project ID: $ProjectId" -ForegroundColor Green
        firebase use $ProjectId
    } else {
        Write-Host "🎯 Initializing Firebase project..." -ForegroundColor Blue
        firebase init hosting --project
    }
    
    # Update .firebaserc if project ID was provided
    if ($ProjectId) {
        $firebaserc = @{
            projects = @{
                default = $ProjectId
            }
        } | ConvertTo-Json -Depth 2
        $firebaserc | Out-File -FilePath ".firebaserc" -Encoding UTF8
        Write-Host "✅ Updated .firebaserc with project ID: $ProjectId" -ForegroundColor Green
    }
}

# Build the application
if (-not $SkipBuild) {
    Write-Host "🔨 Building the application..." -ForegroundColor Blue
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Build successful!" -ForegroundColor Green
}

# Deploy to Firebase Hosting
if (-not $SkipDeploy) {
    Write-Host "🌐 Deploying to Firebase Hosting..." -ForegroundColor Blue
    firebase deploy --only hosting
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Deployment failed!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Add your MCP bridge endpoint in the control panel" -ForegroundColor White
Write-Host "   2. Configure CORS on your bridge to allow this domain" -ForegroundColor White
Write-Host "   3. Start managing your MCP services!" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Your control panel is live at:" -ForegroundColor Cyan
Write-Host "   https://$(firebase use --project | Select-String -Pattern '^\s*[^\s]+' | ForEach-Object { $_.Matches[0].Value }).web.app" -ForegroundColor White
