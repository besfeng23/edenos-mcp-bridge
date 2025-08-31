import React, { useState, useEffect } from 'react'
import { 
  Cloud, 
  Database, 
  Code, 
  Settings, 
  Activity, 
  Shield, 
  Zap,
  Menu,
  X,
  Github,
  Globe,
  Server,
  BarChart3,
  Terminal
} from 'lucide-react'
import Dashboard from './components/Dashboard'
import ToolsManager from './components/ToolsManager'
import Infrastructure from './components/Infrastructure'
import Monitoring from './components/Monitoring'
import SettingsPanel from './components/SettingsPanel'
import { Tool, SystemStatus } from './types'

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    status: 'loading',
    uptime: 0,
    tools: 0,
    memory: { used: 0, total: 0 },
    cpu: 0
  })

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3, color: 'text-primary-400' },
    { id: 'tools', name: 'Tools Manager', icon: Terminal, color: 'text-success-400' },
    { id: 'infrastructure', name: 'Infrastructure', icon: Server, color: 'text-warning-400' },
    { id: 'monitoring', name: 'Monitoring', icon: Activity, color: 'text-danger-400' },
    { id: 'settings', name: 'Settings', icon: Settings, color: 'text-neutral-400' },
  ]

  useEffect(() => {
    // Fetch system status
    fetchSystemStatus()
    const interval = setInterval(fetchSystemStatus, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchSystemStatus = async () => {
    try {
      // In a real app, this would fetch from your MCP Bridge API
      const mockStatus: SystemStatus = {
        status: 'healthy',
        uptime: Date.now() - 1704067200000, // Mock uptime
        tools: 40,
        memory: { used: 256, total: 512 },
        cpu: 15
      }
      setSystemStatus(mockStatus)
    } catch (error) {
      console.error('Failed to fetch system status:', error)
      setSystemStatus(prev => ({ ...prev, status: 'error' }))
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard systemStatus={systemStatus} />
      case 'tools':
        return <ToolsManager />
      case 'infrastructure':
        return <Infrastructure />
      case 'monitoring':
        return <Monitoring />
      case 'settings':
        return <SettingsPanel />
      default:
        return <Dashboard systemStatus={systemStatus} />
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-neutral-900 border-r border-neutral-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-neutral-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <Cloud className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">EdenOS</h1>
              <p className="text-xs text-neutral-400">MCP Bridge</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-neutral-800"
          >
            <X className="w-5 h-5 text-neutral-400" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id)
                    setSidebarOpen(false)
                  }}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-primary-600 text-white'
                      : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${item.color}`} />
                  {item.name}
                </button>
              )
            })}
          </div>
        </nav>

        {/* System Status */}
        <div className="absolute bottom-6 left-3 right-3">
          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-neutral-300">System Status</span>
              <div className={`w-2 h-2 rounded-full ${
                systemStatus.status === 'healthy' ? 'bg-success-500' :
                systemStatus.status === 'warning' ? 'bg-warning-500' :
                systemStatus.status === 'error' ? 'bg-danger-500' : 'bg-neutral-500'
              }`} />
            </div>
            <div className="text-xs text-neutral-400">
              <div className="flex justify-between">
                <span>Tools:</span>
                <span className="text-neutral-300">{systemStatus.tools}</span>
              </div>
              <div className="flex justify-between">
                <span>Uptime:</span>
                <span className="text-neutral-300">{Math.floor(systemStatus.uptime / 1000 / 60)}m</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-neutral-900/80 backdrop-blur-sm border-b border-neutral-800">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-neutral-800"
            >
              <Menu className="w-5 h-5 text-neutral-400" />
            </button>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-neutral-400">
                <Globe className="w-4 h-4" />
                <span>Production</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-neutral-400">
                <Github className="w-4 h-4" />
                <span>main</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button className="btn-secondary text-sm">
                <Zap className="w-4 h-4 mr-2" />
                Quick Deploy
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}

export default App
