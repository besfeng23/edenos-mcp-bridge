# 🚀 EdenOS MCP Bridge - AWS Deployment

This directory contains all the necessary files and scripts to deploy the EdenOS MCP Bridge to AWS using CloudFormation and ECS.

## 📋 Prerequisites

Before deploying to AWS, ensure you have the following installed and configured:

### Required Tools
- **AWS CLI** - [Install Guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- **Docker** - [Install Guide](https://docs.docker.com/get-docker/)
- **Node.js 18+** - [Install Guide](https://nodejs.org/)

### AWS Configuration
1. **AWS Account** with appropriate permissions
2. **AWS CLI configured** with your credentials:
   ```bash
   aws configure
   ```
3. **IAM permissions** for:
   - CloudFormation
   - ECS (Fargate)
   - ECR (Elastic Container Registry)
   - VPC and networking
   - Application Load Balancer
   - CloudWatch Logs

## 🏗️ Architecture

The deployment creates the following AWS resources:

### Core Infrastructure
- **VPC** with public subnets across 2 availability zones
- **Internet Gateway** for public internet access
- **Security Groups** for ALB and ECS tasks
- **Application Load Balancer** for traffic distribution

### Container Platform
- **ECS Cluster** with Fargate launch type
- **ECS Service** with auto-scaling capabilities
- **ECR Repository** for Docker image storage
- **CloudWatch Logs** for application logging

### Optional Features
- **Route 53** hosted zone (if custom domain provided)
- **SSL Certificate** support (if certificate ARN provided)

## 🚀 Quick Start

### 1. Basic Deployment (Linux/macOS)
```bash
# Make the script executable
chmod +x aws/deploy.sh

# Deploy with default settings
./aws/deploy.sh
```

### 2. Basic Deployment (Windows PowerShell)
```powershell
# Deploy with default settings
.\aws\deploy.ps1
```

### 3. Custom Configuration
```bash
# Deploy to specific region with custom domain
./aws/deploy.sh \
  --region us-west-2 \
  --environment staging \
  --domain mydomain.com \
  --certificate arn:aws:acm:us-west-2:123456789012:certificate/12345678-1234-1234-1234-123456789012
```

## 📝 Configuration Options

### Command Line Parameters

| Parameter | Description | Default | Required |
|-----------|-------------|---------|----------|
| `--stack-name` | CloudFormation stack name | `edenos-mcp-bridge` | No |
| `--region` | AWS region | `us-east-1` | No |
| `--environment` | Environment name | `prod` | No |
| `--domain` | Custom domain name | (empty) | No |
| `--certificate` | SSL certificate ARN | (empty) | No |

### Environment Variables

Set these in your ECS task definition or CloudFormation parameters:

```bash
# Server Configuration
NODE_ENV=production
PORT=3000
BRIDGE_ADMIN_TOKEN=your-secure-admin-token

# Service API Keys (add as needed)
NOTION_API_KEY=your-notion-api-key
LINEAR_API_KEY=your-linear-api-key
GITHUB_TOKEN=your-github-token
FIREBASE_PROJECT_ID=your-firebase-project-id
GCP_PROJECT_ID=your-gcp-project-id
FIGMA_ACCESS_TOKEN=your-figma-access-token
ZAPIER_API_KEY=your-zapier-api-key
BND_API_KEY=your-bnd-api-key
SAVIYNT_API_KEY=your-saviynt-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
NEON_API_KEY=your-neon-api-key
DEEPMIND_API_KEY=your-deepmind-api-key
OPENAI_API_KEY=your-openai-api-key
BOX_ACCESS_TOKEN=your-box-access-token
```

## 🔧 Manual Deployment Steps

If you prefer to deploy manually:

### 1. Build and Push Docker Image
```bash
# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REPOSITORY_URI="${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/edenos-mcp-bridge-edenos-mcp-bridge"

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $ECR_REPOSITORY_URI

# Build and push image
docker build -t edenos-mcp-bridge-edenos-mcp-bridge .
docker tag edenos-mcp-bridge-edenos-mcp-bridge:latest $ECR_REPOSITORY_URI:latest
docker push $ECR_REPOSITORY_URI:latest
```

### 2. Deploy CloudFormation Stack
```bash
aws cloudformation create-stack \
  --stack-name edenos-mcp-bridge \
  --template-body file://aws/cloudformation-template.yaml \
  --parameters ParameterKey=Environment,ParameterValue=prod \
  --capabilities CAPABILITY_IAM \
  --region us-east-1
```

### 3. Wait for Stack Creation
```bash
aws cloudformation wait stack-create-complete --stack-name edenos-mcp-bridge --region us-east-1
```

## 📊 Monitoring and Logs

### CloudWatch Logs
- **Log Group**: `/ecs/edenos-mcp-bridge`
- **Retention**: 30 days
- **Stream Prefix**: `ecs`

### Health Checks
- **Path**: `/health`
- **Interval**: 30 seconds
- **Timeout**: 5 seconds
- **Healthy Threshold**: 2
- **Unhealthy Threshold**: 3

### Metrics
- **ECS Service Metrics**: Available in CloudWatch
- **ALB Metrics**: Request count, response time, error rates
- **Custom Metrics**: Available via `/metrics` endpoint

## 🔄 Updates and Scaling

### Update Application
```bash
# Rebuild and push new image
docker build -t edenos-mcp-bridge-edenos-mcp-bridge .
docker tag edenos-mcp-bridge-edenos-mcp-bridge:latest $ECR_REPOSITORY_URI:latest
docker push $ECR_REPOSITORY_URI:latest

# Force new deployment
aws ecs update-service \
  --cluster edenos-mcp-bridge-cluster \
  --service edenos-mcp-bridge-service \
  --force-new-deployment
```

### Scale Service
```bash
# Update desired count
aws ecs update-service \
  --cluster edenos-mcp-bridge-cluster \
  --service edenos-mcp-bridge-service \
  --desired-count 4
```

## 🗑️ Cleanup

To remove all AWS resources:

```bash
# Delete CloudFormation stack
aws cloudformation delete-stack --stack-name edenos-mcp-bridge --region us-east-1

# Wait for deletion
aws cloudformation wait stack-delete-complete --stack-name edenos-mcp-bridge --region us-east-1

# Delete ECR repository (optional)
aws ecr delete-repository --repository-name edenos-mcp-bridge-edenos-mcp-bridge --force
```

## 🚨 Troubleshooting

### Common Issues

1. **Docker Build Fails**
   - Ensure Docker is running
   - Check Dockerfile syntax
   - Verify all dependencies are installed

2. **ECR Push Fails**
   - Verify AWS credentials
   - Check ECR repository exists
   - Ensure proper IAM permissions

3. **CloudFormation Fails**
   - Check IAM permissions
   - Verify resource limits
   - Review CloudFormation events

4. **ECS Service Won't Start**
   - Check task definition
   - Verify security groups
   - Review CloudWatch logs

### Debug Commands

```bash
# Check ECS service status
aws ecs describe-services --cluster edenos-mcp-bridge-cluster --services edenos-mcp-bridge-service

# View CloudFormation events
aws cloudformation describe-stack-events --stack-name edenos-mcp-bridge

# Check CloudWatch logs
aws logs describe-log-streams --log-group-name /ecs/edenos-mcp-bridge
```

## 📚 Additional Resources

- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [AWS CloudFormation Documentation](https://docs.aws.amazon.com/cloudformation/)
- [AWS ECR Documentation](https://docs.aws.amazon.com/ecr/)
- [Docker Documentation](https://docs.docker.com/)

## 🎯 Cost Optimization

### Recommendations
- Use **Fargate Spot** for non-production workloads
- Set up **Auto Scaling** based on CPU/memory usage
- Configure **CloudWatch Logs retention** policies
- Use **Application Load Balancer** only when needed
- Consider **Reserved Capacity** for production workloads

### Estimated Costs (us-east-1)
- **ECS Fargate**: ~$15-30/month (2 tasks, 0.5 vCPU, 1GB RAM)
- **Application Load Balancer**: ~$16/month
- **ECR Storage**: ~$1-5/month (depending on image size)
- **CloudWatch Logs**: ~$1-3/month
- **Total**: ~$33-54/month

---

**Your EdenOS MCP Bridge is now ready for AWS deployment!** 🚀
