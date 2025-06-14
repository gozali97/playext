import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Clock, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  AlertTriangle,
  Activity,
  Calendar,
  Zap
} from 'lucide-react'

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/analytics')
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      } else {
        console.error('Failed to fetch analytics')
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (ms) => {
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${Math.round(ms / 1000)}s`
    return `${Math.round(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short'
    })
  }

  const getTrendIcon = (trend) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-danger-600" />
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-success-600" />
    return <Activity className="h-4 w-4 text-gray-400" />
  }

  const getTrendColor = (trend) => {
    if (trend > 0) return 'text-danger-600'
    if (trend < 0) return 'text-success-600'
    return 'text-gray-600'
  }

  if (loading) {
    return (
      <Layout>
        <div className="p-6 max-w-7xl mx-auto">
          <div className="card">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="ml-3 text-gray-600">Memuat analytics...</span>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (!analytics || analytics.summary.totalReports === 0) {
    return (
      <Layout>
        <div className="p-6 max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">📈 Analytics</h1>
            <p className="text-gray-600 mt-2">Analisa trends dan performa test automation</p>
          </div>
          
          <div className="card">
            <div className="text-center py-12">
              <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada data analytics</h3>
              <p className="text-gray-500 mb-4">
                Jalankan beberapa test untuk melihat analytics dan trends
              </p>
              <button
                onClick={() => router.push('/test-runner')}
                className="btn btn-primary"
              >
                Jalankan Test
              </button>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  const { summary, trends, performance } = analytics

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📈 Analytics</h1>
              <p className="text-gray-600 mt-2">Analisa trends dan performa test automation</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchAnalytics}
                disabled={loading}
                className="btn btn-secondary flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              
              <button
                onClick={() => router.push('/reports')}
                className="btn btn-primary flex items-center space-x-2"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Laporan</span>
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">{summary.totalReports}</p>
              </div>
              <div className="p-3 bg-primary-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{summary.averageSuccessRate}%</p>
              </div>
              <div className="p-3 bg-success-100 rounded-lg">
                <Target className="h-6 w-6 text-success-600" />
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-success-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${summary.averageSuccessRate}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Duration</p>
                <p className="text-2xl font-bold text-gray-900">{formatDuration(summary.averageDuration)}</p>
              </div>
              <div className="p-3 bg-warning-100 rounded-lg">
                <Clock className="h-6 w-6 text-warning-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              {getTrendIcon(performance.durationTrend)}
              <span className={`ml-1 ${getTrendColor(performance.durationTrend)}`}>
                {Math.abs(performance.durationTrend).toFixed(1)}% vs previous
              </span>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tests</p>
                <p className="text-2xl font-bold text-gray-900">{summary.totalTests}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              <span className="text-success-600">{summary.totalPassed} passed</span>
              <span className="mx-2">•</span>
              <span className="text-danger-600">{summary.totalFailed} failed</span>
            </div>
          </div>
        </div>

        {/* Test Type Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance by Test Type</h3>
            <div className="space-y-4">
              {summary.testTypeStats.map((testType) => (
                <div key={testType.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {testType.name}
                      </span>
                      <span className="text-sm text-gray-600">
                        {Math.round(testType.successRate)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${testType.successRate}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{testType.totalRuns} runs</span>
                      <span>{formatDuration(testType.averageDuration)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Trends */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Trends</h3>
            <div className="space-y-4">
              {trends.daily.slice(-7).map((day, index) => (
                <div key={day.date} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(day.date)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {day.reports} reports • {day.totalTests} tests
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {Math.round(day.successRate)}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDuration(day.averageDuration)}
                      </div>
                    </div>
                    {day.successRate >= 80 ? (
                      <CheckCircle className="h-4 w-4 text-success-600" />
                    ) : day.successRate >= 60 ? (
                      <AlertTriangle className="h-4 w-4 text-warning-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-danger-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance History */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance History</h3>
          <div className="space-y-3">
            {performance.successRateHistory.slice(-10).map((record, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-gray-600">
                    {formatDate(record.date)}
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {record.totalTests} tests
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {Math.round(record.successRate)}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDuration(record.duration)}
                    </div>
                  </div>
                  
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        record.successRate >= 80 ? 'bg-success-600' :
                        record.successRate >= 60 ? 'bg-warning-600' : 'bg-danger-600'
                      }`}
                      style={{ width: `${record.successRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
} 