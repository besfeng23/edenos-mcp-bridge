# Setup scheduled task for daily GitHub to Linear sync (PowerShell version)
# This script creates a Windows scheduled task for daily sync

Write-Host "⏰ Setting up daily GitHub to Linear sync scheduled task..." -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "sync-github-to-linear.ps1")) {
    Write-Host "❌ sync-github-to-linear.ps1 not found. Please run this from the repository directory." -ForegroundColor Red
    exit 1
}

# Get the current directory
$repoDir = Get-Location
Write-Host "📁 Repository directory: $repoDir" -ForegroundColor Cyan

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ .env file not found. Please run setup-github-linear-sync.ps1 first." -ForegroundColor Red
    exit 1
}

# Create the scheduled task
$taskName = "GitHub-Linear-Sync"
$taskDescription = "Daily sync of GitHub issues and PRs to Linear"
$scriptPath = Join-Path $repoDir "sync-github-to-linear.ps1"
$logPath = Join-Path $env:TEMP "linear-sync.log"

Write-Host "📝 Scheduled task details:" -ForegroundColor Yellow
Write-Host "   Name: $taskName" -ForegroundColor Cyan
Write-Host "   Script: $scriptPath" -ForegroundColor Cyan
Write-Host "   Log: $logPath" -ForegroundColor Cyan
Write-Host "   Schedule: Daily at 3:15 AM" -ForegroundColor Cyan
Write-Host ""

# Ask for confirmation
$confirm = Read-Host "Create this scheduled task? (y/n)"
if ($confirm -notmatch "^[Yy]$") {
    Write-Host "❌ Scheduled task setup cancelled." -ForegroundColor Red
    exit 0
}

# Create the scheduled task action
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-ExecutionPolicy Bypass -File `"$scriptPath`""

# Create the scheduled task trigger (daily at 3:15 AM)
$trigger = New-ScheduledTaskTrigger -Daily -At "3:15AM"

# Create the scheduled task settings
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

# Create the scheduled task principal (run as current user)
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType InteractiveToken

# Create the scheduled task
try {
    Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Description $taskDescription -Force
    Write-Host "✅ Scheduled task created successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to create scheduled task: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📊 The sync will run daily at 3:15 AM" -ForegroundColor Green
Write-Host "📝 Logs will be written to: $logPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "To view logs: Get-Content $logPath -Tail 50 -Wait" -ForegroundColor Cyan
Write-Host "To remove the scheduled task: Unregister-ScheduledTask -TaskName '$taskName' -Confirm:`$false" -ForegroundColor Cyan
Write-Host "To view task details: Get-ScheduledTask -TaskName '$taskName'" -ForegroundColor Cyan
