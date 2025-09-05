#!/usr/bin/env zx

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import { createServer } from 'http';
import { URL } from 'url';
import express from 'express';
import path from 'path';

// Import all tools
import { gcpTools } from './tools/gcp.js';
import { firebaseTools } from './tools/firebase.js';
import { firestoreTools } from './tools/firestore.js';
import { bigqueryTools } from './tools/bigquery.js';
import { healthTools } from './tools/health.js';
import { actionsTools } from './tools/actions.js';
import { secretsTools } from './tools/secrets.js';
import { authTools } from './tools/auth.js';

// Guardrail verifier
import { canRun } from './tools/guard.js';

// Fun features
import { coolRouter, startCoolSockets, registerCoolMcp } from '../plugins/fun/index.js';

// Configuration
const PORT = process.env.PORT || 8080;
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const ALLOWED_ORIGINS = process.env.VITE_ALLOWED_ORIGINS?.split(',') || ['https://agile-anagram-469914-e2.web.app'];

// MCP Configuration
const MCP_ACTION_CURSOR_DISPATCH = process.env.MCP_ACTION_CURSOR_DISPATCH || 'cursor.dispatch';
const MCP_ENV_TAG = process.env.MCP_ENV_TAG || 'mcpmaster';

// Logging utility
function log(level: string, message: string, meta?: any) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...meta
  };
  
  if (level === 'error') {
    console.error(JSON.stringify(logEntry));
  } else if (level === 'warn') {
    console.warn(JSON.stringify(logEntry));
  } else if (level === 'info' && LOG_LEVEL !== 'warn') {
    console.log(JSON.stringify(logEntry));
  } else if (level === 'debug' && LOG_LEVEL === 'debug') {
    console.log(JSON.stringify(logEntry));
  }
}

// Rate limiting
const rateLimitMap = new Map<string, { count: number, resetTime: number }>();
const RATE_LIMIT_RPS = parseInt(process.env.RATE_LIMIT_RPS || '5');
const RATE_LIMIT_BURST = parseInt(process.env.RATE_LIMIT_BURST || '10');

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const window = 1000; // 1 second window
  
  if (!rateLimitMap.has(identifier)) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + window });
    return true;
  }
  
  const limit = rateLimitMap.get(identifier)!;
  
  if (now > limit.resetTime) {
    limit.count = 1;
    limit.resetTime = now + window;
    return true;
  }
  
  if (limit.count >= RATE_LIMIT_BURST) {
    return false;
  }
  
  limit.count++;
  return true;
}

// Combine all tools
const allTools = [
  ...gcpTools,
  ...firebaseTools,
  ...firestoreTools,
  ...bigqueryTools,
  ...healthTools,
  ...actionsTools,
  ...secretsTools,
  ...authTools
];

// Create MCP server
const server = new Server(
  {
    name: `edenos-mcp-bridge-${MCP_ENV_TAG}`,
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  log('info', 'Tools list requested');
  return {
    tools: allTools,
  };
});

// Execute tools with guardrails
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  // Rate limiting
  if (!checkRateLimit(`tool:${name}`)) {
    log('warn', 'Rate limit exceeded', { tool: name });
    throw new Error(`Rate limit exceeded for tool ${name}`);
  }
  
  log('info', 'Tool execution requested', { tool: name, args });
  
  // Check guardrails
  const now = new Date();
  const hour = now.getHours();
  const context = { hour, branch: process.env.GITHUB_REF };
  
  if (!canRun(name, context)) {
    log('warn', 'Tool blocked by guardrails', { tool: name, context });
    throw new Error(`Tool ${name} blocked by guardrails: outside working hours or missing release branch`);
  }
  
  // Find and execute tool
  const tool = allTools.find(t => t.name === name);
  if (!tool) {
    log('error', 'Tool not found', { tool: name });
    throw new Error(`Tool ${name} not found`);
  }
  
  try {
    // Execute tool based on name
    let result;
    
    if (name.startsWith('gcp.')) {
      result = await executeGcpTool(name, args);
    } else if (name.startsWith('firebase.')) {
      result = await executeFirebaseTool(name, args);
    } else if (name.startsWith('firestore.')) {
      result = await executeFirestoreTool(name, args);
    } else if (name.startsWith('bigquery.')) {
      result = await executeBigQueryTool(name, args);
    } else if (name.startsWith('health.')) {
      result = await executeHealthTool(name, args);
    } else if (name.startsWith('actions.')) {
      result = await executeActionsTool(name, args);
    } else if (name.startsWith('secrets.')) {
      result = await executeSecretsTool(name, args);
    } else if (name.startsWith('auth.')) {
      result = await executeAuthTool(name, args);
    } else {
      throw new Error(`Unknown tool category: ${name}`);
    }
    
    log('info', 'Tool execution successful', { tool: name });
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    log('error', 'Tool execution failed', { tool: name, error: error instanceof Error ? error.message : 'Unknown error' });
    throw new Error(`Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});

// Tool execution functions (implemented in respective tool files)
async function executeGcpTool(name: string, args: any) {
  const { gcpTools } = await import('./tools/gcp.js');
  
  switch (name) {
    case 'gcp.run.status':
      return await import('./tools/gcp.js').then(m => m.executeRunStatus(args));
    case 'gcp.run.restart':
      return await import('./tools/gcp.js').then(m => m.executeRunRestart(args));
    case 'gcp.run.rollback':
      return await import('./tools/gcp.js').then(m => m.executeRunRollback(args));
    case 'gcp.pubsub.publish':
      return await import('./tools/gcp.js').then(m => m.executePubSubPublish(args));
    case 'gcp.scheduler.trigger':
      return await import('./tools/gcp.js').then(m => m.executeSchedulerTrigger(args));
    case 'gcp.tasks.create':
      return await import('./tools/gcp.js').then(m => m.executeTasksCreate(args));
    default:
      throw new Error(`Unknown GCP tool: ${name}`);
  }
}

async function executeFirebaseTool(name: string, args: any) {
  switch (name) {
    case 'firebase.hosting.deploy':
      return await import('./tools/firebase.js').then(m => m.executeHostingDeploy(args));
    case 'firebase.hosting.status':
      return await import('./tools/firebase.js').then(m => m.executeHostingStatus(args));
    case 'firebase.hosting.rollback':
      return await import('./tools/firebase.js').then(m => m.executeHostingRollback(args));
    case 'firebase.functions.deploy':
      return await import('./tools/firebase.js').then(m => m.executeFunctionsDeploy(args));
    case 'firebase.functions.status':
      return await import('./tools/firebase.js').then(m => m.executeFunctionsStatus(args));
    case 'firebase.app.config':
      return await import('./tools/firebase.js').then(m => m.executeAppConfig(args));
    default:
      throw new Error(`Unknown Firebase tool: ${name}`);
  }
}

async function executeFirestoreTool(name: string, args: any) {
  switch (name) {
    case 'firestore.query':
      return await import('./tools/firestore.js').then(m => m.executeQuery(args));
    case 'firestore.write':
      return await import('./tools/firestore.js').then(m => m.executeWrite(args));
    case 'firestore.delete':
      return await import('./tools/firestore.js').then(m => m.executeDelete(args));
    case 'firestore.backup':
      return await import('./tools/firestore.js').then(m => m.executeBackup(args));
    case 'firestore.restore':
      return await import('./tools/firestore.js').then(m => m.executeRestore(args));
    default:
      throw new Error(`Unknown Firestore tool: ${name}`);
  }
}

async function executeBigQueryTool(name: string, args: any) {
  switch (name) {
    case 'bigquery.query':
      return await import('./tools/bigquery.js').then(m => m.executeQuery(args));
    case 'bigquery.dataset.create':
      return await import('./tools/bigquery.js').then(m => m.executeDatasetCreate(args));
    case 'bigquery.table.create':
      return await import('./tools/bigquery.js').then(m => m.executeTableCreate(args));
    case 'bigquery.view.create':
      return await import('./tools/bigquery.js').then(m => m.executeViewCreate(args));
    case 'bigquery.export':
      return await import('./tools/bigquery.js').then(m => m.executeExport(args));
    default:
      throw new Error(`Unknown BigQuery tool: ${name}`);
  }
}

async function executeHealthTool(name: string, args: any) {
  switch (name) {
    case 'health.smoke':
      return await import('./tools/health.js').then(m => m.executeSmoke(args));
    case 'health.check':
      return await import('./tools/health.js').then(m => m.executeHealthCheck(args));
    default:
      throw new Error(`Unknown Health tool: ${name}`);
  }
}

async function executeActionsTool(name: string, args: any) {
  switch (name) {
    case 'actions.workflow.run':
      return await import('./tools/actions.js').then(m => m.executeWorkflowRun(args));
    case 'actions.workflow.status':
      return await import('./tools/actions.js').then(m => m.executeWorkflowStatus(args));
    case 'actions.deploy':
      return await import('./tools/actions.js').then(m => m.executeDeploy(args));
    case 'actions.rollback':
      return await import('./tools/actions.js').then(m => m.executeRollback(args));
    case 'actions.smoke':
      return await import('./tools/actions.js').then(m => m.executeSmoke(args));
    default:
      throw new Error(`Unknown Actions tool: ${name}`);
  }
}

async function executeSecretsTool(name: string, args: any) {
  switch (name) {
    case 'secrets.create':
      return await import('./tools/secrets.js').then(m => m.executeSecretCreate(args));
    case 'secrets.get':
      return await import('./tools/secrets.js').then(m => m.executeSecretGet(args));
    case 'secrets.update':
      return await import('./tools/secrets.js').then(m => m.executeSecretUpdate(args));
    case 'secrets.delete':
      return await import('./tools/secrets.js').then(m => m.executeSecretDelete(args));
    case 'secrets.list':
      return await import('./tools/secrets.js').then(m => m.executeSecretList(args));
    case 'secrets.rotate':
      return await import('./tools/secrets.js').then(m => m.executeSecretRotate(args));
    default:
      throw new Error(`Unknown Secrets tool: ${name}`);
  }
}

async function executeAuthTool(name: string, args: any) {
  switch (name) {
    case 'auth.login':
      return await import('./tools/auth.js').then(m => m.executeLogin(args));
    case 'auth.logout':
      return await import('./tools/auth.js').then(m => m.executeLogout(args));
    case 'auth.status':
      return await import('./tools/auth.js').then(m => m.executeStatus(args));
    case 'auth.token':
      return await import('./tools/auth.js').then(m => m.executeToken(args));
    case 'auth.config':
      return await import('./tools/auth.js').then(m => m.executeConfig(args));
    default:
      throw new Error(`Unknown Auth tool: ${name}`);
  }
}

// HTTP server for health checks and metrics
function createHttpServer() {
  const app = express();
  
  // Middleware
  app.use(express.json());
  app.use(express.static(path.join(__dirname, '../web')));
  
  // CORS headers
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }
    next();
  });
  
  // Admin guard for fun features
  app.use("/cool", (req, res, next) => {
    const token = (req.headers.authorization || "").replace("Bearer ", "");
    if (token !== process.env.BRIDGE_ADMIN_TOKEN) {
      return res.status(401).json({ error: "unauthorized" });
    }
    next();
  });
  
  // Mount fun features
  app.use("/cool", coolRouter);
  
  // Static UIs
  app.use("/live-ops", express.static(path.join(__dirname, "../web/live-ops")));
  app.use("/memgraph", express.static(path.join(__dirname, "../web/memgraph")));
  app.use("/audit-cinema", express.static(path.join(__dirname, "../web/audit-cinema")));
  
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      tools: allTools.length
    });
  });
  
  // Metrics endpoint
  app.get('/metrics', (req, res) => {
    res.set('Content-Type', 'text/plain');
    res.end(`# EdenOS MCP Bridge Metrics
# HELP mcp_tools_total Total number of available tools
# TYPE mcp_tools_total gauge
mcp_tools_total ${allTools.length}

# HELP mcp_rate_limit_hits_total Total rate limit hits
# TYPE mcp_rate_limit_hits_total counter
mcp_rate_limit_hits_total ${Array.from(rateLimitMap.values()).reduce((sum, limit) => sum + limit.count, 0)}
`);
  });
  
  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      name: `EdenOS MCP Bridge (${MCP_ENV_TAG})`,
      version: '1.0.0',
      status: 'running',
      mcp: {
        actionCursorDispatch: MCP_ACTION_CURSOR_DISPATCH,
        envTag: MCP_ENV_TAG
      },
      endpoints: {
        health: '/health',
        metrics: '/metrics',
        tools: '/tools',
        fun: '/cool',
        liveOps: '/live-ops',
        memgraph: '/memgraph',
        auditCinema: '/audit-cinema'
      }
    });
  });
  
  // 404 for unknown paths
  app.use('*', (req, res) => {
    res.status(404).json({ error: 'Not found' });
  });
  
  return app;
}

// Start server
async function main() {
  try {
    log('info', 'Starting EdenOS MCP Bridge', { 
      mcpActionCursorDispatch: MCP_ACTION_CURSOR_DISPATCH,
      mcpEnvTag: MCP_ENV_TAG,
      port: PORT,
      logLevel: LOG_LEVEL
    });
    
    // Create Express app
    const app = createHttpServer();
    
    // Start HTTP server for health checks and fun features
    const httpServer = app.listen(PORT, () => {
      log('info', `HTTP server listening on port ${PORT}`);
    });
    
    // Start fun websockets
    startCoolSockets(httpServer);
    
    // Register fun MCP tools
    registerCoolMcp(server);
    
    // Start MCP server
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    log('info', 'EdenOS MCP Bridge started successfully with fun features');
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
      log('info', 'Received SIGTERM, shutting down gracefully');
      httpServer.close(() => {
        log('info', 'HTTP server closed');
        process.exit(0);
      });
    });
    
    process.on('SIGINT', () => {
      log('info', 'Received SIGINT, shutting down gracefully');
      httpServer.close(() => {
        log('info', 'HTTP server closed');
        process.exit(0);
      });
    });
    
  } catch (error) {
    log('error', 'Failed to start EdenOS MCP Bridge', { error: error instanceof Error ? error.message : 'Unknown error' });
    process.exit(1);
  }
}

main().catch((error) => {
  log('error', 'Unhandled error in main', { error: error instanceof Error ? error.message : 'Unknown error' });
  process.exit(1);
});
