import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import ConfigSection from '../components/ConfigSection'
import { Save, Download, Upload, RotateCcw } from 'lucide-react'

export default function Configuration() {
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    loadConfiguration()
  }, [])

  const loadConfiguration = async () => {
    try {
      const response = await fetch('/api/config')
      if (response.ok) {
        const data = await response.json()
        setConfig(data)
      }
    } catch (error) {
      console.error('Error loading configuration:', error)
      setMessage({ type: 'error', text: 'Gagal memuat konfigurasi' })
    } finally {
      setLoading(false)
    }
  }

  const saveConfiguration = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Konfigurasi berhasil disimpan!' })
      } else {
        throw new Error('Failed to save configuration')
      }
    } catch (error) {
      console.error('Error saving configuration:', error)
      setMessage({ type: 'error', text: 'Gagal menyimpan konfigurasi' })
    } finally {
      setSaving(false)
    }
  }

  const resetConfiguration = async () => {
    if (confirm('Apakah Anda yakin ingin reset ke konfigurasi default?')) {
      try {
        const response = await fetch('/api/config/reset', { method: 'POST' })
        if (response.ok) {
          const data = await response.json()
          setConfig(data)
          setMessage({ type: 'success', text: 'Konfigurasi berhasil direset ke default' })
        }
      } catch (error) {
        console.error('Error resetting configuration:', error)
        setMessage({ type: 'error', text: 'Gagal mereset konfigurasi' })
      }
    }
  }

  const exportConfiguration = () => {
    const dataStr = JSON.stringify(config, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    const exportFileDefaultName = 'test-config.json'
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const importConfiguration = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result)
          setConfig(imported)
          setMessage({ type: 'success', text: 'Konfigurasi berhasil diimport!' })
        } catch (error) {
          setMessage({ type: 'error', text: 'File konfigurasi tidak valid' })
        }
      }
      reader.readAsText(file)
    }
  }

  const updateConfig = (section, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: value
    }))
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
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">⚙️ Konfigurasi Test</h1>
              <p className="text-gray-600 mt-2">Atur parameter automation test framework</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={resetConfiguration}
                className="btn btn-secondary flex items-center space-x-2"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset</span>
              </button>
              
              <button
                onClick={exportConfiguration}
                className="btn btn-secondary flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
              
              <label className="btn btn-secondary flex items-center space-x-2 cursor-pointer">
                <Upload className="h-4 w-4" />
                <span>Import</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={importConfiguration}
                  className="hidden"
                />
              </label>
              
              <button
                onClick={saveConfiguration}
                disabled={saving}
                className="btn btn-primary flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'Menyimpan...' : 'Simpan Config'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-success-100 text-success-800 border border-success-200' 
              : 'bg-danger-100 text-danger-800 border border-danger-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Configuration Sections */}
        {config && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Target Configuration */}
            <ConfigSection
              title="🎯 Target Application"
              description="Konfigurasi aplikasi yang akan ditest"
              config={config.target}
              fields={[
                { key: 'url', label: 'Application URL', type: 'url', required: true },
                { key: 'name', label: 'Application Name', type: 'text', required: true },
                { key: 'description', label: 'Description', type: 'textarea' }
              ]}
              onUpdate={(value) => updateConfig('target', value)}
            />

            {/* Authentication Configuration */}
            <ConfigSection
              title="🔐 Authentication"
              description="Setup kredensial login dan metode autentikasi"
              config={config.auth}
              fields={[
                { key: 'username', label: 'Username/Email', type: 'text', required: true },
                { key: 'password', label: 'Password', type: 'password', required: true },
                { key: 'loginUrl', label: 'Login URL Path', type: 'text', placeholder: '/login' },
                { key: 'usernameField', label: 'Username Field Selector', type: 'text', placeholder: '#username' },
                { key: 'passwordField', label: 'Password Field Selector', type: 'text', placeholder: '#password' },
                { key: 'submitButton', label: 'Submit Button Selector', type: 'text', placeholder: '#login-button' }
              ]}
              onUpdate={(value) => updateConfig('auth', value)}
            />

            {/* Browser Configuration */}
            <ConfigSection
              title="🌐 Browser Settings"
              description="Konfigurasi perilaku browser"
              config={config.browser}
              fields={[
                { 
                  key: 'type', 
                  label: 'Browser Type', 
                  type: 'select', 
                  options: [
                    { value: 'chromium', label: 'Chromium' },
                    { value: 'firefox', label: 'Firefox' },
                    { value: 'webkit', label: 'WebKit' }
                  ]
                },
                { key: 'headless', label: 'Headless Mode', type: 'checkbox' },
                { key: 'slowMo', label: 'Slow Motion (ms)', type: 'number', min: 0, max: 5000 },
                { key: 'timeout', label: 'Timeout (ms)', type: 'number', min: 5000, max: 120000 }
              ]}
              onUpdate={(value) => updateConfig('browser', value)}
            />

            {/* Smoke Test Configuration */}
            <ConfigSection
              title="💨 Smoke Test Settings"
              description="Konfigurasi smoke test dan critical paths"
              config={config.testTypes?.smoke || {}}
              baseUrl={config.target?.url || ""}
              fields={[
                { key: 'enabled', label: 'Enable Smoke Tests', type: 'checkbox' },
                { key: 'timeout', label: 'Timeout (ms)', type: 'number', min: 5000, max: 120000 },
                { 
                  key: 'criticalPaths', 
                  label: 'Critical Paths', 
                  type: 'array',
                  placeholder: 'Masukkan path (contoh: /login, /dashboard)',
                  itemType: 'text',
                  addButtonText: 'Tambah Path',
                  description: 'Daftar path yang critical untuk aplikasi. Contoh: /login, /dashboard, /profile'
                }
              ]}
              onUpdate={(value) => updateConfig('testTypes', { ...config.testTypes, smoke: value })}
            />

            {/* Test Types Configuration */}
            <ConfigSection
              title="🧪 Test Types"
              description="Enable/disable dan konfigurasi jenis test"
              config={config.testTypes}
              fields={Object.entries(config.testTypes || {})
                .filter(([key]) => key !== 'smoke') // Exclude smoke since it has its own section
                .map(([key, testType]) => ({
                  key,
                  label: key.charAt(0).toUpperCase() + key.slice(1),
                  type: 'object',
                  enabled: testType.enabled,
                  subFields: [
                    { key: 'enabled', label: 'Enabled', type: 'checkbox' },
                    { key: 'timeout', label: 'Timeout (ms)', type: 'number', min: 1000 }
                  ]
                }))}
              onUpdate={(value) => updateConfig('testTypes', { ...value, smoke: config.testTypes.smoke })}
            />

            {/* Performance Configuration */}
            <ConfigSection
              title="⚡ Performance Settings"
              description="Konfigurasi threshold performance test"
              config={config.performance}
              fields={[
                { key: 'collectNetworkLogs', label: 'Collect Network Logs', type: 'checkbox' },
                { key: 'collectConsoleLogs', label: 'Collect Console Logs', type: 'checkbox' },
                { 
                  key: 'thresholds', 
                  label: 'Performance Thresholds', 
                  type: 'object',
                  subFields: [
                    { key: 'loadTime', label: 'Load Time (ms)', type: 'number', min: 500 },
                    { key: 'domContentLoaded', label: 'DOM Content Loaded (ms)', type: 'number', min: 500 },
                    { key: 'firstPaint', label: 'First Paint (ms)', type: 'number', min: 500 },
                    { key: 'firstContentfulPaint', label: 'First Contentful Paint (ms)', type: 'number', min: 500 }
                  ]
                }
              ]}
              onUpdate={(value) => updateConfig('performance', value)}
            />

            {/* Security Configuration */}
            <ConfigSection
              title="🔒 Security Settings"
              description="Konfigurasi security test checks"
              config={config.security}
              fields={[
                { 
                  key: 'checks', 
                  label: 'Security Checks', 
                  type: 'array',
                  placeholder: 'Masukkan jenis security check',
                  itemType: 'text',
                  addButtonText: 'Tambah Check',
                  description: 'Jenis security test yang akan dijalankan'
                },
                { 
                  key: 'headers', 
                  label: 'Security Headers', 
                  type: 'array',
                  placeholder: 'Masukkan nama header',
                  itemType: 'text',
                  addButtonText: 'Tambah Header',
                  description: 'Security headers yang akan dicek'
                }
              ]}
              onUpdate={(value) => updateConfig('security', value)}
            />

            {/* Global Configuration */}
            <ConfigSection
              title="🌍 Global Settings"
              description="Pengaturan umum eksekusi test"
              config={config.global}
              fields={[
                { key: 'retries', label: 'Test Retries', type: 'number', min: 0, max: 5 },
                { key: 'timeout', label: 'Global Timeout (ms)', type: 'number', min: 10000 },
                { key: 'verbose', label: 'Verbose Logging', type: 'checkbox' },
                { key: 'parallel', label: 'Parallel Execution', type: 'checkbox' },
                { key: 'maxConcurrency', label: 'Max Concurrency', type: 'number', min: 1, max: 10 }
              ]}
              onUpdate={(value) => updateConfig('global', value)}
            />
          </div>
        )}
      </div>
    </Layout>
  )
} 