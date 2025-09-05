# 🎭 EdenOS MCP Control Panel - Quick Start

## One-Command Deploy

```bash
cd web/control-panel
npm run setup
```

## Manual Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Firebase Setup
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project (select your Firebase project)
firebase init hosting
```

### 3. Build & Deploy
```bash
# Build the application
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

## Configuration

### Add Your MCP Bridge Endpoint

1. Open your deployed control panel
2. Click "Add Endpoint" in the sidebar
3. Enter:
   - **Name**: `Local Bridge` (or any name)
   - **URL**: `http://localhost:3000` (or your bridge URL)
   - **Auth**: Your bridge admin token (optional)
   - **Environment**: `dev`, `staging`, or `prod`

### Configure CORS on Your Bridge

Add this to your MCP bridge server:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'https://your-project.web.app',
    'https://your-project.firebaseapp.com',
    'http://localhost:3000' // for local development
  ],
  credentials: true
}));
```

## Features

### ✅ Core Features
- **Multi-endpoint management** - Connect to multiple MCP bridges
- **Quick Actions** - Status, smoke test, restart, deploy hosting, full deploy
- **Tool Runner** - Execute any MCP tool with JSON arguments
- **Command Palette** - Press `Cmd/Ctrl+K` for quick access
- **Logs Panel** - Real-time log polling
- **LocalStorage** - Saves your endpoints and settings

### 🚀 Enhanced Features
- **RBAC Support** - Role-based access control
- **Demo Mode** - Safe mode for demonstrations (`?demo=1`)
- **Voice Commands** - Speech-to-text for commands
- **Webhook Inspector** - View recent webhooks
- **Metrics Dashboard** - Real-time performance metrics
- **Audit Mode** - Record all actions
- **Environment Filtering** - Tag and filter by dev/staging/prod

## Usage

### Quick Actions
- **Status Check** 🏥 - Health check for active endpoint
- **Smoke Test** 🧪 - Run basic functionality tests
- **Restart Service** 🔄 - Restart the MCP service
- **Deploy Hosting** 🌐 - Deploy to Firebase Hosting
- **Full Deploy** 🚀 - Complete deployment pipeline

### Tool Runner
1. Enter tool name (e.g., `deploy`, `status`, `logs`)
2. Add JSON arguments: `{"key": "value"}`
3. Check "Dry Run" for safe testing
4. Click "Run Tool"

### Command Palette
Press `Cmd/Ctrl+K` to open and quickly access any action.

## Troubleshooting

### Common Issues

1. **CORS errors**
   - Ensure your MCP bridge allows your hosting domain
   - Check that auth tokens are valid

2. **Build fails**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

3. **Deploy fails**
   ```bash
   firebase login
   firebase deploy --only hosting
   ```

4. **Tool execution errors**
   - Verify the tool exists on your MCP bridge
   - Check that the endpoint is accessible

### Debug Mode

Add `?debug=1` to your URL to see detailed error messages.

## Security

### Required MCP Bridge Endpoints

Your MCP bridge should expose these endpoints:

```javascript
// POST /tools
app.post('/tools', (req, res) => {
  const { tool, args, dryRun } = req.body;
  // Execute MCP tool and return result
  res.json({ result: 'success', data: result });
});

// GET /logs
app.get('/logs', (req, res) => {
  const limit = req.query.limit || 100;
  // Return recent logs
  res.json({ lines: logs.slice(-limit) });
});

// Optional: GET /webhooks/recent
app.get('/webhooks/recent', (req, res) => {
  // Return recent webhook events
  res.json({ webhooks: recentWebhooks });
});

// Optional: GET /metrics
app.get('/metrics', (req, res) => {
  // Return performance metrics
  res.json({ errorRate: '0%', p95Latency: '50ms' });
});
```

## Next Steps

1. **Add your MCP bridge endpoints**
2. **Configure user permissions** for RBAC
3. **Set up monitoring alerts** for your MCP services
4. **Train your team** on using the control panel
5. **Document your MCP tools** and workflows

## Support

- Check the [README.md](README.md) for detailed documentation
- Review [DEPLOYMENT.md](DEPLOYMENT.md) for deployment guides
- Check browser console for error messages
- Verify MCP bridge connectivity

---

**Ready to take control?** 🎭

Your EdenOS MCP Control Panel is now ready to manage all your MCP services with style and efficiency!
