#!/usr/bin/env bash
set -euo pipefail

# Test script for EdenOS MCP Bridge Fun Features
# Run this after starting the bridge to verify everything works

BRIDGE_URL="${BRIDGE_URL:-http://localhost:8080}"
BRIDGE_ADMIN_TOKEN="${BRIDGE_ADMIN_TOKEN:-test-token}"

echo "🧪 Testing EdenOS MCP Bridge Fun Features"
echo "🌐 Bridge URL: ${BRIDGE_URL}"
echo ""

# Test 1: Health check
echo "1️⃣ Testing health endpoint..."
curl -fsS "${BRIDGE_URL}/health" | jq '.status, .uptime, .tools' || { echo "❌ Health check failed"; exit 1; }

# Test 2: Root endpoint
echo ""
echo "2️⃣ Testing root endpoint..."
curl -fsS "${BRIDGE_URL}/" | jq '.name, .status, .endpoints' || { echo "❌ Root endpoint failed"; exit 1; }

# Test 3: Chaos monkey
echo ""
echo "3️⃣ Testing chaos monkey..."
curl -fsS -X POST "${BRIDGE_URL}/cool/chaos" \
  -H "Content-Type: application/json" \
  -d '{"failPercent":5}' | jq '.ok, .failPercent' || { echo "❌ Chaos monkey failed"; exit 1; }

# Test 4: Roast
echo ""
echo "4️⃣ Testing roast..."
curl -fsS -X POST "${BRIDGE_URL}/fun/roast" \
  -H "Content-Type: application/json" | jq '.ok, .msg' || { echo "❌ Roast failed"; exit 1; }

# Test 5: Audit logs
echo ""
echo "5️⃣ Testing audit logs..."
curl -fsS "${BRIDGE_URL}/cool/audit/tail" | jq 'length' || { echo "❌ Audit logs failed"; exit 1; }

# Test 6: Mood (if Spotify configured)
echo ""
echo "6️⃣ Testing mood endpoint..."
curl -fsS "${BRIDGE_URL}/cool/mood/now" | jq '.mood' || { echo "⚠️  Mood endpoint failed (expected if no Spotify config)"; }

# Test 7: AI plan (if Vertex configured)
echo ""
echo "7️⃣ Testing AI plan..."
curl -fsS -X POST "${BRIDGE_URL}/cool/auto/plan" \
  -H "Content-Type: application/json" | jq 'length' || { echo "⚠️  AI plan failed (expected if no Vertex config)"; }

# Test 8: Static UIs
echo ""
echo "8️⃣ Testing static UIs..."
curl -fsS "${BRIDGE_URL}/live-ops" | grep -q "Live Ops Theater" || { echo "❌ Live Ops UI failed"; exit 1; }
curl -fsS "${BRIDGE_URL}/memgraph" | grep -q "MemGraph" || { echo "❌ MemGraph UI failed"; exit 1; }
curl -fsS "${BRIDGE_URL}/audit-cinema" | grep -q "Audit Cinema" || { echo "❌ Audit Cinema UI failed"; exit 1; }

echo ""
echo "✅ All fun feature tests passed!"
echo ""
echo "🎭 Your bridge is ready for some fun!"
echo "🌐 Live Ops Theater: ${BRIDGE_URL}/live-ops"
echo "🧠 Memory Graph: ${BRIDGE_URL}/memgraph"
echo "🎬 Audit Cinema: ${BRIDGE_URL}/audit-cinema"
echo ""
echo "🎮 Try the fun-mode CLI:"
echo "   export BRIDGE_URL='${BRIDGE_URL}'"
echo "   export BRIDGE_ADMIN_TOKEN='${BRIDGE_ADMIN_TOKEN}'"
echo "   node plugins/fun/fun-mode/cli.js help"
