# Secure AWS Setup Script for EdenOS MCP Bridge (PowerShell)
# This script helps you configure AWS securely without exposing credentials

param(
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
    Write-Host "Secure AWS Setup Script for EdenOS MCP Bridge" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\setup-aws.ps1 [OPTIONS]" -ForegroundColor White
    Write-Host ""
    Write-Host "Options:" -ForegroundColor White
    Write-Host "  -Help           Show this help message" -ForegroundColor Gray
    Write-Host ""
    Write-Host "This script helps you configure AWS securely for deployment." -ForegroundColor Gray
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
        Write-Error "AWS CLI is not installed. Please install it first:"
        Write-Host "  https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html" -ForegroundColor Gray
        return $false
    }
}

# Function to configure AWS credentials securely
function Set-AWSCredentials {
    Write-Status "Configuring AWS credentials securely..."
    
    Write-Host "Please follow these steps to configure AWS securely:" -ForegroundColor White
    Write-Host ""
    Write-Host "1. Go to AWS IAM Console: https://console.aws.amazon.com/iam/" -ForegroundColor Gray
    Write-Host "2. Create a new IAM user with programmatic access" -ForegroundColor Gray
    Write-Host "3. Attach the following policies:" -ForegroundColor Gray
    Write-Host "   - AmazonECS_FullAccess" -ForegroundColor Gray
    Write-Host "   - AmazonEC2ContainerRegistryFullAccess" -ForegroundColor Gray
    Write-Host "   - CloudFormationFullAccess" -ForegroundColor Gray
    Write-Host "   - AmazonVPCFullAccess" -ForegroundColor Gray
    Write-Host "   - IAMFullAccess" -ForegroundColor Gray
    Write-Host "   - AmazonRoute53FullAccess" -ForegroundColor Gray
    Write-Host "   - CloudWatchLogsFullAccess" -ForegroundColor Gray
    Write-Host ""
    Write-Host "4. Download the credentials CSV file" -ForegroundColor Gray
    Write-Host "5. Run: aws configure" -ForegroundColor Gray
    Write-Host "6. Enter your Access Key ID and Secret Access Key" -ForegroundColor Gray
    Write-Host ""
    
    Read-Host "Press Enter when you have configured AWS credentials"
    
    # Test AWS credentials
    try {
        $null = aws sts get-caller-identity 2>$null
        Write-Success "AWS credentials are configured correctly"
        
        # Show current identity
        $AWSAccountId = aws sts get-caller-identity --query Account --output text
        $AWSUserArn = aws sts get-caller-identity --query Arn --output text
        
        Write-Status "AWS Account ID: $AWSAccountId"
        Write-Status "AWS User ARN: $AWSUserArn"
        return $true
    }
    catch {
        Write-Error "AWS credentials not configured correctly"
        return $false
    }
}

# Function to create ECR repository
function New-ECRRepository {
    Write-Status "Creating ECR repository..."
    
    $AWSAccountId = aws sts get-caller-identity --query Account --output text
    $ECRRepositoryName = "edenos-mcp-bridge-edenos-mcp-bridge"
    $ECRRepositoryURI = "${AWSAccountId}.dkr.ecr.us-east-1.amazonaws.com/${ECRRepositoryName}"
    
    # Check if repository exists
    try {
        $null = aws ecr describe-repositories --repository-names $ECRRepositoryName --region us-east-1 2>$null
        Write-Status "ECR repository already exists"
    }
    catch {
        # Create repository
        aws ecr create-repository `
            --repository-name $ECRRepositoryName `
            --region us-east-1 `
            --image-scanning-configuration scanOnPush=true
        
        Write-Success "ECR repository created: $ECRRepositoryURI"
    }
    
    # Set lifecycle policy
    $lifecyclePolicy = @'
{
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
}
'@
    
    aws ecr put-lifecycle-policy `
        --repository-name $ECRRepositoryName `
        --region us-east-1 `
        --lifecycle-policy-text $lifecyclePolicy
    
    Write-Success "ECR repository configured with lifecycle policy"
}

# Function to test deployment readiness
function Test-DeploymentReadiness {
    Write-Status "Testing deployment readiness..."
    
    # Check if Docker is installed
    try {
        $null = Get-Command docker -ErrorAction Stop
        Write-Success "Docker is installed"
    }
    catch {
        Write-Error "Docker is not installed. Please install it first:"
        Write-Host "  https://docs.docker.com/get-docker/" -ForegroundColor Gray
        return $false
    }
    
    # Check if Docker is running
    try {
        $null = docker info 2>$null
        Write-Success "Docker is running"
    }
    catch {
        Write-Error "Docker is not running. Please start Docker first."
        return $false
    }
    
    # Test Docker build
    Write-Status "Testing Docker build..."
    try {
        $null = docker build -t edenos-mcp-bridge-test . 2>$null
        Write-Success "Docker build test passed"
        docker rmi edenos-mcp-bridge-test 2>$null
        return $true
    }
    catch {
        Write-Error "Docker build test failed"
        return $false
    }
}

# Function to show next steps
function Show-NextSteps {
    Write-Success "AWS setup completed successfully!"
    Write-Host ""
    Write-Status "Next steps:"
    Write-Host "1. Set your environment variables (see env.example)" -ForegroundColor Gray
    Write-Host "2. Run the deployment script:" -ForegroundColor Gray
    Write-Host "   .\aws\deploy.ps1" -ForegroundColor Gray
    Write-Host ""
    
    $AWSAccountId = aws sts get-caller-identity --query Account --output text
    Write-Status "Your AWS Account ID: $AWSAccountId"
    Write-Status "ECR Repository: ${AWSAccountId}.dkr.ecr.us-east-1.amazonaws.com/edenos-mcp-bridge-edenos-mcp-bridge"
    Write-Host ""
    Write-Warning "Remember to:"
    Write-Host "- Never share your AWS credentials" -ForegroundColor Yellow
    Write-Host "- Use environment variables for sensitive data" -ForegroundColor Yellow
    Write-Host "- Monitor your AWS costs" -ForegroundColor Yellow
    Write-Host "- Set up billing alerts" -ForegroundColor Yellow
}

# Main setup process
function Main {
    Write-Status "Setting up AWS for EdenOS MCP Bridge deployment..."
    Write-Host ""
    
    # Pre-setup checks
    if (-not (Test-AWSCLI)) { exit 1 }
    
    Write-Host ""
    
    # Configure AWS credentials
    if (-not (Set-AWSCredentials)) { exit 1 }
    
    Write-Host ""
    
    # Create ECR repository
    New-ECRRepository
    
    Write-Host ""
    
    # Test deployment readiness
    if (-not (Test-DeploymentReadiness)) { exit 1 }
    
    Write-Host ""
    
    # Show next steps
    Show-NextSteps
}

# Run main function
Main
