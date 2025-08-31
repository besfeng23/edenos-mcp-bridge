# EdenOS MCP Bridge Infrastructure

This directory contains the Terraform configuration for deploying the EdenOS MCP Bridge to Google Cloud Platform.

## Architecture

The infrastructure consists of:

- **Cloud Run Service**: Hosts the MCP Bridge application
- **Service Account**: Manages permissions and authentication
- **Cloud Build Trigger**: Automates CI/CD pipeline
- **Pub/Sub Topic**: Handles event notifications
- **Cloud Scheduler**: Runs periodic health checks
- **Secret Manager**: Stores sensitive configuration
- **IAM Roles**: Manages access control

## Prerequisites

1. **Google Cloud SDK**: Install and authenticate
2. **Terraform**: Version 1.0 or higher
3. **GCP Project**: With billing enabled
4. **Required APIs**: Will be enabled automatically

## Quick Start

### 1. Initialize Terraform

```bash
cd infra/terraform
terraform init
```

### 2. Configure Environment

Choose your environment:

**Staging (Development):**
```bash
terraform plan -var-file=environments/staging.tfvars
terraform apply -var-file=environments/staging.tfvars
```

**Production:**
```bash
terraform plan -var-file=environments/production.tfvars
terraform apply -var-file=environments/production.tfvars
```

### 3. Deploy Application

```bash
# Build and deploy
gcloud builds submit --config=cloudbuild.yaml

# Or use the deployment script
../../scripts/deploy.sh
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `project_id` | GCP Project ID | `gcp-edenos` |
| `region` | GCP Region | `us-central1` |
| `environment` | Environment name | `staging` |
| `log_level` | Application log level | `info` |
| `rate_limit_rps` | Rate limit per second | `5` |
| `rate_limit_burst` | Rate limit burst capacity | `10` |

### Customization

Create a custom `.tfvars` file:

```hcl
# custom.tfvars
project_id = "my-project"
region     = "europe-west1"
log_level  = "debug"
```

Apply with:
```bash
terraform apply -var-file=custom.tfvars
```

## Security

### IAM Roles

The service account has the following roles:
- `roles/run.invoker` - Cloud Run invocation
- `roles/secretmanager.secretAccessor` - Secret access
- `roles/pubsub.publisher` - Pub/Sub publishing
- `roles/cloudscheduler.admin` - Scheduler management
- `roles/cloudtasks.admin` - Cloud Tasks management
- `roles/datastore.user` - Firestore access
- `roles/bigquery.dataEditor` - BigQuery data access
- `roles/bigquery.jobUser` - BigQuery job execution
- `roles/firebase.admin` - Firebase management

### CORS Configuration

CORS origins are configurable per environment:
- **Staging**: Includes localhost and staging domains
- **Production**: Production domains only

## Monitoring

### Health Checks

- **Endpoint**: `/health`
- **Schedule**: Every 5 minutes via Cloud Scheduler
- **Metrics**: Available at `/metrics`

### Logging

- **Format**: Structured JSON
- **Destination**: Cloud Logging
- **Levels**: debug, info, warn, error

## Scaling

### Cloud Run Configuration

- **Min Instances**: 1 (staging: 0)
- **Max Instances**: 10 (staging: 5, production: 20)
- **CPU**: 1000m (staging: 500m)
- **Memory**: 512Mi (staging: 256Mi)

### Autoscaling

- **Target CPU**: 70%
- **Target Memory**: 80%
- **Scale Down Delay**: 300 seconds

## Deployment

### Manual Deployment

```bash
# Build container
docker build -t gcr.io/PROJECT_ID/edenos-mcp-bridge:latest .

# Push to registry
docker push gcr.io/PROJECT_ID/edenos-mcp-bridge:latest

# Deploy to Cloud Run
gcloud run deploy edenos-mcp-bridge \
  --image gcr.io/PROJECT_ID/edenos-mcp-bridge:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated
```

### Automated Deployment

The Cloud Build trigger automatically deploys on:
- Push to `main` branch (production)
- Push to `develop` branch (staging)

## Troubleshooting

### Common Issues

1. **Permission Denied**
   ```bash
   gcloud auth application-default login
   gcloud config set project PROJECT_ID
   ```

2. **API Not Enabled**
   ```bash
   gcloud services enable run.googleapis.com
   ```

3. **Service Account Issues**
   ```bash
   gcloud iam service-accounts create edenos-mcp-bridge
   gcloud projects add-iam-policy-binding PROJECT_ID \
     --member="serviceAccount:edenos-mcp-bridge@PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/run.admin"
   ```

### Debug Mode

Enable debug logging:
```bash
export TF_LOG=DEBUG
terraform plan
```

## Cost Optimization

### Recommendations

1. **Staging Environment**: Use `min_scale = 0` to scale to zero
2. **Resource Limits**: Start with lower CPU/memory, scale up as needed
3. **Autoscaling**: Set appropriate min/max instance limits
4. **Monitoring**: Use Cloud Monitoring to track resource usage

### Cost Estimation

Monthly costs (approximate):
- **Cloud Run**: $5-20 (depending on usage)
- **Cloud Build**: $1-5 (per build)
- **Other Services**: $2-10

## Support

For issues and questions:
1. Check Cloud Logging for application errors
2. Review Terraform plan output
3. Verify IAM permissions
4. Check service account configuration
