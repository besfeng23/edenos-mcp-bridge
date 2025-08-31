#!/bin/bash

# EdenOS MCP Bridge Infrastructure Deployment Script
# Usage: ./deploy.sh [staging|production] [plan|apply|destroy]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT=${1:-staging}
ACTION=${2:-apply}
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(staging|production)$ ]]; then
    echo -e "${RED}Error: Environment must be 'staging' or 'production'${NC}"
    echo "Usage: $0 [staging|production] [plan|apply|destroy]"
    exit 1
fi

# Validate action
if [[ ! "$ACTION" =~ ^(plan|apply|destroy)$ ]]; then
    echo -e "${RED}Error: Action must be 'plan', 'apply', or 'destroy'${NC}"
    echo "Usage: $0 [staging|production] [plan|apply|destroy]"
    exit 1
fi

# Load environment variables
ENV_FILE="$PROJECT_DIR/environments/$ENVIRONMENT.tfvars"

if [[ ! -f "$ENV_FILE" ]]; then
    echo -e "${RED}Error: Environment file not found: $ENV_FILE${NC}"
    exit 1
fi

echo -e "${BLUE}=== EdenOS MCP Bridge Infrastructure Deployment ===${NC}"
echo -e "${BLUE}Environment: ${YELLOW}$ENVIRONMENT${NC}"
echo -e "${BLUE}Action: ${YELLOW}$ACTION${NC}"
echo -e "${BLUE}Project Directory: ${YELLOW}$PROJECT_DIR${NC}"
echo ""

# Check if Terraform is installed
if ! command -v terraform &> /dev/null; then
    echo -e "${RED}Error: Terraform is not installed${NC}"
    echo "Please install Terraform from https://www.terraform.io/downloads.html"
    exit 1
fi

# Check if gcloud is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo -e "${RED}Error: Not authenticated with gcloud${NC}"
    echo "Please run: gcloud auth login"
    exit 1
fi

# Get project ID from tfvars
PROJECT_ID=$(grep '^project_id' "$ENV_FILE" | cut -d'=' -f2 | tr -d ' "')
REGION=$(grep '^region' "$ENV_FILE" | cut -d'=' -f2 | tr -d ' "')

echo -e "${BLUE}Target Project: ${YELLOW}$PROJECT_ID${NC}"
echo -e "${BLUE}Target Region: ${YELLOW}$REGION${NC}"
echo ""

# Confirm action for destructive operations
if [[ "$ACTION" == "destroy" ]]; then
    echo -e "${RED}⚠️  WARNING: This will DESTROY all infrastructure in $ENVIRONMENT environment!${NC}"
    read -p "Are you sure you want to continue? Type 'yes' to confirm: " -r
    if [[ ! $REPLY =~ ^[Yy]es$ ]]; then
        echo -e "${YELLOW}Deployment cancelled${NC}"
        exit 0
    fi
    echo ""
fi

# Change to project directory
cd "$PROJECT_DIR"

# Initialize Terraform if needed
if [[ ! -d ".terraform" ]]; then
    echo -e "${BLUE}Initializing Terraform...${NC}"
    terraform init
    echo ""
fi

# Set workspace
WORKSPACE_NAME="edenos-mcp-bridge-$ENVIRONMENT"
if ! terraform workspace list | grep -q "$WORKSPACE_NAME"; then
    echo -e "${BLUE}Creating Terraform workspace: $WORKSPACE_NAME${NC}"
    terraform workspace new "$WORKSPACE_NAME"
else
    echo -e "${BLUE}Switching to workspace: $WORKSPACE_NAME${NC}"
    terraform workspace select "$WORKSPACE_NAME"
fi
echo ""

# Validate configuration
echo -e "${BLUE}Validating Terraform configuration...${NC}"
if ! terraform validate; then
    echo -e "${RED}Error: Terraform configuration validation failed${NC}"
    exit 1
fi
echo ""

# Format check
echo -e "${BLUE}Checking Terraform formatting...${NC}"
if ! terraform fmt -check -recursive; then
    echo -e "${YELLOW}Warning: Terraform files are not properly formatted${NC}"
    echo "Run 'terraform fmt -recursive' to fix formatting"
    echo ""
fi

# Execute Terraform action
echo -e "${BLUE}Executing: terraform $ACTION -var-file=environments/$ENVIRONMENT.tfvars${NC}"
echo ""

case $ACTION in
    "plan")
        terraform plan -var-file="environments/$ENVIRONMENT.tfvars" -out="$ENVIRONMENT.tfplan"
        echo ""
        echo -e "${GREEN}✅ Plan completed successfully!${NC}"
        echo "Review the plan above and run: $0 $ENVIRONMENT apply"
        ;;
    
    "apply")
        if [[ -f "$ENVIRONMENT.tfplan" ]]; then
            terraform apply "$ENVIRONMENT.tfplan"
            rm -f "$ENVIRONMENT.tfplan"
        else
            terraform apply -var-file="environments/$ENVIRONMENT.tfvars"
        fi
        echo ""
        echo -e "${GREEN}✅ Infrastructure deployed successfully!${NC}"
        
        # Show outputs
        echo ""
        echo -e "${BLUE}=== Deployment Outputs ===${NC}"
        terraform output
        ;;
    
    "destroy")
        terraform destroy -var-file="environments/$ENVIRONMENT.tfvars"
        echo ""
        echo -e "${GREEN}✅ Infrastructure destroyed successfully!${NC}"
        ;;
esac

echo ""
echo -e "${BLUE}=== Deployment Summary ===${NC}"
echo -e "${BLUE}Environment: ${GREEN}$ENVIRONMENT${NC}"
echo -e "${BLUE}Action: ${GREEN}$ACTION${NC}"
echo -e "${BLUE}Status: ${GREEN}Completed${NC}"
echo ""

if [[ "$ACTION" == "apply" ]]; then
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Verify the service is running: gcloud run services describe edenos-mcp-bridge --region=$REGION"
    echo "2. Check health endpoint: curl \$(gcloud run services describe edenos-mcp-bridge --region=$REGION --format='value(status.url)')/health"
    echo "3. View logs: gcloud logs tail --project=$PROJECT_ID --filter='resource.type=cloud_run_revision'"
fi
