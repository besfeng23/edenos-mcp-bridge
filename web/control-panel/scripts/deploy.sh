#!/bin/bash

# EdenOS MCP Control Panel - Firebase Hosting Deployment Script
# This script builds and deploys the control panel to Firebase Hosting

set -e

echo "🚀 Starting EdenOS Control Panel deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the control-panel directory."
    exit 1
fi

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Error: Firebase CLI not found. Please install it with:"
    echo "   npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo "❌ Error: Not logged in to Firebase. Please run:"
    echo "   firebase login"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building the application..."
npm run build

echo "🌐 Deploying to Firebase Hosting..."
firebase deploy --only hosting

echo "✅ Deployment complete!"
echo ""
echo "🎉 Your control panel is now live at:"
echo "   https://$(firebase use --project | grep -o '[^/]*$').web.app"
echo ""
echo "💡 Quick setup:"
echo "   1. Add your MCP bridge endpoint in the control panel"
echo "   2. Configure CORS on your bridge to allow this domain"
echo "   3. Start managing your MCP services!"