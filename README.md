# 🚀 EdenOS MCP Bridge

**Ultimate MCP Server with 15+ Service Integrations**

A comprehensive Model Context Protocol (MCP) bridge that connects 15+ popular services including Notion, Linear, GitHub, Firebase, GCP, Figma, Zapier, and more. Built with Express.js, React, and deployed on Vercel.

## ✨ Features

### 🎯 Backend Features
- **MCP Bridge Server** with 15+ service integrations
- **Express.js API** with WebSocket support
- **Fun Features**: Live Ops Theater, Holographic Memory Graph
- **Production Hardening**: Health checks, metrics, monitoring
- **Security**: CORS, rate limiting, authentication

### 🎨 Frontend Features
- **React Control Panel** with command palette
- **Wow Control** with sci-fi UI
- **Live Ops Theater** with real-time updates
- **Holographic Memory Graph** with 3D visualization
- **Audit Cinema** with event streaming
- **Multi-workspace support** for all services

### 🔧 Service Integrations
- **Notion** - Note-taking and documentation
- **Linear** - Project management and issue tracking
- **GitHub** - Code repository management
- **Firebase** - Backend-as-a-Service
- **GCP** - Google Cloud Platform services
- **Figma** - Design collaboration
- **Zapier** - Workflow automation
- **Bnd** - Business process management
- **Saviynt** - Identity governance
- **Anthropic** - AI services
- **Neon** - Serverless PostgreSQL
- **DeepMind** - AI research tools
- **OpenAI** - AI language models
- **Box** - File storage and collaboration

## 🌐 Live Deployment

**Production URL**: https://edenos-mcp-bridge-4cf6pi7jx-joven-ongs-projects-83d1122c.vercel.app

### Available Endpoints
- **Main App**: `/`
- **Health Check**: `/health`
- **Tools API**: `/tools`
- **Logs API**: `/logs`
- **Control Panel**: `/control-panel`
- **Wow Control**: `/wow-control`

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/besfeng23/edenos-mcp-bridge.git
   cd edenos-mcp-bridge
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Main app: http://localhost:3000
   - Control Panel: http://localhost:3000/control-panel
   - Wow Control: http://localhost:3000/wow-control

### Environment Variables

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=3000
# Add your service API keys here
NOTION_API_KEY=your_notion_key
LINEAR_API_KEY=your_linear_key
GITHUB_TOKEN=your_github_token
# ... other service keys
```

## 📁 Project Structure

```
edenos-mcp-bridge/
├── src/                    # Source code
│   ├── server.ts          # Main server file
│   ├── tools/             # MCP tool implementations
│   └── ui/                # UI components
├── web/                   # Frontend applications
│   ├── control-panel/     # React control panel
│   ├── wow-control/       # Sci-fi UI components
│   └── live-ops/          # Live operations theater
├── plugins/               # Fun plugins and features
├── aws/                   # AWS deployment scripts
├── dist/                  # Built files
├── server.js              # Vercel server entry point
├── vercel.json            # Vercel configuration
└── package.json           # Dependencies and scripts
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run vercel-dev` - Start Vercel development
- `npm run aws-deploy` - Deploy to AWS
- `npm run aws-deploy-win` - Deploy to AWS (Windows)

## 🚀 Deployment

### Vercel (Recommended)
```bash
vercel --prod
```

### AWS
```bash
# Setup AWS credentials first
npm run aws-setup-win

# Deploy to AWS
npm run aws-deploy-win
```

### Manual Deployment
1. Build the project: `npm run build`
2. Deploy the `dist/` folder to your hosting provider
3. Configure environment variables

## 🔧 API Usage

### Health Check
```bash
curl https://your-domain.com/health
```

### Execute Tool
```bash
curl -X POST https://your-domain.com/tools \
  -H "Content-Type: application/json" \
  -d '{"tool": "notion.create_page", "args": {"title": "Test Page"}}'
```

### Get Logs
```bash
curl https://your-domain.com/logs?limit=100
```

## 🎨 Frontend Components

### Control Panel
- React-based admin interface
- Command palette (Cmd/Ctrl+K)
- Real-time monitoring
- Multi-workspace support

### Wow Control
- Sci-fi themed UI
- Holographic displays
- Futuristic workspace management
- Interactive 3D elements

### Live Ops Theater
- Real-time event streaming
- Live monitoring dashboard
- Interactive controls
- Performance metrics

## 🔒 Security

- CORS protection
- Rate limiting
- Input validation
- Environment variable protection
- Secure API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ by the EdenOS Team
- Powered by Vercel
- Inspired by the Model Context Protocol community

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/besfeng23/edenos-mcp-bridge/issues)
- **Discussions**: [GitHub Discussions](https://github.com/besfeng23/edenos-mcp-bridge/discussions)
- **Documentation**: [Wiki](https://github.com/besfeng23/edenos-mcp-bridge/wiki)

---

**Made with ❤️ by EdenOS Team**