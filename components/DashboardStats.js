import { CheckCircle, XCircle, Clock, Activity } from 'lucide-react'

export default function DashboardStats({ stats }) {
  const successRate = stats.totalTests > 0 ? Math.round((stats.passedTests / stats.totalTests) * 100) : 0

  const statItems = [
    {
      name: 'Total Tests',
      value: stats.totalTests,
      icon: Activity,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100'
    },
    {
      name: 'Passed',
      value: stats.passedTests,
      icon: CheckCircle,
      color: 'text-success-600',
      bgColor: 'bg-success-100'
    },
    {
      name: 'Failed',
      value: stats.failedTests,
      icon: XCircle,
      color: 'text-danger-600',
      bgColor: 'bg-danger-100'
    },
    {
      name: 'Success Rate',
      value: `${successRate}%`,
      icon: Clock,
      color: successRate >= 80 ? 'text-success-600' : successRate >= 60 ? 'text-warning-600' : 'text-danger-600',
      bgColor: successRate >= 80 ? 'bg-success-100' : successRate >= 60 ? 'bg-warning-100' : 'bg-danger-100'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((item) => (
        <div key={item.name} className="card">
          <div className="flex items-center">
            <div className={`flex-shrink-0 p-3 rounded-lg ${item.bgColor}`}>
              <item.icon className={`h-6 w-6 ${item.color}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{item.name}</p>
              <p className="text-2xl font-bold text-gray-900">{item.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 