import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Tag, AlertCircle, Loader2 } from 'lucide-react';
import Table from '../../../components/admin/Table';
import { Brand } from '../../../types/Brand';
import { getAdminBrands, deleteBrand } from '../../../services/brandApi';

const BrandsPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAdminBrands();
      setBrands(response.data.brands);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch brands');
      console.error('Error fetching brands:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const columns = [
    {
      key: 'name',
      label: 'Brand Name',
      sortable: true,
      render: (value: string, row: Brand) => (
        <div className="flex items-center">
          <img 
            src={row.logo || 'https://images.pexels.com/photos/4439425/pexels-photo-4439425.jpeg?auto=compress&cs=tinysrgb&w=400'} 
            alt={value}
            className="h-10 w-10 rounded-lg object-cover mr-3"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/4439425/pexels-photo-4439425.jpeg?auto=compress&cs=tinysrgb&w=400';
            }}
          />
          <div>
            <p className="font-medium text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{row.description || 'No description'}</p>
          </div>
        </div>
      )
    },
    {
      key: 'website',
      label: 'Website',
      sortable: false,
      render: (value: string) => (
        value ? (
          <a 
            href={value} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            {value.length > 30 ? `${value.substring(0, 30)}...` : value}
          </a>
        ) : (
          <span className="text-gray-400 text-sm">-</span>
        )
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      sortable: true,
      render: (value: boolean) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString()
    }
  ];

  const handleEdit = (brand: Brand) => {
    navigate(`/admin/brands/create?id=${brand._id}`);
  };

const handleDelete = async (brand: Brand) => {
  if (window.confirm(`Are you sure you want to permanently delete "${brand.name}"? This action cannot be undone.`)) {
    try {
      setDeleting(brand._id);
      await deleteBrand(brand._id);
      setBrands(prevBrands => prevBrands.filter(b => b._id !== brand._id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete brand');
      console.error('Error deleting brand:', err);
    } finally {
      setDeleting(null);
    }
  }
};

  if (error) {
    return (
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Brands Management</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Manage product brands</p>
          </div>
          <Link 
            to="/admin/brands/create"
            className="inline-flex items-center justify-center sm:justify-start px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span>Add Brand</span>
          </Link>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-800">{error}</span>
            <button
              onClick={fetchBrands}
              className="ml-auto text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Brands Management</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage product brands</p>
        </div>
        <Link 
          to="/admin/brands/create"
          className="inline-flex items-center justify-center sm:justify-start px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          <span>Add Brand</span>
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <Tag className="h-6 sm:h-8 w-6 sm:w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Total Brands</p>
              <p className="text-lg sm:text-xl font-semibold">
                {loading ? (
                  <Loader2 className="h-4 sm:h-5 w-4 sm:w-5 animate-spin" />
                ) : (
                  brands.length
                )}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <Tag className="h-6 sm:h-8 w-6 sm:w-8 text-green-500 mr-3" />
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Active Brands</p>
              <p className="text-lg sm:text-xl font-semibold">
                {loading ? (
                  <Loader2 className="h-4 sm:h-5 w-4 sm:w-5 animate-spin" />
                ) : (
                  brands.filter(b => b.isActive).length
                )}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <Tag className="h-6 sm:h-8 w-6 sm:w-8 text-red-500 mr-3" />
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Inactive Brands</p>
              <p className="text-lg sm:text-xl font-semibold">
                {loading ? (
                  <Loader2 className="h-4 sm:h-5 w-4 sm:w-5 animate-spin" />
                ) : (
                  brands.filter(b => !b.isActive).length
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Brands Table */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-3" />
            <span className="text-gray-600">Loading brands...</span>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table
            title="All Brands"
            columns={columns}
            data={brands}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      )}
    </div>
  );
};

export default BrandsPage;