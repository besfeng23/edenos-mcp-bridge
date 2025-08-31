variable "project_id" {
  description = "GCP Project ID"
  type        = string
  default     = "gcp-edenos"
}

variable "region" {
  description = "GCP Region for resources"
  type        = string
  default     = "us-central1"
}

variable "container_image" {
  description = "Container image for the MCP Bridge service"
  type        = string
  default     = "gcr.io/gcp-edenos/edenos-mcp-bridge:latest"
}

variable "log_level" {
  description = "Log level for the application"
  type        = string
  default     = "info"
  validation {
    condition     = contains(["debug", "info", "warn", "error"], var.log_level)
    error_message = "Log level must be one of: debug, info, warn, error."
  }
}

variable "allowed_origins" {
  description = "List of allowed CORS origins"
  type        = list(string)
  default     = [
    "https://mcpmaster-web-app.web.app",
    "https://mcpmaster-web-app.firebaseapp.com",
    "http://localhost:3000",
    "http://localhost:5173"
  ]
}

variable "rate_limit_rps" {
  description = "Rate limit requests per second"
  type        = number
  default     = 5
  validation {
    condition     = var.rate_limit_rps > 0 && var.rate_limit_rps <= 100
    error_message = "Rate limit RPS must be between 1 and 100."
  }
}

variable "rate_limit_burst" {
  description = "Rate limit burst capacity"
  type        = number
  default     = 10
  validation {
    condition     = var.rate_limit_burst > 0 && var.rate_limit_burst <= 1000
    error_message = "Rate limit burst must be between 1 and 1000."
  }
}

variable "github_owner" {
  description = "GitHub repository owner"
  type        = string
  default     = "edenos"
}

variable "github_repo" {
  description = "GitHub repository name"
  type        = string
  default     = "edenos-mcp-bridge"
}

variable "github_ref" {
  description = "GitHub reference (branch/tag)"
  type        = string
  default     = "refs/heads/main"
}

variable "environment" {
  description = "Environment (staging, production)"
  type        = string
  default     = "staging"
  validation {
    condition     = contains(["staging", "production"], var.environment)
    error_message = "Environment must be either 'staging' or 'production'."
  }
}

variable "min_scale" {
  description = "Minimum number of Cloud Run instances"
  type        = number
  default     = 1
  validation {
    condition     = var.min_scale >= 0 && var.min_scale <= 10
    error_message = "Min scale must be between 0 and 10."
  }
}

variable "max_scale" {
  description = "Maximum number of Cloud Run instances"
  type        = number
  default     = 10
  validation {
    condition     = var.max_scale > 0 && var.max_scale <= 100
    error_message = "Max scale must be between 1 and 100."
  }
}

variable "cpu_limit" {
  description = "CPU limit for Cloud Run container"
  type        = string
  default     = "1000m"
  validation {
    condition     = can(regex("^[0-9]+m$", var.cpu_limit))
    error_message = "CPU limit must be in format '1000m'."
  }
}

variable "memory_limit" {
  description = "Memory limit for Cloud Run container"
  type        = string
  default     = "512Mi"
  validation {
    condition     = can(regex("^[0-9]+[KMG]i$", var.memory_limit))
    error_message = "Memory limit must be in format '512Mi'."
  }
}
