terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }
  
  backend "gcs" {
    bucket = "edenos-mcp-terraform-state"
    prefix = "edenos-mcp-bridge"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# Enable required APIs
resource "google_project_service" "required_apis" {
  for_each = toset([
    "run.googleapis.com",
    "cloudbuild.googleapis.com",
    "secretmanager.googleapis.com",
    "pubsub.googleapis.com",
    "cloudscheduler.googleapis.com",
    "cloudtasks.googleapis.com",
    "firestore.googleapis.com",
    "bigquery.googleapis.com",
    "firebase.googleapis.com"
  ])
  
  project = var.project_id
  service = each.value
  
  disable_dependent_services = false
  disable_on_destroy         = false
}

# Service account for the MCP Bridge
resource "google_service_account" "mcp_bridge" {
  account_id   = "edenos-mcp-bridge"
  display_name = "EdenOS MCP Bridge Service Account"
  description  = "Service account for EdenOS MCP Bridge Cloud Run service"
}

# IAM roles for the service account
resource "google_project_iam_member" "mcp_bridge_roles" {
  for_each = toset([
    "roles/run.invoker",
    "roles/secretmanager.secretAccessor",
    "roles/pubsub.publisher",
    "roles/cloudscheduler.admin",
    "roles/cloudtasks.admin",
    "roles/datastore.user",
    "roles/bigquery.dataEditor",
    "roles/bigquery.jobUser",
    "roles/firebase.admin"
  ])
  
  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.mcp_bridge.email}"
}

# Cloud Run service
resource "google_cloud_run_service" "mcp_bridge" {
  name     = "edenos-mcp-bridge"
  location = var.region
  
  template {
    spec {
      containers {
        image = var.container_image
        
        ports {
          container_port = 8080
        }
        
        resources {
          limits = {
            cpu    = "1000m"
            memory = "512Mi"
          }
        }
        
        env {
          name  = "PORT"
          value = "8080"
        }
        
        env {
          name  = "LOG_LEVEL"
          value = var.log_level
        }
        
        env {
          name  = "ALLOWED_ORIGINS"
          value = join(",", var.allowed_origins)
        }
        
        env {
          name  = "RATE_LIMIT_RPS"
          value = tostring(var.rate_limit_rps)
        }
        
        env {
          name  = "RATE_LIMIT_BURST"
          value = tostring(var.rate_limit_burst)
        }
        
        env {
          name  = "GITHUB_REF"
          value = var.github_ref
        }
      }
      
      service_account_name = google_service_account.mcp_bridge.email
      
      container_concurrency = 80
      timeout_seconds      = 300
    }
    
    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale" = "1"
        "autoscaling.knative.dev/maxScale" = "10"
        "run.googleapis.com/ingress"       = "all"
        "run.googleapis.com/cloudsql-instances" = ""
      }
    }
  }
  
  traffic {
    percent         = 100
    latest_revision = true
  }
  
  depends_on = [google_project_service.required_apis]
}

# IAM policy for Cloud Run service
resource "google_cloud_run_service_iam_member" "public_access" {
  location = google_cloud_run_service.mcp_bridge.location
  service  = google_cloud_run_service.mcp_bridge.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# Cloud Build trigger for automatic deployments
resource "google_cloudbuild_trigger" "mcp_bridge_deploy" {
  name        = "edenos-mcp-bridge-deploy"
  description = "Deploy EdenOS MCP Bridge on push to main branch"
  
  github {
    owner  = var.github_owner
    name   = var.github_repo
    push {
      branch = "main"
    }
  }
  
  filename = "cloudbuild.yaml"
  
  substitutions = {
    _REGION = var.region
    _SERVICE = "edenos-mcp-bridge"
  }
}

# Pub/Sub topic for notifications
resource "google_pubsub_topic" "mcp_bridge_events" {
  name = "edenos-mcp-bridge-events"
}

# Cloud Scheduler job for health checks
resource "google_cloud_scheduler_job" "health_check" {
  name        = "edenos-mcp-bridge-health-check"
  description = "Periodic health check for MCP Bridge"
  schedule    = "*/5 * * * *"
  
  http_target {
    http_method = "GET"
    uri         = "${google_cloud_run_service.mcp_bridge.status[0].url}/health"
    
    headers = {
      "User-Agent" = "Cloud-Scheduler"
    }
  }
}

# Secret for GitHub token
resource "google_secret_manager_secret" "github_token" {
  secret_id = "edenos-github-token"
  
  replication {
    automatic = true
  }
}

# Secret for Firebase service account
resource "google_secret_manager_secret" "firebase_service_account" {
  secret_id = "edenos-firebase-service-account"
  
  replication {
    automatic = true
  }
}

# Outputs
output "service_url" {
  value = google_cloud_run_service.mcp_bridge.status[0].url
}

output "service_account_email" {
  value = google_service_account.mcp_bridge.email
}

output "pubsub_topic" {
  value = google_pubsub_topic.mcp_bridge_events.name
}
