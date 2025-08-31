import React, { useState } from 'react'
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Key, 
  Globe, 
  Shield,
  Database,
  Activity,
  Cloud
} from 'lucide-react'

const SettingsPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general')
  const [showSecrets, setShowSecrets] = useState(false)

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'environment', name: 'Environment', icon: Globe },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'integrations', name: 'Integrations', icon: Cloud },
    { id: 'monitoring', name: 'Monitoring', icon: Activity }
  ]

  const environmentVars = [
    { name: 'LOG_LEVEL', value: 'info', description: 'Application log level', category: 'system' },
    { name: 'RATE_LIMIT_RPS', value: '5', description: 'Rate limit requests per second', category: 'system' },
    { name: 'RATE_LIMIT_BURST', value: '10', description: 'Rate limit burst capacity', category: 'system' },
    { name: 'ALLOWED_ORIGINS', value: 'https://mcpmaster-web-app.web.app', description: 'CORS allowed origins', category: 'security' },
    { name: 'GITHUB_TOKEN', value: '***', description: 'GitHub API token', category: 'security', secret: true },
    { name: 'FIREBASE_KEY', value: '***', description: 'Firebase service account key', category: 'security', secret: true },
    { name: 'GCP_PROJECT_ID', value: 'gcp-edenos', description: 'Google Cloud Project ID', category: 'gcp' },
    { name: 'GCP_REGION', value: 'us-central1', description: 'Google Cloud Region', category: 'gcp' }
  ]

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Application Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Application Name</label>
            <input type="text" defaultValue="EdenOS MCP Bridge" className="input w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Description</label>
            <textarea 
              defaultValue="Comprehensive Model Context Protocol server with GCP, Firebase, and development tools"
              className="input w-full h-20 resize-none"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Default Environment</label>
              <select className="input w-full">
                <option value="staging">Staging</option>
                <option value="production" selected>Production</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Auto-refresh Interval</label>
              <select className="input w-full">
                <option value="30">30 seconds</option>
                <option value="60" selected>1 minute</option>
                <option value="300">5 minutes</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Performance Settings</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Max Concurrent Tools</label>
              <input type="number" defaultValue="10" min="1" max="100" className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Request Timeout (ms)</label>
              <input type="number" defaultValue="30000" min="1000" max="300000" className="input w-full" />
            </div>
          </div>
          <div>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded border-neutral-600 bg-neutral-800 text-primary-600" />
              <span className="text-sm text-neutral-300">Enable request caching</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )

  const renderEnvironmentSettings = () => (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Environment Variables</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSecrets(!showSecrets)}
              className="btn-secondary text-sm"
            >
              {showSecrets ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
              {showSecrets ? 'Hide' : 'Show'} Secrets
            </button>
            <button className="btn-primary text-sm">
              <Save className="w-4 h-4 mr-1" />
              Save Changes
            </button>
          </div>
        </div>
        
        <div className="space-y-3">
          {environmentVars.map((envVar) => (
            <div key={envVar.name} className="p-4 bg-neutral-800 rounded-lg border border-neutral-700">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-mono text-sm font-medium text-white">{envVar.name}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      envVar.category === 'security' ? 'bg-red-500/20 text-red-400' :
                      envVar.category === 'gcp' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-neutral-500/20 text-neutral-400'
                    }`}>
                      {envVar.category}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-400">{envVar.description}</p>
                </div>
                <button className="btn-secondary text-xs py-1 px-2">
                  <Key className="w-3 h-3 mr-1" />
                  Edit
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type={envVar.secret && !showSecrets ? 'password' : 'text'}
                  defaultValue={envVar.value}
                  className="input flex-1 text-sm"
                  placeholder={envVar.secret ? 'Enter secret value' : 'Enter value'}
                />
                {envVar.secret && (
                  <button className="btn-secondary text-xs py-1 px-2">
                    <RefreshCw className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Environment Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-white mb-3">Staging Environment</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-400">Project ID:</span>
                <span className="text-white">gcp-edenos-staging</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-400">Region:</span>
                <span className="text-white">us-central1</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-400">Status:</span>
                <span className="text-success-400">Active</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-white mb-3">Production Environment</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-400">Project ID:</span>
                <span className="text-white">gcp-edenos</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-400">Region:</span>
                <span className="text-white">us-central1</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-400">Status:</span>
                <span className="text-success-400">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Authentication & Authorization</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Session Timeout</label>
            <select className="input w-full">
              <option value="3600">1 hour</option>
              <option value="7200" selected>2 hours</option>
              <option value="14400">4 hours</option>
              <option value="86400">24 hours</option>
            </select>
          </div>
          <div>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded border-neutral-600 bg-neutral-800 text-primary-600" />
              <span className="text-sm text-neutral-300">Require 2FA for admin actions</span>
            </label>
          </div>
          <div>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded border-neutral-600 bg-neutral-800 text-primary-600" />
              <span className="text-sm text-neutral-300">Log all authentication attempts</span>
            </label>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">CORS Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Allowed Origins</label>
            <textarea 
              defaultValue="https://mcpmaster-web-app.web.app
https://mcpmaster-web-app.firebaseapp.com
https://mcpmaster.edenos.com"
              className="input w-full h-24 resize-none font-mono text-sm"
              placeholder="Enter one origin per line"
            />
          </div>
          <div>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded border-neutral-600 bg-neutral-800 text-primary-600" />
              <span className="text-sm text-neutral-300">Allow credentials</span>
            </label>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Rate Limiting</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Requests per Second</label>
            <input type="number" defaultValue="5" min="1" max="100" className="input w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Burst Capacity</label>
            <input type="number" defaultValue="10" min="1" max="1000" className="input w-full" />
          </div>
        </div>
      </div>
    </div>
  )

  const renderIntegrationsSettings = () => (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Google Cloud Platform</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Default Project ID</label>
            <input type="text" defaultValue="gcp-edenos" className="input w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Default Region</label>
            <select className="input w-full">
              <option value="us-central1" selected>us-central1</option>
              <option value="us-east1">us-east1</option>
              <option value="europe-west1">europe-west1</option>
              <option value="asia-northeast1">asia-northeast1</option>
            </select>
          </div>
          <div>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded border-neutral-600 bg-neutral-800 text-primary-600" />
              <span className="text-sm text-neutral-300">Auto-enable required APIs</span>
            </label>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Firebase</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Project ID</label>
            <input type="text" defaultValue="mcpmaster-web-app" className="input w-full" />
          </div>
          <div>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded border-neutral-600 bg-neutral-800 text-primary-600" />
              <span className="text-sm text-neutral-300">Enable Firebase Admin SDK</span>
            </label>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">GitHub</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Organization</label>
            <input type="text" defaultValue="edenos" className="input w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Repository</label>
            <input type="text" defaultValue="edenos-mcp-bridge" className="input w-full" />
          </div>
          <div>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded border-neutral-600 bg-neutral-800 text-primary-600" />
              <span className="text-sm text-neutral-300">Enable GitHub Actions integration</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )

  const renderMonitoringSettings = () => (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Logging Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Log Level</label>
            <select className="input w-full">
              <option value="debug">Debug</option>
              <option value="info" selected>Info</option>
              <option value="warn">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Log Format</label>
            <select className="input w-full">
              <option value="json" selected>JSON</option>
              <option value="text">Text</option>
              <option value="gcp">GCP Structured</option>
            </select>
          </div>
          <div>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded border-neutral-600 bg-neutral-800 text-primary-600" />
              <span className="text-sm text-neutral-300">Enable request logging</span>
            </label>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Metrics & Monitoring</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Metrics Endpoint</label>
            <input type="text" defaultValue="/metrics" className="input w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Health Check Interval</label>
            <select className="input w-full">
              <option value="30">30 seconds</option>
              <option value="60">1 minute</option>
              <option value="300" selected>5 minutes</option>
            </select>
          </div>
          <div>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded border-neutral-600 bg-neutral-800 text-primary-600" />
              <span className="text-sm text-neutral-300">Enable Prometheus metrics</span>
            </label>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Alerting</h3>
        <div className="space-y-4">
          <div>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded border-neutral-600 bg-neutral-800 text-primary-600" />
              <span className="text-sm text-neutral-300">Enable email alerts</span>
            </label>
          </div>
          <div>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded border-neutral-600 bg-neutral-800 text-primary-600" />
              <span className="text-sm text-neutral-300">Enable Slack notifications</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Alert Threshold (Error Rate)</label>
            <input type="number" defaultValue="5" min="1" max="100" className="input w-full" />
            <p className="text-xs text-neutral-500 mt-1">Percentage of requests that can fail before alerting</p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings()
      case 'environment':
        return renderEnvironmentSettings()
      case 'security':
        return renderSecuritySettings()
      case 'integrations':
        return renderIntegrationsSettings()
      case 'monitoring':
        return renderMonitoringSettings()
      default:
        return renderGeneralSettings()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-neutral-400 mt-1">Configure system preferences and integrations</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn-secondary">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </button>
          <button className="btn-primary">
            <Save className="w-4 h-4 mr-2" />
            Save All Changes
          </button>
        </div>
      </div>

      {/* Settings Tabs */}
      <div className="card">
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Settings Content */}
      {renderContent()}
    </div>
  )
}

export default SettingsPanel
