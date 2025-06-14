import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import { Play, Square, Settings, FileText, AlertCircle, CheckCircle } from 'lucide-react'

export default function TestRunner() {
  const [isRunning, setIsRunning] = useState(false)
  const [selectedTestTypes, setSelectedTestTypes] = useState(['smoke'])
  const [testOptions, setTestOptions] = useState({
    html: true,
    verbose: true,
    headless: false
  })
  const [logs, setLogs] = useState([])
  const [results, setResults] = useState(null)
  const [eventSource, setEventSource] = useState(null)
  const logsEndRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    // Check if test type is specified in URL
    if (router.query.type) {
      setSelectedTestTypes([router.query.type])
    }
  }, [router.query])

  useEffect(() => {
    // Auto-scroll to bottom of logs
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const testTypeOptions = [
    { value: 'smoke', label: 'Smoke Tests', description: 'Quick health checks' },
    { value: 'unit', label: 'Unit Tests', description: 'Component testing' },
    { value: 'integration', label: 'Integration Tests', description: 'API and service testing' },
    { value: 'functional', label: 'Functional Tests', description: 'Feature testing' },
    { value: 'e2e', label: 'E2E Tests', description: 'End-to-end testing' },
    { value: 'performance', label: 'Performance Tests', description: 'Speed and load testing' },
    { value: 'security', label: 'Security Tests', description: 'Vulnerability scanning' },
    { value: 'regression', label: 'Regression Tests', description: 'Preventing regressions' },
    { value: 'load', label: 'Load Tests', description: 'Performance under load' },
    { value: 'all', label: 'All Tests', description: 'Complete test suite' }
  ]

  const startTest = async () => {
    if (!selectedTestTypes.length) {
      alert('Silakan pilih minimal satu jenis test')
      return
    }

    setIsRunning(true)
    setLogs([])
    setResults(null)
    
    try {
      // Prepare test data
      const testData = {
        testType: selectedTestTypes.join(','),
        options: {
          html: testOptions.html,
          verbose: testOptions.verbose,
          headless: testOptions.headless
        }
      }

      addLog('info', 'Memulai eksekusi test...')
      addLog('info', `Menjalankan test: ${selectedTestTypes.join(', ')}`)

      // Create EventSource for real-time updates
      const es = new EventSource('/api/test/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      })

      // For POST requests, we need to use fetch with streaming
      const response = await fetch('/api/test/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              handleTestEvent(data)
            } catch (e) {
              console.error('Error parsing SSE data:', e)
            }
          }
        }
      }

    } catch (error) {
      console.error('Test execution error:', error)
      addLog('error', `Error: ${error.message}`)
      setIsRunning(false)
    }
  }

  const handleTestEvent = (data) => {
    switch (data.type) {
      case 'start':
        addLog('info', data.message)
        break
      case 'stdout':
        addLog('info', data.message)
        break
      case 'stderr':
        addLog('error', data.message)
        break
      case 'complete':
        addLog(data.success ? 'success' : 'error', data.message)
        if (data.report) {
          setResults(data.report)
        }
        setIsRunning(false)
        break
      case 'error':
        addLog('error', data.message)
        setIsRunning(false)
        break
      default:
        addLog('info', data.message || JSON.stringify(data))
    }
  }

  const stopTest = async () => {
    if (eventSource) {
      eventSource.close()
      setEventSource(null)
    }
    setIsRunning(false)
    addLog('warning', 'Test execution diberhentikan oleh user')
  }

  const addLog = (type, message) => {
    const timestamp = new Date().toLocaleTimeString('id-ID')
    setLogs(prev => [...prev, { type, message, timestamp }])
  }

  const handleTestTypeChange = (testType, checked) => {
    if (testType === 'all') {
      if (checked) {
        setSelectedTestTypes(['all'])
      } else {
        setSelectedTestTypes([])
      }
    } else {
      if (checked) {
        setSelectedTestTypes(prev => {
          const filtered = prev.filter(t => t !== 'all')
          return [...filtered, testType]
        })
      } else {
        setSelectedTestTypes(prev => prev.filter(t => t !== testType))
      }
    }
  }

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">▶️ Test Runner</h1>
              <p className="text-gray-600 mt-2">Jalankan dan monitor automated tests secara real-time</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push('/configuration')}
                className="btn btn-secondary flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>Konfigurasi</span>
              </button>
              
              <button
                onClick={() => router.push('/reports')}
                className="btn btn-secondary flex items-center space-x-2"
              >
                <FileText className="h-4 w-4" />
                <span>Laporan</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Test Configuration */}
          <div className="lg:col-span-1 space-y-6">
            {/* Test Type Selection */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pilih Jenis Test</h3>
              <div className="space-y-2">
                {testTypeOptions.map(option => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedTestTypes.includes(option.value)}
                      onChange={(e) => handleTestTypeChange(option.value, e.target.checked)}
                      disabled={isRunning}
                      className="form-checkbox"
                    />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{option.label}</div>
                      <div className="text-xs text-gray-500">{option.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Test Options */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Opsi Test</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={testOptions.html}
                    onChange={(e) => setTestOptions(prev => ({...prev, html: e.target.checked}))}
                    disabled={isRunning}
                    className="form-checkbox"
                  />
                  <span className="ml-2 text-sm text-gray-900">Generate HTML Report</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={testOptions.verbose}
                    onChange={(e) => setTestOptions(prev => ({...prev, verbose: e.target.checked}))}
                    disabled={isRunning}
                    className="form-checkbox"
                  />
                  <span className="ml-2 text-sm text-gray-900">Verbose Logging</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={testOptions.headless}
                    onChange={(e) => setTestOptions(prev => ({...prev, headless: e.target.checked}))}
                    disabled={isRunning}
                    className="form-checkbox"
                  />
                  <span className="ml-2 text-sm text-gray-900">Headless Mode</span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="card">
              <div className="space-y-3">
                {!isRunning ? (
                  <button
                    onClick={startTest}
                    disabled={!selectedTestTypes.length}
                    className="btn btn-primary w-full flex items-center justify-center space-x-2"
                  >
                    <Play className="h-5 w-5" />
                    <span>Mulai Test</span>
                  </button>
                ) : (
                  <button
                    onClick={stopTest}
                    className="btn btn-danger w-full flex items-center justify-center space-x-2"
                  >
                    <Square className="h-5 w-5" />
                    <span>Hentikan Test</span>
                  </button>
                )}

                {/* Status */}
                <div className="text-center">
                  {isRunning ? (
                    <div className="flex items-center justify-center space-x-2 text-warning-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-warning-600"></div>
                      <span className="text-sm">Menjalankan test...</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">Siap untuk menjalankan test</span>
                  )}
                </div>
              </div>
            </div>

            {/* Test Summary */}
            {results && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  {results.summary?.passed > results.summary?.failed ? (
                    <CheckCircle className="h-5 w-5 text-success-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-danger-600" />
                  )}
                  <span>Hasil Test</span>
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Test:</span>
                    <span className="text-sm font-medium">{results.summary?.totalTests || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Berhasil:</span>
                    <span className="text-sm font-medium text-success-600">{results.summary?.passed || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Gagal:</span>
                    <span className="text-sm font-medium text-danger-600">{results.summary?.failed || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Durasi:</span>
                    <span className="text-sm font-medium">{Math.round((results.framework?.duration || 0) / 1000)}s</span>
                  </div>
                  
                  {/* Success Rate */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Success Rate:</span>
                      <span className="text-sm font-medium">
                        {results.summary?.totalTests > 0 
                          ? Math.round((results.summary.passed / results.summary.totalTests) * 100)
                          : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-success-600 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${results.summary?.totalTests > 0 
                            ? (results.summary.passed / results.summary.totalTests) * 100 
                            : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* View Report Button */}
                {results.reportPath && (
                  <div className="mt-4">
                    <button
                      onClick={() => window.open(results.reportPath, '_blank')}
                      className="btn btn-secondary w-full flex items-center justify-center space-x-2"
                    >
                      <FileText className="h-4 w-4" />
                      <span>Lihat Laporan HTML</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Test Execution Panel */}
          <div className="lg:col-span-2">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Log Eksekusi</h3>
              <div className="bg-gray-900 rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm">
                {logs.length === 0 ? (
                  <div className="text-gray-400">Menunggu eksekusi test...</div>
                ) : (
                  <>
                    {logs.map((log, index) => (
                      <div key={index} className={`mb-1 ${
                        log.type === 'error' ? 'text-red-400' :
                        log.type === 'success' ? 'text-green-400' :
                        log.type === 'warning' ? 'text-yellow-400' :
                        'text-gray-300'
                      }`}>
                        <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
                      </div>
                    ))}
                    <div ref={logsEndRef} />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
} 