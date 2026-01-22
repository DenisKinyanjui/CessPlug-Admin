import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, FolderOpen, AlertCircle, GripVertical, Save, X } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Category } from '../../../types/Category';
import { getAllCategoriesAdmin, deleteCategory, reorderCategories } from '../../../services/adminApi';

// Sortable Category Row Component
interface SortableCategoryRowProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  deleting: boolean;
  isReorderMode: boolean;
}

const SortableCategoryRow: React.FC<SortableCategoryRowProps> = ({
  category,
  onEdit,
  onDelete,
  deleting,
  isReorderMode
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b border-gray-200 hover:bg-gray-50 ${
        isDragging ? 'bg-blue-50' : ''
      }`}
    >
      {/* Drag Handle */}
      <td className="px-4 sm:px-6 py-4">
        {isReorderMode ? (
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab hover:cursor-grabbing text-gray-400 hover:text-gray-600"
            aria-label="Drag to reorder"
          >
            <GripVertical className="h-5 w-5" />
          </button>
        ) : (
          <div className="w-5" />
        )}
      </td>

      {/* Category Info */}
      <td className="px-4 sm:px-6 py-4">
        <div className="flex items-center">
          <img 
            src={category.image || 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=400'} 
            alt={category.name}
            className="h-8 sm:h-10 w-8 sm:w-10 rounded-lg object-cover mr-3"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=400';
            }}
          />
          <div>
            <p className="font-medium text-gray-900 text-sm sm:text-base">{category.name}</p>
            {category.description && (
              <p className="text-xs sm:text-sm text-gray-500">{category.description}</p>
            )}
            {category.parent && (
              <p className="text-xs text-blue-600">Parent: {category.parent.name}</p>
            )}
          </div>
        </div>
      </td>

      {/* Slug */}
      <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
        <code className="bg-gray-100 px-2 py-1 rounded text-xs sm:text-sm">{category.slug}</code>
      </td>

      {/* Status */}
      <td className="px-4 sm:px-6 py-4">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          category.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {category.status}
        </span>
      </td>

      {/* Created Date */}
      <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-500 hidden md:table-cell">
        {new Date(category.createdAt).toLocaleDateString()}
      </td>

      {/* Actions */}
      <td className="px-4 sm:px-6 py-4">
        {!isReorderMode && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit(category)}
              className="text-blue-600 hover:text-blue-900 text-xs sm:text-sm font-medium"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(category)}
              disabled={deleting}
              className="text-red-600 hover:text-red-900 text-xs sm:text-sm font-medium disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        )}
      </td>
    </tr>
  );
};

const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllCategoriesAdmin();
      
      if (response.success) {
        const sortedCategories = response.data.categories.sort((a, b) => {
          if (a.order !== b.order) {
            return (a.order || 0) - (b.order || 0);
          }
          return a.name.localeCompare(b.name);
        });
        setCategories(sortedCategories);
      } else {
        setError('Failed to fetch categories');
      }
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError(err.response?.data?.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setCategories((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        const newOrder = arrayMove(items, oldIndex, newIndex);
        setHasUnsavedChanges(true);
        return newOrder;
      });
    }
  };

  const saveOrder = async () => {
    try {
      setSaving(true);
      setError(null);

      const categoriesWithOrder = categories.map((category, index) => ({
        id: category.id,
        order: index + 1
      }));

      const response = await reorderCategories(categoriesWithOrder);

      if (response.success) {
        setHasUnsavedChanges(false);
        setIsReorderMode(false);
        await fetchCategories();
      } else {
        setError(response.message || 'Failed to save order');
      }
    } catch (err: any) {
      console.error('Error saving order:', err);
      setError(err.response?.data?.message || 'Failed to save order');
    } finally {
      setSaving(false);
    }
  };

  const cancelReorder = () => {
    setIsReorderMode(false);
    setHasUnsavedChanges(false);
    fetchCategories();
  };

  const handleEdit = (category: Category) => {
    navigate(`/admin/categories/edit/${category.id}`);
  };

  const handleDelete = async (category: Category) => {
    if (window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
      try {
        setDeleting(category.id);
        const response = await deleteCategory(category.id);
        
        if (response.success) {
          await fetchCategories();
        } else {
          setError(response.message || 'Failed to delete category');
        }
      } catch (err: any) {
        console.error('Error deleting category:', err);
        setError(err.response?.data?.message || 'Failed to delete category');
      } finally {
        setDeleting(null);
      }
    }
  };

  // Calculate stats
  const totalCategories = categories.length;
  const activeCategories = categories.filter(c => c.status === 'active').length;
  const inactiveCategories = categories.filter(c => c.status === 'inactive').length;

  if (loading) {
    return (
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Categories Management</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Manage product categories</p>
          </div>
          <Link 
            to="/admin/categories/create"
            className="inline-flex items-center justify-center sm:justify-start px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span>Add Category</span>
          </Link>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading categories...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Categories Management</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage product categories</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {!isReorderMode ? (
            <>
              <button
                onClick={() => setIsReorderMode(true)}
                className="inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors w-full sm:w-auto"
              >
                <GripVertical className="h-4 w-4 mr-2" />
                <span>Reorder</span>
              </button>
              <Link 
                to="/admin/categories/create"
                className="inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span>Add Category</span>
              </Link>
            </>
          ) : (
            <>
              <button
                onClick={cancelReorder}
                className="inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors w-full sm:w-auto"
              >
                <X className="h-4 w-4 mr-2" />
                <span>Cancel</span>
              </button>
              <button
                onClick={saveOrder}
                disabled={!hasUnsavedChanges || saving}
                className="inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                <Save className="h-4 w-4 mr-2" />
                <span>{saving ? 'Saving...' : 'Save Order'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Reorder Mode Notice */}
      {isReorderMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <GripVertical className="h-5 w-5 text-blue-500 mr-2" />
            <span className="text-blue-800 text-sm sm:text-base">
              Reorder mode active. Drag categories to rearrange them, then click "Save Order" to apply changes.
            </span>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-800 text-sm sm:text-base">{error}</span>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FolderOpen className="h-6 sm:h-8 w-6 sm:w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Total Categories</p>
              <p className="text-lg sm:text-xl font-semibold">{totalCategories}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FolderOpen className="h-6 sm:h-8 w-6 sm:w-8 text-green-500 mr-3" />
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Active Categories</p>
              <p className="text-lg sm:text-xl font-semibold">{activeCategories}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FolderOpen className="h-6 sm:h-8 w-6 sm:w-8 text-red-500 mr-3" />
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Inactive Categories</p>
              <p className="text-lg sm:text-xl font-semibold">{inactiveCategories}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-medium text-gray-900">All Categories</h3>
        </div>
        <div className="overflow-x-auto">
          {categories.length === 0 ? (
            <div className="text-center py-8">
              <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No categories found</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {isReorderMode ? 'Drag' : ''}
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Slug
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Created
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <SortableContext
                    items={categories.map(cat => cat.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {categories.map((category) => (
                      <SortableCategoryRow
                        key={category.id}
                        category={category}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        deleting={deleting === category.id}
                        isReorderMode={isReorderMode}
                      />
                    ))}
                  </SortableContext>
                </tbody>
              </table>
            </DndContext>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;