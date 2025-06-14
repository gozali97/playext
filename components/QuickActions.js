import { Play, Settings, FileText, Zap, Shield, Globe } from 'lucide-react'

export default function QuickActions({ onQuickTest, onViewReports, onConfigureTests }) {
  const quickTests = [
    {
      type: 'smoke',
      name: 'Smoke Test',
      description: 'Quick health check',
      icon: Zap,
      color: 'text-warning-600',
      bgColor: 'bg-warning-100'
    },
    {
      type: 'security',
      name: 'Security Test',
      description: 'Vulnerability scan',
      icon: Shield,
      color: 'text-danger-600',
      bgColor: 'bg-danger-100'
    },
    {
      type: 'performance',
      name: 'Performance Test',
      description: 'Speed & load test',
      icon: Globe,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Main Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="space-y-3">
          <button
            onClick={onConfigureTests}
            className="w-full flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="flex-shrink-0 p-2 bg-primary-100 rounded-lg">
              <Settings className="h-5 w-5 text-primary-600" />
            </div>
            <div className="ml-3 text-left">
              <p className="text-sm font-medium text-gray-900">Configure Tests</p>
              <p className="text-xs text-gray-500">Setup test parameters</p>
            </div>
          </button>

          <button
            onClick={onViewReports}
            className="w-full flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="flex-shrink-0 p-2 bg-success-100 rounded-lg">
              <FileText className="h-5 w-5 text-success-600" />
            </div>
            <div className="ml-3 text-left">
              <p className="text-sm font-medium text-gray-900">View Reports</p>
              <p className="text-xs text-gray-500">Analyze test results</p>
            </div>
          </button>
        </div>
      </div>

      {/* Quick Tests */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Tests</h3>
        <div className="space-y-3">
          {quickTests.map((test) => (
            <button
              key={test.type}
              onClick={() => onQuickTest(test.type)}
              className="w-full flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className={`flex-shrink-0 p-2 rounded-lg ${test.bgColor}`}>
                <test.icon className={`h-5 w-5 ${test.color}`} />
              </div>
              <div className="ml-3 text-left">
                <p className="text-sm font-medium text-gray-900">{test.name}</p>
                <p className="text-xs text-gray-500">{test.description}</p>
              </div>
              <div className="ml-auto">
                <Play className="h-4 w-4 text-gray-400" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Test All */}
      <div className="card bg-gradient-to-r from-primary-50 to-purple-50 border-primary-200">
        <div className="text-center">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Play className="h-6 w-6 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Run All Tests</h3>
          <p className="text-sm text-gray-600 mb-4">
            Execute comprehensive test suite
          </p>
          <button
            onClick={() => onQuickTest('all')}
            className="btn btn-primary w-full"
          >
            Start Full Test Suite
          </button>
        </div>
      </div>
    </div>
  )
} 