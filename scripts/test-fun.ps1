# Test script for EdenOS MCP Bridge Fun Features
# Run this after starting the bridge to verify everything works

param(
    [string]$BridgeUrl = "http://localhost:8080",
    [string]$BridgeAdminToken = "test-token"
)

Write-Host "🧪 Testing EdenOS MCP Bridge Fun Features" -ForegroundColor Green
Write-Host "🌐 Bridge URL: $BridgeUrl" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health check
Write-Host "1️⃣ Testing health endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BridgeUrl/health" -Method Get
    Write-Host "✅ Health: $($response.status), Uptime: $($response.uptime), Tools: $($response.tools)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Root endpoint
Write-Host ""
Write-Host "2️⃣ Testing root endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BridgeUrl/" -Method Get
    Write-Host "✅ Root: $($response.name), Status: $($response.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ Root endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 3: Chaos monkey
Write-Host ""
Write-Host "3️⃣ Testing chaos monkey..." -ForegroundColor Yellow
try {
    $body = @{ failPercent = 5 } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$BridgeUrl/cool/chaos" -Method Post -Body $body -ContentType "application/json"
    Write-Host "✅ Chaos: $($response.ok), Fail Rate: $($response.failPercent)%" -ForegroundColor Green
} catch {
    Write-Host "❌ Chaos monkey failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 4: Roast
Write-Host ""
Write-Host "4️⃣ Testing roast..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BridgeUrl/fun/roast" -Method Post -ContentType "application/json"
    Write-Host "✅ Roast: $($response.ok), Message: $($response.msg)" -ForegroundColor Green
} catch {
    Write-Host "❌ Roast failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 5: Audit logs
Write-Host ""
Write-Host "5️⃣ Testing audit logs..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BridgeUrl/cool/audit/tail" -Method Get
    Write-Host "✅ Audit logs: $($response.Count) events" -ForegroundColor Green
} catch {
    Write-Host "❌ Audit logs failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 6: Mood (if Spotify configured)
Write-Host ""
Write-Host "6️⃣ Testing mood endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BridgeUrl/cool/mood/now" -Method Get
    Write-Host "✅ Mood: $($response.mood)" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Mood endpoint failed (expected if no Spotify config): $($_.Exception.Message)" -ForegroundColor Yellow
}

# Test 7: AI plan (if Vertex configured)
Write-Host ""
Write-Host "7️⃣ Testing AI plan..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BridgeUrl/cool/auto/plan" -Method Post -ContentType "application/json"
    Write-Host "✅ AI plan: $($response.Count) suggestions" -ForegroundColor Green
} catch {
    Write-Host "⚠️  AI plan failed (expected if no Vertex config): $($_.Exception.Message)" -ForegroundColor Yellow
}

# Test 8: Static UIs
Write-Host ""
Write-Host "8️⃣ Testing static UIs..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BridgeUrl/live-ops" -Method Get
    if ($response.Content -match "Live Ops Theater") {
        Write-Host "✅ Live Ops UI: Working" -ForegroundColor Green
    } else {
        Write-Host "❌ Live Ops UI failed" -ForegroundColor Red
        exit 1
    }
    
    $response = Invoke-WebRequest -Uri "$BridgeUrl/memgraph" -Method Get
    if ($response.Content -match "MemGraph") {
        Write-Host "✅ MemGraph UI: Working" -ForegroundColor Green
    } else {
        Write-Host "❌ MemGraph UI failed" -ForegroundColor Red
        exit 1
    }
    
    $response = Invoke-WebRequest -Uri "$BridgeUrl/audit-cinema" -Method Get
    if ($response.Content -match "Audit Cinema") {
        Write-Host "✅ Audit Cinema UI: Working" -ForegroundColor Green
    } else {
        Write-Host "❌ Audit Cinema UI failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Static UI test failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ All fun feature tests passed!" -ForegroundColor Green
Write-Host ""
Write-Host "🎭 Your bridge is ready for some fun!" -ForegroundColor Magenta
Write-Host "🌐 Live Ops Theater: $BridgeUrl/live-ops" -ForegroundColor Cyan
Write-Host "🧠 Memory Graph: $BridgeUrl/memgraph" -ForegroundColor Cyan
Write-Host "🎬 Audit Cinema: $BridgeUrl/audit-cinema" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎮 Try the fun-mode CLI:" -ForegroundColor Yellow
Write-Host "   `$env:BRIDGE_URL='$BridgeUrl'" -ForegroundColor Gray
Write-Host "   `$env:BRIDGE_ADMIN_TOKEN='$BridgeAdminToken'" -ForegroundColor Gray
Write-Host "   node plugins/fun/fun-mode/cli.js help" -ForegroundColor Gray
