import React from 'react';
import { Plus } from 'lucide-react';

interface ProductFormActionsProps {
  loading: boolean;
  isEdit: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}

const ProductFormActions: React.FC<ProductFormActionsProps> = ({
  loading,
  isEdit,
  onCancel,
  onSubmit
}) => {
  return (
    <div className="flex justify-end space-x-4">
      <button
        type="button"
        onClick={onCancel}
        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        disabled={loading}
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onSubmit}
        disabled={loading}
        className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            {isEdit ? 'Updating...' : 'Creating...'}
          </>
        ) : (
          <>
            <Plus className="h-4 w-4 mr-2" />
            {isEdit ? 'Update Product' : 'Create Product'}
          </>
        )}
      </button>
    </div>
  );
};

export default ProductFormActions;