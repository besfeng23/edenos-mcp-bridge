# 🚀 Complete EdenOS MCP Bridge Deployment Guide

## Overview

This guide will help you deploy the complete EdenOS MCP Bridge to AWS, including:
- **Backend**: MCP Bridge Server with 15+ service integrations
- **Frontend**: React Control Panel + Wow Control Features
- **Infrastructure**: AWS ECS Fargate, ALB, VPC, ECR, CloudWatch

## 🎯 What You'll Get

### Backend Features
- ✅ MCP Bridge Server with Express.js API
- ✅ WebSocket support for real-time updates
- ✅ 15+ service integrations (Notion, Linear, GitHub, Firebase, GCP, Figma, Zapier, Bnd, Saviynt, Anthropic, Neon, DeepMind, OpenAI, Box)
- ✅ Fun features: Live Ops Theater, Holographic Memory Graph, Audit Cinema
- ✅ Production hardening: Health checks, metrics, monitoring
- ✅ Security: CORS, rate limiting, authentication

### Frontend Features
- ✅ React Control Panel with command palette
- ✅ Wow Control with sci-fi UI
- ✅ Live Ops Theater with real-time updates
- ✅ Holographic Memory Graph with 3D visualization
- ✅ Audit Cinema with event streaming
- ✅ Multi-workspace support for all services

### AWS Infrastructure
- ✅ ECS Fargate with auto-scaling
- ✅ Application Load Balancer
- ✅ VPC with security groups
- ✅ ECR repository for container images
- ✅ CloudWatch logs and monitoring
- ✅ Route 53 DNS (optional)
- ✅ SSL/TLS certificates (optional)

## 🔧 Prerequisites

### Required Software
- **AWS CLI**: [Install Guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- **Docker**: [Install Guide](https://docs.docker.com/get-docker/)
- **Node.js**: [Install Guide](https://nodejs.org/)
- **npm**: Comes with Node.js

### AWS Account Setup
1. **Create AWS Account**: [Sign up here](https://aws.amazon.com/)
2. **Configure AWS CLI**: Run `aws configure`
3. **Set up IAM User** with these policies:
   - `AmazonECS_FullAccess`
   - `AmazonEC2ContainerRegistryFullAccess`
   - `CloudFormationFullAccess`
   - `AmazonVPCFullAccess`
   - `IAMFullAccess`
   - `AmazonRoute53FullAccess`
   - `CloudWatchLogsFullAccess`

## 🚀 Quick Start Deployment

### Option 1: Complete Deployment (Recommended)

#### Linux/macOS:
```bash
# 1. Clone the repository
git clone https://github.com/your-username/edenos-mcp-bridge.git
cd edenos-mcp-bridge

# 2. Run complete deployment
./aws/deploy-complete.sh
```

#### Windows PowerShell:
```powershell
# 1. Clone the repository
git clone https://github.com/your-username/edenos-mcp-bridge.git
cd edenos-mcp-bridge

# 2. Run complete deployment
.\aws\deploy-complete.ps1
```

### Option 2: Step-by-Step Deployment

#### Step 1: AWS Setup
```bash
# Linux/macOS
./aws/setup-aws.sh

# Windows PowerShell
.\aws\setup-aws.ps1
```

#### Step 2: Deploy Backend
```bash
# Linux/macOS
./aws/deploy.sh

# Windows PowerShell
.\aws\deploy.ps1
```

## 🔐 Security Configuration

### Environment Variables
Create a `.env` file with your API keys:

```bash
# Core MCP Bridge
BRIDGE_ADMIN_TOKEN=your-admin-token
NODE_ENV=production

# Service API Keys
NOTION_API_KEY=your-notion-key
LINEAR_API_KEY=your-linear-key
GITHUB_TOKEN=your-github-token
FIREBASE_PROJECT_ID=your-firebase-project
GCP_PROJECT_ID=your-gcp-project
FIGMA_ACCESS_TOKEN=your-figma-token
ZAPIER_API_KEY=your-zapier-key
BND_API_KEY=your-bnd-key
SAVIYNT_API_KEY=your-saviynt-key
ANTHROPIC_API_KEY=your-anthropic-key
NEON_API_KEY=your-neon-key
DEEPMIND_API_KEY=your-deepmind-key
OPENAI_API_KEY=your-openai-key
BOX_ACCESS_TOKEN=your-box-token

# Fun Features (Optional)
SPOTIFY_CLIENT_ID=your-spotify-id
SPOTIFY_CLIENT_SECRET=your-spotify-secret
SLACK_BOT_TOKEN=your-slack-token
TELEGRAM_BOT_TOKEN=your-telegram-token
```

### AWS Secrets Manager (Recommended)
```bash
# Store secrets in AWS Secrets Manager
aws secretsmanager create-secret \
    --name "edenos-mcp-bridge/secrets" \
    --description "EdenOS MCP Bridge secrets" \
    --secret-string '{"NOTION_API_KEY":"your-key","LINEAR_API_KEY":"your-key"}'
```

## 📊 Monitoring and Logs

### CloudWatch Logs
- **Log Group**: `/ecs/edenos-mcp-bridge`
- **Retention**: 30 days (configurable)
- **Log Streams**: One per ECS task

### Health Checks
- **Endpoint**: `/health`
- **Interval**: 30 seconds
- **Timeout**: 3 seconds
- **Retries**: 3

### Metrics
- **Endpoint**: `/metrics`
- **Format**: Prometheus format
- **Metrics**: Request count, response time, error rate

## 🔄 Updates and Maintenance

### Update Deployment
```bash
# Linux/macOS
./aws/deploy-complete.sh

# Windows PowerShell
.\aws\deploy-complete.ps1
```

### Scale Services
```bash
# Scale ECS service
aws ecs update-service \
    --cluster edenos-mcp-bridge-cluster \
    --service edenos-mcp-bridge-service \
    --desired-count 3
```

### View Logs
```bash
# View recent logs
aws logs tail /ecs/edenos-mcp-bridge --follow

# View specific log stream
aws logs get-log-events \
    --log-group-name /ecs/edenos-mcp-bridge \
    --log-stream-name your-log-stream
```

## 🎨 Frontend Features

### React Control Panel
- **URL**: `https://your-domain.com/control-panel`
- **Features**: Command palette, tool runner, logs viewer
- **Authentication**: Admin token required

### Wow Control
- **URL**: `https://your-domain.com/wow-control`
- **Features**: Sci-fi UI, multi-workspace support
- **Services**: All 15+ integrated services

### Live Ops Theater
- **URL**: `https://your-domain.com/live-ops`
- **Features**: Real-time deployment monitoring
- **WebSocket**: Real-time updates

### Holographic Memory Graph
- **URL**: `https://your-domain.com/memgraph`
- **Features**: 3D visualization of system state
- **Technology**: Three.js

### Audit Cinema
- **URL**: `https://your-domain.com/audit-cinema`
- **Features**: Event streaming and visualization
- **Real-time**: Live event updates

## 🛠️ Troubleshooting

### Common Issues

#### 1. AWS Credentials Not Configured
```bash
# Configure AWS credentials
aws configure
```

#### 2. Docker Not Running
```bash
# Start Docker
sudo systemctl start docker  # Linux
# or start Docker Desktop on Windows/macOS
```

#### 3. ECS Service Not Starting
```bash
# Check ECS service status
aws ecs describe-services \
    --cluster edenos-mcp-bridge-cluster \
    --services edenos-mcp-bridge-service
```

#### 4. Load Balancer Health Check Failing
```bash
# Check target group health
aws elbv2 describe-target-health \
    --target-group-arn your-target-group-arn
```

### Debug Commands

#### Check Stack Status
```bash
aws cloudformation describe-stacks \
    --stack-name edenos-mcp-bridge
```

#### View ECS Task Logs
```bash
aws logs get-log-events \
    --log-group-name /ecs/edenos-mcp-bridge \
    --log-stream-name your-task-id
```

#### Test Health Endpoint
```bash
curl https://your-load-balancer-url/health
```

## 💰 Cost Optimization

### ECS Fargate
- **CPU**: 0.25 vCPU (256 CPU units)
- **Memory**: 0.5 GB (512 MB)
- **Cost**: ~$15-20/month for basic usage

### ECR Repository
- **Storage**: 10 GB (10 latest images)
- **Cost**: ~$1/month

### Application Load Balancer
- **Fixed Cost**: ~$16/month
- **Data Processing**: $0.008 per GB

### CloudWatch
- **Logs**: $0.50 per GB ingested
- **Metrics**: $0.30 per metric per month

### Total Estimated Cost
- **Basic Usage**: ~$35-40/month
- **High Usage**: ~$50-100/month

## 🔒 Security Best Practices

### 1. Never Store Secrets in Code
- Use AWS Secrets Manager
- Use environment variables
- Use IAM roles when possible

### 2. Network Security
- VPC with private subnets
- Security groups with minimal access
- ALB with SSL/TLS termination

### 3. Access Control
- IAM users with least privilege
- MFA enabled for AWS console
- Regular credential rotation

### 4. Monitoring
- CloudTrail for API calls
- CloudWatch for metrics and logs
- AWS Config for compliance

## 🎉 Success!

Once deployed, you'll have:

1. **Complete MCP Bridge** running on AWS ECS
2. **React Control Panel** for management
3. **Wow Control Features** for demonstrations
4. **15+ Service Integrations** ready to use
5. **Production-ready infrastructure** with monitoring

### Next Steps
1. Configure your API keys
2. Test all integrations
3. Set up monitoring alerts
4. Configure custom domain (optional)
5. Set up SSL certificates (optional)

---

**Your EdenOS MCP Bridge is now live and ready to power your AI applications!** 🚀✨
