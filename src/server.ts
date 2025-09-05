import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import express from 'express';
import path from 'path';
import { z } from 'zod';
import { executeTool, getAllTools, toolRegistry } from './tools/index.js';
import { coolRouter, startCoolSockets, registerCoolMcp } from './plugins/fun/index.js';

// MCP Server Configuration
const server = new Server(
  {
    name: 'edenos-mcp-bridge',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Express app for HTTP endpoints
const app = express();
app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'web')));

// Admin guard middleware
const adminGuard = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const adminToken = process.env.BRIDGE_ADMIN_TOKEN;
  
  if (req.path.startsWith('/cool') && token !== adminToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  next();
};

app.use(adminGuard);

// Mount fun features
app.use('/cool', coolRouter);

// Serve static UIs
app.use('/live-ops', express.static(path.join(process.cwd(), 'web/live-ops')));
app.use('/memgraph', express.static(path.join(process.cwd(), 'web/memgraph')));
app.use('/audit-cinema', express.static(path.join(process.cwd(), 'web/audit-cinema')));

// Health endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    features: ['notion', 'linear', 'github', 'firebase', 'gcp', 'figma', 'zapier', 'bnd', 'saviynt', 'anthropic', 'neon', 'deepmind', 'fun-features']
  });
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  res.json({
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString(),
    tools: getAllTools().length,
    services: ['notion', 'linear', 'github', 'firebase', 'gcp', 'figma', 'zapier', 'bnd', 'saviynt', 'anthropic', 'neon', 'deepmind']
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'EdenOS MCP Bridge',
    version: '1.0.0',
    description: 'AI-powered MCP bridge with Notion, Linear, and fun features',
    endpoints: {
      health: '/health',
      metrics: '/metrics',
      tools: '/tools',
      logs: '/logs',
      fun: '/cool',
      liveOps: '/live-ops',
      memgraph: '/memgraph',
      auditCinema: '/audit-cinema'
    },
    features: {
      notion: 'Notion workspace integration',
      linear: 'Linear project management',
      github: 'GitHub code management',
      firebase: 'Firebase cloud services',
      gcp: 'Google Cloud Platform infrastructure',
      figma: 'Figma design management',
      zapier: 'Zapier automation workflows',
      bnd: 'Bnd blockchain and DeFi operations',
      saviynt: 'Saviynt identity governance',
      anthropic: 'Anthropic AI models and services',
      neon: 'Neon serverless Postgres database',
      deepmind: 'DeepMind AI research and models',
      fun: 'Cool features for normal people',
      controlPanel: 'React control panel',
      wowControl: 'Sci-fi features that make people gasp'
    }
  });
});

// Tools endpoint
app.post('/tools', async (req, res) => {
  try {
    const { tool, args, dryRun } = req.body;
    
    if (!tool) {
      return res.status(400).json({ error: 'Tool name is required' });
    }

    if (dryRun) {
      return res.json({ 
        tool, 
        args, 
        dryRun: true, 
        message: 'Dry run - no actual execution',
        wouldExecute: true
      });
    }

    const result = await executeTool(tool, args || {}, {
      notion: {
        apiKey: process.env.NOTION_API_KEY || 'demo-key',
        version: '2022-06-28'
      },
      linear: {
        apiKey: process.env.LINEAR_API_KEY || 'demo-key'
      },
      github: {
        token: process.env.GITHUB_TOKEN || 'demo-key'
      },
      firebase: {
        projectId: process.env.FIREBASE_PROJECT_ID || 'demo-project',
        serviceAccountKey: process.env.FIREBASE_SERVICE_ACCOUNT_KEY || 'demo-key'
      },
      gcp: {
        projectId: process.env.GCP_PROJECT_ID || 'demo-project',
        serviceAccountKey: process.env.GCP_SERVICE_ACCOUNT_KEY || 'demo-key'
      },
      figma: {
        accessToken: process.env.FIGMA_ACCESS_TOKEN || 'demo-token'
      },
      zapier: {
        apiKey: process.env.ZAPIER_API_KEY || 'demo-key'
      },
      bnd: {
        apiKey: process.env.BND_API_KEY || 'demo-key',
        network: process.env.BND_NETWORK || 'mainnet'
      },
      saviynt: {
        apiKey: process.env.SAVIYNT_API_KEY || 'demo-key',
        tenantId: process.env.SAVIYNT_TENANT_ID || 'demo-tenant'
      },
      anthropic: {
        apiKey: process.env.ANTHROPIC_API_KEY || 'demo-key',
        model: process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229'
      },
      neon: {
        apiKey: process.env.NEON_API_KEY || 'demo-key',
        projectId: process.env.NEON_PROJECT_ID || 'demo-project'
      },
      deepmind: {
        apiKey: process.env.DEEPMIND_API_KEY || 'demo-key',
        projectId: process.env.DEEPMIND_PROJECT_ID || 'demo-project'
      }
    });

    res.json({ tool, args, result });
  } catch (error) {
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      tool: req.body.tool
    });
  }
});

// Logs endpoint
app.get('/logs', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 100;
  
  // Mock logs for demo
  const logs = [
    `[${new Date().toISOString()}] EdenOS MCP Bridge started`,
    `[${new Date().toISOString()}] Notion integration loaded`,
    `[${new Date().toISOString()}] Linear integration loaded`,
    `[${new Date().toISOString()}] Fun features activated`,
    `[${new Date().toISOString()}] Control panel ready`,
    `[${new Date().toISOString()}] Wow control center online`
  ];

  res.json({ lines: logs.slice(-limit) });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// MCP Tool definitions
const tools: Tool[] = [
  // Notion tools
  {
    name: 'notion.get-page',
    description: 'Get a Notion page by ID',
    inputSchema: {
      type: 'object',
      properties: {
        pageId: { type: 'string', description: 'The ID of the page to retrieve' }
      },
      required: ['pageId']
    }
  },
  {
    name: 'notion.get-database',
    description: 'Get a Notion database by ID',
    inputSchema: {
      type: 'object',
      properties: {
        databaseId: { type: 'string', description: 'The ID of the database to retrieve' }
      },
      required: ['databaseId']
    }
  },
  {
    name: 'notion.query-database',
    description: 'Query a Notion database with filters and sorts',
    inputSchema: {
      type: 'object',
      properties: {
        databaseId: { type: 'string', description: 'The ID of the database to query' },
        filter: { type: 'object', description: 'Filter criteria for the query' },
        sorts: { type: 'array', description: 'Sort criteria for the query' },
        pageSize: { type: 'number', description: 'Number of results to return' }
      },
      required: ['databaseId']
    }
  },
  {
    name: 'notion.create-page',
    description: 'Create a new Notion page',
    inputSchema: {
      type: 'object',
      properties: {
        parent: { type: 'object', description: 'Parent database or page ID' },
        properties: { type: 'object', description: 'Properties for the new page' }
      },
      required: ['parent', 'properties']
    }
  },
  {
    name: 'notion.update-page',
    description: 'Update an existing Notion page',
    inputSchema: {
      type: 'object',
      properties: {
        pageId: { type: 'string', description: 'The ID of the page to update' },
        properties: { type: 'object', description: 'Properties to update' }
      },
      required: ['pageId', 'properties']
    }
  },
  {
    name: 'notion.search',
    description: 'Search across Notion pages and databases',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
        filter: { type: 'object', description: 'Filter criteria for the search' },
        pageSize: { type: 'number', description: 'Number of results to return' }
      },
      required: ['query']
    }
  },
  // Linear tools
  {
    name: 'linear.get-issue',
    description: 'Get a Linear issue by ID',
    inputSchema: {
      type: 'object',
      properties: {
        issueId: { type: 'string', description: 'The ID of the issue to retrieve' }
      },
      required: ['issueId']
    }
  },
  {
    name: 'linear.get-issues',
    description: 'Get Linear issues with optional filters',
    inputSchema: {
      type: 'object',
      properties: {
        teamId: { type: 'string', description: 'Filter by team ID' },
        state: { type: 'string', description: 'Filter by state name' },
        assigneeId: { type: 'string', description: 'Filter by assignee ID' },
        limit: { type: 'number', description: 'Maximum number of issues to return' }
      }
    }
  },
  {
    name: 'linear.create-issue',
    description: 'Create a new Linear issue',
    inputSchema: {
      type: 'object',
      properties: {
        teamId: { type: 'string', description: 'ID of the team to create the issue in' },
        title: { type: 'string', description: 'Title of the issue' },
        description: { type: 'string', description: 'Description of the issue' },
        stateId: { type: 'string', description: 'ID of the state to set' },
        assigneeId: { type: 'string', description: 'ID of the assignee' },
        projectId: { type: 'string', description: 'ID of the project' },
        priority: { type: 'number', description: 'Priority of the issue (0-4)' }
      },
      required: ['teamId', 'title']
    }
  },
  {
    name: 'linear.update-issue',
    description: 'Update an existing Linear issue',
    inputSchema: {
      type: 'object',
      properties: {
        issueId: { type: 'string', description: 'ID of the issue to update' },
        title: { type: 'string', description: 'New title for the issue' },
        description: { type: 'string', description: 'New description for the issue' },
        stateId: { type: 'string', description: 'New state ID for the issue' },
        assigneeId: { type: 'string', description: 'New assignee ID for the issue' },
        projectId: { type: 'string', description: 'New project ID for the issue' },
        priority: { type: 'number', description: 'New priority for the issue (0-4)' }
      },
      required: ['issueId']
    }
  },
  {
    name: 'linear.get-projects',
    description: 'Get Linear projects with optional filters',
    inputSchema: {
      type: 'object',
      properties: {
        teamId: { type: 'string', description: 'Filter by team ID' },
        state: { type: 'string', description: 'Filter by project state' },
        limit: { type: 'number', description: 'Maximum number of projects to return' }
      }
    }
  },
  {
    name: 'linear.search-issues',
    description: 'Search Linear issues',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
        teamId: { type: 'string', description: 'Filter by team ID' },
        limit: { type: 'number', description: 'Maximum number of results to return' }
      },
      required: ['query']
    }
  },
  // GitHub tools
  {
    name: 'github.get-repository',
    description: 'Get a GitHub repository by owner and name',
    inputSchema: {
      type: 'object',
      properties: {
        owner: { type: 'string', description: 'Repository owner' },
        repo: { type: 'string', description: 'Repository name' }
      },
      required: ['owner', 'repo']
    }
  },
  {
    name: 'github.create-issue',
    description: 'Create a new GitHub issue',
    inputSchema: {
      type: 'object',
      properties: {
        owner: { type: 'string', description: 'Repository owner' },
        repo: { type: 'string', description: 'Repository name' },
        title: { type: 'string', description: 'Issue title' },
        body: { type: 'string', description: 'Issue body' }
      },
      required: ['owner', 'repo', 'title']
    }
  },
  {
    name: 'github.create-pull-request',
    description: 'Create a new GitHub pull request',
    inputSchema: {
      type: 'object',
      properties: {
        owner: { type: 'string', description: 'Repository owner' },
        repo: { type: 'string', description: 'Repository name' },
        title: { type: 'string', description: 'PR title' },
        head: { type: 'string', description: 'Head branch' },
        base: { type: 'string', description: 'Base branch' }
      },
      required: ['owner', 'repo', 'title', 'head', 'base']
    }
  },
  // Firebase tools
  {
    name: 'firebase.get-document',
    description: 'Get a Firestore document',
    inputSchema: {
      type: 'object',
      properties: {
        collection: { type: 'string', description: 'Collection name' },
        documentId: { type: 'string', description: 'Document ID' }
      },
      required: ['collection', 'documentId']
    }
  },
  {
    name: 'firebase.create-document',
    description: 'Create a Firestore document',
    inputSchema: {
      type: 'object',
      properties: {
        collection: { type: 'string', description: 'Collection name' },
        documentId: { type: 'string', description: 'Document ID' },
        data: { type: 'object', description: 'Document data' }
      },
      required: ['collection', 'documentId', 'data']
    }
  },
  // GCP tools
  {
    name: 'gcp.list-cloud-run-services',
    description: 'List Cloud Run services',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'gcp.deploy-cloud-run-service',
    description: 'Deploy a Cloud Run service',
    inputSchema: {
      type: 'object',
      properties: {
        serviceName: { type: 'string', description: 'Service name' },
        imageUrl: { type: 'string', description: 'Container image URL' },
        port: { type: 'number', description: 'Container port' }
      },
      required: ['serviceName', 'imageUrl']
    }
  },
  // Figma tools
  {
    name: 'figma.get-file',
    description: 'Get a Figma file by key',
    inputSchema: {
      type: 'object',
      properties: {
        fileKey: { type: 'string', description: 'Figma file key' },
        version: { type: 'string', description: 'File version' },
        ids: { type: 'array', items: { type: 'string' }, description: 'Node IDs to retrieve' }
      },
      required: ['fileKey']
    }
  },
  {
    name: 'figma.get-file-images',
    description: 'Get images from a Figma file',
    inputSchema: {
      type: 'object',
      properties: {
        fileKey: { type: 'string', description: 'Figma file key' },
        ids: { type: 'array', items: { type: 'string' }, description: 'Node IDs to export' },
        format: { type: 'string', enum: ['jpg', 'png', 'svg', 'pdf'], description: 'Image format' }
      },
      required: ['fileKey', 'ids']
    }
  },
  {
    name: 'figma.post-comment',
    description: 'Post a comment to a Figma file',
    inputSchema: {
      type: 'object',
      properties: {
        fileKey: { type: 'string', description: 'Figma file key' },
        message: { type: 'string', description: 'Comment message' },
        client_meta: { type: 'object', description: 'Comment position metadata' }
      },
      required: ['fileKey', 'message', 'client_meta']
    }
  },
  // Zapier tools
  {
    name: 'zapier.get-zaps',
    description: 'Get all Zapier zaps',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Number of results per page' },
        offset: { type: 'number', description: 'Number of results to skip' }
      }
    }
  },
  {
    name: 'zapier.create-zap',
    description: 'Create a new Zapier zap',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Zap title' },
        description: { type: 'string', description: 'Zap description' },
        triggerId: { type: 'number', description: 'Trigger ID' },
        actionId: { type: 'number', description: 'Action ID' }
      },
      required: ['title']
    }
  },
  {
    name: 'zapier.update-zap',
    description: 'Update a Zapier zap',
    inputSchema: {
      type: 'object',
      properties: {
        zapId: { type: 'number', description: 'Zap ID' },
        title: { type: 'string', description: 'New title' },
        status: { type: 'string', enum: ['on', 'off'], description: 'New status' }
      },
      required: ['zapId']
    }
  },
  // Bnd tools
  {
    name: 'bnd.get-account-balance',
    description: 'Get account balance',
    inputSchema: {
      type: 'object',
      properties: {
        address: { type: 'string', description: 'Account address' }
      },
      required: ['address']
    }
  },
  {
    name: 'bnd.get-transaction',
    description: 'Get transaction by hash',
    inputSchema: {
      type: 'object',
      properties: {
        txHash: { type: 'string', description: 'Transaction hash' }
      },
      required: ['txHash']
    }
  },
  {
    name: 'bnd.send-transaction',
    description: 'Send transaction',
    inputSchema: {
      type: 'object',
      properties: {
        from: { type: 'string', description: 'From address' },
        to: { type: 'string', description: 'To address' },
        value: { type: 'string', description: 'Transaction value' }
      },
      required: ['from', 'to', 'value']
    }
  },
  // Saviynt tools
  {
    name: 'saviynt.get-user',
    description: 'Get user by ID',
    inputSchema: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'User ID' }
      },
      required: ['userId']
    }
  },
  {
    name: 'saviynt.create-user',
    description: 'Create user',
    inputSchema: {
      type: 'object',
      properties: {
        username: { type: 'string', description: 'Username' },
        email: { type: 'string', description: 'Email address' },
        firstName: { type: 'string', description: 'First name' },
        lastName: { type: 'string', description: 'Last name' }
      },
      required: ['username', 'email', 'firstName', 'lastName']
    }
  },
  {
    name: 'saviynt.assign-role',
    description: 'Assign role to user',
    inputSchema: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'User ID' },
        roleId: { type: 'string', description: 'Role ID' }
      },
      required: ['userId', 'roleId']
    }
  },
  // Anthropic tools
  {
    name: 'anthropic.generate-text',
    description: 'Generate text completion',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: 'Text prompt' },
        maxTokens: { type: 'number', description: 'Maximum tokens to generate' },
        temperature: { type: 'number', description: 'Temperature for generation' }
      },
      required: ['prompt']
    }
  },
  {
    name: 'anthropic.analyze-sentiment',
    description: 'Analyze text sentiment',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Text to analyze' }
      },
      required: ['text']
    }
  },
  {
    name: 'anthropic.generate-code',
    description: 'Generate code',
    inputSchema: {
      type: 'object',
      properties: {
        description: { type: 'string', description: 'Code description' },
        language: { type: 'string', description: 'Programming language' }
      },
      required: ['description', 'language']
    }
  },
  // Neon tools
  {
    name: 'neon.execute-query',
    description: 'Execute SQL query',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'SQL query' },
        database: { type: 'string', description: 'Database name' }
      },
      required: ['query']
    }
  },
  {
    name: 'neon.create-database',
    description: 'Create database',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Database name' },
        owner: { type: 'string', description: 'Database owner' }
      },
      required: ['name']
    }
  },
  {
    name: 'neon.create-table',
    description: 'Create table',
    inputSchema: {
      type: 'object',
      properties: {
        tableName: { type: 'string', description: 'Table name' },
        schema: { type: 'string', description: 'Table schema' },
        database: { type: 'string', description: 'Database name' }
      },
      required: ['tableName', 'schema']
    }
  },
  // DeepMind tools
  {
    name: 'deepmind.generate-text',
    description: 'Generate text with model',
    inputSchema: {
      type: 'object',
      properties: {
        modelId: { type: 'string', description: 'Model ID' },
        prompt: { type: 'string', description: 'Text prompt' },
        maxTokens: { type: 'number', description: 'Maximum tokens to generate' }
      },
      required: ['modelId', 'prompt']
    }
  },
  {
    name: 'deepmind.create-experiment',
    description: 'Create experiment',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Experiment name' },
        modelId: { type: 'string', description: 'Model ID' },
        parameters: { type: 'object', description: 'Experiment parameters' }
      },
      required: ['name', 'modelId', 'parameters']
    }
  },
  {
    name: 'deepmind.get-experiments',
    description: 'Get experiments',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Number of results per page' },
        status: { type: 'string', description: 'Filter by status' }
      }
    }
  }
];

// MCP Tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const result = await executeTool(name, args || {}, {
      notion: {
        apiKey: process.env.NOTION_API_KEY || 'demo-key',
        version: '2022-06-28'
      },
      linear: {
        apiKey: process.env.LINEAR_API_KEY || 'demo-key'
      },
      github: {
        token: process.env.GITHUB_TOKEN || 'demo-key'
      },
      firebase: {
        projectId: process.env.FIREBASE_PROJECT_ID || 'demo-project',
        serviceAccountKey: process.env.FIREBASE_SERVICE_ACCOUNT_KEY || 'demo-key'
      },
      gcp: {
        projectId: process.env.GCP_PROJECT_ID || 'demo-project',
        serviceAccountKey: process.env.GCP_SERVICE_ACCOUNT_KEY || 'demo-key'
      },
      figma: {
        accessToken: process.env.FIGMA_ACCESS_TOKEN || 'demo-token'
      },
      zapier: {
        apiKey: process.env.ZAPIER_API_KEY || 'demo-key'
      }
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      ],
      isError: true
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Start Express server
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`EdenOS MCP Bridge running on port ${port}`);
    console.log(`Health check: http://localhost:${port}/health`);
    console.log(`Control panel: http://localhost:${port}/control-panel`);
    console.log(`Wow control: http://localhost:${port}/wow-control`);
  });

  // Start fun features
  startCoolSockets();
  registerCoolMcp();

  console.log('EdenOS MCP Bridge with Notion, Linear, and Fun Features ready!');
}

main().catch(console.error);