export interface Tool {
  name: string
  description: string
  category: string
  status: 'active' | 'inactive' | 'error'
  lastUsed?: Date
  usageCount: number
  permissions: string[]
}

export interface SystemStatus {
  status: 'healthy' | 'warning' | 'error' | 'loading'
  uptime: number
  tools: number
  memory: {
    used: number
    total: number
  }
  cpu: number
}

export interface ToolCategory {
  id: string
  name: string
  description: string
  icon: string
  color: string
  toolCount: number
  tools: Tool[]
}

export interface InfrastructureResource {
  id: string
  name: string
  type: 'cloud-run' | 'firebase' | 'firestore' | 'bigquery' | 'pubsub' | 'scheduler'
  status: 'running' | 'stopped' | 'error' | 'deploying'
  region: string
  url?: string
  lastDeployed?: Date
  metrics: {
    requests: number
    errors: number
    latency: number
  }
}

export interface MonitoringMetric {
  timestamp: Date
  value: number
  label: string
  category: string
}

export interface DeploymentStatus {
  id: string
  status: 'pending' | 'running' | 'success' | 'failed'
  environment: 'staging' | 'production'
  timestamp: Date
  duration?: number
  logs: string[]
}

export interface QuickAction {
  id: string
  name: string
  description: string
  icon: string
  action: () => void
  category: 'deploy' | 'monitor' | 'manage' | 'security'
}
