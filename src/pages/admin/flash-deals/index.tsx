import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Zap, Calendar, Percent } from 'lucide-react';
import Table from '../../../components/admin/Table';
import { FlashDeal } from '../../../types';
import { getFlashDeals, removeFlashDeal } from '../../../services/dealApi';

const FlashDealsPage: React.FC = () => {
  const navigate = useNavigate();
  const [flashDeals, setFlashDeals] = useState<FlashDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFlashDeals = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getFlashDeals();
        if (response.success) {
          const transformedDeals = response.data.flashDeals.map(deal => ({
            id: deal._id,
            title: deal.product.name,
            description: deal.product.description,
            discount: deal.discount,
            startDate: new Date().toISOString(),
            endDate: deal.flashEndsAt,
            products: [deal.product._id],
            status: (new Date(deal.flashEndsAt) > new Date() ? 'active' : 'expired') as 'active' | 'expired',
            createdAt: deal.createdAt
          }));
          setFlashDeals(transformedDeals);
        } else {
          throw new Error('Failed to fetch flash deals');
        }
      } catch (error: any) {
        console.error('Error fetching flash deals:', error);
        setError(error.message || 'Failed to load flash deals');
      } finally {
        setLoading(false);
      }
    };

    fetchFlashDeals();
  }, []);

  const columns = [
    {
      key: 'title',
      label: 'Deal Title',
      sortable: true,
      render: (value: string, row: FlashDeal) => (
        <div>
          <p className="font-medium text-gray-900 text-sm sm:text-base">{value}</p>
          {row.description && (
            <p className="text-xs sm:text-sm text-gray-500">{row.description}</p>
          )}
        </div>
      )
    },
    {
      key: 'discount',
      label: 'Discount',
      sortable: true,
      render: (value: number) => (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <Percent className="h-3 w-3 mr-1" />
          {value}%
        </span>
      )
    },
    {
      key: 'startDate',
      label: 'Start Date',
      sortable: true,
      render: (value: string) => (
        <span className="text-xs sm:text-sm">
          {new Date(value).toLocaleDateString()}
        </span>
      )
    },
    {
      key: 'endDate',
      label: 'End Date',
      sortable: true,
      render: (value: string) => (
        <span className="text-xs sm:text-sm">
          {new Date(value).toLocaleDateString()}
        </span>
      )
    },
    {
      key: 'products',
      label: 'Products',
      render: (value: string[]) => (
        <span className="text-xs sm:text-sm">
          {value.length} product{value.length !== 1 ? 's' : ''}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value === 'active' ? 'bg-green-100 text-green-800' :
          value === 'expired' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value}
        </span>
      )
    }
  ];

  const handleEdit = (deal: FlashDeal) => {
    navigate(`/admin/flash-deals/create`, {
      state: {
        editData: {
          ...deal,
          productId: deal.products[0]
        }
      }
    });
  };

  const handleDelete = async (deal: FlashDeal) => {
    if (window.confirm(`Are you sure you want to delete "${deal.title}"?`)) {
      try {
        const productId = deal.products[0];
        await removeFlashDeal(productId);
        setFlashDeals(prev => prev.filter(d => d.id !== deal.id));
      } catch (error) {
        console.error('Error deleting flash deal:', error);
        alert('Failed to delete flash deal. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 p-4 sm:p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-red-700 text-sm sm:text-base">{error}</span>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalDeals = flashDeals.length;
  const activeDeals = flashDeals.filter(d => d.status === 'active').length;
  const expiredDeals = flashDeals.filter(d => d.status === 'expired').length;
  const avgDiscount = flashDeals.length > 0 
    ? Math.round(flashDeals.reduce((sum, deal) => sum + deal.discount, 0) / flashDeals.length)
    : 0;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Flash Deals Management</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage promotional flash deals</p>
        </div>
        <Link 
          to="/admin/flash-deals/create"
          className="inline-flex items-center justify-center sm:justify-start px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          <span>Create Flash Deal</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <Zap className="h-6 sm:h-8 w-6 sm:w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Total Deals</p>
              <p className="text-lg sm:text-xl font-semibold">{totalDeals}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <Zap className="h-6 sm:h-8 w-6 sm:w-8 text-green-500 mr-3" />
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Active Deals</p>
              <p className="text-lg sm:text-xl font-semibold">{activeDeals}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <Calendar className="h-6 sm:h-8 w-6 sm:w-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Expired Deals</p>
              <p className="text-lg sm:text-xl font-semibold">{expiredDeals}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <Percent className="h-6 sm:h-8 w-6 sm:w-8 text-purple-500 mr-3" />
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Avg. Discount</p>
              <p className="text-lg sm:text-xl font-semibold">{avgDiscount}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table
          title="All Flash Deals"
          columns={columns}
          data={flashDeals}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default FlashDealsPage;