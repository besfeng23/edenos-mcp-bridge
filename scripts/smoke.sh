#!/usr/bin/env bash
set -euo pipefail

REGION="${GCP_REGION:-asia-southeast1}"
SERVICE="${CLOUD_RUN_SERVICE:-edenos-mcp-bridge}"
URL="$(gcloud run services describe "${SERVICE}" --region "${REGION}" --format='value(status.url)')"

echo "🧪 Running smoke tests against ${URL}"
echo ""

echo "GET /health"
curl -fsS "${URL}/health" | jq '.status, .uptime, .tools' || { echo "❌ health failed"; exit 1; }

echo ""
echo "GET /metrics (sample)"
curl -fsS "${URL}/metrics" | head -n 20 || { echo "❌ metrics failed"; exit 1; }

echo ""
echo "GET / (root endpoint)"
curl -fsS "${URL}/" | jq '.name, .status, .mcp.envTag' || { echo "❌ root failed"; exit 1; }

echo ""
echo "POST /cool/chaos (dry run)"
curl -fsS -X POST "${URL}/cool/chaos" \
  -H "Content-Type: application/json" \
  -d '{"failPercent":0}' | jq '.ok, .failPercent' || { echo "❌ chaos failed"; exit 1; }

echo ""
echo "GET /cool/audit/tail"
curl -fsS "${URL}/cool/audit/tail" | jq 'length' || { echo "❌ audit failed"; exit 1; }

echo ""
echo "✅ All smoke tests passed!"
echo "🌐 Service is healthy and responding"

