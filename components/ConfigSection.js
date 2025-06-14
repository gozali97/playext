import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

export default function ConfigSection({ title, description, config, fields, onUpdate }) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [localConfig, setLocalConfig] = useState(config)

  const handleFieldChange = (fieldKey, value) => {
    const newConfig = { ...localConfig, [fieldKey]: value }
    setLocalConfig(newConfig)
    onUpdate(newConfig)
  }

  const handleObjectFieldChange = (objectKey, subFieldKey, value) => {
    const newConfig = {
      ...localConfig,
      [objectKey]: {
        ...localConfig[objectKey],
        [subFieldKey]: value
      }
    }
    setLocalConfig(newConfig)
    onUpdate(newConfig)
  }

  const renderField = (field) => {
    const value = localConfig?.[field.key] || ''

    switch (field.type) {
      case 'text':
      case 'url':
      case 'email':
        return (
          <input
            type={field.type}
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className="form-input"
          />
        )

      case 'password':
        return (
          <input
            type="password"
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className="form-input"
          />
        )

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(field.key, parseInt(e.target.value))}
            min={field.min}
            max={field.max}
            className="form-input"
          />
        )

      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleFieldChange(field.key, e.target.checked)}
              className="form-checkbox"
            />
            <span className="ml-2 text-sm text-gray-600">
              {value ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        )

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            className="form-select"
          >
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            className="form-input"
          />
        )

      case 'object':
        return (
          <div className="space-y-4 border border-gray-200 rounded-lg p-4">
            {field.subFields?.map(subField => (
              <div key={subField.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {subField.label}
                  {subField.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {renderSubField(field.key, subField)}
              </div>
            ))}
          </div>
        )

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            className="form-input"
          />
        )
    }
  }

  const renderSubField = (objectKey, subField) => {
    const value = localConfig?.[objectKey]?.[subField.key] || ''

    switch (subField.type) {
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleObjectFieldChange(objectKey, subField.key, parseInt(e.target.value))}
            min={subField.min}
            max={subField.max}
            className="form-input"
          />
        )

      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleObjectFieldChange(objectKey, subField.key, e.target.checked)}
              className="form-checkbox"
            />
            <span className="ml-2 text-sm text-gray-600">
              {value ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        )

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleObjectFieldChange(objectKey, subField.key, e.target.value)}
            className="form-input"
          />
        )
    }
  }

  return (
    <div className="card">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </div>

      {isExpanded && (
        <div className="mt-6 space-y-4">
          {fields.map(field => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {renderField(field)}
              {field.description && (
                <p className="text-xs text-gray-500 mt-1">{field.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 