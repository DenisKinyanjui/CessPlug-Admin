import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, CheckCircle, AlertCircle } from 'lucide-react';
import { getChamaById, getChamaContributions, markContributionPaid } from '../../../services/chamaApi';
import Table from '../../../components/admin/Table';

const ChamaContributionsManagement = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [chama, setChama] = useState<any>(null);
  const [contributions, setContributions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id, filterStatus]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [chamaData, contributionsData] = await Promise.all([
        getChamaById(id!),
        getChamaContributions(id!, { 
          status: filterStatus !== 'all' ? filterStatus : undefined 
        })
      ]);
      setChama(chamaData.chama);
      setContributions(contributionsData.contributions || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async (contributionId: string) => {
    try {
      await markContributionPaid(contributionId);
      fetchData();
    } catch (error) {
      console.error('Error marking paid:', error);
    }
  };

  const filteredContributions = contributions.filter(contrib =>
    contrib.memberName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contrib.transactionReference?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    pending: contributions.filter(c => c.paymentStatus === 'pending').length,
    completed: contributions.filter(c => c.paymentStatus === 'completed').length,
    failed: contributions.filter(c => c.paymentStatus === 'failed').length,
    total: (contributions.reduce((sum, c) => sum + (c.amount || 0), 0))
  };

  const columns = [
    {
      key: 'week',
      label: 'Week'
    },
    {
      key: 'memberName',
      label: 'Member'
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (value: number) => `KES ${value?.toLocaleString()}`
    },
    {
      key: 'paymentMethod',
      label: 'Method',
      render: (value: string) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
          {value || 'N/A'}
        </span>
      )
    },
    {
      key: 'paymentStatus',
      label: 'Status',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded text-sm flex items-center gap-1 w-fit ${
          value === 'completed' ? 'bg-green-100 text-green-800' :
          value === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {value === 'completed' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, contrib: any) => (
        contrib.paymentStatus !== 'completed' && (
          <button
            onClick={() => handleMarkPaid(contrib._id)}
            className="text-green-600 hover:text-green-800 font-medium text-sm"
          >
            Mark Paid
          </button>
        )
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/admin/chamas/${id}`)}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contributions</h1>
          <p className="text-gray-600 mt-1">{chama?.name}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 text-sm">Total Pending</p>
          <p className="text-3xl font-bold mt-2">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 text-sm">Completed</p>
          <p className="text-3xl font-bold mt-2 text-green-600">{stats.completed}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 text-sm">Failed</p>
          <p className="text-3xl font-bold mt-2 text-red-600">{stats.failed}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 text-sm">Total Amount</p>
          <p className="text-2xl font-bold mt-2">KES {stats.total.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search contributions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredContributions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No contributions found
          </div>
        ) : (
          <Table
            columns={columns}
            data={filteredContributions}
            title="Contributions"
          />
        )}
      </div>
    </div>
  );
};

export default ChamaContributionsManagement;
