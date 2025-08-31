#!/usr/bin/env bash
set -euo pipefail

echo "🚀 EdenOS MCP Bridge Bootstrap"
echo "================================"

# Check prerequisites
echo "📋 Checking prerequisites..."
command -v pnpm >/dev/null 2>&1 || { echo "❌ pnpm is required but not installed. Run: corepack enable && corepack prepare pnpm@9.6.0 --activate"; exit 1; }
command -v gcloud >/dev/null 2>&1 || { echo "❌ gcloud is required but not installed. Run: curl -sSL https://sdk.cloud.google.com | bash"; exit 1; }
command -v firebase >/dev/null 2>&1 || { echo "❌ firebase CLI is required but not installed. Run: npm i -g firebase-tools"; exit 1; }

# Set project
PROJECT_ID="${GOOGLE_CLOUD_PROJECT:-agile-anagram-469914-e2}"
echo "🔧 Using project: $PROJECT_ID"
gcloud config set project "$PROJECT_ID"

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Configure Docker for Artifact Registry
echo "🐳 Configuring Docker for Artifact Registry..."
gcloud auth configure-docker asia-southeast1-docker.pkg.dev -q

# Deploy the bridge
echo "🚀 Deploying MCP Bridge..."
./scripts/deploy.sh

# Run smoke test
echo "🧪 Running smoke test..."
./scripts/smoke.sh

echo "✅ Bootstrap completed successfully!"
echo "🎯 Your MCP Bridge is now running at:"
gcloud run services describe edenos-mcp-bridge --region=asia-southeast1 --format="value(status.url)" 2>/dev/null || echo "   (Service URL will be available after first deployment)"

