# EdenOS MCP Control Panel - Deployment Guide

## Quick Deploy to Firebase Hosting

### Prerequisites

1. **Node.js 18+** installed
2. **Firebase CLI** installed: `npm install -g firebase-tools`
3. **Firebase project** created at [console.firebase.google.com](https://console.firebase.google.com)

### One-Command Deploy

```bash
cd web/control-panel
npm install && npm run build && firebase deploy --only hosting
```

### Step-by-Step Deployment

1. **Navigate to control panel directory:**
   ```bash
   cd web/control-panel
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Login to Firebase:**
   ```bash
   firebase login
   ```

4. **Initialize Firebase project:**
   ```bash
   firebase init hosting
   ```
   - Select your Firebase project
   - Use `out` as public directory
   - Configure as single-page app: **Yes**
   - Don't overwrite index.html: **No**

5. **Update `.firebaserc` with your project ID:**
   ```json
   {
     "projects": {
       "default": "your-project-id"
     }
   }
   ```

6. **Build the application:**
   ```bash
   npm run build
   ```

7. **Deploy to Firebase Hosting:**
   ```bash
   firebase deploy --only hosting
   ```

### Automated Deployment Scripts

#### Windows (PowerShell)
```powershell
.\scripts\deploy.ps1
```

#### Linux/macOS (Bash)
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

## Configuration

### Environment Variables

Create `.env.local` for local development:

```bash
# Default MCP endpoints (optional)
NEXT_PUBLIC_DEFAULT_ENDPOINTS='[{"name":"Local Bridge","url":"http://localhost:3000","auth":""}]'

# Default user scopes for RBAC (optional)
NEXT_PUBLIC_DEFAULT_SCOPES='["deploy.run","bq.read"]'

# Demo mode (optional)
NEXT_PUBLIC_DEMO_MODE=false
```

### CORS Configuration

Update your MCP bridge to allow CORS from your hosting domain:

```javascript
// In your MCP bridge server
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

## Custom Domain Setup

1. **Add custom domain in Firebase Console:**
   - Go to Project Settings > Hosting
   - Click "Add custom domain"
   - Follow the verification steps

2. **Update CORS settings:**
   ```javascript
   app.use(cors({
     origin: [
       'https://your-custom-domain.com',
       'https://your-project.web.app'
     ],
     credentials: true
   }));
   ```

3. **Redeploy:**
   ```bash
   npm run deploy:hosting
   ```

## Security Configuration

### Firebase Hosting Security Headers

The `firebase.json` includes security headers:

```json
{
  "hosting": {
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          },
          {
            "key": "X-Frame-Options",
            "value": "DENY"
          },
          {
            "key": "X-XSS-Protection",
            "value": "1; mode=block"
          },
          {
            "key": "Referrer-Policy",
            "value": "strict-origin-when-cross-origin"
          }
        ]
      }
    ]
  }
}
```

### Content Security Policy (CSP)

Add CSP headers to your MCP bridge:

```javascript
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "connect-src 'self' https://your-project.web.app;"
  );
  next();
});
```

## Monitoring and Analytics

### Firebase Analytics

Enable Firebase Analytics in your project:

1. Go to Firebase Console > Analytics
2. Enable Google Analytics
3. Add tracking code to your app

### Performance Monitoring

Monitor your control panel performance:

```bash
# Install Firebase Performance Monitoring
npm install firebase

# Add to your app
import { getPerformance } from 'firebase/performance';
const perf = getPerformance(app);
```

## Troubleshooting

### Common Issues

1. **Build fails:**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

2. **Deploy fails:**
   ```bash
   # Check Firebase CLI version
   firebase --version
   
   # Update if needed
   npm install -g firebase-tools@latest
   ```

3. **CORS errors:**
   - Verify your MCP bridge allows your hosting domain
   - Check that auth tokens are valid
   - Ensure endpoints are accessible

4. **404 errors:**
   - Verify `firebase.json` has correct rewrites
   - Check that build output is in `out` directory

### Debug Mode

Enable debug mode by adding `?debug=1` to your URL:

```
https://your-project.web.app?debug=1
```

This will show detailed error messages and network requests.

## Production Checklist

- [ ] Firebase project created and configured
- [ ] Custom domain added (if needed)
- [ ] CORS configured on MCP bridge
- [ ] Security headers enabled
- [ ] Analytics enabled
- [ ] Performance monitoring configured
- [ ] Error tracking set up
- [ ] Backup strategy in place
- [ ] SSL certificate valid
- [ ] CDN configured (if needed)

## Support

For issues with deployment:

1. Check Firebase Console logs
2. Verify MCP bridge connectivity
3. Test endpoints manually
4. Check browser console for errors
5. Review Firebase Hosting documentation

## Next Steps

After successful deployment:

1. **Add your MCP bridge endpoints** in the control panel
2. **Configure user permissions** for RBAC
3. **Set up monitoring alerts** for your MCP services
4. **Train your team** on using the control panel
5. **Document your MCP tools** and workflows


