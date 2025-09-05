// Vercel server entry point with ES module support
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Use dynamic import for MCP SDK
const { Server } = await import('@modelcontextprotocol/sdk/server/index.js');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'EdenOS MCP Bridge'
  });
});

// Main endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'EdenOS MCP Bridge is running!',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      tools: '/tools',
      logs: '/logs',
      controlPanel: '/control-panel',
      wowControl: '/wow-control'
    }
  });
});

// Tools endpoint
app.post('/tools', async (req, res) => {
  try {
    const { tool, args, dryRun } = req.body;
    
    // Mock tool execution for now
    res.json({
      success: true,
      tool,
      args,
      dryRun,
      result: 'Tool executed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Logs endpoint
app.get('/logs', (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  
  res.json({
    lines: [
      {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'EdenOS MCP Bridge started successfully'
      },
      {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'All service integrations loaded'
      }
    ]
  });
});

// Serve static files
app.use('/web', express.static('web'));
app.use('/control-panel', express.static('web/control-panel/out'));
app.use('/wow-control', express.static('web/wow-control'));

// Start server
app.listen(PORT, () => {
  console.log(`EdenOS MCP Bridge running on port ${PORT}`);
});

export default app;
