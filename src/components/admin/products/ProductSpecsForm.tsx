import React, { useState, useRef } from "react";
import { Plus, Trash2 } from "lucide-react";

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice: number;
  category: string;
  brand: string;
  stock: number;
  tags: string[];
  images: string[];
  specifications: { [key: string]: any };
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  status: "active" | "inactive";
}

interface ProductSpecsFormProps {
  formData: ProductFormData;
  errors: { [key: string]: string };
  loading: boolean;
  onSpecificationChange: (specifications: { [key: string]: string }) => void;
}

// Predefined common specification names for suggestions
const COMMON_SPECS = [
  "RAM",
  "Storage",
  "Screen Size",
  "Processor",
  "Graphics Card",
  "Operating System",
  "Color",
  "Weight",
  "Dimensions",
  "Battery Life",
  "Camera",
  "Display Type",
  "Connectivity",
  "Warranty",
  "Material",
  "Size",
  "Brand",
  "Model",
  "Power",
  "Capacity",
];

const ProductSpecsForm: React.FC<ProductSpecsFormProps> = ({
  formData,
  errors,
  loading,
  onSpecificationChange,
}) => {
  const [newSpecName, setNewSpecName] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Convert specifications object to array for easier manipulation
  const specsArray = Object.entries(formData.specifications || {});

  // Filter suggestions based on current input
  const filteredSuggestions = COMMON_SPECS.filter(
    (spec) =>
      spec.toLowerCase().includes(newSpecName.toLowerCase()) &&
      !formData.specifications.hasOwnProperty(spec)
  );

  const handleAddSpec = () => {
    const trimmedName = newSpecName.trim();
    const trimmedValue = newSpecValue.trim();

    if (trimmedName && trimmedValue) {
      const updatedSpecs = {
        ...formData.specifications,
        [trimmedName]: trimmedValue,
      };

      onSpecificationChange(updatedSpecs);
      setNewSpecName("");
      setNewSpecValue("");
      setShowSuggestions(false);
    }
  };

  const handleRemoveSpec = (specName: string) => {
    const { [specName]: removed, ...updatedSpecs } = formData.specifications;
    onSpecificationChange(updatedSpecs);
  };

  const handleUpdateSpec = (
    oldName: string,
    newName: string,
    newValue: string
  ) => {
    if (!newName.trim() || !newValue.trim()) return;

    const updatedSpecs = { ...formData.specifications };

    // If name changed, remove old key and add new one
    if (oldName !== newName.trim()) {
      delete updatedSpecs[oldName];
    }

    updatedSpecs[newName.trim()] = newValue.trim();
    onSpecificationChange(updatedSpecs);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setNewSpecName(suggestion);
    setShowSuggestions(false);
    // Focus back to the value input after selecting suggestion
    setTimeout(() => {
      const valueInput = document.querySelector(
        'input[placeholder="e.g., 8GB, 512GB SSD, Black"]'
      ) as HTMLInputElement;
      if (valueInput) {
        valueInput.focus();
      }
    }, 100);
  };

  const handleInputChange = (value: string) => {
    setNewSpecName(value);
    setShowSuggestions(value.length > 0 && filteredSuggestions.length > 0);
  };

  const handleInputFocus = () => {
    setShowSuggestions(
      newSpecName.length > 0 && filteredSuggestions.length > 0
    );
  };

  const handleInputBlur = (e: React.FocusEvent) => {
    // Only hide suggestions if the focus is not moving to the suggestions dropdown
    if (!suggestionsRef.current?.contains(e.relatedTarget as Node)) {
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSpec();
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Product Specifications
      </h2>
      <p className="text-sm text-gray-600 mb-6">
        Add key specifications for this product to help customers make informed
        decisions and enable better filtering.
      </p>

      {/* Existing Specifications */}
      {specsArray.length > 0 && (
        <div className="space-y-3 mb-6">
          <h3 className="text-md font-medium text-gray-800 mb-3">
            Current Specifications
          </h3>
          {specsArray.map(([name, value], index) => (
            <SpecificationRow
              key={`${name}-${index}`}
              name={name}
              value={value}
              onUpdate={handleUpdateSpec}
              onRemove={handleRemoveSpec}
              loading={loading}
            />
          ))}
        </div>
      )}

      {/* Add New Specification */}
      <div className="border-t pt-6">
        <h3 className="text-md font-medium text-gray-800 mb-3">
          Add New Specification
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          {/* Spec Name Input with Suggestions */}
          <div className="md:col-span-2 relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specification Name
            </label>
            <input
              ref={inputRef}
              type="text"
              value={newSpecName}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., RAM, Storage, Color"
              disabled={loading}
              autoComplete="off"
            />

            {/* Suggestions Dropdown */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto"
              >
                {filteredSuggestions.slice(0, 8).map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                    }}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-3 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none first:rounded-t-lg last:rounded-b-lg transition-colors"
                  >
                    <span className="text-sm text-gray-900">{suggestion}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Spec Value Input */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Value
            </label>
            <input
              type="text"
              name="specValue"
              value={newSpecValue}
              onChange={(e) => setNewSpecValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 8GB, 512GB SSD, Black"
              disabled={loading}
              autoComplete="on"
            />
          </div>

          {/* Add Button */}
          <div className="md:col-span-1">
            <button
              type="button"
              onClick={handleAddSpec}
              disabled={!newSpecName.trim() || !newSpecValue.trim() || loading}
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {errors.specifications && (
        <p className="text-sm text-red-500 mt-2">{errors.specifications}</p>
      )}

      {/* Help Text */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          Tips for Better Specifications
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>
            • Use consistent naming (e.g., always "RAM" not "Memory" or "ram")
          </li>
          <li>
            • Include units where relevant (e.g., "8GB", "15.6 inches", "2.5
            kg")
          </li>
          <li>
            • These specifications will help customers filter and compare
            products
          </li>
        </ul>
      </div>
    </div>
  );
};

// Individual Specification Row Component
interface SpecificationRowProps {
  name: string;
  value: string;
  onUpdate: (oldName: string, newName: string, newValue: string) => void;
  onRemove: (name: string) => void;
  loading: boolean;
}

const SpecificationRow: React.FC<SpecificationRowProps> = ({
  name,
  value,
  onUpdate,
  onRemove,
  loading,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    if (editName.trim() && editValue.trim()) {
      onUpdate(name, editName.trim(), editValue.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditName(name);
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
        <input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent"
          placeholder="Spec name"
          autoFocus
        />
        <span className="text-gray-400">:</span>
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent"
          placeholder="Value"
        />
        <div className="flex space-x-1">
          <button
            type="button"
            onClick={handleSave}
            className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            disabled={loading}
          >
            Save
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors">
      <div className="flex items-center space-x-3">
        <span className="font-medium text-gray-900 text-sm">{name}</span>
        <span className="text-gray-400">:</span>
        <span className="text-gray-700 text-sm">{value}</span>
      </div>
      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="text-blue-600 hover:text-blue-800 text-xs font-medium"
          disabled={loading}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onRemove(name)}
          className="text-red-500 hover:text-red-700"
          disabled={loading}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ProductSpecsForm;
