import React, { useState, useEffect, useCallback, useRef } from 'react';

// EdenOS MCP Control Panel - Single File React Component
// Drop this into any React app and deploy to Firebase Hosting

const ControlPanel = () => {
  // State management
  const [endpoints, setEndpoints] = useState([]);
  const [activeEndpoint, setActiveEndpoint] = useState(null);
  const [output, setOutput] = useState('');
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [commandInput, setCommandInput] = useState('');
  const [userScopes, setUserScopes] = useState([]);
  const [demoMode, setDemoMode] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(null);

  // Refs
  const outputRef = useRef(null);
  const logsRef = useRef(null);

  // Load saved data from localStorage
  useEffect(() => {
    const savedEndpoints = localStorage.getItem('edenos-endpoints');
    const savedActiveEndpoint = localStorage.getItem('edenos-active-endpoint');
    const savedUserScopes = localStorage.getItem('edenos-user-scopes');
    const urlParams = new URLSearchParams(window.location.search);
    
    if (savedEndpoints) {
      setEndpoints(JSON.parse(savedEndpoints));
    }
    if (savedActiveEndpoint) {
      setActiveEndpoint(savedActiveEndpoint);
    }
    if (savedUserScopes) {
      setUserScopes(JSON.parse(savedUserScopes));
    }
    if (urlParams.get('demo') === '1') {
      setDemoMode(true);
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('edenos-endpoints', JSON.stringify(endpoints));
  }, [endpoints]);

  useEffect(() => {
    if (activeEndpoint) {
      localStorage.setItem('edenos-active-endpoint', activeEndpoint);
    }
  }, [activeEndpoint]);

  // Auto-scroll output and logs
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [logs]);

  // Command palette keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // MCP call function
  const mcpCall = useCallback(async (tool, args = {}, dryRun = false) => {
    if (!activeEndpoint) {
      throw new Error('No active endpoint selected');
    }

    const endpoint = endpoints.find(e => e.id === activeEndpoint);
    if (!endpoint) {
      throw new Error('Active endpoint not found');
    }

    const url = `${endpoint.url}/tools`;
    const token = endpoint.auth;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({
        tool,
        args,
        dryRun: demoMode || dryRun
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }, [activeEndpoint, endpoints, demoMode]);

  // Logs polling
  const fetchLogs = useCallback(async () => {
    if (!activeEndpoint) return;

    const endpoint = endpoints.find(e => e.id === activeEndpoint);
    if (!endpoint) return;

    try {
      const url = `${endpoint.url}/logs?limit=100`;
      const token = endpoint.auth;

      const response = await fetch(url, {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLogs(data.lines || []);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
  }, [activeEndpoint, endpoints]);

  // Start/stop logs polling
  useEffect(() => {
    if (activeEndpoint) {
      fetchLogs(); // Initial fetch
      const interval = setInterval(fetchLogs, 5000); // Poll every 5 seconds
      setPollingInterval(interval);
    } else {
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
    }

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [activeEndpoint, fetchLogs]);

  // Quick Actions
  const quickActions = [
    {
      id: 'status',
      label: 'Status Check',
      icon: '🏥',
      action: async () => {
        setIsLoading(true);
        try {
          const result = await mcpCall('status');
          setOutput(JSON.stringify(result, null, 2));
        } catch (error) {
          setOutput(`Error: ${error.message}`);
        } finally {
          setIsLoading(false);
        }
      }
    },
    {
      id: 'smoke',
      label: 'Smoke Test',
      icon: '🧪',
      action: async () => {
        setIsLoading(true);
        try {
          const result = await mcpCall('smoke-test');
          setOutput(JSON.stringify(result, null, 2));
        } catch (error) {
          setOutput(`Error: ${error.message}`);
        } finally {
          setIsLoading(false);
        }
      }
    },
    {
      id: 'restart',
      label: 'Restart Service',
      icon: '🔄',
      action: async () => {
        if (demoMode) {
          setOutput('Demo mode: Restart disabled');
          return;
        }
        setIsLoading(true);
        try {
          const result = await mcpCall('restart');
          setOutput(JSON.stringify(result, null, 2));
        } catch (error) {
          setOutput(`Error: ${error.message}`);
        } finally {
          setIsLoading(false);
        }
      }
    },
    {
      id: 'deploy-hosting',
      label: 'Deploy Hosting',
      icon: '🌐',
      action: async () => {
        setIsLoading(true);
        try {
          const result = await mcpCall('deploy-hosting');
          setOutput(JSON.stringify(result, null, 2));
        } catch (error) {
          setOutput(`Error: ${error.message}`);
        } finally {
          setIsLoading(false);
        }
      }
    },
    {
      id: 'full-deploy',
      label: 'Full Deploy',
      icon: '🚀',
      action: async () => {
        if (demoMode) {
          setOutput('Demo mode: Full deploy disabled');
          return;
        }
        if (!userScopes.includes('deploy.run')) {
          setOutput('Error: Insufficient permissions (deploy.run scope required)');
          return;
        }
        setIsLoading(true);
        try {
          const result = await mcpCall('full-deploy');
          setOutput(JSON.stringify(result, null, 2));
        } catch (error) {
          setOutput(`Error: ${error.message}`);
        } finally {
          setIsLoading(false);
        }
      }
    }
  ];

  // Command palette commands
  const commandPaletteCommands = [
    ...quickActions.map(action => ({
      id: action.id,
      label: action.label,
      icon: action.icon,
      action: action.action
    })),
    {
      id: 'clear-output',
      label: 'Clear Output',
      icon: '🗑️',
      action: () => setOutput('')
    },
    {
      id: 'clear-logs',
      label: 'Clear Logs',
      icon: '📋',
      action: () => setLogs([])
    }
  ];

  // Add endpoint
  const addEndpoint = () => {
    const name = prompt('Endpoint name:');
    const url = prompt('Endpoint URL:');
    const auth = prompt('Auth token (optional):');

    if (name && url) {
      const newEndpoint = {
        id: Date.now().toString(),
        name,
        url: url.replace(/\/$/, ''), // Remove trailing slash
        auth: auth || ''
      };
      setEndpoints([...endpoints, newEndpoint]);
      if (!activeEndpoint) {
        setActiveEndpoint(newEndpoint.id);
      }
    }
  };

  // Remove endpoint
  const removeEndpoint = (id) => {
    setEndpoints(endpoints.filter(e => e.id !== id));
    if (activeEndpoint === id) {
      setActiveEndpoint(endpoints.length > 1 ? endpoints[0].id : null);
    }
  };

  // Execute command from palette
  const executeCommand = (command) => {
    setCommandPaletteOpen(false);
    setCommandInput('');
    command.action();
  };

  // Filter commands based on input
  const filteredCommands = commandPaletteCommands.filter(cmd =>
    cmd.label.toLowerCase().includes(commandInput.toLowerCase())
  );

  return (
    <div className="edenos-control-panel">
      <style jsx>{`
        .edenos-control-panel {
          display: flex;
          height: 100vh;
          background: #0a0f18;
          color: #cbd5e1;
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
          font-size: 14px;
        }

        .sidebar {
          width: 300px;
          background: #111827;
          border-right: 1px solid #374151;
          padding: 20px;
          overflow-y: auto;
        }

        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .toolbar {
          background: #1f2937;
          border-bottom: 1px solid #374151;
          padding: 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .content-area {
          flex: 1;
          display: flex;
        }

        .output-panel {
          flex: 1;
          background: #0f172a;
          border-right: 1px solid #374151;
          display: flex;
          flex-direction: column;
        }

        .logs-panel {
          width: 400px;
          background: #0f172a;
          display: flex;
          flex-direction: column;
        }

        .panel-header {
          background: #1f2937;
          border-bottom: 1px solid #374151;
          padding: 12px 16px;
          font-weight: 600;
          color: #f3f4f6;
        }

        .panel-content {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
        }

        .endpoint-list {
          margin-bottom: 20px;
        }

        .endpoint-item {
          background: #1f2937;
          border: 1px solid #374151;
          border-radius: 6px;
          padding: 12px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .endpoint-item:hover {
          background: #374151;
        }

        .endpoint-item.active {
          background: #1e40af;
          border-color: #3b82f6;
        }

        .endpoint-name {
          font-weight: 600;
          margin-bottom: 4px;
        }

        .endpoint-url {
          font-size: 12px;
          color: #9ca3af;
          word-break: break-all;
        }

        .endpoint-actions {
          margin-top: 8px;
          display: flex;
          gap: 8px;
        }

        .btn {
          background: #374151;
          border: 1px solid #4b5563;
          color: #e5e7eb;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s;
        }

        .btn:hover {
          background: #4b5563;
        }

        .btn-primary {
          background: #1e40af;
          border-color: #3b82f6;
        }

        .btn-primary:hover {
          background: #2563eb;
        }

        .btn-danger {
          background: #dc2626;
          border-color: #ef4444;
        }

        .btn-danger:hover {
          background: #ef4444;
        }

        .quick-actions {
          margin-bottom: 20px;
        }

        .quick-actions h3 {
          margin-bottom: 12px;
          color: #f3f4f6;
        }

        .action-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .action-btn {
          background: #1f2937;
          border: 1px solid #374151;
          color: #e5e7eb;
          padding: 12px;
          border-radius: 6px;
          cursor: pointer;
          text-align: center;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .action-btn:hover {
          background: #374151;
        }

        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .action-icon {
          font-size: 20px;
        }

        .action-label {
          font-size: 12px;
        }

        .tool-runner {
          margin-bottom: 20px;
        }

        .tool-runner h3 {
          margin-bottom: 12px;
          color: #f3f4f6;
        }

        .form-group {
          margin-bottom: 12px;
        }

        .form-group label {
          display: block;
          margin-bottom: 4px;
          color: #d1d5db;
          font-size: 12px;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          background: #1f2937;
          border: 1px solid #374151;
          color: #e5e7eb;
          padding: 8px 12px;
          border-radius: 4px;
          font-family: inherit;
          font-size: 12px;
        }

        .form-group textarea {
          height: 80px;
          resize: vertical;
        }

        .checkbox-group {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .checkbox-group input[type="checkbox"] {
          width: auto;
        }

        .output-content {
          background: #0f172a;
          border: 1px solid #374151;
          border-radius: 4px;
          padding: 12px;
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
          font-size: 12px;
          white-space: pre-wrap;
          word-break: break-word;
          min-height: 200px;
          max-height: 400px;
          overflow-y: auto;
        }

        .logs-content {
          background: #0f172a;
          border: 1px solid #374151;
          border-radius: 4px;
          padding: 12px;
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
          font-size: 11px;
          white-space: pre-wrap;
          word-break: break-word;
          min-height: 200px;
          max-height: 400px;
          overflow-y: auto;
        }

        .log-entry {
          margin-bottom: 4px;
          padding: 2px 0;
        }

        .log-entry.error {
          color: #ef4444;
        }

        .log-entry.warn {
          color: #f59e0b;
        }

        .log-entry.info {
          color: #3b82f6;
        }

        .command-palette {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .command-palette-content {
          background: #1f2937;
          border: 1px solid #374151;
          border-radius: 8px;
          width: 600px;
          max-height: 400px;
          overflow: hidden;
        }

        .command-palette-input {
          width: 100%;
          background: transparent;
          border: none;
          color: #e5e7eb;
          padding: 16px;
          font-size: 16px;
          font-family: inherit;
          outline: none;
        }

        .command-palette-list {
          max-height: 300px;
          overflow-y: auto;
        }

        .command-item {
          padding: 12px 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: background 0.2s;
        }

        .command-item:hover {
          background: #374151;
        }

        .command-icon {
          font-size: 16px;
        }

        .status-indicator {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          margin-right: 8px;
        }

        .status-indicator.error {
          background: #ef4444;
        }

        .status-indicator.warning {
          background: #f59e0b;
        }

        .demo-banner {
          background: #f59e0b;
          color: #000;
          padding: 8px 16px;
          text-align: center;
          font-weight: 600;
        }

        .loading {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid #374151;
          border-radius: 50%;
          border-top-color: #3b82f6;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .empty-state {
          text-align: center;
          color: #6b7280;
          padding: 40px 20px;
        }

        .empty-state-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
      `}</style>

      {demoMode && (
        <div className="demo-banner">
          🎭 Demo Mode - All destructive actions disabled
        </div>
      )}

      <div className="sidebar">
        <h2>🎭 EdenOS Control Panel</h2>
        
        <div className="endpoint-list">
          <h3>Endpoints</h3>
          {endpoints.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🌐</div>
              <p>No endpoints configured</p>
            </div>
          ) : (
            endpoints.map(endpoint => (
              <div
                key={endpoint.id}
                className={`endpoint-item ${activeEndpoint === endpoint.id ? 'active' : ''}`}
                onClick={() => setActiveEndpoint(endpoint.id)}
              >
                <div className="endpoint-name">{endpoint.name}</div>
                <div className="endpoint-url">{endpoint.url}</div>
                <div className="endpoint-actions">
                  <button
                    className="btn btn-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeEndpoint(endpoint.id);
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
          <button className="btn btn-primary" onClick={addEndpoint}>
            + Add Endpoint
          </button>
        </div>

        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="action-grid">
            {quickActions.map(action => (
              <button
                key={action.id}
                className="action-btn"
                onClick={action.action}
                disabled={isLoading || (action.id === 'restart' && demoMode) || (action.id === 'full-deploy' && (!userScopes.includes('deploy.run') || demoMode))}
              >
                <div className="action-icon">{action.icon}</div>
                <div className="action-label">{action.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="tool-runner">
          <h3>Tool Runner</h3>
          <div className="form-group">
            <label>Tool Name</label>
            <input
              type="text"
              placeholder="e.g., deploy, status, logs"
              id="tool-name"
            />
          </div>
          <div className="form-group">
            <label>JSON Args</label>
            <textarea
              placeholder='{"key": "value"}'
              id="tool-args"
            />
          </div>
          <div className="checkbox-group">
            <input type="checkbox" id="dry-run" />
            <label htmlFor="dry-run">Dry Run</label>
          </div>
          <button
            className="btn btn-primary"
            onClick={async () => {
              const toolName = document.getElementById('tool-name').value;
              const toolArgs = document.getElementById('tool-args').value;
              const dryRun = document.getElementById('dry-run').checked;

              if (!toolName) {
                setOutput('Error: Tool name is required');
                return;
              }

              setIsLoading(true);
              try {
                let args = {};
                if (toolArgs) {
                  args = JSON.parse(toolArgs);
                }
                const result = await mcpCall(toolName, args, dryRun);
                setOutput(JSON.stringify(result, null, 2));
              } catch (error) {
                setOutput(`Error: ${error.message}`);
              } finally {
                setIsLoading(false);
              }
            }}
            disabled={isLoading}
          >
            {isLoading ? <div className="loading" /> : 'Run Tool'}
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="toolbar">
          <div>
            <span className="status-indicator" />
            {activeEndpoint ? (
              <span>
                Connected to {endpoints.find(e => e.id === activeEndpoint)?.name}
              </span>
            ) : (
              <span>No endpoint selected</span>
            )}
          </div>
          <div>
            <button
              className="btn"
              onClick={() => setCommandPaletteOpen(true)}
            >
              Command Palette (⌘K)
            </button>
          </div>
        </div>

        <div className="content-area">
          <div className="output-panel">
            <div className="panel-header">
              Output {isLoading && <div className="loading" />}
            </div>
            <div className="panel-content">
              <div className="output-content" ref={outputRef}>
                {output || 'No output yet. Run a tool or quick action to see results.'}
              </div>
            </div>
          </div>

          <div className="logs-panel">
            <div className="panel-header">
              Logs ({logs.length})
            </div>
            <div className="panel-content">
              <div className="logs-content" ref={logsRef}>
                {logs.length === 0 ? (
                  'No logs available. Make sure your endpoint has a /logs endpoint.'
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="log-entry">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {commandPaletteOpen && (
        <div className="command-palette">
          <div className="command-palette-content">
            <input
              className="command-palette-input"
              placeholder="Type a command..."
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              autoFocus
            />
            <div className="command-palette-list">
              {filteredCommands.map(command => (
                <div
                  key={command.id}
                  className="command-item"
                  onClick={() => executeCommand(command)}
                >
                  <div className="command-icon">{command.icon}</div>
                  <div>{command.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ControlPanel;

