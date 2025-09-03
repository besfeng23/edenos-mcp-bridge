# GitHub to Linear Sync Script (PowerShell version)
# Syncs open GitHub issues and PRs to Linear issues

# Load environment variables
if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.*)$") {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
}

# Validate required environment variables
$requiredVars = @("LINEAR_API_KEY", "LINEAR_TEAM_KEY", "GITHUB_REPO")
foreach ($var in $requiredVars) {
    if (-not [Environment]::GetEnvironmentVariable($var)) {
        Write-Host "❌ Environment variable $var is not set" -ForegroundColor Red
        exit 1
    }
}

$LINEAR_API_KEY = [Environment]::GetEnvironmentVariable("LINEAR_API_KEY")
$LINEAR_TEAM_KEY = [Environment]::GetEnvironmentVariable("LINEAR_TEAM_KEY")
$GITHUB_REPO = [Environment]::GetEnvironmentVariable("GITHUB_REPO")

Write-Host "🔄 Starting GitHub to Linear sync..." -ForegroundColor Green
Write-Host "📊 Repository: $GITHUB_REPO" -ForegroundColor Cyan
Write-Host "🎯 Linear Team: $LINEAR_TEAM_KEY" -ForegroundColor Cyan
Write-Host ""

# Check if jq is available
try {
    $null = Get-Command jq -ErrorAction Stop
} catch {
    Write-Host "❌ jq is required but not installed" -ForegroundColor Red
    exit 1
}

# Check if gh is available
try {
    $null = Get-Command gh -ErrorAction Stop
} catch {
    Write-Host "❌ GitHub CLI (gh) is required but not installed" -ForegroundColor Red
    exit 1
}

# Function to create Linear issue
function Create-LinearIssue {
    param(
        [string]$title,
        [string]$description,
        [string]$labelsCsv,
        [string]$sourceType,
        [string]$sourceNumber
    )

    Write-Host "📝 Creating Linear issue: $title" -ForegroundColor Yellow

    # GraphQL mutation to create issue
    $graphql = @"
mutation CreateIssue(`$input: IssueCreateInput!) {
  issueCreate(input: `$input) {
    success
    issue { 
      id 
      identifier 
      url 
    }
    error {
      message
    }
  }
}
"@

    # First: lookup team id
    $teamLookup = 'query{teams{nodes{id key}}}'
    $teamJson = Invoke-RestMethod -Uri "https://api.linear.app/graphql" -Method Post -Headers @{
        "Content-Type" = "application/json"
        "Authorization" = $LINEAR_API_KEY
    } -Body (@{query = $teamLookup} | ConvertTo-Json)
    
    $teamId = ($teamJson.data.teams.nodes | Where-Object { $_.key -eq $LINEAR_TEAM_KEY }).id
    
    if (-not $teamId) {
        Write-Host "❌ Could not resolve Linear team key '$LINEAR_TEAM_KEY' to id" -ForegroundColor Red
        Write-Host "Available teams:" -ForegroundColor Yellow
        $teamJson.data.teams.nodes | ForEach-Object { Write-Host "  - $($_.key) ($($_.id))" -ForegroundColor Cyan }
        return $false
    }

    # Build final payload with teamId
    $payload = @{
        query = $graphql
        variables = @{
            input = @{
                teamId = $teamId
                title = $title
                description = $description
            }
        }
    } | ConvertTo-Json -Depth 10

    # Create the issue
    try {
        $response = Invoke-RestMethod -Uri "https://api.linear.app/graphql" -Method Post -Headers @{
            "Content-Type" = "application/json"
            "Authorization" = $LINEAR_API_KEY
        } -Body $payload

        $success = $response.data.issueCreate.success
        $errorMsg = $response.data.issueCreate.error.message
        $identifier = $response.data.issueCreate.issue.identifier
        $url = $response.data.issueCreate.issue.url

        if ($success) {
            Write-Host "✅ Created Linear issue $identifier → $url" -ForegroundColor Green
            
            # Log to audit file
            $auditEntry = @{
                ts = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
                src = "github"
                type = $sourceType
                repo = $GITHUB_REPO
                num = [int]$sourceNumber
                linear = $identifier
                url = $url
            } | ConvertTo-Json -Compress
            
            Add-Content -Path "linear-sync-audit.ndjson" -Value $auditEntry
            
            return @{
                success = $true
                identifier = $identifier
                url = $url
            }
        } else {
            Write-Host "❌ Failed to create Linear issue: $errorMsg" -ForegroundColor Red
            Write-Host "Response: $($response | ConvertTo-Json -Depth 10)" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ Error creating Linear issue: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Function to post comment back to GitHub
function Post-GitHubComment {
    param(
        [string]$issueNumber,
        [string]$linearUrl,
        [string]$linearIdentifier,
        [string]$type = "issue"
    )
    
    $comment = "🔄 **Mirrored to Linear**

Linear Issue: [$linearIdentifier]($linearUrl)

This $type has been automatically synced from GitHub to Linear for tracking."
    
    try {
        if ($type -eq "issue") {
            gh issue comment $issueNumber -R $GITHUB_REPO -b $comment
        } else {
            gh pr comment $issueNumber -R $GITHUB_REPO -b $comment
        }
        Write-Host "💬 Posted comment back to GitHub $type #$issueNumber" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Could not post comment to GitHub $type #$issueNumber" -ForegroundColor Yellow
    }
}

# Fetch GitHub issues (open)
Write-Host "📋 Fetching GitHub issues..." -ForegroundColor Yellow
$issuesJson = gh issue list -R $GITHUB_REPO --state open --json number,title,body,labels,url,assignees,createdAt,updatedAt | ConvertFrom-Json

# Fetch GitHub PRs (open)
Write-Host "📋 Fetching GitHub PRs..." -ForegroundColor Yellow
$prsJson = gh pr list -R $GITHUB_REPO --state open --json number,title,body,labels,url,author,createdAt,updatedAt | ConvertFrom-Json

# Process issues
Write-Host ""
Write-Host "🔄 Syncing issues → Linear..." -ForegroundColor Green
foreach ($issue in $issuesJson) {
    $num = $issue.number
    $title = $issue.title
    $body = if ($issue.body) { $issue.body } else { "" }
    $url = $issue.url
    $labels = ($issue.labels | ForEach-Object { $_.name }) -join ", "
    $assignees = ($issue.assignees | ForEach-Object { $_.login }) -join ", "
    $createdAt = $issue.createdAt
    
    $desc = @"
**Source:** GitHub Issue #$num
**URL:** $url
**Created:** $createdAt
**Labels:** $labels
**Assignees:** $assignees

---

$body
"@
    
    $result = Create-LinearIssue -title $title -description $desc -labelsCsv $labels -sourceType "issue" -sourceNumber $num
    if ($result -and $result.success) {
        Post-GitHubComment -issueNumber $num -linearUrl $result.url -linearIdentifier $result.identifier -type "issue"
    }
}

# Process PRs
Write-Host ""
Write-Host "🔄 Syncing PRs → Linear..." -ForegroundColor Green
foreach ($pr in $prsJson) {
    $num = $pr.number
    $title = $pr.title
    $body = if ($pr.body) { $pr.body } else { "" }
    $url = $pr.url
    $labels = ($pr.labels | ForEach-Object { $_.name }) -join ", "
    $author = $pr.author.login
    $createdAt = $pr.createdAt
    
    $desc = @"
**Source:** GitHub PR #$num
**URL:** $url
**Created:** $createdAt
**Author:** $author
**Labels:** $labels

---

$body
"@
    
    $result = Create-LinearIssue -title "[PR] $title" -description $desc -labelsCsv $labels -sourceType "pr" -sourceNumber $num
    if ($result -and $result.success) {
        Post-GitHubComment -issueNumber $num -linearUrl $result.url -linearIdentifier $result.identifier -type "pr"
    }
}

Write-Host ""
Write-Host "✅ Sync complete!" -ForegroundColor Green
Write-Host "📊 Check linear-sync-audit.ndjson for detailed logs" -ForegroundColor Cyan
