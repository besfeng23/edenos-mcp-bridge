#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Deploying EdenOS MCP Bridge"
echo "==============================="

# Configuration
REG="asia-southeast1"
SERVICE="edenos-mcp-bridge"
PROJECT_ID="${GOOGLE_CLOUD_PROJECT:-$(gcloud config get-value project)}"
SA="edenos-mcp-sa@${PROJECT_ID}.iam.gserviceaccount.com"

echo "🔧 Configuration:"
echo "   Region: $REG"
echo "   Service: $SERVICE"
echo "   Project: $PROJECT_ID"
echo "   Service Account: $SA"

# Build the application
echo "📦 Building application..."
pnpm run build

# Build Docker image
echo "🐳 Building Docker image..."
IMG="asia-southeast1-docker.pkg.dev/${PROJECT_ID}/bridge/${SERVICE}"
gcloud builds submit --tag "$IMG"

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy "$SERVICE" \
  --image "$IMG" \
  --region "$REG" \
  --platform managed \
  --service-account "$SA" \
  --allow-unauthenticated \
  --max-instances 10 \
  --cpu 1 \
  --memory 512Mi \
  --set-env-vars "GOOGLE_CLOUD_PROJECT=${PROJECT_ID}" \
  --set-env-vars "EDENOS_ENV=${EDENOS_ENV:-staging}"

echo "✅ Deployment completed successfully!"
echo "🌐 Service URL:"
gcloud run services describe "$SERVICE" --region="$REG" --format="value(status.url)"

# Update CORS for the console
echo "🔐 Updating CORS for console access..."
CONSOLE_ORIGIN="${MCP_CONSOLE_ORIGIN:-https://mcpmaster-web-app.web.app}"
gcloud run services update "$SERVICE" \
  --region "$REG" \
  --set-env-vars "ALLOWED_ORIGINS=${CONSOLE_ORIGIN}"

echo "🎯 MCP Bridge is ready to receive requests!"

