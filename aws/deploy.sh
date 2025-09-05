#!/bin/bash

# EdenOS MCP Bridge AWS Deployment Script
# This script deploys the EdenOS MCP Bridge to AWS using CloudFormation and ECS

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
NC='\033[0m' # No Color

# Function to print colored output
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

# Function to check if AWS CLI is installed
check_aws_cli() {
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
    print_success "AWS CLI is installed"
}

# Function to check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install it first."
        exit 1
    fi
    print_success "Docker is installed"
}

# Function to check AWS credentials
check_aws_credentials() {
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials not configured. Please run 'aws configure' first."
        exit 1
    fi
    print_success "AWS credentials are configured"
}

# Function to build and push Docker image
build_and_push_image() {
    print_status "Building Docker image..."
    
    # Get AWS account ID
    AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    ECR_REPOSITORY_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${STACK_NAME}-edenos-mcp-bridge"
    
    # Login to ECR
    print_status "Logging in to Amazon ECR..."
    aws ecr get-login-password --region ${REGION} | docker login --username AWS --password-stdin ${ECR_REPOSITORY_URI}
    
    # Build Docker image
    print_status "Building Docker image..."
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
    print_status "Deploying CloudFormation stack..."
    
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
    print_status "Updating ECS service..."
    
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

# Function to get deployment URL
get_deployment_url() {
    print_status "Getting deployment URL..."
    
    # Get load balancer URL
    LOAD_BALANCER_URL=$(aws cloudformation describe-stacks \
        --stack-name ${STACK_NAME} \
        --region ${REGION} \
        --query 'Stacks[0].Outputs[?OutputKey==`LoadBalancerURL`].OutputValue' \
        --output text)
    
    print_success "Deployment URL: ${LOAD_BALANCER_URL}"
    
    # Test the deployment
    print_status "Testing deployment..."
    if curl -f -s "${LOAD_BALANCER_URL}/health" > /dev/null; then
        print_success "Deployment is healthy and accessible!"
    else
        print_warning "Deployment may still be starting up. Please wait a few minutes and test manually."
    fi
}

# Function to show help
show_help() {
    echo "EdenOS MCP Bridge AWS Deployment Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -s, --stack-name    CloudFormation stack name (default: edenos-mcp-bridge)"
    echo "  -r, --region        AWS region (default: us-east-1)"
    echo "  -e, --environment   Environment (default: prod)"
    echo "  -d, --domain        Custom domain name (optional)"
    echo "  -c, --certificate   SSL certificate ARN (optional)"
    echo "  -h, --help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Deploy with defaults"
    echo "  $0 -r us-west-2 -e staging           # Deploy to us-west-2 staging"
    echo "  $0 -d mydomain.com -c arn:aws:acm:... # Deploy with custom domain"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -s|--stack-name)
            STACK_NAME="$2"
            shift 2
            ;;
        -r|--region)
            REGION="$2"
            shift 2
            ;;
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -d|--domain)
            DOMAIN_NAME="$2"
            shift 2
            ;;
        -c|--certificate)
            CERTIFICATE_ARN="$2"
            shift 2
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Main deployment process
main() {
    print_status "Starting EdenOS MCP Bridge deployment to AWS..."
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
    check_aws_cli
    check_docker
    check_aws_credentials
    
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
    
    # Get deployment URL
    get_deployment_url
    
    echo ""
    print_success "EdenOS MCP Bridge deployed successfully to AWS!"
    print_status "You can now access your MCP Bridge at the URL shown above."
}

# Run main function
main "$@"
