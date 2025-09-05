#!/usr/bin/env bash
set -euo pipefail

PROJECT="${GCP_PROJECT_ID:-agile-anagram-469914-e2}"
REGION="${GCP_REGION:-asia-southeast1}"
SERVICE="${CLOUD_RUN_SERVICE:-edenos-mcp-bridge}"

echo "🚨 Setting up monitoring and alerts for ${SERVICE}"

# Uptime check (regional)
echo "📡 Creating uptime check..."
gcloud monitoring uptime-checks create http edenos-mcp-uptime \
  --project="${PROJECT}" \
  --path="/health" \
  --hostname="$(gcloud run services describe ${SERVICE} --region ${REGION} --format='value(status.url)' | sed 's#https://##')" \
  --port=443 --period=60s --timeout=10s || true

# Alert: 5xx rate
echo "⚠️  Creating 5xx alert policy..."
gcloud monitoring policies create --project="${PROJECT}" \
  --display-name="Run 5xx high - ${SERVICE}" \
  --documentation="Investigate logs for high error rates" \
  --condition-display-name="5xx > 1/min for 5m" \
  --condition-filter="resource.type=\"cloud_run_revision\" AND resource.label.service_name=\"${SERVICE}\" AND metric.type=\"run.googleapis.com/request_count\" AND metric.label.response_code_class=\"5xx\"" \
  --condition-aggregations-alignment-period=60s \
  --condition-aggregations-per-series-alignment=ALIGN_RATE \
  --condition-comparison=COMPARISON_GT \
  --condition-threshold-value=1 \
  --duration=300s \
  --notification-channels="" || true

# Alert: High latency
echo "⏱️  Creating latency alert policy..."
gcloud monitoring policies create --project="${PROJECT}" \
  --display-name="Run latency high - ${SERVICE}" \
  --documentation="Investigate high response times" \
  --condition-display-name="Latency > 5s for 3m" \
  --condition-filter="resource.type=\"cloud_run_revision\" AND resource.label.service_name=\"${SERVICE}\" AND metric.type=\"run.googleapis.com/request_latencies\"" \
  --condition-aggregations-alignment-period=60s \
  --condition-aggregations-per-series-alignment=ALIGN_MEAN \
  --condition-comparison=COMPARISON_GT \
  --condition-threshold-value=5000 \
  --duration=180s \
  --notification-channels="" || true

# Alert: Memory usage
echo "🧠 Creating memory alert policy..."
gcloud monitoring policies create --project="${PROJECT}" \
  --display-name="Run memory high - ${SERVICE}" \
  --documentation="Check memory usage and scaling" \
  --condition-display-name="Memory > 80% for 5m" \
  --condition-filter="resource.type=\"cloud_run_revision\" AND resource.label.service_name=\"${SERVICE}\" AND metric.type=\"run.googleapis.com/container/memory/utilizations\"" \
  --condition-aggregations-alignment-period=60s \
  --condition-aggregations-per-series-alignment=ALIGN_MEAN \
  --condition-comparison=COMPARISON_GT \
  --condition-threshold-value=0.8 \
  --duration=300s \
  --notification-channels="" || true

# Alert: CPU usage
echo "🔥 Creating CPU alert policy..."
gcloud monitoring policies create --project="${PROJECT}" \
  --display-name="Run CPU high - ${SERVICE}" \
  --documentation="Check CPU usage and scaling" \
  --condition-display-name="CPU > 80% for 5m" \
  --condition-filter="resource.type=\"cloud_run_revision\" AND resource.label.service_name=\"${SERVICE}\" AND metric.type=\"run.googleapis.com/container/cpu/utilizations\"" \
  --condition-aggregations-alignment-period=60s \
  --condition-aggregations-per-series-alignment=ALIGN_MEAN \
  --condition-comparison=COMPARISON_GT \
  --condition-threshold-value=0.8 \
  --duration=300s \
  --notification-channels="" || true

echo "✅ Monitoring and alerts configured!"
echo "📊 View policies: https://console.cloud.google.com/monitoring/alerting?project=${PROJECT}"
echo "📈 View metrics: https://console.cloud.google.com/monitoring/metrics-explorer?project=${PROJECT}"
