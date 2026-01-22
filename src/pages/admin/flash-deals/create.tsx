import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Save, X, Calendar, Percent, Search, Loader2 } from 'lucide-react';
import { getAllProducts } from '../../../services/productApi';
import { createFlashDeal } from '../../../services/dealApi';
import { Product } from '../../../types/Product';

const CreateFlashDealPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = location.state?.editData;
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount: '',
    startDate: '',
    endDate: '',
    products: [] as string[],
    status: 'active'
  });

  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Initialize form data if in edit mode
  useEffect(() => {
    if (isEdit) {
      setFormData({
        title: isEdit.title,
        description: isEdit.description || '',
        discount: isEdit.discount.toString(),
        startDate: isEdit.startDate,
        endDate: isEdit.endDate,
        products: isEdit.products,
        status: isEdit.status || 'active'
      });
    }
  }, [isEdit]);

  // Fetch available products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setProductsLoading(true);
        setProductsError(null);
        
        const response = await getAllProducts({
          status: 'active',
          limit: 100
        });
        
        if (response.success && response.data.products) {
          setAvailableProducts(response.data.products);
          setFilteredProducts(response.data.products);
        } else {
          throw new Error('Failed to fetch products');
        }
      } catch (error: any) {
        console.error('Error fetching products:', error);
        setProductsError(error.message || 'Failed to load products');
        setAvailableProducts([]);
        setFilteredProducts([]);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(availableProducts);
    } else {
      const filtered = availableProducts.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, availableProducts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.title.trim()) {
      alert('Please enter a deal title');
      return;
    }
    
    if (!formData.discount || Number(formData.discount) <= 0 || Number(formData.discount) > 100) {
      alert('Please enter a valid discount percentage (1-100)');
      return;
    }
    
    if (!formData.startDate || !formData.endDate) {
      alert('Please select both start and end dates');
      return;
    }
    
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      alert('End date must be after start date');
      return;
    }
    
    if (formData.products.length === 0) {
      alert('Please select at least one product for the flash deal');
      return;
    }

    try {
      setSubmitting(true);
      
      // Create flash deals for each selected product
      const createPromises = formData.products.map(productId =>
        createFlashDeal({
          productId,
          discount: Number(formData.discount),
          endsAt: formData.endDate
        })
      );
      
      await Promise.all(createPromises);
      
      // Show success message and navigate back
      alert(`Flash deal ${isEdit ? 'updated' : 'created'} successfully!`);
      navigate('/admin/flash-deals');
      
    } catch (error: any) {
      console.error('Error creating flash deal:', error);
      alert(error.message || 'Failed to create flash deal. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleProductToggle = (productId: string) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.includes(productId)
        ? prev.products.filter(id => id !== productId)
        : [...prev.products, productId]
    }));
  };

  const handleSelectAll = () => {
    if (formData.products.length === filteredProducts.length) {
      // Deselect all
      setFormData(prev => ({ ...prev, products: [] }));
    } else {
      // Select all filtered products
      setFormData(prev => ({
        ...prev,
        products: filteredProducts.map(product => product._id)
      }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit Flash Deal' : 'Create New Flash Deal'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEdit ? 'Update flash deal information' : 'Create a new promotional flash deal'}
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/flash-deals')}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={submitting}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Deal Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deal Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter deal title"
                required
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter deal description"
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Percentage *
              </label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.discount}
                  onChange={(e) => setFormData(prev => ({ ...prev, discount: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter discount percentage"
                  required
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={submitting}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Select Products</h2>
            {!productsLoading && filteredProducts.length > 0 && (
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                disabled={submitting}
              >
                {formData.products.length === filteredProducts.length ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>
          
          {/* Search bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search products by name, brand, or category..."
                disabled={submitting || productsLoading}
              />
            </div>
          </div>

          {/* Products loading state */}
          {productsLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600">Loading products...</span>
            </div>
          )}

          {/* Products error state */}
          {productsError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <X className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-red-700">{productsError}</span>
              </div>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Retry loading products
              </button>
            </div>
          )}

          {/* Products list */}
          {!productsLoading && !productsError && (
            <>
              {filteredProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchQuery ? 'No products found matching your search.' : 'No products available.'}
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredProducts.map(product => (
                    <label key={product._id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.products.includes(product._id)}
                        onChange={() => handleProductToggle(product._id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        disabled={submitting}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          {product.images && product.images.length > 0 && (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="h-12 w-12 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {product.name}
                            </p>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              {product.brand?.name && (
                                <span>{product.brand.name}</span>
                              )}
                              {product.category?.name && (
                                <>
                                  <span>•</span>
                                  <span>{product.category.name}</span>
                                </>
                              )}
                              <span>•</span>
                              <span>Ksh {product.price}</span>
                              {product.stock !== undefined && (
                                <>
                                  <span>•</span>
                                  <span>{product.stock} in stock</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              
              <p className="text-sm text-gray-500 mt-4">
                {formData.products.length} of {filteredProducts.length} products selected
                {searchQuery && ` (filtered from ${availableProducts.length} total)`}
              </p>
            </>
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/admin/flash-deals')}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || productsLoading || formData.products.length === 0}
            className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {submitting 
              ? isEdit ? 'Updating...' : 'Creating...' 
              : isEdit 
                ? 'Update Flash Deal' 
                : 'Create Flash Deal'
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateFlashDealPage;