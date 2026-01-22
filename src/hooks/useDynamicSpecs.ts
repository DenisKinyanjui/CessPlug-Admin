// hooks/useDynamicSpecs.ts - React Hook for Managing Dynamic Specs

import { useState, useCallback, useEffect, useMemo } from 'react';
import { DynamicSpecField, ProductSpecUtils, ProductValidationError } from '../types/Product';

interface UseDynamicSpecsProps {
  initialSpecs?: { [key: string]: string | number } | DynamicSpecField[];
  onSpecsChange?: (specs: { [key: string]: string | number }) => void;
}

interface UseDynamicSpecsReturn {
  specs: DynamicSpecField[];
  specsObject: { [key: string]: string | number };
  addSpec: () => void;
  removeSpec: (id: string) => void;
  updateSpec: (id: string, field: 'name' | 'value', value: string | number) => void;
  setSpecs: (specs: DynamicSpecField[] | { [key: string]: string | number }) => void;
  clearSpecs: () => void;
  errors: ProductValidationError[];
  hasErrors: boolean;
  isEmpty: boolean;
}

export const useDynamicSpecs = ({
  initialSpecs = {},
  onSpecsChange
}: UseDynamicSpecsProps = {}): UseDynamicSpecsReturn => {
  // Initialize specs from props
  const initializeSpecs = useCallback(() => {
    if (Array.isArray(initialSpecs)) {
      return initialSpecs;
    }
    
    if (typeof initialSpecs === 'object' && initialSpecs !== null) {
      return ProductSpecUtils.generateDynamicFields(initialSpecs);
    }
    
    return [];
  }, [initialSpecs]);

  const [specs, setSpecsState] = useState<DynamicSpecField[]>(initializeSpecs);

  // Convert specs array to object format
  const specsObject = useMemo(() => {
    const obj: { [key: string]: string | number } = {};
    specs.forEach(spec => {
      if (spec.name.trim() && spec.value !== undefined && spec.value !== '') {
        obj[spec.name.trim()] = spec.value;
      }
    });
    return obj;
  }, [specs]);

  // Validation
  const errors = useMemo(() => {
    return ProductSpecUtils.validateSpecs(specs);
  }, [specs]);

  const hasErrors = errors.length > 0;
  const isEmpty = specs.length === 0 || specs.every(spec => !spec.name.trim() && !spec.value);

  // Add new spec field
  const addSpec = useCallback(() => {
    const newSpec = ProductSpecUtils.createEmptySpecField();
    setSpecsState(prev => [...prev, newSpec]);
  }, []);

  // Remove spec field
  const removeSpec = useCallback((id: string) => {
    setSpecsState(prev => prev.filter(spec => spec.id !== id));
  }, []);

  // Update spec field
  const updateSpec = useCallback((id: string, field: 'name' | 'value', value: string | number) => {
    setSpecsState(prev =>
      prev.map(spec =>
        spec.id === id
          ? {
              ...spec,
              [field]: value,
              // Auto-detect type based on value
              type: field === 'value' && typeof value === 'number' ? 'number' : 'text'
            }
          : spec
      )
    );
  }, []);

  // Set specs (external update)
  const setSpecs = useCallback((newSpecs: DynamicSpecField[] | { [key: string]: string | number }) => {
    if (Array.isArray(newSpecs)) {
      setSpecsState(newSpecs);
    } else if (typeof newSpecs === 'object' && newSpecs !== null) {
      setSpecsState(ProductSpecUtils.generateDynamicFields(newSpecs));
    }
  }, []);

  // Clear all specs
  const clearSpecs = useCallback(() => {
    setSpecsState([]);
  }, []);

  // Notify parent component of changes
  useEffect(() => {
    if (onSpecsChange) {
      onSpecsChange(specsObject);
    }
  }, [specsObject, onSpecsChange]);

  // Update specs when initialSpecs changes
  useEffect(() => {
    setSpecsState(initializeSpecs());
  }, [initializeSpecs]);

  return {
    specs,
    specsObject,
    addSpec,
    removeSpec,
    updateSpec,
    setSpecs,
    clearSpecs,
    errors,
    hasErrors,
    isEmpty
  };
};

// Additional utility hook for category-based spec suggestions
interface UseCategorySpecSuggestionsProps {
  categoryId?: string;
}

interface UseCategorySpecSuggestionsReturn {
  suggestions: Array<{
    name: string;
    type: 'text' | 'number' | 'select';
    options?: (string | number)[];
    placeholder?: string;
  }>;
  loading: boolean;
  error: string | null;
  addSuggestionAsSpec: (suggestion: any, addSpec: () => void, updateSpec: (id: string, field: 'name' | 'value', value: any) => void) => void;
}

export const useCategorySpecSuggestions = ({
  categoryId
}: UseCategorySpecSuggestionsProps = {}): UseCategorySpecSuggestionsReturn => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For demo purposes - in real implementation, fetch from API
  useEffect(() => {
    if (!categoryId) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    setError(null);

    // Simulate API call with common specs based on category
    const getSpecSuggestions = (catId: string) => {
      const commonSpecs: { [key: string]: any[] } = {
        'electronics': [
          { name: 'Brand', type: 'text', placeholder: 'e.g., Apple, Samsung' },
          { name: 'Model', type: 'text', placeholder: 'e.g., iPhone 15' },
          { name: 'Color', type: 'select', options: ['Black', 'White', 'Blue', 'Red', 'Gold'] },
          { name: 'Warranty', type: 'text', placeholder: 'e.g., 1 year' }
        ],
        'smartphones': [
          { name: 'RAM', type: 'select', options: ['4GB', '6GB', '8GB', '12GB', '16GB'] },
          { name: 'Storage', type: 'select', options: ['64GB', '128GB', '256GB', '512GB', '1TB'] },
          { name: 'Screen Size', type: 'text', placeholder: 'e.g., 6.1 inches' },
          { name: 'Battery', type: 'text', placeholder: 'e.g., 4000mAh' },
          { name: 'Camera', type: 'text', placeholder: 'e.g., 48MP' },
          { name: 'Operating System', type: 'select', options: ['Android', 'iOS'] }
        ],
        'laptops': [
          { name: 'RAM', type: 'select', options: ['8GB', '16GB', '32GB', '64GB'] },
          { name: 'Storage', type: 'select', options: ['256GB SSD', '512GB SSD', '1TB SSD', '2TB SSD'] },
          { name: 'Processor', type: 'text', placeholder: 'e.g., Intel i7, AMD Ryzen 7' },
          { name: 'Graphics', type: 'text', placeholder: 'e.g., NVIDIA RTX 4060' },
          { name: 'Screen Size', type: 'text', placeholder: 'e.g., 15.6 inches' },
          { name: 'Operating System', type: 'select', options: ['Windows 11', 'macOS', 'Ubuntu'] }
        ],
        'clothing': [
          { name: 'Size', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
          { name: 'Material', type: 'text', placeholder: 'e.g., 100% Cotton' },
          { name: 'Color', type: 'select', options: ['Black', 'White', 'Blue', 'Red', 'Green', 'Gray'] },
          { name: 'Care Instructions', type: 'text', placeholder: 'e.g., Machine wash cold' }
        ]
      };

      return commonSpecs[catId.toLowerCase()] || [];
    };

    // Simulate async operation
    setTimeout(() => {
      try {
        const specs = getSpecSuggestions(categoryId);
        setSuggestions(specs);
      } catch (err) {
        setError('Failed to load spec suggestions');
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [categoryId]);

  const addSuggestionAsSpec = useCallback((
    suggestion: any,
    addSpec: () => void,
    updateSpec: (id: string, field: 'name' | 'value', value: any) => void
  ) => {
    addSpec();
    // Note: In a real implementation, you'd need to get the ID of the newly added spec
    // This is a simplified example
    setTimeout(() => {
      const newSpecId = `spec-${Date.now()}`;
      updateSpec(newSpecId, 'name', suggestion.name);
    }, 0);
  }, []);

  return {
    suggestions,
    loading,
    error,
    addSuggestionAsSpec
  };
};

export default useDynamicSpecs;