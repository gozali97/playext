import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import DashboardStats from '../components/DashboardStats'
import RecentTests from '../components/RecentTests'
import QuickActions from '../components/QuickActions'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    lastRunTime: null
  })
  const [recentTests, setRecentTests] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setRecentTests(data.recentTests)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickTest = async (testType) => {
    router.push(`/test-runner?type=${testType}`)
  }

  const handleViewReports = () => {
    router.push('/reports')
  }

  const handleConfigureTests = () => {
    router.push('/configuration')
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            🚀 Test Automation Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Kelola dan jalankan automated tests dengan mudah
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8">
          <DashboardStats stats={stats} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <QuickActions 
              onQuickTest={handleQuickTest}
              onViewReports={handleViewReports}
              onConfigureTests={handleConfigureTests}
            />
          </div>

          {/* Recent Tests */}
          <div className="lg:col-span-2">
            <RecentTests 
              tests={recentTests}
              onRefresh={fetchDashboardData}
            />
          </div>
        </div>

        {/* Welcome Message */}
        {stats.totalTests === 0 && (
          <div className="mt-8 bg-gradient-to-r from-primary-50 to-purple-50 rounded-xl p-6 border border-primary-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">👋</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Selamat Datang di Test Automation Framework!
                </h3>
                <p className="text-gray-600">
                  Mulai dengan mengkonfigurasi test atau menjalankan smoke test untuk memastikan aplikasi berjalan dengan baik.
                </p>
                <div className="mt-4 flex space-x-3">
                  <button 
                    onClick={() => handleQuickTest('smoke')}
                    className="btn btn-primary"
                  >
                    Jalankan Smoke Test
                  </button>
                  <button 
                    onClick={handleConfigureTests}
                    className="btn btn-secondary"
                  >
                    Konfigurasi Test
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
} 