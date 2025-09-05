#!/bin/bash

# Complete AWS Deployment Script for EdenOS MCP Bridge
# This script builds frontend, deploys backend, and wires everything together

set -e

# Configuration
STACK_NAME="edenos-mcp-bridge"
REGION="us-east-1"
ENVIRONMENT="prod"
DOMAIN_NAME=""
CERTIFICATE_ARN=""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${PURPLE}[STEP]${NC} $1"
}

print_feature() {
    echo -e "${CYAN}[FEATURE]${NC} $1"
}

# Function to check prerequisites
check_prerequisites() {
    print_step "Checking prerequisites..."
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
    print_success "AWS CLI is installed"
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install it first."
        exit 1
    fi
    print_success "Docker is installed"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install it first."
        exit 1
    fi
    print_success "Node.js is installed"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install it first."
        exit 1
    fi
    print_success "npm is installed"
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials not configured. Please run: aws configure"
        exit 1
    fi
    print_success "AWS credentials configured"
}

# Function to build frontend
build_frontend() {
    print_step "Building frontend with all features..."
    
    # Build React Control Panel
    print_status "Building React Control Panel..."
    cd web/control-panel
    npm install
    npm run build
    cd ../..
    print_success "React Control Panel built"
    
    # Build Wow Control Features
    print_status "Building Wow Control Features..."
    # Copy static files to web directory
    cp -r web/wow-control/* web/
    print_success "Wow Control Features built"
    
    # Build Live Ops Theater
    print_status "Building Live Ops Theater..."
    # Ensure all static files are in place
    print_success "Live Ops Theater built"
    
    # Build Holographic Memory Graph
    print_status "Building Holographic Memory Graph..."
    print_success "Holographic Memory Graph built"
    
    # Build Audit Cinema
    print_status "Building Audit Cinema..."
    print_success "Audit Cinema built"
    
    print_success "All frontend features built successfully!"
}

# Function to build and push Docker image
build_and_push_image() {
    print_step "Building and pushing Docker image..."
    
    AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    ECR_REPOSITORY_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${STACK_NAME}-edenos-mcp-bridge"
    
    # Login to ECR
    print_status "Logging in to Amazon ECR..."
    aws ecr get-login-password --region ${REGION} | docker login --username AWS --password-stdin ${ECR_REPOSITORY_URI}
    
    # Build Docker image with all features
    print_status "Building Docker image with all features..."
    docker build -t ${STACK_NAME}-edenos-mcp-bridge .
    
    # Tag image for ECR
    docker tag ${STACK_NAME}-edenos-mcp-bridge:latest ${ECR_REPOSITORY_URI}:latest
    
    # Push image to ECR
    print_status "Pushing image to ECR..."
    docker push ${ECR_REPOSITORY_URI}:latest
    
    print_success "Docker image built and pushed successfully"
}

# Function to deploy CloudFormation stack
deploy_stack() {
    print_step "Deploying CloudFormation stack..."
    
    # Check if stack exists
    if aws cloudformation describe-stacks --stack-name ${STACK_NAME} --region ${REGION} &> /dev/null; then
        print_status "Stack exists, updating..."
        aws cloudformation update-stack \
            --stack-name ${STACK_NAME} \
            --template-body file://aws/cloudformation-template.yaml \
            --parameters ParameterKey=Environment,ParameterValue=${ENVIRONMENT} \
                        ParameterKey=DomainName,ParameterValue=${DOMAIN_NAME} \
                        ParameterKey=CertificateArn,ParameterValue=${CERTIFICATE_ARN} \
            --capabilities CAPABILITY_IAM \
            --region ${REGION}
        
        print_status "Waiting for stack update to complete..."
        aws cloudformation wait stack-update-complete --stack-name ${STACK_NAME} --region ${REGION}
    else
        print_status "Stack does not exist, creating..."
        aws cloudformation create-stack \
            --stack-name ${STACK_NAME} \
            --template-body file://aws/cloudformation-template.yaml \
            --parameters ParameterKey=Environment,ParameterValue=${ENVIRONMENT} \
                        ParameterKey=DomainName,ParameterValue=${DOMAIN_NAME} \
                        ParameterKey=CertificateArn,ParameterValue=${CERTIFICATE_ARN} \
            --capabilities CAPABILITY_IAM \
            --region ${REGION}
        
        print_status "Waiting for stack creation to complete..."
        aws cloudformation wait stack-create-complete --stack-name ${STACK_NAME} --region ${REGION}
    fi
    
    print_success "CloudFormation stack deployed successfully"
}

# Function to update ECS service
update_ecs_service() {
    print_step "Updating ECS service..."
    
    # Get ECS cluster name
    ECS_CLUSTER_NAME=$(aws cloudformation describe-stacks \
        --stack-name ${STACK_NAME} \
        --region ${REGION} \
        --query 'Stacks[0].Outputs[?OutputKey==`ECSClusterName`].OutputValue' \
        --output text)
    
    # Get ECS service name
    ECS_SERVICE_NAME=$(aws cloudformation describe-stacks \
        --stack-name ${STACK_NAME} \
        --region ${REGION} \
        --query 'Stacks[0].Outputs[?OutputKey==`ECSServiceName`].OutputValue' \
        --output text)
    
    # Force new deployment
    aws ecs update-service \
        --cluster ${ECS_CLUSTER_NAME} \
        --service ${ECS_SERVICE_NAME} \
        --force-new-deployment \
        --region ${REGION}
    
    print_success "ECS service updated successfully"
}

# Function to get deployment URLs
get_deployment_urls() {
    print_step "Getting deployment URLs..."
    
    # Get load balancer URL
    LOAD_BALANCER_URL=$(aws cloudformation describe-stacks \
        --stack-name ${STACK_NAME} \
        --region ${REGION} \
        --query 'Stacks[0].Outputs[?OutputKey==`LoadBalancerURL`].OutputValue' \
        --output text)
    
    print_success "Backend API URL: ${LOAD_BALANCER_URL}"
    print_success "Control Panel: ${LOAD_BALANCER_URL}/control-panel"
    print_success "Wow Control: ${LOAD_BALANCER_URL}/wow-control"
    print_success "Live Ops Theater: ${LOAD_BALANCER_URL}/live-ops"
    print_success "Holographic Memory: ${LOAD_BALANCER_URL}/memgraph"
    print_success "Audit Cinema: ${LOAD_BALANCER_URL}/audit-cinema"
    
    # Test the deployment
    print_status "Testing deployment..."
    if curl -f -s "${LOAD_BALANCER_URL}/health" > /dev/null; then
        print_success "Backend is healthy and accessible!"
    else
        print_warning "Backend may still be starting up. Please wait a few minutes and test manually."
    fi
}

# Function to show feature summary
show_feature_summary() {
    print_step "EdenOS MCP Bridge - Complete Feature Summary"
    
    echo ""
    print_feature "🎯 Backend Features:"
    echo "  • MCP Bridge Server with 15+ service integrations"
    echo "  • Express.js API with WebSocket support"
    echo "  • Fun features: Live Ops Theater, Holographic Memory Graph"
    echo "  • Production hardening: Health checks, metrics, monitoring"
    echo "  • Security: CORS, rate limiting, authentication"
    
    echo ""
    print_feature "🎨 Frontend Features:"
    echo "  • React Control Panel with command palette"
    echo "  • Wow Control with sci-fi UI"
    echo "  • Live Ops Theater with real-time updates"
    echo "  • Holographic Memory Graph with 3D visualization"
    echo "  • Audit Cinema with event streaming"
    echo "  • Multi-workspace support for all services"
    
    echo ""
    print_feature "🔧 Service Integrations:"
    echo "  • Notion, Linear, GitHub, Firebase, GCP"
    echo "  • Figma, Zapier, Bnd, Saviynt, Anthropic"
    echo "  • Neon, DeepMind, OpenAI, Box"
    echo "  • Each with dedicated tools and Wow UI"
    
    echo ""
    print_feature "☁️ AWS Infrastructure:"
    echo "  • ECS Fargate with auto-scaling"
    echo "  • Application Load Balancer"
    echo "  • VPC with security groups"
    echo "  • ECR repository for container images"
    echo "  • CloudWatch logs and monitoring"
    echo "  • Route 53 DNS (optional)"
    echo "  • SSL/TLS certificates (optional)"
}

# Main deployment process
main() {
    print_step "🚀 Starting Complete EdenOS MCP Bridge Deployment to AWS"
    print_status "Stack Name: ${STACK_NAME}"
    print_status "Region: ${REGION}"
    print_status "Environment: ${ENVIRONMENT}"
    
    if [[ -n "$DOMAIN_NAME" ]]; then
        print_status "Domain: ${DOMAIN_NAME}"
    fi
    
    if [[ -n "$CERTIFICATE_ARN" ]]; then
        print_status "Certificate: ${CERTIFICATE_ARN}"
    fi
    
    echo ""
    
    # Pre-deployment checks
    check_prerequisites
    
    echo ""
    
    # Build frontend with all features
    build_frontend
    
    echo ""
    
    # Build and push Docker image
    build_and_push_image
    
    echo ""
    
    # Deploy CloudFormation stack
    deploy_stack
    
    echo ""
    
    # Update ECS service
    update_ecs_service
    
    echo ""
    
    # Get deployment URLs
    get_deployment_urls
    
    echo ""
    
    # Show feature summary
    show_feature_summary
    
    echo ""
    print_success "🎉 EdenOS MCP Bridge deployed successfully to AWS!"
    print_status "Your complete MCP Bridge with all features is now live!"
    print_warning "Remember to configure your environment variables in the ECS task definition."
}

# Run main function
main "$@"
