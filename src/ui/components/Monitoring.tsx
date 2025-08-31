import React, { useState } from 'react'
import { 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  RefreshCw,
  Download,
  Filter,
  Search
} from 'lucide-react'

const Monitoring: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h')

  const metrics = [
    { name: 'Request Rate', value: '1.2K', change: '+12%', trend: 'up' },
    { name: 'Error Rate', value: '0.8%', change: '-5%', trend: 'down' },
    { name: 'Response Time', value: '45ms', change: '-8%', trend: 'down' },
    { name: 'CPU Usage', value: '15%', change: '+2%', trend: 'up' },
    { name: 'Memory Usage', value: '50%', change: '+5%', trend: 'up' },
    { name: 'Uptime', value: '99.9%', change: '0%', trend: 'stable' }
  ]

  const recentLogs = [
    { id: 1, level: 'info', message: 'Health check completed successfully', timestamp: '2 minutes ago', service: 'MCP Bridge' },
    { id: 2, level: 'info', message: 'Tool executed: gcp.run.status', timestamp: '5 minutes ago', service: 'GCP Tools' },
    { id: 3, level: 'warning', message: 'High memory usage detected', timestamp: '10 minutes ago', service: 'System Monitor' },
    { id: 4, level: 'info', message: 'Firebase hosting deployed successfully', timestamp: '1 hour ago', service: 'Firebase Tools' },
    { id: 5, level: 'error', message: 'Failed to connect to BigQuery', timestamp: '2 hours ago', service: 'BigQuery Tools' },
    { id: 6, level: 'info', message: 'Secrets rotated successfully', timestamp: '3 hours ago', service: 'Secrets Manager' }
  ]

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'info':
        return 'text-blue-400 bg-blue-500/20'
      case 'warning':
        return 'text-warning-400 bg-warning-500/20'
      case 'error':
        return 'text-danger-400 bg-danger-500/20'
      default:
        return 'text-neutral-400 bg-neutral-500/20'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-success-500" />
      case 'down':
        return <TrendingUp className="w-4 h-4 text-danger-500 transform rotate-180" />
      default:
        return <Clock className="w-4 h-4 text-neutral-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Monitoring</h1>
          <p className="text-neutral-400 mt-1">System metrics, logs, and health monitoring</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn-secondary">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </button>
          <button className="btn-primary">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-neutral-300">Time Range:</span>
          <div className="flex bg-neutral-800 rounded-lg p-1">
            {['1h', '24h', '7d', '30d'].map((range) => (
              <button
                key={range}
                onClick={() => setSelectedTimeRange(range)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  selectedTimeRange === range
                    ? 'bg-primary-600 text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <div className="flex items-center space-x-2 text-sm text-neutral-400">
            <div className="w-2 h-2 bg-success-500 rounded-full"></div>
            <span>Real-time updates enabled</span>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric) => (
          <div key={metric.name} className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-neutral-400">{metric.name}</h3>
              {getTrendIcon(metric.trend)}
            </div>
            <div className="text-2xl font-bold text-white mb-1">{metric.value}</div>
            <div className={`text-sm ${
              metric.trend === 'up' ? 'text-success-500' : 
              metric.trend === 'down' ? 'text-danger-500' : 'text-neutral-500'
            }`}>
              {metric.change} from last period
            </div>
          </div>
        ))}
      </div>

      {/* System Health */}
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-4">System Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-neutral-800 rounded-xl">
            <div className="w-16 h-16 bg-success-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-8 h-8 text-success-500" />
            </div>
            <div className="text-2xl font-bold text-white">Healthy</div>
            <div className="text-sm text-neutral-400">Overall Status</div>
          </div>
          
          <div className="text-center p-4 bg-neutral-800 rounded-xl">
            <div className="w-16 h-16 bg-success-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Activity className="w-8 h-8 text-success-500" />
            </div>
            <div className="text-2xl font-bold text-white">99.9%</div>
            <div className="text-sm text-neutral-400">Uptime</div>
          </div>
          
          <div className="text-center p-4 bg-neutral-800 rounded-xl">
            <div className="w-16 h-16 bg-warning-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-8 h-8 text-warning-500" />
            </div>
            <div className="text-2xl font-bold text-white">2</div>
            <div className="text-sm text-neutral-400">Warnings</div>
          </div>
          
          <div className="text-center p-4 bg-neutral-800 rounded-xl">
            <div className="w-16 h-16 bg-danger-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-8 h-8 text-danger-500" />
            </div>
            <div className="text-2xl font-bold text-white">1</div>
            <div className="text-sm text-neutral-400">Errors</div>
          </div>
        </div>
      </div>

      {/* Recent Logs */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Recent Logs</h2>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search logs..."
                className="input pl-10 w-48"
              />
            </div>
            <select className="input w-32">
              <option value="all">All Levels</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>
        
        <div className="space-y-2">
          {recentLogs.map((log) => (
            <div key={log.id} className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(log.level)}`}>
                  {log.level.toUpperCase()}
                </span>
                <span className="text-sm text-neutral-300">{log.message}</span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-neutral-400">
                <span>{log.service}</span>
                <span>{log.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Charts */}
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-4">Performance Trends</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-4 bg-neutral-800 rounded-xl">
            <h3 className="font-medium text-white mb-3">Request Rate (24h)</h3>
            <div className="h-32 bg-neutral-700 rounded-lg flex items-center justify-center">
              <span className="text-neutral-400">Chart placeholder</span>
            </div>
          </div>
          
          <div className="p-4 bg-neutral-800 rounded-xl">
            <h3 className="font-medium text-white mb-3">Response Time (24h)</h3>
            <div className="h-32 bg-neutral-700 rounded-lg flex items-center justify-center">
              <span className="text-neutral-400">Chart placeholder</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Monitoring
