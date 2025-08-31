# 🚀 EdenOS MCP Bridge - Deployment Guide

## 📋 Prerequisites

Before deploying, ensure you have:

- ✅ **Google Cloud SDK** installed and authenticated
- ✅ **Terraform** v1.0+ installed
- ✅ **Docker** installed and running
- ✅ **Git** access to the repository
- ✅ **GCP Project** with billing enabled

## 🔧 Quick Setup

### 1. Install Dependencies

```bash
# Install Google Cloud SDK
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init

# Install Terraform
# Windows: Download from https://www.terraform.io/downloads.html
# macOS: brew install terraform
# Linux: curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add -

# Install Docker
# Follow instructions at https://docs.docker.com/get-docker/
```

### 2. Authenticate with GCP

```bash
gcloud auth login
gcloud auth application-default login
gcloud config set project YOUR_PROJECT_ID
```

## 🚀 Deployment Options

### Option A: Automated CI/CD (Recommended)

The project includes a Cloud Build pipeline that automatically deploys on GitHub pushes:

1. **Push to `develop` branch** → Deploys to staging
2. **Push to `main` branch** → Deploys to production

### Option B: Manual Deployment

For manual control or testing:

```bash
# Build and deploy manually
gcloud builds submit --config=cloudbuild.yaml
```

## 🏗️ Infrastructure Deployment

### Step 1: Deploy Staging Environment

```bash
cd edenos-mcp-bridge/infra/terraform

# Review the deployment plan
./deploy.sh staging plan

# Deploy the infrastructure
./deploy.sh staging apply
```

**Expected Output:**
```
=== EdenOS MCP Bridge Infrastructure Deployment ===
Environment: staging
Action: apply
Project Directory: /path/to/edenos-mcp-bridge/infra/terraform

Target Project: gcp-edenos-staging
Target Region: us-central1

✅ Infrastructure deployed successfully!

=== Deployment Outputs ===
service_url = "https://edenos-mcp-bridge-xxxxx.run.app"
service_account_email = "edenos-mcp-bridge@gcp-edenos-staging.iam.gserviceaccount.com"
```

### Step 2: Deploy Production Environment

```bash
# Review the deployment plan
./deploy.sh production plan

# Deploy the infrastructure
./deploy.sh production apply
```

## 🐳 Container Deployment

### Build and Push Container

```bash
# Set your project ID
export PROJECT_ID="your-gcp-project-id"

# Build the container
docker build -t gcr.io/$PROJECT_ID/edenos-mcp-bridge:latest .

# Push to Google Container Registry
docker push gcr.io/$PROJECT_ID/edenos-mcp-bridge:latest
```

### Deploy to Cloud Run

```bash
# Deploy the service
gcloud run deploy edenos-mcp-bridge \
  --image gcr.io/$PROJECT_ID/edenos-mcp-bridge:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1000m \
  --min-instances 1 \
  --max-instances 10
```

## ✅ Verification Steps

### 1. Check Service Status

```bash
# Get service URL
gcloud run services describe edenos-mcp-bridge \
  --region us-central1 \
  --format='value(status.url)'

# Test health endpoint
curl https://YOUR_SERVICE_URL/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-08-31T12:00:00.000Z",
  "uptime": 123.45,
  "memory": {...},
  "tools": 40
}
```

### 2. Test Metrics Endpoint

```bash
curl https://YOUR_SERVICE_URL/metrics
```

**Expected Response:**
```
# EdenOS MCP Bridge Metrics
# HELP mcp_tools_total Total number of available tools
# TYPE mcp_tools_total gauge
mcp_tools_total 40

# HELP mcp_rate_limit_hits_total Total rate limit hits
# TYPE mcp_rate_limit_hits_total counter
mcp_rate_limit_hits_total 0
```

### 3. Verify Tools Available

```bash
# Test tool listing (if using MCP client)
# The service should expose 40 tools across 8 categories
```

## 🔍 Monitoring & Troubleshooting

### View Logs

```bash
# View real-time logs
gcloud logs tail --project=$PROJECT_ID \
  --filter='resource.type=cloud_run_revision'

# View specific service logs
gcloud logs read --project=$PROJECT_ID \
  --filter='resource.type=cloud_run_revision AND resource.labels.service_name=edenos-mcp-bridge' \
  --limit=50
```

### Check Service Status

```bash
# Get service details
gcloud run services describe edenos-mcp-bridge \
  --region us-central1

# Check revisions
gcloud run revisions list \
  --service=edenos-mcp-bridge \
  --region us-central1
```

### Common Issues & Solutions

#### Issue: Service won't start
```bash
# Check container logs
gcloud logs read --project=$PROJECT_ID \
  --filter='resource.type=cloud_run_revision' \
  --limit=10

# Verify environment variables
gcloud run services describe edenos-mcp-bridge \
  --region us-central1 \
  --format='value(spec.template.spec.containers[0].env[].name,spec.template.spec.containers[0].env[].value)'
```

#### Issue: Permission denied
```bash
# Check service account permissions
gcloud projects get-iam-policy $PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:edenos-mcp-bridge"

# Verify required APIs are enabled
gcloud services list --enabled --project=$PROJECT_ID
```

#### Issue: Health checks failing
```bash
# Test health endpoint manually
curl -v https://YOUR_SERVICE_URL/health

# Check Cloud Scheduler job
gcloud scheduler jobs describe edenos-mcp-bridge-health-check \
  --location=us-central1
```

## 🔒 Security Configuration

### Update CORS Origins

```bash
# Update allowed origins for production
gcloud run services update edenos-mcp-bridge \
  --region us-central1 \
  --set-env-vars="ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com"
```

### Rotate Secrets

```bash
# Update GitHub token
echo -n "your-new-github-token" | \
  gcloud secrets versions add edenos-github-token --data-file=-

# Update Firebase service account
gcloud secrets versions add edenos-firebase-service-account \
  --data-file=path/to/firebase-key.json
```

## 📊 Performance Tuning

### Adjust Scaling

```bash
# Update scaling configuration
gcloud run services update edenos-mcp-bridge \
  --region us-central1 \
  --min-instances 2 \
  --max-instances 20
```

### Update Rate Limits

```bash
# Adjust rate limiting for production
gcloud run services update edenos-mcp-bridge \
  --region us-central1 \
  --set-env-vars="RATE_LIMIT_RPS=10,RATE_LIMIT_BURST=20"
```

## 🧹 Cleanup

### Destroy Infrastructure

```bash
# Destroy staging environment
./deploy.sh staging destroy

# Destroy production environment
./deploy.sh production destroy
```

### Remove Container Images

```bash
# List images
gcloud container images list-tags gcr.io/$PROJECT_ID/edenos-mcp-bridge

# Delete specific tags
gcloud container images delete gcr.io/$PROJECT_ID/edenos-mcp-bridge:latest

# Delete all images
gcloud container images delete gcr.io/$PROJECT_ID/edenos-mcp-bridge --delete-all-tags
```

## 📚 Additional Resources

### Documentation
- [PROJECT_STATUS.md](./PROJECT_STATUS.md) - Complete project overview
- [README.md](./README.md) - Project documentation
- [Terraform README](./infra/terraform/README.md) - Infrastructure details

### Scripts
- `./deploy.sh` - Linux/macOS deployment script
- `./deploy.ps1` - Windows PowerShell deployment script
- `./scripts/deploy.sh` - Application deployment script
- `./scripts/smoke.sh` - Smoke testing script

### Configuration Files
- `infra/terraform/environments/staging.tfvars` - Staging configuration
- `infra/terraform/environments/production.tfvars` - Production configuration
- `cloudbuild.yaml` - CI/CD pipeline configuration

## 🎯 Next Steps

After successful deployment:

1. **Test all 40 tools** to ensure functionality
2. **Configure monitoring** alerts for production
3. **Set up backup procedures** for critical data
4. **Document runbooks** for common operations
5. **Train team members** on the new system

## 🆘 Support

For deployment issues:

1. Check the logs: `gcloud logs tail --project=$PROJECT_ID`
2. Verify infrastructure: `terraform plan`
3. Test endpoints manually
4. Review the troubleshooting section above

**Happy deploying! 🚀**
