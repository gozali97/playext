import { useState } from 'react'
import { Plus, X, GripVertical } from 'lucide-react'

export default function ArrayInput({ 
  value = [], 
  onChange, 
  placeholder = "Add new item", 
  label = "Items",
  itemType = "text",
  addButtonText = "Add Item"
}) {
  const [newItem, setNewItem] = useState('')

  const addItem = () => {
    if (newItem.trim() && !value.includes(newItem.trim())) {
      const updatedArray = [...value, newItem.trim()]
      onChange(updatedArray)
      setNewItem('')
    }
  }

  const removeItem = (index) => {
    const updatedArray = value.filter((_, i) => i !== index)
    onChange(updatedArray)
  }

  const updateItem = (index, newValue) => {
    const updatedArray = value.map((item, i) => i === index ? newValue : item)
    onChange(updatedArray)
  }

  const moveItem = (fromIndex, toIndex) => {
    const updatedArray = [...value]
    const [movedItem] = updatedArray.splice(fromIndex, 1)
    updatedArray.splice(toIndex, 0, movedItem)
    onChange(updatedArray)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addItem()
    }
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      {/* Existing Items */}
      <div className="space-y-2">
        {value.map((item, index) => (
          <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg border">
            <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
            
            <input
              type={itemType}
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              className="flex-1 text-sm border-0 bg-transparent focus:ring-0 focus:outline-none"
              placeholder={placeholder}
            />
            
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="p-1 text-gray-400 hover:text-danger-600 transition-colors"
              title="Remove item"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Add New Item */}
      <div className="flex items-center space-x-2">
        <input
          type={itemType}
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="flex-1 form-input text-sm"
        />
        <button
          type="button"
          onClick={addItem}
          disabled={!newItem.trim() || value.includes(newItem.trim())}
          className="btn btn-primary text-sm flex items-center space-x-1 px-3 py-2"
        >
          <Plus className="h-3 w-3" />
          <span>{addButtonText}</span>
        </button>
      </div>

      {/* Item Count */}
      <div className="text-xs text-gray-500">
        {value.length} {value.length === 1 ? 'item' : 'items'}
      </div>

      {/* Helper Text */}
      <div className="text-xs text-gray-400">
        Press Enter or click "Add" to add new items. Drag to reorder.
      </div>
    </div>
  )
} 