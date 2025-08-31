# 🚀 EdenOS MCP Bridge

A comprehensive **Model Context Protocol (MCP)** server that provides 40+ tools for managing Google Cloud Platform, Firebase, Firestore, BigQuery, GitHub Actions, and more. Features a modern React-based web interface for complete control and monitoring.

## ✨ Features

### 🔧 **40+ MCP Tools Across 8 Categories**
- **GCP Tools** (6): Cloud Run, Pub/Sub, Scheduler, Cloud Tasks
- **Firebase Tools** (6): Hosting, Functions, App Management
- **Firestore Tools** (5): Query, Write, Delete, Backup, Restore
- **BigQuery Tools** (5): SQL Execution, Dataset/Table Management, Export
- **GitHub Actions** (5): Workflow Management, Deploy, Rollback, Smoke Tests
- **Secrets Management** (6): Create, Get, Update, Delete, List, Rotate
- **Authentication** (5): GCP, Firebase, GitHub Auth Management
- **Health & Monitoring** (2): System Health, Smoke Tests

### 🎨 **Modern Web Interface**
- **Dark Theme**: Professional dark UI with neutral-950 background
- **Responsive Design**: Mobile-first responsive layout
- **Real-time Updates**: Live system status and metrics
- **Interactive Dashboard**: Comprehensive overview with quick actions
- **Tool Manager**: Search, filter, and execute all 40 tools
- **Infrastructure View**: GCP resources and deployment status
- **Monitoring Panel**: System metrics, logs, and health checks
- **Settings Management**: Complete configuration control

### 🏗️ **Infrastructure & DevOps**
- **Terraform IaC**: Complete infrastructure as code
- **Cloud Run**: Serverless container deployment
- **Firebase Hosting**: Web interface hosting
- **CI/CD Pipeline**: Automated deployments via Cloud Build
- **Multi-Environment**: Staging and production support
- **Health Monitoring**: Automated health checks and alerts

## 🚀 Quick Start

### 1. **Clone & Install**
```bash
git clone https://github.com/edenos/edenos-mcp-bridge.git
cd edenos-mcp-bridge
npm install
```

### 2. **Build & Run**
```bash
# Build the backend server
npm run build

# Build the web interface
npm run build:ui

# Start the server
npm start
```

### 3. **Access the Interface**
- **Web UI**: Open `http://localhost:3000` in your browser
- **MCP Server**: Available on the configured transport
- **Health Check**: `http://localhost:8080/health`
- **Metrics**: `http://localhost:8080/metrics`

## 🌐 Web Interface

The EdenOS MCP Bridge includes a comprehensive web interface with:

### 📊 **Dashboard**
- System status overview
- Quick action buttons
- Tool category summary
- Recent activity feed
- Performance metrics

### 🛠️ **Tools Manager**
- Browse all 40 tools by category
- Search and filter capabilities
- Grid and list view modes
- Tool execution interface
- Usage statistics

### 🏗️ **Infrastructure**
- GCP resource status
- Cloud Run services
- Firebase projects
- Terraform deployment status
- Environment management

### 📈 **Monitoring**
- Real-time metrics
- System health status
- Log viewing and filtering
- Performance trends
- Alert configuration

### ⚙️ **Settings**
- Environment variables
- Security configuration
- Integration settings
- Monitoring preferences
- System preferences

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Interface │    │   MCP Bridge    │    │   GCP Services  │
│   (React +      │◄──►│   (Node.js +    │◄──►│   (Cloud Run,   │
│    Tailwind)    │    │    MCP SDK)     │    │    Firebase,    │
└─────────────────┘    └─────────────────┘    │    Firestore)   │
                                              └─────────────────┘
```

## 🔧 Development

### **Available Scripts**
```bash
npm run build          # Build backend server
npm run build:ui       # Build web interface
npm run dev:ui         # Start UI development server
npm run start          # Start production server
npm run deploy         # Deploy to Firebase
```

### **Project Structure**
```
edenos-mcp-bridge/
├── src/
│   ├── server.ts          # Main MCP server
│   ├── tools/             # Tool implementations
│   │   ├── gcp.ts         # GCP tools
│   │   ├── firebase.ts    # Firebase tools
│   │   ├── firestore.ts   # Firestore tools
│   │   ├── bigquery.ts    # BigQuery tools
│   │   ├── actions.ts     # GitHub Actions
│   │   ├── secrets.ts     # Secrets management
│   │   ├── auth.ts        # Authentication
│   │   └── health.ts      # Health monitoring
│   └── ui/                # Web interface
│       ├── components/    # React components
│       ├── types.ts       # TypeScript types
│       └── main.tsx       # App entry point
├── infra/                 # Infrastructure
│   └── terraform/         # Terraform configs
├── public/                # Built web assets
└── dist/                  # Built server
```

## 🚀 Deployment

### **Firebase Hosting (Web UI)**
```bash
# Deploy web interface
npm run deploy:hosting

# Or manually
firebase deploy --only hosting
```

### **Cloud Run (Backend)**
```bash
# Deploy backend service
npm run deploy:functions

# Or use the deployment script
./scripts/deploy.sh
```

### **Terraform (Infrastructure)**
```bash
cd infra/terraform

# Deploy staging
./deploy.sh staging apply

# Deploy production
./deploy.sh production apply
```

## 🔒 Security Features

- **Rate Limiting**: Configurable RPS and burst limits
- **CORS Protection**: Environment-specific origin restrictions
- **Secret Management**: Secure credential storage
- **RBAC Support**: Role-based access control
- **Audit Logging**: Comprehensive operation logging

## 📊 Monitoring & Observability

- **Health Checks**: `/health` endpoint with system status
- **Metrics**: Prometheus-style metrics at `/metrics`
- **Structured Logging**: JSON-formatted logs
- **Real-time Updates**: Live status monitoring
- **Performance Tracking**: Request rates, latency, errors

## 🌍 Environment Support

### **Staging Environment**
- Project: `gcp-edenos-staging`
- Features: Debug logging, permissive rate limits
- Scaling: 0-5 instances, lower resource limits

### **Production Environment**
- Project: `gcp-edenos`
- Features: Info logging, strict rate limits
- Scaling: 2-20 instances, higher resource limits

## 🔗 Integrations

- **Google Cloud Platform**: Full GCP service management
- **Firebase**: Hosting, Functions, App management
- **GitHub**: Actions, workflows, deployments
- **Terraform**: Infrastructure automation
- **Cloud Build**: CI/CD pipeline

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Complete deployment instructions
- [Terraform README](./infra/terraform/README.md) - Infrastructure details
- [API Reference](./docs/api.md) - Tool API documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/edenos/edenos-mcp-bridge/issues)
- **Documentation**: [Project Wiki](https://github.com/edenos/edenos-mcp-bridge/wiki)
- **Discussions**: [GitHub Discussions](https://github.com/edenos/edenos-mcp-bridge/discussions)

---

**Built with ❤️ by the EdenOS Team**

*Empowering developers with comprehensive MCP tools and modern infrastructure management.*
# mcpmaster
