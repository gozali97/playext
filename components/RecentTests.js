import { useState } from 'react'
import { CheckCircle, XCircle, Clock, RefreshCw, Eye, Download } from 'lucide-react'

export default function RecentTests({ tests, onRefresh }) {
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    await onRefresh()
    setRefreshing(false)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PASSED':
        return <CheckCircle className="h-5 w-5 text-success-600" />
      case 'FAILED':
        return <XCircle className="h-5 w-5 text-danger-600" />
      case 'RUNNING':
        return <Clock className="h-5 w-5 text-warning-600 animate-pulse" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PASSED':
        return 'bg-success-100 text-success-800'
      case 'FAILED':
        return 'bg-danger-100 text-danger-800'
      case 'RUNNING':
        return 'bg-warning-100 text-warning-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDuration = (ms) => {
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${Math.round(ms / 1000)}s`
    return `${Math.round(ms / 60000)}m`
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Tests</h3>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {tests.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm">No tests have been run yet</p>
          <p className="text-gray-400 text-xs mt-1">Start by running a quick test</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tests.map((test, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                {getStatusIcon(test.status)}
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-medium text-gray-900">
                      {test.type.toUpperCase()} Test
                    </h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(test.status)}`}>
                      {test.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                    <span>{formatDate(test.startTime)}</span>
                    <span>Duration: {formatDuration(test.duration)}</span>
                    <span>Tests: {test.totalTests || 0}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.open(`/reports/${test.reportId}`, '_blank')}
                  className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                  title="View Report"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => window.open(`/api/reports/${test.reportId}/download`, '_blank')}
                  className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                  title="Download Report"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tests.length > 0 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => window.location.href = '/reports'}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            View All Reports →
          </button>
        </div>
      )}
    </div>
  )
} 