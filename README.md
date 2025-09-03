# GitHub to Linear Sync for mcpmaster

A complete solution for syncing GitHub issues and pull requests to Linear issues with proper linking and automation.

## 🚀 Quick Start

1. **Run the setup script:**
   ```bash
   chmod +x setup-github-linear-sync.sh
   ./setup-github-linear-sync.sh
   ```

2. **Run the sync:**
   ```bash
   cd mcpmaster-sync
   ./sync-github-to-linear.sh
   ```

## 📋 Prerequisites

- **GitHub CLI** installed and authenticated: `gh auth login`
- **Linear API key**: Create one in Linear → Settings → API
- **Linear Team Key**: The short code like `ENG`, `OPS`, etc.
- **jq**: JSON processor (`choco install jq` on Windows, `brew install jq` on macOS)

## 🔧 Configuration

The setup script will create a `.env` file with your configuration:

```bash
GITHUB_REPO=your-org/mcpmaster
LINEAR_API_KEY=your-linear-api-key
LINEAR_TEAM_KEY=ENG
GIT_BRANCH=mcpmaster  # if mcpmaster is a branch
```

## 📁 Files Overview

- `setup-github-linear-sync.sh` - Main setup script
- `sync-github-to-linear.sh` - Core sync script
- `.github/pull_request_template.md` - PR template for Linear linking
- `.github/workflows/linear-sync.yml` - GitHub Actions auto-sync
- `setup-cron.sh` - Daily sync cron job setup
- `linear-sync-audit.ndjson` - Audit log (created after first sync)

## 🔄 Features

### One-time Sync
- Syncs all open GitHub issues and PRs to Linear
- Preserves metadata (labels, assignees, creation date)
- Creates back-references in Linear descriptions
- Posts comments back to GitHub with Linear links

### Auto-sync (GitHub Actions)
- Automatically creates Linear issues for new GitHub issues/PRs
- Posts comments back to GitHub with Linear links
- Runs on issue/PR open and reopen events

### Daily Sync (Cron)
- Optional daily sync to catch any missed items
- Runs at 3:15 AM daily
- Logs to `/tmp/linear-sync.log`

### Audit Trail
- All sync actions logged to `linear-sync-audit.ndjson`
- JSON format for easy processing and analysis
- Includes timestamps, source info, and Linear identifiers

## 🎯 Linear Linking Conventions

For future commits and PRs, use these conventions so Linear auto-links:

- **Branch names**: `ENG-123-feature-name`
- **Commit messages**: `ENG-123: fix authentication bug`
- **PR titles**: `[ENG-123] Add user management feature`

## 🔧 GitHub Actions Setup

1. Add your Linear API key to GitHub Secrets:
   - Go to your repo → Settings → Secrets and variables → Actions
   - Add secret: `LINEAR_API_KEY`

2. Add your Linear team key to GitHub Variables:
   - Go to your repo → Settings → Secrets and variables → Actions
   - Add variable: `LINEAR_TEAM_KEY` (e.g., `ENG`)

3. The workflow will automatically sync new issues and PRs

## 📊 Monitoring

### View Sync Logs
```bash
# View recent sync activity
tail -f linear-sync-audit.ndjson

# View cron job logs
tail -f /tmp/linear-sync.log
```

### Check Cron Job
```bash
# List current cron jobs
crontab -l

# Edit cron jobs
crontab -e
```

## 🛠️ Troubleshooting

### Common Issues

1. **"jq required" error**
   - Install jq: `choco install jq` (Windows) or `brew install jq` (macOS)

2. **"GitHub CLI not authenticated"**
   - Run: `gh auth login`

3. **"Could not resolve Linear team key"**
   - Check your `LINEAR_TEAM_KEY` in `.env`
   - Available teams are listed in the error message

4. **"Failed to create Linear issue"**
   - Check your `LINEAR_API_KEY` in `.env`
   - Ensure the API key has proper permissions

### Debug Mode
Add `set -x` to the beginning of `sync-github-to-linear.sh` for verbose output.

## 🔄 Manual Sync

To run a manual sync:
```bash
cd mcpmaster-sync
source .env
./sync-github-to-linear.sh
```

## 📈 Optional Enhancements

### Label-based Priority Mapping
Extend the sync script to map GitHub labels to Linear priorities:
```bash
# Add to create_linear_issue function
case "$labels" in
    *"priority:high"*) priority="Urgent" ;;
    *"priority:medium"*) priority="High" ;;
    *) priority="Normal" ;;
esac
```

### Custom Field Mapping
Map GitHub labels to Linear custom fields for SLA tracking, customer tiers, etc.

### Bi-directional Sync
Extend to sync Linear issue updates back to GitHub (requires webhook setup).

## 📝 License

This project is provided as-is for educational and practical use.
