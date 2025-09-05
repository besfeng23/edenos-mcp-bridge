# Simple AWS Deployment Script for EdenOS MCP Bridge
param(
    [string]$StackName = "edenos-mcp-bridge",
    [string]$Region = "us-east-1"
)

Write-Host "Starting EdenOS MCP Bridge deployment..." -ForegroundColor Green

# Check AWS credentials
try {
    $null = aws sts get-caller-identity 2>$null
    Write-Host "AWS credentials configured" -ForegroundColor Green
}
catch {
    Write-Host "AWS credentials not configured. Please run: aws configure" -ForegroundColor Red
    exit 1
}

# Build frontend
Write-Host "Building frontend..." -ForegroundColor Yellow
Set-Location web/control-panel
npm install
npm run build
Set-Location ../..

# Copy Wow Control files
Write-Host "Building Wow Control Features..." -ForegroundColor Yellow
Copy-Item -Path "web\wow-control\*" -Destination "web\" -Recurse -Force

# Build Docker image
Write-Host "Building Docker image..." -ForegroundColor Yellow
docker build -t edenos-mcp-bridge-edenos-mcp-bridge .

# Login to ECR
Write-Host "Logging in to ECR..." -ForegroundColor Yellow
$AWSAccountId = aws sts get-caller-identity --query Account --output text
$ECRRepositoryURI = "${AWSAccountId}.dkr.ecr.${Region}.amazonaws.com/${StackName}-edenos-mcp-bridge"

aws ecr get-login-password --region ${Region} | docker login --username AWS --password-stdin ${ECRRepositoryURI}

# Tag and push image
Write-Host "Pushing image to ECR..." -ForegroundColor Yellow
docker tag edenos-mcp-bridge-edenos-mcp-bridge:latest ${ECRRepositoryURI}:latest
docker push ${ECRRepositoryURI}:latest

# Deploy CloudFormation stack
Write-Host "Deploying CloudFormation stack..." -ForegroundColor Yellow
aws cloudformation create-stack `
    --stack-name ${StackName} `
    --template-body file://aws/cloudformation-template.yaml `
    --parameters ParameterKey=Environment,ParameterValue=prod `
    --capabilities CAPABILITY_IAM `
    --region ${Region}

Write-Host "Waiting for stack creation..." -ForegroundColor Yellow
aws cloudformation wait stack-create-complete --stack-name ${StackName} --region ${Region}

# Get deployment URL
$LoadBalancerURL = aws cloudformation describe-stacks `
    --stack-name ${StackName} `
    --region ${Region} `
    --query 'Stacks[0].Outputs[?OutputKey==`LoadBalancerURL`].OutputValue' `
    --output text

Write-Host "Deployment completed!" -ForegroundColor Green
Write-Host "Backend API: ${LoadBalancerURL}" -ForegroundColor Cyan
Write-Host "Control Panel: ${LoadBalancerURL}/control-panel" -ForegroundColor Cyan
Write-Host "Wow Control: ${LoadBalancerURL}/wow-control" -ForegroundColor Cyan
