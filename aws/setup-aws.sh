#!/bin/bash

# Secure AWS Setup Script for EdenOS MCP Bridge
# This script helps you configure AWS securely without exposing credentials

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Function to check if AWS CLI is installed
check_aws_cli() {
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install it first:"
        echo "  https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
        exit 1
    fi
    print_success "AWS CLI is installed"
}

# Function to configure AWS credentials securely
configure_aws_credentials() {
    print_status "Configuring AWS credentials securely..."
    
    echo "Please follow these steps to configure AWS securely:"
    echo ""
    echo "1. Go to AWS IAM Console: https://console.aws.amazon.com/iam/"
    echo "2. Create a new IAM user with programmatic access"
    echo "3. Attach the following policies:"
    echo "   - AmazonECS_FullAccess"
    echo "   - AmazonEC2ContainerRegistryFullAccess"
    echo "   - CloudFormationFullAccess"
    echo "   - AmazonVPCFullAccess"
    echo "   - IAMFullAccess"
    echo "   - AmazonRoute53FullAccess"
    echo "   - CloudWatchLogsFullAccess"
    echo ""
    echo "4. Download the credentials CSV file"
    echo "5. Run: aws configure"
    echo "6. Enter your Access Key ID and Secret Access Key"
    echo ""
    
    read -p "Press Enter when you have configured AWS credentials..."
    
    # Test AWS credentials
    if aws sts get-caller-identity &> /dev/null; then
        print_success "AWS credentials are configured correctly"
        
        # Show current identity
        AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
        AWS_USER_ARN=$(aws sts get-caller-identity --query Arn --output text)
        
        print_status "AWS Account ID: $AWS_ACCOUNT_ID"
        print_status "AWS User ARN: $AWS_USER_ARN"
    else
        print_error "AWS credentials not configured correctly"
        exit 1
    fi
}

# Function to create ECR repository
create_ecr_repository() {
    print_status "Creating ECR repository..."
    
    AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    ECR_REPOSITORY_NAME="edenos-mcp-bridge-edenos-mcp-bridge"
    ECR_REPOSITORY_URI="${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/${ECR_REPOSITORY_NAME}"
    
    # Check if repository exists
    if aws ecr describe-repositories --repository-names $ECR_REPOSITORY_NAME --region us-east-1 &> /dev/null; then
        print_status "ECR repository already exists"
    else
        # Create repository
        aws ecr create-repository \
            --repository-name $ECR_REPOSITORY_NAME \
            --region us-east-1 \
            --image-scanning-configuration scanOnPush=true
        
        print_success "ECR repository created: $ECR_REPOSITORY_URI"
    fi
    
    # Set lifecycle policy
    aws ecr put-lifecycle-policy \
        --repository-name $ECR_REPOSITORY_NAME \
        --region us-east-1 \
        --lifecycle-policy-text '{
            "rules": [
                {
                    "rulePriority": 1,
                    "description": "Keep last 10 images",
                    "selection": {
                        "tagStatus": "any",
                        "countType": "imageCountMoreThan",
                        "countNumber": 10
                    },
                    "action": {
                        "type": "expire"
                    }
                }
            ]
        }'
    
    print_success "ECR repository configured with lifecycle policy"
}

# Function to test deployment readiness
test_deployment_readiness() {
    print_status "Testing deployment readiness..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install it first:"
        echo "  https://docs.docker.com/get-docker/"
        exit 1
    fi
    print_success "Docker is installed"
    
    # Check if Docker is running
    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    print_success "Docker is running"
    
    # Test Docker build
    print_status "Testing Docker build..."
    if docker build -t edenos-mcp-bridge-test . &> /dev/null; then
        print_success "Docker build test passed"
        docker rmi edenos-mcp-bridge-test &> /dev/null
    else
        print_error "Docker build test failed"
        exit 1
    fi
}

# Function to show next steps
show_next_steps() {
    print_success "AWS setup completed successfully!"
    echo ""
    print_status "Next steps:"
    echo "1. Set your environment variables (see env.example)"
    echo "2. Run the deployment script:"
    echo "   ./aws/deploy.sh"
    echo ""
    print_status "Your AWS Account ID: $(aws sts get-caller-identity --query Account --output text)"
    print_status "ECR Repository: $(aws sts get-caller-identity --query Account --output text).dkr.ecr.us-east-1.amazonaws.com/edenos-mcp-bridge-edenos-mcp-bridge"
    echo ""
    print_warning "Remember to:"
    echo "- Never share your AWS credentials"
    echo "- Use environment variables for sensitive data"
    echo "- Monitor your AWS costs"
    echo "- Set up billing alerts"
}

# Main setup process
main() {
    print_status "Setting up AWS for EdenOS MCP Bridge deployment..."
    echo ""
    
    # Pre-setup checks
    check_aws_cli
    
    echo ""
    
    # Configure AWS credentials
    configure_aws_credentials
    
    echo ""
    
    # Create ECR repository
    create_ecr_repository
    
    echo ""
    
    # Test deployment readiness
    test_deployment_readiness
    
    echo ""
    
    # Show next steps
    show_next_steps
}

# Run main function
main "$@"
