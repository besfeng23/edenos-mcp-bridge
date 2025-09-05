// MCP Tools Index
// Exports all available MCP tools and their handlers

export * from './guard';
export * from './notion';
export * from './linear';
export * from './github';
export * from './firebase';
export * from './gcp';
export * from './figma';
export * from './zapier';
export * from './bnd';
export * from './saviynt';
export * from './anthropic';
export * from './neon';
export * from './deepmind';
export * from './openai';

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
  'gcp.get-project-info': { handler: 'gcp', description: 'Get GCP project information' },

  // Figma tools
  'figma.get-file': { handler: 'figma', description: 'Get a Figma file by key' },
  'figma.get-file-images': { handler: 'figma', description: 'Get images from a Figma file' },
  'figma.get-file-comments': { handler: 'figma', description: 'Get comments from a Figma file' },
  'figma.post-comment': { handler: 'figma', description: 'Post a comment to a Figma file' },
  'figma.get-team-projects': { handler: 'figma', description: 'Get projects from a Figma team' },
  'figma.get-project-files': { handler: 'figma', description: 'Get files from a Figma project' },
  'figma.get-team-components': { handler: 'figma', description: 'Get components from a Figma team' },
  'figma.get-file-components': { handler: 'figma', description: 'Get components from a Figma file' },
  'figma.get-team-styles': { handler: 'figma', description: 'Get styles from a Figma team' },
  'figma.get-file-styles': { handler: 'figma', description: 'Get styles from a Figma file' },
  'figma.get-me': { handler: 'figma', description: 'Get current Figma user' },

  // Zapier tools
  'zapier.get-zaps': { handler: 'zapier', description: 'Get all Zapier zaps' },
  'zapier.get-zap': { handler: 'zapier', description: 'Get a Zapier zap by ID' },
  'zapier.create-zap': { handler: 'zapier', description: 'Create a new Zapier zap' },
  'zapier.update-zap': { handler: 'zapier', description: 'Update a Zapier zap' },
  'zapier.delete-zap': { handler: 'zapier', description: 'Delete a Zapier zap' },
  'zapier.get-zap-runs': { handler: 'zapier', description: 'Get runs for a Zapier zap' },
  'zapier.get-apps': { handler: 'zapier', description: 'Get available Zapier apps' },
  'zapier.get-app-triggers': { handler: 'zapier', description: 'Get triggers for a Zapier app' },
  'zapier.get-app-actions': { handler: 'zapier', description: 'Get actions for a Zapier app' },
  'zapier.get-me': { handler: 'zapier', description: 'Get current Zapier user' },

  // Bnd tools
  'bnd.get-account-balance': { handler: 'bnd', description: 'Get account balance' },
  'bnd.get-transaction': { handler: 'bnd', description: 'Get transaction by hash' },
  'bnd.get-account-transactions': { handler: 'bnd', description: 'Get account transactions' },
  'bnd.send-transaction': { handler: 'bnd', description: 'Send transaction' },
  'bnd.get-token-info': { handler: 'bnd', description: 'Get token information' },
  'bnd.get-token-balance': { handler: 'bnd', description: 'Get token balance for account' },
  'bnd.get-defi-protocols': { handler: 'bnd', description: 'Get DeFi protocols' },
  'bnd.get-liquidity-pools': { handler: 'bnd', description: 'Get liquidity pools' },
  'bnd.get-market-data': { handler: 'bnd', description: 'Get market data' },
  'bnd.get-network-status': { handler: 'bnd', description: 'Get network status' },

  // Saviynt tools
  'saviynt.get-user': { handler: 'saviynt', description: 'Get user by ID' },
  'saviynt.list-users': { handler: 'saviynt', description: 'List users' },
  'saviynt.create-user': { handler: 'saviynt', description: 'Create user' },
  'saviynt.update-user': { handler: 'saviynt', description: 'Update user' },
  'saviynt.delete-user': { handler: 'saviynt', description: 'Delete user' },
  'saviynt.get-role': { handler: 'saviynt', description: 'Get role by ID' },
  'saviynt.list-roles': { handler: 'saviynt', description: 'List roles' },
  'saviynt.create-role': { handler: 'saviynt', description: 'Create role' },
  'saviynt.assign-role': { handler: 'saviynt', description: 'Assign role to user' },
  'saviynt.remove-role': { handler: 'saviynt', description: 'Remove role from user' },
  'saviynt.get-access-requests': { handler: 'saviynt', description: 'Get access requests' },
  'saviynt.create-access-request': { handler: 'saviynt', description: 'Create access request' },
  'saviynt.approve-access-request': { handler: 'saviynt', description: 'Approve access request' },
  'saviynt.reject-access-request': { handler: 'saviynt', description: 'Reject access request' },
  'saviynt.get-audit-logs': { handler: 'saviynt', description: 'Get audit logs' },

  // Anthropic tools
  'anthropic.generate-text': { handler: 'anthropic', description: 'Generate text completion' },
  'anthropic.generate-chat': { handler: 'anthropic', description: 'Generate chat completion' },
  'anthropic.get-models': { handler: 'anthropic', description: 'Get available models' },
  'anthropic.get-model': { handler: 'anthropic', description: 'Get model information' },
  'anthropic.analyze-sentiment': { handler: 'anthropic', description: 'Analyze text sentiment' },
  'anthropic.extract-entities': { handler: 'anthropic', description: 'Extract named entities from text' },
  'anthropic.summarize-text': { handler: 'anthropic', description: 'Summarize text' },
  'anthropic.translate-text': { handler: 'anthropic', description: 'Translate text' },
  'anthropic.generate-code': { handler: 'anthropic', description: 'Generate code' },
  'anthropic.answer-question': { handler: 'anthropic', description: 'Answer a question' },
  'anthropic.get-usage-stats': { handler: 'anthropic', description: 'Get usage statistics' },

  // Neon tools
  'neon.get-project': { handler: 'neon', description: 'Get project information' },
  'neon.list-databases': { handler: 'neon', description: 'List databases' },
  'neon.create-database': { handler: 'neon', description: 'Create database' },
  'neon.get-database': { handler: 'neon', description: 'Get database by name' },
  'neon.delete-database': { handler: 'neon', description: 'Delete database' },
  'neon.execute-query': { handler: 'neon', description: 'Execute SQL query' },
  'neon.get-tables': { handler: 'neon', description: 'Get table information' },
  'neon.get-table-schema': { handler: 'neon', description: 'Get table schema' },
  'neon.create-table': { handler: 'neon', description: 'Create table' },
  'neon.drop-table': { handler: 'neon', description: 'Drop table' },
  'neon.insert-data': { handler: 'neon', description: 'Insert data' },
  'neon.update-data': { handler: 'neon', description: 'Update data' },
  'neon.delete-data': { handler: 'neon', description: 'Delete data' },
  'neon.get-connection-string': { handler: 'neon', description: 'Get connection string' },
  'neon.get-usage-stats': { handler: 'neon', description: 'Get usage statistics' },

  // DeepMind tools
  'deepmind.get-models': { handler: 'deepmind', description: 'Get available models' },
  'deepmind.get-model': { handler: 'deepmind', description: 'Get model by ID' },
  'deepmind.generate-text': { handler: 'deepmind', description: 'Generate text with model' },
  'deepmind.analyze-image': { handler: 'deepmind', description: 'Analyze image with model' },
  'deepmind.create-experiment': { handler: 'deepmind', description: 'Create experiment' },
  'deepmind.get-experiments': { handler: 'deepmind', description: 'Get experiments' },
  'deepmind.get-experiment': { handler: 'deepmind', description: 'Get experiment by ID' },
  'deepmind.start-experiment': { handler: 'deepmind', description: 'Start experiment' },
  'deepmind.stop-experiment': { handler: 'deepmind', description: 'Stop experiment' },
  'deepmind.get-experiment-results': { handler: 'deepmind', description: 'Get experiment results' },
  'deepmind.train-model': { handler: 'deepmind', description: 'Train model' },
  'deepmind.get-model-performance': { handler: 'deepmind', description: 'Get model performance' },
  'deepmind.get-research-papers': { handler: 'deepmind', description: 'Get research papers' },
  'deepmind.get-project': { handler: 'deepmind', description: 'Get project information' },

  // OpenAI tools
  'openai.generate-text': { handler: 'openai', description: 'Generate text completion' },
  'openai.generate-chat': { handler: 'openai', description: 'Generate chat completion' },
  'openai.generate-embeddings': { handler: 'openai', description: 'Generate embeddings' },
  'openai.get-models': { handler: 'openai', description: 'Get available models' },
  'openai.get-model': { handler: 'openai', description: 'Get model information' },
  'openai.create-fine-tuning-job': { handler: 'openai', description: 'Create fine-tuning job' },
  'openai.list-fine-tuning-jobs': { handler: 'openai', description: 'List fine-tuning jobs' },
  'openai.get-fine-tuning-job': { handler: 'openai', description: 'Get fine-tuning job' },
  'openai.cancel-fine-tuning-job': { handler: 'openai', description: 'Cancel fine-tuning job' },
  'openai.list-fine-tuning-events': { handler: 'openai', description: 'List fine-tuning events' },
  'openai.create-image': { handler: 'openai', description: 'Create image' },
  'openai.create-image-edit': { handler: 'openai', description: 'Create image edit' },
  'openai.create-image-variation': { handler: 'openai', description: 'Create image variation' },
  'openai.create-transcription': { handler: 'openai', description: 'Create transcription' },
  'openai.create-translation': { handler: 'openai', description: 'Create translation' },
  'openai.get-usage-stats': { handler: 'openai', description: 'Get usage statistics' }
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
  },
  figma: {
    accessToken: { type: 'string', required: true, description: 'Figma access token' },
    baseUrl: { type: 'string', required: false, default: 'https://api.figma.com/v1', description: 'Figma API base URL' }
  },
  zapier: {
    apiKey: { type: 'string', required: true, description: 'Zapier API key' },
    baseUrl: { type: 'string', required: false, default: 'https://zapier.com/api/v1', description: 'Zapier API base URL' }
  },
  bnd: {
    apiKey: { type: 'string', required: true, description: 'Bnd API key' },
    baseUrl: { type: 'string', required: false, default: 'https://api.bnd.com/v1', description: 'Bnd API base URL' },
    network: { type: 'string', required: false, default: 'mainnet', description: 'Blockchain network' }
  },
  saviynt: {
    apiKey: { type: 'string', required: true, description: 'Saviynt API key' },
    baseUrl: { type: 'string', required: false, default: 'https://api.saviynt.com/v1', description: 'Saviynt API base URL' },
    tenantId: { type: 'string', required: true, description: 'Saviynt tenant ID' }
  },
  anthropic: {
    apiKey: { type: 'string', required: true, description: 'Anthropic API key' },
    baseUrl: { type: 'string', required: false, default: 'https://api.anthropic.com/v1', description: 'Anthropic API base URL' },
    model: { type: 'string', required: false, default: 'claude-3-sonnet-20240229', description: 'Default model' }
  },
  neon: {
    apiKey: { type: 'string', required: true, description: 'Neon API key' },
    baseUrl: { type: 'string', required: false, default: 'https://console.neon.tech/api/v2', description: 'Neon API base URL' },
    projectId: { type: 'string', required: true, description: 'Neon project ID' }
  },
  deepmind: {
    apiKey: { type: 'string', required: true, description: 'DeepMind API key' },
    baseUrl: { type: 'string', required: false, default: 'https://api.deepmind.com/v1', description: 'DeepMind API base URL' },
    projectId: { type: 'string', required: true, description: 'DeepMind project ID' }
  },
  openai: {
    apiKey: { type: 'string', required: true, description: 'OpenAI API key' },
    baseUrl: { type: 'string', required: false, default: 'https://api.openai.com/v1', description: 'OpenAI API base URL' },
    organization: { type: 'string', required: false, description: 'OpenAI organization ID' },
    defaultModel: { type: 'string', required: false, default: 'gpt-4o', description: 'Default model' }
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
    
    case 'figma':
      const { executeFigmaTool } = await import('./figma');
      return await executeFigmaTool(tool, args, serviceConfig);
    
    case 'zapier':
      const { executeZapierTool } = await import('./zapier');
      return await executeZapierTool(tool, args, serviceConfig);
    
    case 'bnd':
      const { executeBndTool } = await import('./bnd');
      return await executeBndTool(tool, args, serviceConfig);
    
    case 'saviynt':
      const { executeSaviyntTool } = await import('./saviynt');
      return await executeSaviyntTool(tool, args, serviceConfig);
    
    case 'anthropic':
      const { executeAnthropicTool } = await import('./anthropic');
      return await executeAnthropicTool(tool, args, serviceConfig);
    
    case 'neon':
      const { executeNeonTool } = await import('./neon');
      return await executeNeonTool(tool, args, serviceConfig);
    
    case 'deepmind':
      const { executeDeepMindTool } = await import('./deepmind');
      return await executeDeepMindTool(tool, args, serviceConfig);
    
    case 'openai':
      const { executeOpenAITool } = await import('./openai');
      return await executeOpenAITool(tool, args, serviceConfig);
    
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
