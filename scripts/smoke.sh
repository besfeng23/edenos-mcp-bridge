#!/usr/bin/env bash
set -euo pipefail

echo "🧪 EdenOS MCP Bridge Smoke Test"
echo "==============================="

PROJECT_ID="${GOOGLE_CLOUD_PROJECT:-$(gcloud config get-value project)}"
REG="asia-southeast1"
SERVICE="edenos-mcp-bridge"

echo "🔧 Configuration:"
echo "   Project: $PROJECT_ID"
echo "   Region: $REG"
echo "   Service: $SERVICE"

# 1) Publish test chat messages
echo "📨 Publishing test chat messages..."
timestamp=$(date -Is)
gcloud pubsub topics publish chat-history --message "{\"text\":\"I love EdenOS\",\"sentiment\":\"positive\",\"ts\":\"$timestamp\"}"
gcloud pubsub topics publish chat-history --message "{\"text\":\"I hate bugs\",\"sentiment\":\"negative\",\"ts\":\"$timestamp\"}"
gcloud pubsub topics publish chat-history --message "{\"text\":\"This is amazing\",\"sentiment\":\"positive\",\"ts\":\"$timestamp\"}"

echo "✅ Published 3 test messages"

# 2) Wait for processing
echo "⏳ Waiting for message processing..."
sleep 3

# 3) Quick KPI check
echo "📊 Checking BigQuery KPI..."
bq query --nouse_legacy_sql --format=prettyjson "
SELECT
  COUNTIF(sentiment='positive') pos,
  COUNTIF(sentiment='negative') neg,
  SAFE_DIVIDE(COUNTIF(sentiment='positive'), COUNT(*)) pos_rate
FROM \`${PROJECT_ID}.edenos.chat_raw\`
WHERE DATE(ts)=CURRENT_DATE('Asia/Manila');"

# 4) Preview sentiment trends view
echo "📈 Previewing sentiment trends view..."
bq head -n 5 "${PROJECT_ID}.edenos.sentiment_trends_7d_ma" 2>/dev/null || echo "⚠️  View not yet available (may need more data)"

# 5) Test MCP Bridge health
echo "🏥 Testing MCP Bridge health..."
if gcloud run services describe "$SERVICE" --region="$REG" >/dev/null 2>&1; then
    SERVICE_URL=$(gcloud run services describe "$SERVICE" --region="$REG" --format="value(status.url)")
    echo "🌐 Service URL: $SERVICE_URL"
    
    # Test health endpoint if available
    if curl -s "$SERVICE_URL/health" >/dev/null 2>&1; then
        echo "✅ Health endpoint responding"
    else
        echo "⚠️  Health endpoint not responding (may not be implemented yet)"
    fi
else
    echo "❌ Service not found - run bootstrap.sh first"
fi

echo "🎯 Smoke test completed!"
echo "💡 Next steps:"
echo "   1. Check BigQuery views are populated"
echo "   2. Test MCP tools through the console"
echo "   3. Monitor Cloud Run logs for any errors"

