// MCP Tools Index
// Exports all available MCP tools and their handlers

export * from './guard';
export * from './notion';
export * from './linear';
export * from './github';
export * from './firebase';
export * from './gcp';

// Tool registry for easy lookup
export const toolRegistry = {
  // Notion tools
  'notion.get-page': { handler: 'notion', description: 'Get a Notion page by ID' },
  'notion.get-database': { handler: 'notion', description: 'Get a Notion database by ID' },
  'notion.query-database': { handler: 'notion', description: 'Query a Notion database' },
  'notion.create-page': { handler: 'notion', description: 'Create a new Notion page' },
  'notion.update-page': { handler: 'notion', description: 'Update an existing Notion page' },
  'notion.get-page-content': { handler: 'notion', description: 'Get Notion page content' },
  'notion.search': { handler: 'notion', description: 'Search across Notion' },
  'notion.get-me': { handler: 'notion', description: 'Get current Notion user' },

  // Linear tools
  'linear.get-issue': { handler: 'linear', description: 'Get a Linear issue by ID' },
  'linear.get-issues': { handler: 'linear', description: 'Get Linear issues with filters' },
  'linear.create-issue': { handler: 'linear', description: 'Create a new Linear issue' },
  'linear.update-issue': { handler: 'linear', description: 'Update an existing Linear issue' },
  'linear.get-project': { handler: 'linear', description: 'Get a Linear project by ID' },
  'linear.get-projects': { handler: 'linear', description: 'Get Linear projects with filters' },
  'linear.create-project': { handler: 'linear', description: 'Create a new Linear project' },
  'linear.get-team': { handler: 'linear', description: 'Get a Linear team by ID' },
  'linear.get-teams': { handler: 'linear', description: 'Get all Linear teams' },
  'linear.search-issues': { handler: 'linear', description: 'Search Linear issues' },
  'linear.get-me': { handler: 'linear', description: 'Get current Linear user' },

  // GitHub tools
  'github.get-repository': { handler: 'github', description: 'Get a GitHub repository' },
  'github.list-repositories': { handler: 'github', description: 'List GitHub repositories' },
  'github.get-issue': { handler: 'github', description: 'Get a GitHub issue' },
  'github.list-issues': { handler: 'github', description: 'List GitHub issues' },
  'github.create-issue': { handler: 'github', description: 'Create a GitHub issue' },
  'github.update-issue': { handler: 'github', description: 'Update a GitHub issue' },
  'github.get-pull-request': { handler: 'github', description: 'Get a GitHub pull request' },
  'github.list-pull-requests': { handler: 'github', description: 'List GitHub pull requests' },
  'github.create-pull-request': { handler: 'github', description: 'Create a GitHub pull request' },
  'github.merge-pull-request': { handler: 'github', description: 'Merge a GitHub pull request' },
  'github.search-repositories': { handler: 'github', description: 'Search GitHub repositories' },
  'github.search-issues': { handler: 'github', description: 'Search GitHub issues' },
  'github.get-me': { handler: 'github', description: 'Get current GitHub user' },

  // Firebase tools
  'firebase.get-document': { handler: 'firebase', description: 'Get a Firestore document' },
  'firebase.create-document': { handler: 'firebase', description: 'Create a Firestore document' },

  // GCP tools
  'gcp.list-cloud-run-services': { handler: 'gcp', description: 'List Cloud Run services' },
  'gcp.deploy-cloud-run-service': { handler: 'gcp', description: 'Deploy a Cloud Run service' },
  'gcp.list-storage-buckets': { handler: 'gcp', description: 'List Cloud Storage buckets' },
  'gcp.create-storage-bucket': { handler: 'gcp', description: 'Create a Cloud Storage bucket' },
  'gcp.list-ai-platform-models': { handler: 'gcp', description: 'List AI Platform models' },
  'gcp.create-ai-platform-model': { handler: 'gcp', description: 'Create an AI Platform model' },
  'gcp.list-bigquery-datasets': { handler: 'gcp', description: 'List BigQuery datasets' },
  'gcp.create-bigquery-dataset': { handler: 'gcp', description: 'Create a BigQuery dataset' },
  'gcp.get-project-info': { handler: 'gcp', description: 'Get GCP project information' }
};

// Configuration schemas for each service
export const serviceConfigs = {
  notion: {
    apiKey: { type: 'string', required: true, description: 'Notion API key' },
    version: { type: 'string', required: false, default: '2022-06-28', description: 'Notion API version' },
    baseUrl: { type: 'string', required: false, default: 'https://api.notion.com/v1', description: 'Notion API base URL' }
  },
  linear: {
    apiKey: { type: 'string', required: true, description: 'Linear API key' },
    baseUrl: { type: 'string', required: false, default: 'https://api.linear.app/graphql', description: 'Linear API base URL' }
  },
  github: {
    token: { type: 'string', required: true, description: 'GitHub personal access token' },
    baseUrl: { type: 'string', required: false, default: 'https://api.github.com', description: 'GitHub API base URL' }
  },
  firebase: {
    projectId: { type: 'string', required: true, description: 'Firebase project ID' },
    serviceAccountKey: { type: 'string', required: false, description: 'Firebase service account key' },
    apiKey: { type: 'string', required: false, description: 'Firebase API key' }
  },
  gcp: {
    projectId: { type: 'string', required: true, description: 'GCP project ID' },
    serviceAccountKey: { type: 'string', required: false, description: 'GCP service account key' },
    region: { type: 'string', required: false, default: 'us-central1', description: 'GCP region' },
    zone: { type: 'string', required: false, default: 'us-central1-a', description: 'GCP zone' }
  }
};

// Tool execution dispatcher
export async function executeTool(tool: string, args: any, config: any) {
  const toolInfo = toolRegistry[tool];
  if (!toolInfo) {
    throw new Error(`Unknown tool: ${tool}`);
  }

  const { handler } = toolInfo;
  const serviceConfig = config[handler];
  
  if (!serviceConfig) {
    throw new Error(`Configuration missing for ${handler} service`);
  }

  switch (handler) {
    case 'notion':
      const { executeNotionTool } = await import('./notion');
      return await executeNotionTool(tool, args, serviceConfig);
    
    case 'linear':
      const { executeLinearTool } = await import('./linear');
      return await executeLinearTool(tool, args, serviceConfig);
    
    case 'github':
      const { executeGitHubTool } = await import('./github');
      return await executeGitHubTool(tool, args, serviceConfig);
    
    case 'firebase':
      const { executeFirebaseTool } = await import('./firebase');
      return await executeFirebaseTool(tool, args, serviceConfig);
    
    case 'gcp':
      const { executeGCPTool } = await import('./gcp');
      return await executeGCPTool(tool, args, serviceConfig);
    
    default:
      throw new Error(`Unknown handler: ${handler}`);
  }
}

// Get all available tools
export function getAllTools() {
  return Object.keys(toolRegistry);
}

// Get tools by service
export function getToolsByService(service: string) {
  return Object.keys(toolRegistry).filter(tool => tool.startsWith(`${service}.`));
}

// Validate tool configuration
export function validateToolConfig(tool: string, config: any) {
  const toolInfo = toolRegistry[tool];
  if (!toolInfo) {
    throw new Error(`Unknown tool: ${tool}`);
  }

  const { handler } = toolInfo;
  const serviceConfig = serviceConfigs[handler];
  const toolConfig = config[handler];

  if (!toolConfig) {
    throw new Error(`Configuration missing for ${handler} service`);
  }

  // Validate required fields
  for (const [key, fieldConfig] of Object.entries(serviceConfig)) {
    if (fieldConfig.required && !toolConfig[key]) {
      throw new Error(`Required configuration field missing: ${handler}.${key}`);
    }
  }

  return true;
}
