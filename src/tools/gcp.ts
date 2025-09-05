import { z } from 'zod';

// GCP MCP Server Integration
// Provides tools for interacting with Google Cloud Platform services

const GCPConfigSchema = z.object({
  projectId: z.string().min(1, 'GCP project ID is required'),
  serviceAccountKey: z.string().optional(),
  region: z.string().default('us-central1'),
  zone: z.string().default('us-central1-a')
});

export class GCPMCPServer {
  private config: z.infer<typeof GCPConfigSchema>;
  private accessToken: string | null = null;

  constructor(config: z.infer<typeof GCPConfigSchema>) {
    this.config = GCPConfigSchema.parse(config);
  }

  // Get access token
  private async getAccessToken(): Promise<string> {
    if (this.accessToken) return this.accessToken;

    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion: this.config.serviceAccountKey || ''
        })
      });

      if (!response.ok) {
        throw new Error(`GCP Auth error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      return this.accessToken;
    } catch (error) {
      throw new Error(`Failed to get access token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // List Cloud Run services
  async listCloudRunServices() {
    try {
      const token = await this.getAccessToken();
      const response = await fetch(`https://run.googleapis.com/v1/projects/${this.config.projectId}/locations/${this.config.region}/services`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Cloud Run API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.services || [];
    } catch (error) {
      throw new Error(`Failed to list Cloud Run services: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Deploy Cloud Run service
  async deployCloudRunService(serviceName: string, imageUrl: string, port: number = 8080) {
    try {
      const token = await this.getAccessToken();
      const serviceData = {
        apiVersion: 'serving.knative.dev/v1',
        kind: 'Service',
        metadata: {
          name: serviceName,
          namespace: this.config.projectId
        },
        spec: {
          template: {
            spec: {
              containers: [{
                image: imageUrl,
                ports: [{ containerPort: port }],
                resources: {
                  limits: {
                    cpu: '1000m',
                    memory: '512Mi'
                  }
                }
              }]
            }
          }
        }
      };

      const response = await fetch(`https://run.googleapis.com/v1/projects/${this.config.projectId}/locations/${this.config.region}/services`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(serviceData)
      });

      if (!response.ok) {
        throw new Error(`Cloud Run API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to deploy Cloud Run service: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // List Cloud Storage buckets
  async listStorageBuckets() {
    try {
      const token = await this.getAccessToken();
      const response = await fetch(`https://storage.googleapis.com/storage/v1/b?project=${this.config.projectId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Cloud Storage API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      throw new Error(`Failed to list storage buckets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Create Cloud Storage bucket
  async createStorageBucket(bucketName: string, location: string = 'US') {
    try {
      const token = await this.getAccessToken();
      const bucketData = {
        name: bucketName,
        location: location,
        storageClass: 'STANDARD'
      };

      const response = await fetch(`https://storage.googleapis.com/storage/v1/b?project=${this.config.projectId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bucketData)
      });

      if (!response.ok) {
        throw new Error(`Cloud Storage API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to create storage bucket: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // List AI Platform models
  async listAIPlatformModels() {
    try {
      const token = await this.getAccessToken();
      const response = await fetch(`https://ml.googleapis.com/v1/projects/${this.config.projectId}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`AI Platform API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.models || [];
    } catch (error) {
      throw new Error(`Failed to list AI Platform models: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Create AI Platform model
  async createAIPlatformModel(modelName: string, description?: string) {
    try {
      const token = await this.getAccessToken();
      const modelData = {
        name: modelName,
        description: description || `Model: ${modelName}`,
        regions: [this.config.region]
      };

      const response = await fetch(`https://ml.googleapis.com/v1/projects/${this.config.projectId}/models`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(modelData)
      });

      if (!response.ok) {
        throw new Error(`AI Platform API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to create AI Platform model: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // List BigQuery datasets
  async listBigQueryDatasets() {
    try {
      const token = await this.getAccessToken();
      const response = await fetch(`https://bigquery.googleapis.com/bigquery/v2/projects/${this.config.projectId}/datasets`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`BigQuery API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.datasets || [];
    } catch (error) {
      throw new Error(`Failed to list BigQuery datasets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Create BigQuery dataset
  async createBigQueryDataset(datasetId: string, description?: string) {
    try {
      const token = await this.getAccessToken();
      const datasetData = {
        datasetReference: {
          datasetId: datasetId,
          projectId: this.config.projectId
        },
        description: description || `Dataset: ${datasetId}`,
        location: this.config.region
      };

      const response = await fetch(`https://bigquery.googleapis.com/bigquery/v2/projects/${this.config.projectId}/datasets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datasetData)
      });

      if (!response.ok) {
        throw new Error(`BigQuery API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to create BigQuery dataset: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get project info
  async getProjectInfo() {
    try {
      const token = await this.getAccessToken();
      const response = await fetch(`https://cloudresourcemanager.googleapis.com/v1/projects/${this.config.projectId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Cloud Resource Manager API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to get project info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// MCP Tools for GCP
export const gcpTools = {
  'gcp.list-cloud-run-services': {
    description: 'List Cloud Run services',
    parameters: {
      type: 'object',
      properties: {}
    }
  },
  'gcp.deploy-cloud-run-service': {
    description: 'Deploy a Cloud Run service',
    parameters: {
      type: 'object',
      properties: {
        serviceName: { type: 'string', description: 'Service name' },
        imageUrl: { type: 'string', description: 'Container image URL' },
        port: { type: 'number', description: 'Container port' }
      },
      required: ['serviceName', 'imageUrl']
    }
  },
  'gcp.list-storage-buckets': {
    description: 'List Cloud Storage buckets',
    parameters: {
      type: 'object',
      properties: {}
    }
  },
  'gcp.create-storage-bucket': {
    description: 'Create a Cloud Storage bucket',
    parameters: {
      type: 'object',
      properties: {
        bucketName: { type: 'string', description: 'Bucket name' },
        location: { type: 'string', description: 'Bucket location' }
      },
      required: ['bucketName']
    }
  },
  'gcp.list-ai-platform-models': {
    description: 'List AI Platform models',
    parameters: {
      type: 'object',
      properties: {}
    }
  },
  'gcp.create-ai-platform-model': {
    description: 'Create an AI Platform model',
    parameters: {
      type: 'object',
      properties: {
        modelName: { type: 'string', description: 'Model name' },
        description: { type: 'string', description: 'Model description' }
      },
      required: ['modelName']
    }
  },
  'gcp.list-bigquery-datasets': {
    description: 'List BigQuery datasets',
    parameters: {
      type: 'object',
      properties: {}
    }
  },
  'gcp.create-bigquery-dataset': {
    description: 'Create a BigQuery dataset',
    parameters: {
      type: 'object',
      properties: {
        datasetId: { type: 'string', description: 'Dataset ID' },
        description: { type: 'string', description: 'Dataset description' }
      },
      required: ['datasetId']
    }
  },
  'gcp.get-project-info': {
    description: 'Get GCP project information',
    parameters: {
      type: 'object',
      properties: {}
    }
  }
};

// Tool execution handler
export async function executeGCPTool(tool: string, args: any, config: any) {
  const gcp = new GCPMCPServer(config);
  
  switch (tool) {
    case 'gcp.list-cloud-run-services':
      return await gcp.listCloudRunServices();
    
    case 'gcp.deploy-cloud-run-service':
      return await gcp.deployCloudRunService(args.serviceName, args.imageUrl, args.port);
    
    case 'gcp.list-storage-buckets':
      return await gcp.listStorageBuckets();
    
    case 'gcp.create-storage-bucket':
      return await gcp.createStorageBucket(args.bucketName, args.location);
    
    case 'gcp.list-ai-platform-models':
      return await gcp.listAIPlatformModels();
    
    case 'gcp.create-ai-platform-model':
      return await gcp.createAIPlatformModel(args.modelName, args.description);
    
    case 'gcp.list-bigquery-datasets':
      return await gcp.listBigQueryDatasets();
    
    case 'gcp.create-bigquery-dataset':
      return await gcp.createBigQueryDataset(args.datasetId, args.description);
    
    case 'gcp.get-project-info':
      return await gcp.getProjectInfo();
    
    default:
      throw new Error(`Unknown GCP tool: ${tool}`);
  }
}