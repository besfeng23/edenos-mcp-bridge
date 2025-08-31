# EdenOS MCP Bridge Infrastructure Deployment Script (PowerShell)
# Usage: .\deploy.ps1 [staging|production] [plan|apply|destroy]

param(
    [Parameter(Position=0)]
    [ValidateSet("staging", "production")]
    [string]$Environment = "staging",
    
    [Parameter(Position=1)]
    [ValidateSet("plan", "apply", "destroy")]
    [string]$Action = "apply"
)

# Error handling
$ErrorActionPreference = "Stop"

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"
$White = "White"

# Default values
$ProjectDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Load environment variables
$EnvFile = Join-Path $ProjectDir "environments\$Environment.tfvars"

if (-not (Test-Path $EnvFile)) {
    Write-Host "Error: Environment file not found: $EnvFile" -ForegroundColor $Red
    exit 1
}

Write-Host "=== EdenOS MCP Bridge Infrastructure Deployment ===" -ForegroundColor $Blue
Write-Host "Environment: $Environment" -ForegroundColor $Yellow
Write-Host "Action: $Action" -ForegroundColor $Yellow
Write-Host "Project Directory: $ProjectDir" -ForegroundColor $Yellow
Write-Host ""

# Check if Terraform is installed
try {
    $terraformVersion = terraform version
    Write-Host "Terraform found: $($terraformVersion[0])" -ForegroundColor $Green
} catch {
    Write-Host "Error: Terraform is not installed" -ForegroundColor $Red
    Write-Host "Please install Terraform from https://www.terraform.io/downloads.html" -ForegroundColor $Yellow
    exit 1
}

# Check if gcloud is authenticated
try {
    $gcloudAuth = gcloud auth list --filter=status:ACTIVE --format="value(account)"
    if (-not $gcloudAuth) {
        throw "No active authentication"
    }
    Write-Host "gcloud authenticated as: $gcloudAuth" -ForegroundColor $Green
} catch {
    Write-Host "Error: Not authenticated with gcloud" -ForegroundColor $Red
    Write-Host "Please run: gcloud auth login" -ForegroundColor $Yellow
    exit 1
}

# Get project ID and region from tfvars
$ProjectId = (Get-Content $EnvFile | Where-Object { $_ -match '^project_id\s*=' } | ForEach-Object { ($_ -split '=')[1].Trim() -replace '"', '' })
$Region = (Get-Content $EnvFile | Where-Object { $_ -match '^region\s*=' } | ForEach-Object { ($_ -split '=')[1].Trim() -replace '"', '' })

Write-Host "Target Project: $ProjectId" -ForegroundColor $Yellow
Write-Host "Target Region: $Region" -ForegroundColor $Yellow
Write-Host ""

# Confirm action for destructive operations
if ($Action -eq "destroy") {
    Write-Host "⚠️  WARNING: This will DESTROY all infrastructure in $Environment environment!" -ForegroundColor $Red
    $confirm = Read-Host "Are you sure you want to continue? Type 'yes' to confirm"
    if ($confirm -ne "yes") {
        Write-Host "Deployment cancelled" -ForegroundColor $Yellow
        exit 0
    }
    Write-Host ""
}

# Change to project directory
Set-Location $ProjectDir

# Initialize Terraform if needed
if (-not (Test-Path ".terraform")) {
    Write-Host "Initializing Terraform..." -ForegroundColor $Blue
    terraform init
    Write-Host ""
}

# Set workspace
$WorkspaceName = "edenos-mcp-bridge-$Environment"
$workspaces = terraform workspace list
if ($workspaces -notcontains "* $WorkspaceName") {
    Write-Host "Creating Terraform workspace: $WorkspaceName" -ForegroundColor $Blue
    terraform workspace new $WorkspaceName
} else {
    Write-Host "Switching to workspace: $WorkspaceName" -ForegroundColor $Blue
    terraform workspace select $WorkspaceName
}
Write-Host ""

# Validate configuration
Write-Host "Validating Terraform configuration..." -ForegroundColor $Blue
try {
    terraform validate
    Write-Host "Configuration validation passed" -ForegroundColor $Green
} catch {
    Write-Host "Error: Terraform configuration validation failed" -ForegroundColor $Red
    exit 1
}
Write-Host ""

# Format check
Write-Host "Checking Terraform formatting..." -ForegroundColor $Blue
try {
    terraform fmt -check -recursive
    Write-Host "Formatting check passed" -ForegroundColor $Green
} catch {
    Write-Host "Warning: Terraform files are not properly formatted" -ForegroundColor $Yellow
    Write-Host "Run 'terraform fmt -recursive' to fix formatting" -ForegroundColor $Yellow
}
Write-Host ""

# Execute Terraform action
Write-Host "Executing: terraform $Action -var-file=environments\$Environment.tfvars" -ForegroundColor $Blue
Write-Host ""

switch ($Action) {
    "plan" {
        terraform plan -var-file="environments\$Environment.tfvars" -out="$Environment.tfplan"
        Write-Host ""
        Write-Host "✅ Plan completed successfully!" -ForegroundColor $Green
        Write-Host "Review the plan above and run: .\deploy.ps1 $Environment apply" -ForegroundColor $Blue
    }
    
    "apply" {
        $planFile = "$Environment.tfplan"
        if (Test-Path $planFile) {
            terraform apply $planFile
            Remove-Item $planFile -Force
        } else {
            terraform apply -var-file="environments\$Environment.tfvars"
        }
        Write-Host ""
        Write-Host "✅ Infrastructure deployed successfully!" -ForegroundColor $Green
        
        # Show outputs
        Write-Host ""
        Write-Host "=== Deployment Outputs ===" -ForegroundColor $Blue
        terraform output
    }
    
    "destroy" {
        terraform destroy -var-file="environments\$Environment.tfvars"
        Write-Host ""
        Write-Host "✅ Infrastructure destroyed successfully!" -ForegroundColor $Green
    }
}

Write-Host ""
Write-Host "=== Deployment Summary ===" -ForegroundColor $Blue
Write-Host "Environment: $Environment" -ForegroundColor $Green
Write-Host "Action: $Action" -ForegroundColor $Green
Write-Host "Status: Completed" -ForegroundColor $Green
Write-Host ""

if ($Action -eq "apply") {
    Write-Host "Next steps:" -ForegroundColor $Blue
    Write-Host "1. Verify the service is running: gcloud run services describe edenos-mcp-bridge --region=$Region" -ForegroundColor $White
    Write-Host "2. Check health endpoint: curl `$(gcloud run services describe edenos-mcp-bridge --region=$Region --format='value(status.url)')/health" -ForegroundColor $White
    Write-Host "3. View logs: gcloud logs tail --project=$ProjectId --filter='resource.type=cloud_run_revision'" -ForegroundColor $White
}
