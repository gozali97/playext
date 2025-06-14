import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import { 
  FileText, 
  Download, 
  Eye, 
  Trash2, 
  RefreshCw, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Filter,
  Search
} from 'lucide-react'

function Reports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, success, failed
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('date') // date, duration, tests
  const router = useRouter()

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/reports')
      if (response.ok) {
        const data = await response.json()
        setReports(data)
      } else {
        console.error('Failed to fetch reports')
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteReport = async (reportId) => {
    if (!confirm('Apakah Anda yakin ingin menghapus laporan ini?')) {
      return
    }

    try {
      const response = await fetch(`/api/reports?id=${reportId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setReports(reports.filter(r => r.id !== reportId))
      } else {
        alert('Gagal menghapus laporan')
      }
    } catch (error) {
      console.error('Error deleting report:', error)
      alert('Terjadi error saat menghapus laporan')
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (ms) => {
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${Math.round(ms / 1000)}s`
    return `${Math.round(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
    return `${Math.round(bytes / (1024 * 1024))} MB`
  }

  const filteredReports = reports
    .filter(report => {
      if (filter === 'success') return report.success
      if (filter === 'failed') return !report.success
      return true
    })
    .filter(report => 
      searchTerm === '' || 
      report.target?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.id.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'duration':
          return b.duration - a.duration
        case 'tests':
          return b.totalTests - a.totalTests
        default:
          return new Date(b.startTime) - new Date(a.startTime)
      }
    })

  const getStatusIcon = (success) => {
    return success 
      ? <CheckCircle className="h-5 w-5 text-success-600" />
      : <XCircle className="h-5 w-5 text-danger-600" />
  }

  const getStatusBadge = (success, passed, failed) => {
    const total = passed + failed
    if (total === 0) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-warning-100 text-warning-800">NO TESTS</span>
    }
    return success 
      ? <span className="px-2 py-1 text-xs font-medium rounded-full bg-success-100 text-success-800">PASSED</span>
      : <span className="px-2 py-1 text-xs font-medium rounded-full bg-danger-100 text-danger-800">FAILED</span>
  }

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📊 Laporan Test</h1>
              <p className="text-gray-600 mt-2">Kelola dan analisa hasil test automation</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchReports}
                disabled={loading}
                className="btn btn-secondary flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              
              <button
                onClick={() => router.push('/analytics')}
                className="btn btn-primary flex items-center space-x-2"
              >
                <FileText className="h-4 w-4" />
                <span>Analytics</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="form-select text-sm"
                >
                  <option value="all">Semua Status</option>
                  <option value="success">Berhasil</option>
                  <option value="failed">Gagal</option>
                </select>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="form-select text-sm"
              >
                <option value="date">Urutkan: Tanggal</option>
                <option value="duration">Urutkan: Durasi</option>
                <option value="tests">Urutkan: Jumlah Test</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Cari laporan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input text-sm w-64"
              />
            </div>
          </div>
        </div>

        {/* Reports List */}
        {loading ? (
          <div className="card">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="ml-3 text-gray-600">Memuat laporan...</span>
            </div>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="card">
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada laporan</h3>
              <p className="text-gray-500">
                {reports.length === 0 
                  ? 'Belum ada laporan test yang dibuat. Jalankan test untuk membuat laporan.'
                  : 'Tidak ada laporan yang sesuai dengan filter.'
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div key={report.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0 pt-1">
                      {getStatusIcon(report.success)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          Test Report - {formatDate(report.startTime)}
                        </h3>
                        {getStatusBadge(report.success, report.passed, report.failed)}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(report.startTime)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>{formatDuration(report.duration)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-success-600" />
                          <span>{report.passed}/{report.totalTests} Passed</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <XCircle className="h-4 w-4 text-danger-600" />
                          <span>{report.failed} Failed</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Target: {report.target || 'N/A'}</span>
                        <span>•</span>
                        <span>Types: {report.testTypes.join(', ')}</span>
                        <span>•</span>
                        <span>Size: {formatFileSize(report.fileSize)}</span>
                      </div>
                      
                      {/* Success Rate Bar */}
                      <div className="mt-3">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Success Rate</span>
                          <span>{Math.round((report.passed / Math.max(1, report.totalTests)) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-success-600 h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${(report.passed / Math.max(1, report.totalTests)) * 100}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {report.hasHtml && (
                      <button
                        onClick={() => window.open(`/reports/${report.id}.html`, '_blank')}
                        className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                        title="Lihat HTML Report"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => window.open(`/reports/${report.id}.json`, '_blank')}
                      className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                      title="Download JSON"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => deleteReport(report.id)}
                      className="p-2 text-gray-400 hover:text-danger-600 transition-colors"
                      title="Hapus Laporan"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {reports.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card text-center">
              <div className="text-2xl font-bold text-primary-600">{reports.length}</div>
              <div className="text-sm text-gray-600">Total Laporan</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold text-success-600">
                {reports.filter(r => r.success).length}
              </div>
              <div className="text-sm text-gray-600">Berhasil</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold text-danger-600">
                {reports.filter(r => !r.success).length}
              </div>
              <div className="text-sm text-gray-600">Gagal</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold text-gray-600">
                {Math.round((reports.filter(r => r.success).length / reports.length) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Reports 