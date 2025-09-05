# 🎭 EdenOS MCP Bridge - Fun Features Guide

Welcome to the **Tony-Stark layer** of your MCP Bridge! This guide covers all the cool, fun, and occasionally chaotic features that make your bridge more than just a boring MCP server.

## 🚀 Quick Start

### 1. Environment Setup

Add these to your `.env` file:

```bash
# Fun Features
BRIDGE_ADMIN_TOKEN=your-super-long-random-token-here
CHAOS_FAIL_PERCENT=0

# Optional: External Integrations
SLACK_BOT_TOKEN=xoxb-your-slack-token
SLACK_CHANNEL_ID=C12345678
TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
TELEGRAM_CHAT_ID=-100123456

# Optional: AI & Analytics
VERTEX_TEXT_MODEL=publishers/google/models/gemini-1.5-pro
BLACKWELL_EMB_TABLE=edenos_prod.blackwell_embeddings
```

### 2. Start the Bridge

```bash
npm run build
npm start
```

### 3. Access Fun Features

- **Live Ops Theater**: `http://localhost:8080/live-ops`
- **Memory Graph**: `http://localhost:8080/memgraph`
- **Audit Cinema**: `http://localhost:8080/audit-cinema`
- **Fun API**: `http://localhost:8080/cool/*`

## 🎪 Live Ops Theater

**What it is**: Real-time visualization of your Cloud Run revisions as rockets taking off and exploding.

**URL**: `/live-ops`

**Features**:
- 🚀 Rockets represent Cloud Run revisions
- 💥 Explosions when revisions become inactive
- 📊 Real-time traffic data visualization
- 🌟 Animated starfield background

**How it works**:
- Polls Cloud Run every 5 seconds
- WebSocket streams updates to the browser
- Canvas-based animations with D3-style physics

## 🧠 Holographic Memory Graph

**What it is**: 3D visualization of your BigQuery embeddings using Three.js.

**URL**: `/memgraph`

**Features**:
- 🔮 3D force-directed graph
- 🎨 Color-coded by embedding dimensions
- 🖱️ Mouse controls (drag to rotate, scroll to zoom)
- 📊 Real-time FPS and node count
- 🎛️ Adjustable rotation speed and node size

**Data Source**: `BLACKWELL_EMB_TABLE` in BigQuery

## 🎬 Audit Cinema

**What it is**: Cinematic timeline view of all audit events with filtering and real-time updates.

**URL**: `/audit-cinema`

**Features**:
- 📅 Timeline view of audit events
- 🔍 Filter by event type, actor, and time range
- 🎨 Color-coded event types
- ⚡ Auto-refresh every 30 seconds
- 📱 Responsive design

**Event Types**:
- 🚀 `deploy_*` - Deployment events
- ⚠️ `error_*` - Error events  
- 🎭 `chaos_*` - Chaos monkey events
- 🔄 `env_*` - Environment operations

## 🎲 Chaos Monkey

**What it is**: Inject controlled failures into your bridge to test resilience.

**Endpoint**: `POST /cool/chaos`

```bash
# Set 30% failure rate
curl -X POST "http://localhost:8080/cool/chaos" \
  -H "Authorization: Bearer $BRIDGE_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"failPercent": 30}'
```

**Features**:
- 🎯 Configurable failure percentage (0-100%)
- 🔄 Global middleware integration
- 📊 Real-time failure rate monitoring
- 🧪 Perfect for chaos engineering

## 🚀 Ephemeral Deploys

**What it is**: Deploy temporary revisions that auto-rollback after a TTL.

**Endpoint**: `POST /fun/deploy/ephemeral`

```bash
# Deploy ephemeral revision
curl -X POST "http://localhost:8080/fun/deploy/ephemeral" \
  -H "Authorization: Bearer $BRIDGE_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "service": "edenos-mcp-bridge",
    "image": "gcr.io/project/image:latest",
    "ttlSec": 600
  }'
```

**Features**:
- ⏰ Auto-rollback after TTL expires
- 🔐 Approval tokens for manual approval
- 📱 Slack/Telegram notifications
- 🎭 Roast messages on failures

## 🌍 Environment Cloning

**What it is**: One-command cloning of your entire production environment.

**Endpoint**: `POST /cool/env/clone`

```bash
# Clone prod into sandbox
curl -X POST "http://localhost:8080/cool/env/clone" \
  -H "Authorization: Bearer $BRIDGE_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"toEnv": "sandbox-joven"}'
```

**What gets cloned**:
- 🗄️ BigQuery datasets
- 🪣 GCS buckets  
- 🚀 Cloud Run services
- 📊 All data and configurations

## ⏰ Time Travel (Rewind)

**What it is**: Create and restore snapshots of your infrastructure state.

**Endpoints**:
- `POST /cool/rewind/snapshot` - Create snapshot
- `POST /cool/rewind/restore` - Restore snapshot

```bash
# Create snapshot
curl -X POST "http://localhost:8080/cool/rewind/snapshot" \
  -H "Authorization: Bearer $BRIDGE_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"label": "before-migration"}'
```

## 🔌 Kill Switch

**What it is**: Global emergency stop for all your services.

**Endpoints**:
- `POST /cool/kill/sleep` - Sleep all services
- `POST /cool/kill/wake` - Wake all services

```bash
# Emergency stop
curl -X POST "http://localhost:8080/cool/kill/sleep" \
  -H "Authorization: Bearer $BRIDGE_ADMIN_TOKEN"

# Wake up
curl -X POST "http://localhost:8080/cool/kill/wake" \
  -H "Authorization: Bearer $BRIDGE_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"min": 1}'
```

## 🤖 AI Doppelgänger

**What it is**: AI-powered command suggestions based on your operation history.

**Endpoint**: `POST /cool/auto/plan`

```bash
# Get AI suggestions
curl -X POST "http://localhost:8080/cool/auto/plan" \
  -H "Authorization: Bearer $BRIDGE_ADMIN_TOKEN"
```

**Features**:
- 🧠 Vertex AI integration
- 📚 Learns from your command history
- 💡 Suggests next 5 commands
- 🎯 Context-aware recommendations

## 🎵 Mood-Based Themes

**What it is**: UI themes that change based on your Spotify music.

**Endpoint**: `GET /cool/mood/now`

**Theme Triggers**:
- 🎹 **Synth**: Synthwave/retro music → Dark synth theme
- 🎼 **Classical**: Classical music → Elegant theme
- 🎸 **Default**: Everything else → Neutral theme

## 🎭 Fun Mode CLI

**What it is**: Command-line interface for all fun features.

**Installation**:
```bash
chmod +x plugins/fun/fun-mode/cli.js
npm link
```

**Usage**:
```bash
# Set environment variables
export BRIDGE_URL="http://localhost:8080"
export BRIDGE_ADMIN_TOKEN="your-token"

# Use the CLI
edenos.mcp clone sandbox-joven
edenos.mcp chaos 30
edenos.mcp kill
edenos.mcp wake 2
edenos.mcp auto
edenos.mcp rewind demo
edenos.mcp roast
edenos.mcp deploy gcr.io/project/image:latest
edenos.mcp status
```

## 🔥 RoastBot

**What it is**: Automated snarky messages sent to Slack/Telegram on failures.

**Endpoint**: `POST /fun/roast`

**Sample Roasts**:
- "Your deploy failed. Again. Consistency is key, I guess."
- "I've seen shell scripts with more self-esteem."
- "Try fewer typos, genius."
- "Logs don't lie. You do."

## 📱 External Integrations

### Slack
- **Bot Token**: `SLACK_BOT_TOKEN`
- **Channel**: `SLACK_CHANNEL_ID`
- **Features**: Deploy notifications, roasts, approval buttons

### Telegram  
- **Bot Token**: `TELEGRAM_BOT_TOKEN`
- **Chat ID**: `TELEGRAM_CHAT_ID`
- **Features**: Same as Slack but more private

### Vertex AI
- **Model**: `VERTEX_TEXT_MODEL`
- **Features**: Code review, command suggestions, AI operations

## 🧪 Testing Fun Features

### 1. Local Testing
```bash
# Start bridge
npm start

# Test chaos
curl -X POST "http://localhost:8080/cool/chaos" \
  -H "Authorization: Bearer $BRIDGE_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"failPercent": 10}'

# Test roast
curl -X POST "http://localhost:8080/fun/roast" \
  -H "Authorization: Bearer $BRIDGE_ADMIN_TOKEN"
```

### 2. Production Testing
```bash
# Use the fun-mode CLI
edenos.mcp chaos 5
edenos.mcp roast
edenos.mcp status
```

## 🚨 Security Notes

### Authentication
- All fun features require `BRIDGE_ADMIN_TOKEN`
- Token should be long and random
- Store in environment variables, never in code

### CORS
- Fun UIs are served from your bridge domain
- No cross-origin access to fun APIs
- Admin endpoints are protected

### Rate Limiting
- Built-in rate limiting on all endpoints
- Configurable via `RATE_RPS` and `RATE_BURST`

## 🎯 Production Deployment

### 1. Build and Deploy
```bash
# Build
npm run build

# Deploy to Cloud Run
./scripts/deploy.sh

# Run smoke tests
./scripts/smoke.sh

# Set up monitoring
./scripts/alerts.sh
```

### 2. GitHub Actions
- **AI Review**: Automatic on PRs
- **Ephemeral Deploys**: Use `[ephemeral]` in commit message
- **Chaos Testing**: Use `[chaos]` in commit message

### 3. Monitoring
- Uptime checks every 60 seconds
- 5xx error rate alerts
- Latency and resource usage alerts
- Custom metrics for fun features

## 🎨 Customization

### Adding New Fun Features
1. Create router in `plugins/fun/`
2. Add to `plugins/fun/index.ts`
3. Create UI in `web/` if needed
4. Add to CLI in `plugins/fun/fun-mode/cli.js`

### Theming
- All UIs use dark minimalist design
- CSS variables for easy color changes
- Responsive design for all screen sizes

### Extending AI Features
- Add new prompts to Vertex AI calls
- Integrate with other AI services
- Create custom training data

## 🐛 Troubleshooting

### Common Issues

**WebSocket not connecting**:
- Check firewall rules
- Verify WebSocket upgrade handling
- Check browser console for errors

**AI features not working**:
- Verify Vertex AI credentials
- Check model availability
- Verify API quotas

**External integrations failing**:
- Check token validity
- Verify channel/chat IDs
- Check rate limits

### Debug Mode
```bash
# Enable debug logging
LOG_LEVEL=debug npm start

# Check WebSocket connections
curl -s "http://localhost:8080/cool/audit/tail" | jq
```

## 🎉 What's Next?

### Planned Features
- 🎮 **AR Control Panel**: WebXR integration
- 🎭 **Investor Demo Mode**: Fake metrics for demos
- 🎨 **Sentiment-Reactive Themes**: Mood-based UI changes
- 💰 **Monetization Hooks**: Usage tracking and billing

### Contributing
- Add new fun features to `plugins/fun/`
- Create UIs in `web/`
- Extend CLI in `plugins/fun/fun-mode/`
- Submit PRs with `[fun]` tag

---

**Remember**: Fun features are meant to make operations enjoyable, not chaotic (unless you want them to be). Use responsibly and always have a rollback plan! 🎭✨
