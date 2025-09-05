# EdenOS MCP Control Panel

A production-ready React control panel for managing MCP services with Firebase Hosting deployment.

## Features

- **Multi-endpoint management** - Connect to multiple MCP bridges
- **Quick Actions** - Status, smoke test, restart, deploy hosting, full deploy
- **Tool Runner** - Execute any MCP tool with JSON arguments and dry-run support
- **Command Palette** - Cmd/Ctrl+K for quick access to all actions
- **LocalStorage persistence** - Saves endpoints and settings
- **Logs panel** - Real-time log polling from MCP services
- **RBAC support** - Role-based access control for dangerous operations
- **Demo mode** - Safe mode for demonstrations

## Quick Start

1. **Install dependencies:**
   ```bash
   cd web/control-panel
   npm install
   ```

2. **Development:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Deploy to Firebase Hosting:**
   ```bash
   npm run deploy:hosting
   ```

## Configuration

### Environment Variables

Create `.env.local` for local development:

```bash
# Optional: Override default MCP endpoints
NEXT_PUBLIC_DEFAULT_ENDPOINTS='[{"name":"Local Bridge","url":"http://localhost:3000","auth":""}]'

# Optional: Default user scopes for RBAC
NEXT_PUBLIC_DEFAULT_SCOPES='["deploy.run","bq.read"]'
```

### Firebase Setup

1. **Initialize Firebase project:**
   ```bash
   firebase login
   firebase init hosting
   ```

2. **Update `.firebaserc`** with your project ID:
   ```json
   {
     "projects": {
       "default": "your-project-id"
     }
   }
   ```

## Usage

### Adding Endpoints

1. Click "Add Endpoint" in the sidebar
2. Enter endpoint name, URL, and optional auth token
3. Select the endpoint to make it active

### Quick Actions

- **Status Check** 🏥 - Health check for the active endpoint
- **Smoke Test** 🧪 - Run basic functionality tests
- **Restart Service** 🔄 - Restart the MCP service (requires permissions)
- **Deploy Hosting** 🌐 - Deploy to Firebase Hosting
- **Full Deploy** 🚀 - Complete deployment pipeline (requires `deploy.run` scope)

### Tool Runner

1. Enter tool name (e.g., `deploy`, `status`, `logs`)
2. Add JSON arguments if needed: `{"key": "value"}`
3. Check "Dry Run" for safe testing
4. Click "Run Tool"

### Command Palette

Press `Cmd/Ctrl+K` to open the command palette and quickly access any action.

## Security Features

### RBAC (Role-Based Access Control)

The control panel respects user scopes for dangerous operations:

- `deploy.run` - Required for full deployments
- `bq.read` - Required for BigQuery operations
- `gcs.write` - Required for Cloud Storage operations

### Demo Mode

Add `?demo=1` to the URL to enable demo mode:
- All destructive actions are disabled
- Dry run is forced for all tool calls
- Restart and full deploy buttons are hidden

### CORS Configuration

Ensure your MCP bridge allows CORS from your hosting domain:

```javascript
// In your MCP bridge server
app.use(cors({
  origin: ['https://your-project.web.app', 'https://your-project.firebaseapp.com'],
  credentials: true
}));
```

## API Endpoints

The control panel expects these endpoints on your MCP bridge:

### POST /tools
```json
{
  "tool": "string",
  "args": {},
  "dryRun": false
}
```

### GET /logs?limit=100
```json
{
  "lines": ["log entry 1", "log entry 2"]
}
```

## Deployment

### Firebase Hosting

```bash
# Build and deploy
npm run deploy:hosting

# Or manually
npm run build
firebase deploy --only hosting
```

### Custom Domain

1. Add custom domain in Firebase Console
2. Update CORS settings in your MCP bridge
3. Redeploy the control panel

## Troubleshooting

### Common Issues

1. **CORS errors** - Ensure your MCP bridge allows your hosting domain
2. **Authentication failures** - Check that auth tokens are valid
3. **Tool execution errors** - Verify the tool exists on your MCP bridge
4. **Logs not loading** - Ensure your bridge has a `/logs` endpoint

### Debug Mode

Add `?debug=1` to the URL to see detailed error messages and network requests.

## Optional Enhancements

The control panel includes several optional features that can be enabled:

- **Webhook Inspector** - View recent outbound webhooks
- **Voice Trigger** - Speech-to-text for commands
- **Observability Pop-outs** - Real-time metrics and charts
- **Environment Scoping** - Tag services with dev/staging/prod
- **Audit Mode** - Record all actions to signed JSONL files

## License

MIT License - See LICENSE file for details.


