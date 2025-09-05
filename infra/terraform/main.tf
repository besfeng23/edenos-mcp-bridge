terraform {
  backend "gcs" {
    bucket = "tfstate-${var.project_id}"
    prefix = "edenos-mcp-bridge"
  }
  required_providers {
    google = { source = "hashicorp/google", version = "~> 5.43" }
  }
}

# Example SLO label propagation
resource "google_run_v2_service" "mcp" {
  name     = var.service_name
  location = var.region
  template {
    containers {
      image = var.image
      env {
        name  = "SLO_TARGET"
        value = "99.5"
      }
    }
    scaling { min_instance_count = 1 max_instance_count = 20 }
  }
  ingress = "INGRESS_TRAFFIC_ALL"
}
