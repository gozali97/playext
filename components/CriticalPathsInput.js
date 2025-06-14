import { useState } from 'react'
import { Plus, X, Globe, AlertCircle, CheckCircle } from 'lucide-react'

export default function CriticalPathsInput({ 
  value = [], 
  onChange, 
  baseUrl = ""
}) {
  const [newPath, setNewPath] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')

  const validatePath = (path) => {
    if (!path) return { valid: false, message: 'Path tidak boleh kosong' }
    if (!path.startsWith('/')) return { valid: false, message: 'Path harus diawali dengan /' }
    if (path.includes(' ')) return { valid: false, message: 'Path tidak boleh mengandung spasi' }
    if (value.includes(path)) return { valid: false, message: 'Path sudah ada dalam daftar' }
    return { valid: true, message: 'Path valid' }
  }

  const addPath = () => {
    const validation = validatePath(newPath.trim())
    if (validation.valid) {
      const updatedArray = [...value, newPath.trim()]
      onChange(updatedArray)
      setNewPath('')
      setPreviewUrl('')
    }
  }

  const removePath = (index) => {
    const updatedArray = value.filter((_, i) => i !== index)
    onChange(updatedArray)
  }

  const updatePath = (index, newValue) => {
    const validation = validatePath(newValue)
    if (validation.valid || newValue === '') {
      const updatedArray = value.map((item, i) => i === index ? newValue : item)
      onChange(updatedArray)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addPath()
    }
  }

  const handleNewPathChange = (e) => {
    const path = e.target.value
    setNewPath(path)
    if (path && baseUrl) {
      setPreviewUrl(baseUrl + (path.startsWith('/') ? path : '/' + path))
    } else {
      setPreviewUrl('')
    }
  }

  const validation = validatePath(newPath.trim())

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Critical Paths</p>
            <p>Daftar URL path yang critical untuk aplikasi Anda. Path ini akan ditest dalam smoke test untuk memastikan fungsionalitas dasar berjalan dengan baik.</p>
            <p className="mt-2 text-xs text-blue-600">
              Contoh: /login, /dashboard, /profile, /api/health, /checkout
            </p>
          </div>
        </div>
      </div>
      
      {/* Existing Paths */}
      <div className="space-y-2">
        {value.map((path, index) => (
          <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
            <div className="flex items-center space-x-2 flex-1">
              <Globe className="h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={path}
                onChange={(e) => updatePath(index, e.target.value)}
                className="flex-1 text-sm border-0 bg-transparent focus:ring-0 focus:outline-none font-mono"
                placeholder="/path"
              />
            </div>
            
            {baseUrl && (
              <div className="text-xs text-gray-500 max-w-xs truncate">
                {baseUrl + path}
              </div>
            )}
            
            <button
              type="button"
              onClick={() => removePath(index)}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="Hapus path"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        
        {value.length === 0 && (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
            <Globe className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Belum ada critical paths</p>
            <p className="text-xs">Tambahkan path yang penting untuk ditest</p>
          </div>
        )}
      </div>

      {/* Add New Path */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <div className="flex-1">
            <input
              type="text"
              value={newPath}
              onChange={handleNewPathChange}
              onKeyPress={handleKeyPress}
              placeholder="Masukkan path baru (contoh: /login)"
              className="w-full form-input text-sm font-mono"
            />
          </div>
          <button
            type="button"
            onClick={addPath}
            disabled={!validation.valid}
            className={`btn text-sm flex items-center space-x-1 px-4 py-2 ${
              validation.valid 
                ? 'btn-primary' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
            }`}
          >
            <Plus className="h-3 w-3" />
            <span>Tambah Path</span>
          </button>
        </div>
        
        {/* Validation Message */}
        {newPath && (
          <div className={`flex items-center space-x-2 text-xs ${
            validation.valid ? 'text-green-600' : 'text-red-600'
          }`}>
            {validation.valid ? (
              <CheckCircle className="h-3 w-3" />
            ) : (
              <AlertCircle className="h-3 w-3" />
            )}
            <span>{validation.message}</span>
          </div>
        )}
        
        {/* Preview URL */}
        {previewUrl && validation.valid && (
          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded border">
            <span className="text-gray-500">Preview:</span> 
            <span className="font-mono ml-1">{previewUrl}</span>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-200">
        <div>
          {value.length} critical {value.length === 1 ? 'path' : 'paths'}
        </div>
        <div className="text-gray-400">
          Press Enter atau klik "Tambah Path"
        </div>
      </div>
    </div>
  )
} 