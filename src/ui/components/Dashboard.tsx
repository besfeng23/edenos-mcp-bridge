import React from 'react'
import { 
  Cloud, 
  Database, 
  Code, 
  Activity, 
  Shield, 
  Zap, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Server,
  BarChart3
} from 'lucide-react'
import { SystemStatus, QuickAction } from '../types'

interface DashboardProps {
  systemStatus: SystemStatus
}

const Dashboard: React.FC<DashboardProps> = ({ systemStatus }) => {
  const quickActions: QuickAction[] = [
    {
      id: 'deploy-staging',
      name: 'Deploy to Staging',
      description: 'Deploy latest changes to staging environment',
      icon: '🚀',
      category: 'deploy',
      action: () => console.log('Deploy to staging')
    },
    {
      id: 'health-check',
      name: 'Health Check',
      description: 'Run comprehensive system health check',
      icon: '🏥',
      category: 'monitor',
      action: () => console.log('Health check')
    },
    {
      id: 'backup-firestore',
      name: 'Backup Firestore',
      description: 'Create backup of Firestore database',
      icon: '💾',
      category: 'manage',
      action: () => console.log('Backup Firestore')
    },
    {
      id: 'rotate-secrets',
      name: 'Rotate Secrets',
      description: 'Rotate sensitive credentials and tokens',
      icon: '🔐',
      category: 'security',
      action: () => console.log('Rotate secrets')
    }
  ]

  const toolCategories = [
    { name: 'GCP Tools', count: 6, color: 'bg-blue-500', icon: Cloud },
    { name: 'Firebase Tools', count: 6, color: 'bg-orange-500', icon: Code },
    { name: 'Firestore Tools', count: 5, color: 'bg-green-500', icon: Database },
    { name: 'BigQuery Tools', count: 5, color: 'bg-purple-500', icon: BarChart3 },
    { name: 'GitHub Actions', count: 5, color: 'bg-gray-500', icon: Activity },
    { name: 'Secrets Management', count: 6, color: 'bg-red-500', icon: Shield },
    { name: 'Authentication', count: 5, color: 'bg-indigo-500', icon: Shield },
    { name: 'Health & Monitoring', count: 2, color: 'bg-teal-500', icon: Activity }
  ]

  const recentActivity = [
    { id: 1, action: 'Deployed to production', time: '2 minutes ago', status: 'success' },
    { id: 2, action: 'Health check completed', time: '5 minutes ago', status: 'success' },
    { id: 3, action: 'Firestore backup created', time: '1 hour ago', status: 'success' },
    { id: 4, action: 'Secrets rotated', time: '2 hours ago', status: 'success' },
    { id: 5, action: 'BigQuery export completed', time: '3 hours ago', status: 'success' }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-success-500" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-warning-500" />
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-danger-500" />
      default:
        return <Clock className="w-4 h-4 text-neutral-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-neutral-400 mt-1">Monitor and manage your EdenOS MCP Bridge</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn-primary">
            <Zap className="w-4 h-4 mr-2" />
            Quick Actions
          </button>
        </div>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-400">System Status</p>
              <p className="text-2xl font-bold text-white capitalize">{systemStatus.status}</p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              systemStatus.status === 'healthy' ? 'bg-success-500/20' :
              systemStatus.status === 'warning' ? 'bg-warning-500/20' :
              systemStatus.status === 'error' ? 'bg-danger-500/20' : 'bg-neutral-500/20'
            }`}>
              <Server className={`w-6 h-6 ${
                systemStatus.status === 'healthy' ? 'text-success-500' :
                systemStatus.status === 'warning' ? 'text-warning-500' :
                systemStatus.status === 'error' ? 'text-danger-500' : 'text-neutral-500'
              }`} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-400">Available Tools</p>
              <p className="text-2xl font-bold text-white">{systemStatus.tools}</p>
            </div>
            <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center">
              <Code className="w-6 h-6 text-primary-500" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-400">Memory Usage</p>
              <p className="text-2xl font-bold text-white">
                {Math.round((systemStatus.memory.used / systemStatus.memory.total) * 100)}%
              </p>
            </div>
            <div className="w-12 h-12 bg-warning-500/20 rounded-lg flex items-center justify-center">
              <Database className="w-6 h-6 text-warning-500" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-400">CPU Usage</p>
              <p className="text-2xl font-bold text-white">{systemStatus.cpu}%</p>
            </div>
            <div className="w-12 h-12 bg-success-500/20 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-success-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              className="p-4 bg-neutral-800 rounded-xl border border-neutral-700 hover:border-primary-500 transition-colors text-left group"
            >
              <div className="text-2xl mb-2">{action.icon}</div>
              <h3 className="font-medium text-white group-hover:text-primary-400 transition-colors">
                {action.name}
              </h3>
              <p className="text-sm text-neutral-400 mt-1">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Tool Categories Overview */}
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-4">Tool Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {toolCategories.map((category) => {
            const Icon = category.icon
            return (
              <div key={category.name} className="p-4 bg-neutral-800 rounded-xl border border-neutral-700">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{category.name}</h3>
                    <p className="text-sm text-neutral-400">{category.count} tools</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500">Status: Active</span>
                  <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(activity.status)}
                <span className="text-sm text-neutral-300">{activity.action}</span>
              </div>
              <span className="text-xs text-neutral-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-4">Performance Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-success-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-8 h-8 text-success-500" />
            </div>
            <p className="text-2xl font-bold text-white">99.9%</p>
            <p className="text-sm text-neutral-400">Uptime</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <BarChart3 className="w-8 h-8 text-primary-500" />
            </div>
            <p className="text-2xl font-bold text-white">45ms</p>
            <p className="text-sm text-neutral-400">Avg Response</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-warning-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Activity className="w-8 h-8 text-warning-500" />
            </div>
            <p className="text-2xl font-bold text-white">1.2K</p>
            <p className="text-sm text-neutral-400">Requests/min</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
