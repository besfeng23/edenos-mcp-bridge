import React, { useState } from 'react'
import { 
  Search, 
  Filter, 
  Play, 
  Settings, 
  Cloud, 
  Database, 
  Code, 
  Activity, 
  Shield, 
  BarChart3,
  ExternalLink,
  Clock,
  Zap
} from 'lucide-react'
import { Tool, ToolCategory } from '../types'

const ToolsManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const toolCategories: ToolCategory[] = [
    {
      id: 'gcp',
      name: 'GCP Tools',
      description: 'Google Cloud Platform services management',
      icon: '☁️',
      color: 'text-blue-400',
      toolCount: 6,
      tools: [
        { name: 'gcp.run.status', description: 'Check Cloud Run service status', category: 'GCP', status: 'active', usageCount: 45, permissions: ['gcp.run.read'] },
        { name: 'gcp.run.restart', description: 'Restart Cloud Run service', category: 'GCP', status: 'active', usageCount: 12, permissions: ['gcp.run.write'] },
        { name: 'gcp.run.rollback', description: 'Rollback Cloud Run service', category: 'GCP', status: 'active', usageCount: 8, permissions: ['gcp.run.write'] },
        { name: 'gcp.pubsub.publish', description: 'Publish message to Pub/Sub', category: 'GCP', status: 'active', usageCount: 23, permissions: ['gcp.pubsub.write'] },
        { name: 'gcp.scheduler.trigger', description: 'Trigger Cloud Scheduler job', category: 'GCP', status: 'active', usageCount: 15, permissions: ['gcp.scheduler.write'] },
        { name: 'gcp.tasks.create', description: 'Create Cloud Tasks', category: 'GCP', status: 'active', usageCount: 7, permissions: ['gcp.tasks.write'] }
      ]
    },
    {
      id: 'firebase',
      name: 'Firebase Tools',
      description: 'Firebase services management',
      icon: '🔥',
      color: 'text-orange-400',
      toolCount: 6,
      tools: [
        { name: 'firebase.hosting.deploy', description: 'Deploy Firebase Hosting', category: 'Firebase', status: 'active', usageCount: 18, permissions: ['firebase.hosting.write'] },
        { name: 'firebase.hosting.status', description: 'Check hosting status', category: 'Firebase', status: 'active', usageCount: 32, permissions: ['firebase.hosting.read'] },
        { name: 'firebase.hosting.rollback', description: 'Rollback hosting deployment', category: 'Firebase', status: 'active', usageCount: 5, permissions: ['firebase.hosting.write'] },
        { name: 'firebase.functions.deploy', description: 'Deploy Firebase Functions', category: 'Firebase', status: 'active', usageCount: 14, permissions: ['firebase.functions.write'] },
        { name: 'firebase.functions.status', description: 'Check functions status', category: 'Firebase', status: 'active', usageCount: 28, permissions: ['firebase.functions.read'] },
        { name: 'firebase.app.config', description: 'Get app configuration', category: 'Firebase', status: 'active', usageCount: 41, permissions: ['firebase.app.read'] }
      ]
    },
    {
      id: 'firestore',
      name: 'Firestore Tools',
      description: 'Firestore database operations',
      icon: '🗄️',
      color: 'text-green-400',
      toolCount: 5,
      tools: [
        { name: 'firestore.query', description: 'Query Firestore collection', category: 'Firestore', status: 'active', usageCount: 67, permissions: ['firestore.read'] },
        { name: 'firestore.write', description: 'Write to Firestore', category: 'Firestore', status: 'active', usageCount: 34, permissions: ['firestore.write'] },
        { name: 'firestore.delete', description: 'Delete from Firestore', category: 'Firestore', status: 'active', usageCount: 19, permissions: ['firestore.write'] },
        { name: 'firestore.backup', description: 'Create Firestore backup', category: 'Firestore', status: 'active', usageCount: 8, permissions: ['firestore.admin'] },
        { name: 'firestore.restore', description: 'Restore Firestore backup', category: 'Firestore', status: 'active', usageCount: 3, permissions: ['firestore.admin'] }
      ]
    },
    {
      id: 'bigquery',
      name: 'BigQuery Tools',
      description: 'BigQuery data warehouse operations',
      icon: '📊',
      color: 'text-purple-400',
      toolCount: 5,
      tools: [
        { name: 'bigquery.query', description: 'Execute BigQuery SQL', category: 'BigQuery', status: 'active', usageCount: 89, permissions: ['bigquery.read'] },
        { name: 'bigquery.dataset.create', description: 'Create BigQuery dataset', category: 'BigQuery', status: 'active', usageCount: 12, permissions: ['bigquery.write'] },
        { name: 'bigquery.table.create', description: 'Create BigQuery table', category: 'BigQuery', status: 'active', usageCount: 23, permissions: ['bigquery.write'] },
        { name: 'bigquery.view.create', description: 'Create BigQuery view', category: 'BigQuery', status: 'active', usageCount: 15, permissions: ['bigquery.write'] },
        { name: 'bigquery.export', description: 'Export BigQuery data', category: 'BigQuery', status: 'active', usageCount: 31, permissions: ['bigquery.read'] }
      ]
    },
    {
      id: 'actions',
      name: 'GitHub Actions',
      description: 'GitHub Actions workflow management',
      icon: '⚡',
      color: 'text-gray-400',
      toolCount: 5,
      tools: [
        { name: 'actions.workflow.run', description: 'Trigger GitHub workflow', category: 'Actions', status: 'active', usageCount: 26, permissions: ['github.actions.write'] },
        { name: 'actions.workflow.status', description: 'Check workflow status', category: 'Actions', status: 'active', usageCount: 52, permissions: ['github.actions.read'] },
        { name: 'actions.deploy', description: 'Deploy via GitHub Actions', category: 'Actions', status: 'active', usageCount: 18, permissions: ['github.actions.write'] },
        { name: 'actions.rollback', description: 'Rollback deployment', category: 'Actions', status: 'active', usageCount: 7, permissions: ['github.actions.write'] },
        { name: 'actions.smoke', description: 'Run smoke tests', category: 'Actions', status: 'active', usageCount: 14, permissions: ['github.actions.write'] }
      ]
    },
    {
      id: 'secrets',
      name: 'Secrets Management',
      description: 'GCP Secret Manager operations',
      icon: '🔐',
      color: 'text-red-400',
      toolCount: 6,
      tools: [
        { name: 'secrets.create', description: 'Create new secret', category: 'Secrets', status: 'active', usageCount: 9, permissions: ['secrets.write'] },
        { name: 'secrets.get', description: 'Get secret value', category: 'Secrets', status: 'active', usageCount: 156, permissions: ['secrets.read'] },
        { name: 'secrets.update', description: 'Update secret', category: 'Secrets', status: 'active', usageCount: 12, permissions: ['secrets.write'] },
        { name: 'secrets.delete', description: 'Delete secret', category: 'Secrets', status: 'active', usageCount: 4, permissions: ['secrets.admin'] },
        { name: 'secrets.list', description: 'List all secrets', category: 'Secrets', status: 'active', usageCount: 23, permissions: ['secrets.read'] },
        { name: 'secrets.rotate', description: 'Rotate secret', category: 'Secrets', status: 'active', usageCount: 6, permissions: ['secrets.admin'] }
      ]
    },
    {
      id: 'auth',
      name: 'Authentication',
      description: 'Service authentication management',
      icon: '🔑',
      color: 'text-indigo-400',
      toolCount: 5,
      tools: [
        { name: 'auth.login', description: 'Authenticate with service', category: 'Auth', status: 'active', usageCount: 45, permissions: ['auth.write'] },
        { name: 'auth.logout', description: 'Logout from service', category: 'Auth', status: 'active', usageCount: 23, permissions: ['auth.write'] },
        { name: 'auth.status', description: 'Check auth status', category: 'Auth', status: 'active', usageCount: 78, permissions: ['auth.read'] },
        { name: 'auth.token', description: 'Get auth token', category: 'Auth', status: 'active', usageCount: 89, permissions: ['auth.read'] },
        { name: 'auth.config', description: 'Configure auth', category: 'Auth', status: 'active', usageCount: 12, permissions: ['auth.admin'] }
      ]
    },
    {
      id: 'health',
      name: 'Health & Monitoring',
      description: 'System health and monitoring',
      icon: '🏥',
      color: 'text-teal-400',
      toolCount: 2,
      tools: [
        { name: 'health.smoke', description: 'Run smoke tests', category: 'Health', status: 'active', usageCount: 34, permissions: ['health.read'] },
        { name: 'health.check', description: 'Check system health', category: 'Health', status: 'active', usageCount: 67, permissions: ['health.read'] }
      ]
    }
  ]

  const filteredCategories = toolCategories.filter(category => {
    if (selectedCategory !== 'all' && category.id !== selectedCategory) return false
    if (searchTerm) {
      const hasMatchingTool = category.tools.some(tool => 
        tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      return hasMatchingTool
    }
    return true
  })

  const totalTools = toolCategories.reduce((sum, cat) => sum + cat.toolCount, 0)
  const activeTools = toolCategories.reduce((sum, cat) => 
    sum + cat.tools.filter(t => t.status === 'active').length, 0
  )

  const executeTool = (toolName: string) => {
    console.log(`Executing tool: ${toolName}`)
    // In a real app, this would call the MCP Bridge API
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Tools Manager</h1>
          <p className="text-neutral-400 mt-1">Manage and execute all 40 MCP Bridge tools</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn-secondary">
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </button>
          <button className="btn-primary">
            <Zap className="w-4 h-4 mr-2" />
            Execute All
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="text-3xl font-bold text-white">{totalTools}</div>
          <div className="text-sm text-neutral-400">Total Tools</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-success-500">{activeTools}</div>
          <div className="text-sm text-neutral-400">Active Tools</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-primary-500">{toolCategories.length}</div>
          <div className="text-sm text-neutral-400">Categories</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search tools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input w-full md:w-48"
          >
            <option value="all">All Categories</option>
            {toolCategories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name} ({category.toolCount})
              </option>
            ))}
          </select>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-neutral-800 text-neutral-400'}`}
            >
              <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
              </div>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-neutral-800 text-neutral-400'}`}
            >
              <div className="w-4 h-4 space-y-1">
                <div className="w-full h-0.5 bg-current rounded-sm"></div>
                <div className="w-full h-0.5 bg-current rounded-sm"></div>
                <div className="w-full h-0.5 bg-current rounded-sm"></div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Tools Display */}
      <div className="space-y-6">
        {filteredCategories.map(category => (
          <div key={category.id} className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{category.icon}</div>
                <div>
                  <h3 className="text-xl font-semibold text-white">{category.name}</h3>
                  <p className="text-sm text-neutral-400">{category.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-neutral-400">{category.toolCount} tools</span>
                <div className="w-2 h-2 bg-success-500 rounded-full"></div>
              </div>
            </div>

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.tools.map(tool => (
                  <div key={tool.name} className="p-4 bg-neutral-800 rounded-xl border border-neutral-700 hover:border-primary-500 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-white text-sm font-mono">{tool.name}</h4>
                        <p className="text-xs text-neutral-400 mt-1">{tool.description}</p>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${
                        tool.status === 'active' ? 'bg-success-500' : 'bg-neutral-500'
                      }`} />
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-neutral-500 mb-3">
                      <span>Used {tool.usageCount} times</span>
                      <span>{tool.permissions.join(', ')}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => executeTool(tool.name)}
                        className="btn-primary text-xs py-1 px-2 flex-1"
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Execute
                      </button>
                      <button className="btn-secondary text-xs py-1 px-2">
                        <Settings className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {category.tools.map(tool => (
                  <div key={tool.name} className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium text-white font-mono">{tool.name}</h4>
                        <div className={`w-2 h-2 rounded-full ${
                          tool.status === 'active' ? 'bg-success-500' : 'bg-neutral-500'
                        }`} />
                      </div>
                      <p className="text-sm text-neutral-400 mt-1">{tool.description}</p>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-neutral-400">
                      <span>Used {tool.usageCount} times</span>
                      <span>{tool.permissions.join(', ')}</span>
                      <button
                        onClick={() => executeTool(tool.name)}
                        className="btn-primary text-xs py-1 px-3"
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Execute
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-white mb-2">No tools found</h3>
          <p className="text-neutral-400">Try adjusting your search terms or category filter</p>
        </div>
      )}
    </div>
  )
}

export default ToolsManager
