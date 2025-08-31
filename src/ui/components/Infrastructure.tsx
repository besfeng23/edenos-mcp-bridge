import React, { useState } from 'react'
import { 
  Server, 
  Cloud, 
  Database, 
  Code, 
  Activity, 
  Settings, 
  Play, 
  Pause,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock
} from 'lucide-react'
import { InfrastructureResource } from '../types'

const Infrastructure: React.FC = () => {
  const [selectedEnvironment, setSelectedEnvironment] = useState<'staging' | 'production'>('production')

  const resources: InfrastructureResource[] = [
    {
      id: 'cloud-run-1',
      name: 'edenos-mcp-bridge',
      type: 'cloud-run',
      status: 'running',
      region: 'us-central1',
      url: 'https://edenos-mcp-bridge-xxxxx.run.app',
      lastDeployed: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      metrics: { requests: 1200, errors: 2, latency: 45 }
    },
    {
      id: 'firebase-hosting-1',
      name: 'mcpmaster-web-app',
      type: 'firebase',
      status: 'running',
      region: 'us-central1',
      url: 'https://mcpmaster-web-app.web.app',
      lastDeployed: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      metrics: { requests: 890, errors: 0, latency: 120 }
    },
    {
      id: 'firestore-1',
      name: 'edenos-firestore',
      type: 'firestore',
      status: 'running',
      region: 'us-central1',
      lastDeployed: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      metrics: { requests: 2340, errors: 5, latency: 15 }
    },
    {
      id: 'bigquery-1',
      name: 'edenos-analytics',
      type: 'bigquery',
      status: 'running',
      region: 'us-central1',
      lastDeployed: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 1 week ago
      metrics: { requests: 156, errors: 1, latency: 1200 }
    },
    {
      id: 'pubsub-1',
      name: 'edenos-events',
      type: 'pubsub',
      status: 'running',
      region: 'us-central1',
      lastDeployed: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // 1 month ago
      metrics: { requests: 450, errors: 0, latency: 25 }
    },
    {
      id: 'scheduler-1',
      name: 'health-check-job',
      type: 'scheduler',
      status: 'running',
      region: 'us-central1',
      lastDeployed: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 1 week ago
      metrics: { requests: 288, errors: 0, latency: 50 }
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <CheckCircle className="w-5 h-5 text-success-500" />
      case 'stopped':
        return <Pause className="w-5 h-5 text-warning-500" />
      case 'error':
        return <XCircle className="w-5 h-5 text-danger-500" />
      case 'deploying':
        return <RefreshCw className="w-5 h-5 text-primary-500 animate-spin" />
      default:
        return <Clock className="w-5 h-5 text-neutral-500" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'cloud-run':
        return <Server className="w-5 h-5 text-blue-500" />
      case 'firebase':
        return <Code className="w-5 h-5 text-orange-500" />
      case 'firestore':
        return <Database className="w-5 h-5 text-green-500" />
      case 'bigquery':
        return <Activity className="w-5 h-5 text-purple-500" />
      case 'pubsub':
        return <Cloud className="w-5 h-5 text-indigo-500" />
      case 'scheduler':
        return <Clock className="w-5 h-5 text-teal-500" />
      default:
        return <Settings className="w-5 h-5 text-neutral-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-success-500/20 text-success-400 border-success-500/30'
      case 'stopped':
        return 'bg-warning-500/20 text-warning-400 border-warning-500/30'
      case 'error':
        return 'bg-danger-500/20 text-danger-400 border-danger-500/30'
      case 'deploying':
        return 'bg-primary-500/20 text-primary-400 border-primary-500/30'
      default:
        return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30'
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Infrastructure</h1>
          <p className="text-neutral-400 mt-1">Manage GCP resources and deployment status</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn-secondary">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button className="btn-primary">
            <Play className="w-4 h-4 mr-2" />
            Deploy All
          </button>
        </div>
      </div>

      {/* Environment Selector */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-neutral-300">Environment:</span>
          <div className="flex bg-neutral-800 rounded-lg p-1">
            <button
              onClick={() => setSelectedEnvironment('staging')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                selectedEnvironment === 'staging'
                  ? 'bg-primary-600 text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Staging
            </button>
            <button
              onClick={() => setSelectedEnvironment('production')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                selectedEnvironment === 'production'
                  ? 'bg-primary-600 text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Production
            </button>
          </div>
          <div className="flex items-center space-x-2 text-sm text-neutral-400">
            <div className="w-2 h-2 bg-success-500 rounded-full"></div>
            <span>All systems operational</span>
          </div>
        </div>
      </div>

      {/* Infrastructure Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="text-3xl font-bold text-white">{resources.length}</div>
          <div className="text-sm text-neutral-400">Total Resources</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-success-500">
            {resources.filter(r => r.status === 'running').length}
          </div>
          <div className="text-sm text-neutral-400">Running</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-primary-500">
            {resources.filter(r => r.status === 'deploying').length}
          </div>
          <div className="text-sm text-neutral-400">Deploying</div>
        </div>
      </div>

      {/* Resources List */}
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-4">Resources</h2>
        <div className="space-y-4">
          {resources.map((resource) => (
            <div key={resource.id} className="p-4 bg-neutral-800 rounded-xl border border-neutral-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {getTypeIcon(resource.type)}
                  <div>
                    <h3 className="font-medium text-white">{resource.name}</h3>
                    <p className="text-sm text-neutral-400 capitalize">{resource.type.replace('-', ' ')}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(resource.status)}`}>
                    {resource.status}
                  </span>
                  {getStatusIcon(resource.status)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <div className="text-sm">
                  <span className="text-neutral-400">Region:</span>
                  <span className="text-white ml-2">{resource.region}</span>
                </div>
                <div className="text-sm">
                  <span className="text-neutral-400">Last Deployed:</span>
                  <span className="text-white ml-2">{formatTimeAgo(resource.lastDeployed)}</span>
                </div>
                <div className="text-sm">
                  <span className="text-neutral-400">Status:</span>
                  <span className="text-white ml-2 capitalize">{resource.status}</span>
                </div>
              </div>

              {resource.url && (
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-sm text-neutral-400">URL:</span>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-400 hover:text-primary-300 flex items-center space-x-1"
                  >
                    <span>{resource.url}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center p-2 bg-neutral-700 rounded-lg">
                  <div className="text-lg font-bold text-white">{resource.metrics.requests}</div>
                  <div className="text-xs text-neutral-400">Requests</div>
                </div>
                <div className="text-center p-2 bg-neutral-700 rounded-lg">
                  <div className="text-lg font-bold text-white">{resource.metrics.errors}</div>
                  <div className="text-xs text-neutral-400">Errors</div>
                </div>
                <div className="text-center p-2 bg-neutral-700 rounded-lg">
                  <div className="text-lg font-bold text-white">{resource.metrics.latency}ms</div>
                  <div className="text-xs text-neutral-400">Latency</div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button className="btn-primary text-sm py-1 px-3">
                  <Play className="w-3 h-3 mr-1" />
                  Deploy
                </button>
                <button className="btn-secondary text-sm py-1 px-3">
                  <Settings className="w-3 h-3 mr-1" />
                  Configure
                </button>
                <button className="btn-secondary text-sm py-1 px-3">
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Restart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Terraform Status */}
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-4">Terraform Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-neutral-800 rounded-xl border border-neutral-700">
            <h3 className="font-medium text-white mb-2">Staging Environment</h3>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-success-500 rounded-full"></div>
              <span className="text-sm text-neutral-400">Infrastructure up to date</span>
            </div>
            <p className="text-xs text-neutral-500 mb-3">Last applied: 2 hours ago</p>
            <button className="btn-primary text-sm py-1 px-3">
              <Play className="w-3 h-3 mr-1" />
              Apply Changes
            </button>
          </div>

          <div className="p-4 bg-neutral-800 rounded-xl border border-neutral-700">
            <h3 className="font-medium text-white mb-2">Production Environment</h3>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-success-500 rounded-full"></div>
              <span className="text-sm text-neutral-400">Infrastructure up to date</span>
            </div>
            <p className="text-xs text-neutral-500 mb-3">Last applied: 1 day ago</p>
            <button className="btn-primary text-sm py-1 px-3">
              <Play className="w-3 h-3 mr-1" />
              Apply Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Infrastructure
