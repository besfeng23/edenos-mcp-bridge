# Staging Environment Configuration
project_id = "gcp-edenos-staging"
region     = "us-central1"
environment = "staging"

# Container configuration
container_image = "gcr.io/gcp-edenos-staging/edenos-mcp-bridge:staging"
log_level      = "debug"

# Rate limiting (more permissive for staging)
rate_limit_rps   = 10
rate_limit_burst = 20

# Scaling (lower for staging)
min_scale = 0
max_scale = 5

# Resource limits (lower for staging)
cpu_limit    = "500m"
memory_limit = "256Mi"

# CORS origins (include staging domains)
allowed_origins = [
  "https://mcpmaster-web-app-staging.web.app",
  "https://mcpmaster-web-app-staging.firebaseapp.com",
  "http://localhost:3000",
  "http://localhost:5173",
  "https://staging.mcpmaster.edenos.com"
]

# GitHub configuration
github_owner = "edenos"
github_repo  = "edenos-mcp-bridge"
github_ref   = "refs/heads/develop"
