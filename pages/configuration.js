import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import ConfigSection from '../components/ConfigSection'
import { Save, Download, Upload, RotateCcw } from 'lucide-react'
import ArrayInput from '../components/ArrayInput'
import CriticalPathsInput from '../components/CriticalPathsInput'
import E2EScenarioManager from '../components/E2EScenarioManager'

export default function Configuration() {
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [activeTab, setActiveTab] = useState('general')

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

  const updateConfig = (path, value) => {
    const newConfig = { ...config }
    const keys = path.split('.')
    let current = newConfig
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {}
      current = current[keys[i]]
    }
    
    current[keys[keys.length - 1]] = value
    setConfig(newConfig)
  }

  const tabs = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'testing', label: 'Test Types', icon: '🧪' },
    { id: 'e2e-scenarios', label: 'E2E Scenarios', icon: '🎬' },
    { id: 'browser', label: 'Browser', icon: '🌐' },
    { id: 'reporting', label: 'Reporting', icon: '📊' }
  ]

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

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
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
            </div>
          )}

          {activeTab === 'testing' && (
            <div className="space-y-6">
              {/* Test Types Configuration */}
              {Object.entries(config.testTypes || {}).map(([testType, testConfig]) => (
                <ConfigSection
                  key={testType}
                  title={`${testType.toUpperCase()} Tests`}
                  icon="🧪"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={testConfig.enabled || false}
                        onChange={(e) => updateConfig(`testTypes.${testType}.enabled`, e.target.checked)}
                        className="mr-2"
                      />
                      <span className="font-medium">Enable {testType.toUpperCase()} Tests</span>
                    </label>
                  </div>

                  {testConfig.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Test Directory
                        </label>
                        <input
                          type="text"
                          value={testConfig.testDir || ''}
                          onChange={(e) => updateConfig(`testTypes.${testType}.testDir`, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          File Pattern
                        </label>
                        <input
                          type="text"
                          value={testConfig.pattern || ''}
                          onChange={(e) => updateConfig(`testTypes.${testType}.pattern`, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Timeout (ms)
                        </label>
                        <input
                          type="number"
                          value={testConfig.timeout || 30000}
                          onChange={(e) => updateConfig(`testTypes.${testType}.timeout`, parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  )}

                  {/* Special configurations for specific test types */}
                  {testType === 'smoke' && testConfig.enabled && (
                    <div className="mt-4">
                      <CriticalPathsInput
                        paths={testConfig.criticalPaths || []}
                        onChange={(paths) => updateConfig(`testTypes.${testType}.criticalPaths`, paths)}
                      />
                    </div>
                  )}

                  {testType === 'performance' && testConfig.enabled && (
                    <div className="mt-4">
                      <ArrayInput
                        label="Performance Metrics"
                        values={testConfig.metrics || []}
                        onChange={(metrics) => updateConfig(`testTypes.${testType}.metrics`, metrics)}
                        placeholder="Add metric (e.g., loadTime)"
                      />
                    </div>
                  )}
                </ConfigSection>
              ))}
            </div>
          )}

          {activeTab === 'e2e-scenarios' && (
            <E2EScenarioManager 
              config={config}
              onConfigChange={setConfig}
            />
          )}

          {activeTab === 'browser' && (
            <div className="space-y-6">
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

              <ConfigSection
                title="🌐 Browser Viewport"
                description="Konfigurasi ukuran viewport browser"
                config={config.browser?.viewport}
                fields={[
                  { key: 'width', label: 'Viewport Width', type: 'number', min: 800, max: 4096 },
                  { key: 'height', label: 'Viewport Height', type: 'number', min: 600, max: 2160 }
                ]}
                onUpdate={(value) => updateConfig('browser.viewport', value)}
              />
            </div>
          )}

          {activeTab === 'reporting' && (
            <div className="space-y-6">
              <ConfigSection
                title="📊 Reporting Configuration"
                description="Konfigurasi pengaturan laporan"
                config={config.reporting}
                fields={[
                  { key: 'enabled', label: 'Enable Reporting', type: 'checkbox' },
                  { key: 'outputDir', label: 'Output Directory', type: 'text', placeholder: 'reports' },
                  { key: 'formats', label: 'Report Formats', type: 'array', placeholder: 'Add format (json, html, xml)' },
                  { key: 'includeScreenshots', label: 'Include Screenshots', type: 'checkbox' },
                  { key: 'includeVideos', label: 'Include Videos', type: 'checkbox' }
                ]}
                onUpdate={(value) => updateConfig('reporting', value)}
              />
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
} 