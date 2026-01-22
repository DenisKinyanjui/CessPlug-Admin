// src/components/admin/categories/CustomFieldsSection.tsx
import React from 'react';
import { Eye, EyeOff, Plus, GripVertical, Trash2, Info, X } from 'lucide-react';

interface CustomField {
  id: string;
  label: string;
  key: string;
  inputType: 'text' | 'number' | 'select' | 'multi-select' | 'boolean' | 'date';
  options: string[];
  required: boolean;
  showInFilters: boolean;
  showInHighlights: boolean;
  order: number;
}

interface CustomFieldsSectionProps {
  customFields: CustomField[];
  showPreview: boolean;
  setShowPreview: React.Dispatch<React.SetStateAction<boolean>>;
  addCustomField: () => void;
  removeCustomField: (id: string) => void;
  moveField: (id: string, direction: 'up' | 'down') => void;
  handleFieldLabelChange: (id: string, label: string) => void;
  updateCustomField: (id: string, updates: Partial<CustomField>) => void;
  handleOptionsChange: (id: string, optionsString: string) => void;
  validationErrors?: Record<string, string>;
  disabled?: boolean;
}

const PreviewField = ({ field }: { field: CustomField }) => {
  const renderInput = () => {
    switch (field.inputType) {
      case 'text':
        return (
          <input 
            type="text" 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" 
            placeholder={`Enter ${field.label.toLowerCase()}`} 
            disabled 
          />
        );
      case 'number':
        return (
          <input 
            type="number" 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" 
            placeholder={`Enter ${field.label.toLowerCase()}`} 
            disabled 
          />
        );
      case 'select':
        return (
          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" disabled>
            <option value="">Select {field.label.toLowerCase()}</option>
            {field.options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'multi-select':
        return (
          <div className="space-y-2 p-3 border border-gray-300 rounded-lg bg-gray-50">
            {field.options.map(option => (
              <label key={option} className="flex items-center text-sm">
                <input type="checkbox" className="mr-2 rounded" disabled />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );
      case 'boolean':
        return (
          <label className="flex items-center">
            <input type="checkbox" className="mr-2 rounded" disabled />
            <span className="text-sm text-gray-700">Yes</span>
          </label>
        );
      case 'date':
        return (
          <input 
            type="date" 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" 
            disabled 
          />
        );
      default:
        return (
          <input 
            type="text" 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" 
            disabled 
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
        <div className="flex items-center space-x-2 mt-1">
          {field.showInFilters && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Filter
            </span>
          )}
          {field.showInHighlights && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Highlight
            </span>
          )}
        </div>
      </label>
      {renderInput()}
    </div>
  );
};

const CustomFieldsSection: React.FC<CustomFieldsSectionProps> = ({
  customFields,
  showPreview,
  setShowPreview,
  addCustomField,
  removeCustomField,
  moveField,
  handleFieldLabelChange,
  updateCustomField,
  handleOptionsChange,
  validationErrors = {},
  disabled = false,
}) => {
  return (
    <>
      {/* Custom Fields Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Custom Fields</h2>
            <p className="text-sm text-gray-500 mt-1">
              Define additional product attributes specific to this category
            </p>
          </div>
          <div className="flex space-x-2">
            {customFields.length > 0 && (
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="inline-flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={disabled}
              >
                {showPreview ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
            )}
            <button
              type="button"
              onClick={addCustomField}
              className="inline-flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={disabled}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Field
            </button>
          </div>
        </div>

        {customFields.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No custom fields yet</h3>
              <p className="text-gray-500 mb-4 max-w-md">
                Custom fields help you capture specific product information like size, color, material, or technical specifications.
              </p>
              <button
                type="button"
                onClick={addCustomField}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={disabled}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Field
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {customFields.map((field, index) => {
              const fieldErrorPrefix = `customField_${index}`;
              const labelError = validationErrors?.[`${fieldErrorPrefix}_label`];
const keyError = validationErrors?.[`${fieldErrorPrefix}_key`];
const optionsError = validationErrors?.[`${fieldErrorPrefix}_options`];

              return (
                <div key={field.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                      <div>
                        <span className="text-sm font-medium text-gray-700">Field {index + 1}</span>
                        {field.label && (
                          <span className="text-sm text-gray-500 ml-2">({field.label})</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => moveField(field.id, 'up')}
                        disabled={index === 0 || disabled}
                        className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveField(field.id, 'down')}
                        disabled={index === customFields.length - 1 || disabled}
                        className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => removeCustomField(field.id)}
                        className="text-red-600 hover:text-red-700 p-1 rounded disabled:opacity-50"
                        disabled={disabled}
                        title="Remove field"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Field Label *
                      </label>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => handleFieldLabelChange(field.id, e.target.value)}
                        className={`w-full px-3 py-2 border ${
                          labelError ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white`}
                        placeholder="e.g., Size, Color, Material"
                        disabled={disabled}
                      />
                      {labelError && (
                        <p className="mt-1 text-sm text-red-600">{labelError}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Field Key *
                        <Info className="inline h-3 w-3 ml-1 text-gray-400" aria-label="Auto-generated from label" />
                      </label>
                      <input
                        type="text"
                        value={field.key}
                        onChange={(e) => updateCustomField(field.id, { key: e.target.value })}
                        className={`w-full px-3 py-2 border ${
                          keyError ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white`}
                        placeholder="e.g., size, color, material"
                        disabled={disabled}
                      />
                      {keyError && (
                        <p className="mt-1 text-sm text-red-600">{keyError}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        Used for data storage (lowercase, underscores only)
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Input Type *
                      </label>
                      <select
                        value={field.inputType}
                        onChange={(e) => updateCustomField(field.id, { 
                          inputType: e.target.value as CustomField['inputType']
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        disabled={disabled}
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="select">Select (Single Choice)</option>
                        <option value="multi-select">Multi-Select (Multiple Choices)</option>
                        <option value="boolean">Boolean (Yes/No)</option>
                        <option value="date">Date</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Display Order
                      </label>
                      <input
                        type="number"
                        value={field.order}
                        onChange={(e) => updateCustomField(field.id, { order: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        min="1"
                        disabled={disabled}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Order in which this field appears in forms
                      </p>
                    </div>
                  </div>

                  {(field.inputType === 'select' || field.inputType === 'multi-select') && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Options *
                        <span className="text-xs font-normal text-gray-500 ml-1">
                          (separate with commas)
                        </span>
                      </label>
                      <input
                        type="text"
                        value={field.options.join(', ')}
                        onChange={(e) => handleOptionsChange(field.id, e.target.value)}
                        className={`w-full px-3 py-2 border ${
                          optionsError ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white`}
                        placeholder="Small, Medium, Large"
                        disabled={disabled}
                      />
                      {optionsError && (
                        <p className="mt-1 text-sm text-red-600">{optionsError}</p>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-200">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => updateCustomField(field.id, { required: e.target.checked })}
                        className="mr-2 rounded"
                        disabled={disabled}
                      />
                      <span className="text-sm text-gray-700">Required Field</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={field.showInFilters}
                        onChange={(e) => updateCustomField(field.id, { showInFilters: e.target.checked })}
                        className="mr-2 rounded"
                        disabled={disabled}
                      />
                      <span className="text-sm text-gray-700">Show in Product Filters</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={field.showInHighlights}
                        onChange={(e) => updateCustomField(field.id, { showInHighlights: e.target.checked })}
                        className="mr-2 rounded"
                        disabled={disabled}
                      />
                      <span className="text-sm text-gray-700">Show in Product Highlights</span>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Preview Section */}
      {showPreview && customFields.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Product Form Preview</h2>
            <button
              type="button"
              onClick={() => setShowPreview(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-md font-medium text-gray-800 mb-4">
              How these fields will appear when adding products:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customFields
                .sort((a, b) => a.order - b.order)
                .map(field => (
                  <PreviewField key={field.id} field={field} />
                ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomFieldsSection;