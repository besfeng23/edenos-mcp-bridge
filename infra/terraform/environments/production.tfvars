# Production Environment Configuration
project_id = "gcp-edenos"
region     = "us-central1"
environment = "production"

# Container configuration
container_image = "gcr.io/gcp-edenos/edenos-mcp-bridge:latest"
log_level      = "info"

# Rate limiting (stricter for production)
rate_limit_rps   = 5
rate_limit_burst = 10

# Scaling (higher for production)
min_scale = 2
max_scale = 20

# Resource limits (higher for production)
cpu_limit    = "1000m"
memory_limit = "512Mi"

# CORS origins (production domains only)
allowed_origins = [
  "https://mcpmaster-web-app.web.app",
  "https://mcpmaster-web-app.firebaseapp.com",
  "https://mcpmaster.edenos.com"
]

# GitHub configuration
github_owner = "edenos"
github_repo  = "edenos-mcp-bridge"
github_ref   = "refs/heads/main"
