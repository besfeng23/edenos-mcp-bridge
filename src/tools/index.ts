// MCP Tools Index
// Exports all available MCP tools and their handlers

export * from './guard';
export * from './notion';
export * from './linear';

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
  'linear.get-me': { handler: 'linear', description: 'Get current Linear user' }
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
