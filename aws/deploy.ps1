# EdenOS MCP Bridge AWS Deployment Script (PowerShell)
# This script deploys the EdenOS MCP Bridge to AWS using CloudFormation and ECS

param(
    [string]$StackName = "edenos-mcp-bridge",
    [string]$Region = "us-east-1",
    [string]$Environment = "prod",
    [string]$DomainName = "",
    [string]$CertificateArn = "",
    [switch]$Help
)

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Function to show help
function Show-Help {
    Write-Host "EdenOS MCP Bridge AWS Deployment Script (PowerShell)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\deploy.ps1 [OPTIONS]" -ForegroundColor White
    Write-Host ""
    Write-Host "Options:" -ForegroundColor White
    Write-Host "  -StackName      CloudFormation stack name (default: edenos-mcp-bridge)" -ForegroundColor Gray
    Write-Host "  -Region         AWS region (default: us-east-1)" -ForegroundColor Gray
    Write-Host "  -Environment    Environment (default: prod)" -ForegroundColor Gray
    Write-Host "  -DomainName     Custom domain name (optional)" -ForegroundColor Gray
    Write-Host "  -CertificateArn SSL certificate ARN (optional)" -ForegroundColor Gray
    Write-Host "  -Help           Show this help message" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor White
    Write-Host "  .\deploy.ps1                                    # Deploy with defaults" -ForegroundColor Gray
    Write-Host "  .\deploy.ps1 -Region us-west-2 -Environment staging  # Deploy to us-west-2 staging" -ForegroundColor Gray
    Write-Host "  .\deploy.ps1 -DomainName mydomain.com -CertificateArn arn:aws:acm:...  # Deploy with custom domain" -ForegroundColor Gray
}

# Show help if requested
if ($Help) {
    Show-Help
    exit 0
}

# Function to check if AWS CLI is installed
function Test-AWSCLI {
    try {
        $null = Get-Command aws -ErrorAction Stop
        Write-Success "AWS CLI is installed"
        return $true
    }
    catch {
        Write-Error "AWS CLI is not installed. Please install it first."
        return $false
    }
}

# Function to check if Docker is installed
function Test-Docker {
    try {
        $null = Get-Command docker -ErrorAction Stop
        Write-Success "Docker is installed"
        return $true
    }
    catch {
        Write-Error "Docker is not installed. Please install it first."
        return $false
    }
}

# Function to check AWS credentials
function Test-AWSCredentials {
    try {
        $null = aws sts get-caller-identity 2>$null
        Write-Success "AWS credentials are configured"
        return $true
    }
    catch {
        Write-Error "AWS credentials not configured. Please run 'aws configure' first."
        return $false
    }
}

# Function to build and push Docker image
function Build-AndPushImage {
    Write-Status "Building Docker image..."
    
    # Get AWS account ID
    $AWSAccountId = aws sts get-caller-identity --query Account --output text
    $ECRRepositoryURI = "${AWSAccountId}.dkr.ecr.${Region}.amazonaws.com/${StackName}-edenos-mcp-bridge"
    
    # Login to ECR
    Write-Status "Logging in to Amazon ECR..."
    aws ecr get-login-password --region $Region | docker login --username AWS --password-stdin $ECRRepositoryURI
    
    # Build Docker image
    Write-Status "Building Docker image..."
    docker build -t "${StackName}-edenos-mcp-bridge" .
    
    # Tag image for ECR
    docker tag "${StackName}-edenos-mcp-bridge:latest" "${ECRRepositoryURI}:latest"
    
    # Push image to ECR
    Write-Status "Pushing image to ECR..."
    docker push "${ECRRepositoryURI}:latest"
    
    Write-Success "Docker image built and pushed successfully"
}

# Function to deploy CloudFormation stack
function Deploy-Stack {
    Write-Status "Deploying CloudFormation stack..."
    
    # Check if stack exists
    $stackExists = $false
    try {
        $null = aws cloudformation describe-stacks --stack-name $StackName --region $Region 2>$null
        $stackExists = $true
    }
    catch {
        $stackExists = $false
    }
    
    if ($stackExists) {
        Write-Status "Stack exists, updating..."
        aws cloudformation update-stack `
            --stack-name $StackName `
            --template-body file://aws/cloudformation-template.yaml `
            --parameters ParameterKey=Environment,ParameterValue=$Environment `
                        ParameterKey=DomainName,ParameterValue=$DomainName `
                        ParameterKey=CertificateArn,ParameterValue=$CertificateArn `
            --capabilities CAPABILITY_IAM `
            --region $Region
        
        Write-Status "Waiting for stack update to complete..."
        aws cloudformation wait stack-update-complete --stack-name $StackName --region $Region
    }
    else {
        Write-Status "Stack does not exist, creating..."
        aws cloudformation create-stack `
            --stack-name $StackName `
            --template-body file://aws/cloudformation-template.yaml `
            --parameters ParameterKey=Environment,ParameterValue=$Environment `
                        ParameterKey=DomainName,ParameterValue=$DomainName `
                        ParameterKey=CertificateArn,ParameterValue=$CertificateArn `
            --capabilities CAPABILITY_IAM `
            --region $Region
        
        Write-Status "Waiting for stack creation to complete..."
        aws cloudformation wait stack-create-complete --stack-name $StackName --region $Region
    }
    
    Write-Success "CloudFormation stack deployed successfully"
}

# Function to update ECS service
function Update-ECSService {
    Write-Status "Updating ECS service..."
    
    # Get ECS cluster name
    $ECSClusterName = aws cloudformation describe-stacks `
        --stack-name $StackName `
        --region $Region `
        --query 'Stacks[0].Outputs[?OutputKey==`ECSClusterName`].OutputValue' `
        --output text
    
    # Get ECS service name
    $ECSServiceName = aws cloudformation describe-stacks `
        --stack-name $StackName `
        --region $Region `
        --query 'Stacks[0].Outputs[?OutputKey==`ECSServiceName`].OutputValue' `
        --output text
    
    # Force new deployment
    aws ecs update-service `
        --cluster $ECSClusterName `
        --service $ECSServiceName `
        --force-new-deployment `
        --region $Region
    
    Write-Success "ECS service updated successfully"
}

# Function to get deployment URL
function Get-DeploymentURL {
    Write-Status "Getting deployment URL..."
    
    # Get load balancer URL
    $LoadBalancerURL = aws cloudformation describe-stacks `
        --stack-name $StackName `
        --region $Region `
        --query 'Stacks[0].Outputs[?OutputKey==`LoadBalancerURL`].OutputValue' `
        --output text
    
    Write-Success "Deployment URL: $LoadBalancerURL"
    
    # Test the deployment
    Write-Status "Testing deployment..."
    try {
        $response = Invoke-WebRequest -Uri "${LoadBalancerURL}/health" -Method Get -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Success "Deployment is healthy and accessible!"
        }
        else {
            Write-Warning "Deployment returned status code: $($response.StatusCode)"
        }
    }
    catch {
        Write-Warning "Deployment may still be starting up. Please wait a few minutes and test manually."
    }
}

# Main deployment process
function Main {
    Write-Status "Starting EdenOS MCP Bridge deployment to AWS..."
    Write-Status "Stack Name: $StackName"
    Write-Status "Region: $Region"
    Write-Status "Environment: $Environment"
    
    if ($DomainName) {
        Write-Status "Domain: $DomainName"
    }
    
    if ($CertificateArn) {
        Write-Status "Certificate: $CertificateArn"
    }
    
    Write-Host ""
    
    # Pre-deployment checks
    if (-not (Test-AWSCLI)) { exit 1 }
    if (-not (Test-Docker)) { exit 1 }
    if (-not (Test-AWSCredentials)) { exit 1 }
    
    Write-Host ""
    
    # Build and push Docker image
    Build-AndPushImage
    
    Write-Host ""
    
    # Deploy CloudFormation stack
    Deploy-Stack
    
    Write-Host ""
    
    # Update ECS service
    Update-ECSService
    
    Write-Host ""
    
    # Get deployment URL
    Get-DeploymentURL
    
    Write-Host ""
    Write-Success "EdenOS MCP Bridge deployed successfully to AWS!"
    Write-Status "You can now access your MCP Bridge at the URL shown above."
}

# Run main function
Main
