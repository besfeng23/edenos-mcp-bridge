#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${GCP_PROJECT_ID:-agile-anagram-469914-e2}"
REGION="${GCP_REGION:-asia-southeast1}"
SERVICE="${CLOUD_RUN_SERVICE:-edenos-mcp-bridge}"
REPO="${ARTIFACT_REPO:-containers}"
AR_HOST="${REGION}-docker.pkg.dev"
TAG="${TAG:-$(git rev-parse --short HEAD 2>/dev/null || date +%s)}"
IMAGE="${AR_HOST}/${PROJECT_ID}/${REPO}/${SERVICE}:${TAG}"

echo "🧱 Building image ${IMAGE}"
docker build --pull --no-cache -t "${IMAGE}" .

echo "⬆️  Pushing"
gcloud auth configure-docker "${AR_HOST}" -q
docker push "${IMAGE}"

echo "🔐 Attaching secrets"
SA="${SERVICE}-sa"
gcloud iam service-accounts create "${SA}" --project "${PROJECT_ID}" --quiet || true

# Minimum roles; expand only as needed
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${SA}@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/run.invoker" --quiet || true
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${SA}@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" --quiet || true

echo "🚀 Deploy canary (10%)"
gcloud run deploy "${SERVICE}" \
  --project "${PROJECT_ID}" --region "${REGION}" \
  --image "${IMAGE}" \
  --service-account "${SA}@${PROJECT_ID}.iam.gserviceaccount.com" \
  --platform managed \
  --allow-unauthenticated \
  --concurrency 80 \
  --cpu 1 --memory 512Mi \
  --min-instances 1 --max-instances 20 \
  --set-env-vars "NODE_ENV=production,MCP_ENV_TAG=${MCP_ENV_TAG:-mcpmaster},RATE_RPS=${RATE_RPS:-5},RATE_BURST=${RATE_BURST:-10},OTEL_EXPORTER_OTLP_ENDPOINT=${OTEL_EXPORTER_OTLP_ENDPOINT:-},OTEL_RESOURCE_SERVICE_NAME=${OTEL_RESOURCE_SERVICE_NAME:-edenos-mcp-bridge}" \
  --set-secrets "SERVICE_ACCOUNT_JSON=${SECRET__SERVICE_ACCOUNT_JSON:-},JWT_SIGNING_KEY=${SECRET__JWT_SIGNING_KEY:-}" \
  --traffic latest=10 || { echo "❌ deploy failed"; exit 1; }

URL="$(gcloud run services describe "${SERVICE}" --region "${REGION}" --format='value(status.url)')"
echo "🌐 Service URL: ${URL}"

echo "🩺 Smoke check"
curl -fsS "${URL}/health" || { echo "❌ health failed"; exit 2; }

echo "📈 Shift traffic to 100%"
REV="$(gcloud run services describe "${SERVICE}" --region "${REGION}" --format='value(status.latestReadyRevisionName)')"
gcloud run services update-traffic "${SERVICE}" --region "${REGION}" --to-revisions "${REV}=100"

echo "✅ Deployed ${REV} to 100%"

