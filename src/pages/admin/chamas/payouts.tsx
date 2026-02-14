import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { getChamaById } from '../../../services/chamaApi';
import Table from '../../../components/admin/Table';

const ChamaPayoutsManagement = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [chama, setChama] = useState<any>(null);
  const [payouts, setPayouts] = useState<any[]>([]);
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
      const chamaData = await getChamaById(id!);
      setChama(chamaData.chama);
      // Mock payouts data - replace with actual API call
      setPayouts([
        {
          _id: '1',
          week: 1,
          memberName: 'John Doe',
          amount: 5000,
          status: 'completed',
          payoutDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          mpesaRef: 'SGS1234567890'
        },
        {
          _id: '2',
          week: 2,
          memberName: 'Jane Smith',
          amount: 5000,
          status: 'pending',
          payoutDate: null,
          mpesaRef: null
        }
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayouts = payouts.filter(payout =>
    payout.memberName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payout.mpesaRef?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    pending: payouts.filter(p => p.status === 'pending').length,
    completed: payouts.filter(p => p.status === 'completed').length,
    total: (payouts.reduce((sum, p) => sum + (p.amount || 0), 0))
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
      key: 'status',
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
      key: 'mpesaRef',
      label: 'M-Pesa Reference',
      render: (value: string) => value || 'Pending'
    },
    {
      key: 'payoutDate',
      label: 'Date',
      render: (value: Date) => value ? new Date(value).toLocaleDateString() : '-'
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/admin/chamas/${id}`)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payouts</h1>
            <p className="text-gray-600 mt-1">{chama?.name}</p>
          </div>
        </div>
        <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
          <Download size={20} /> Export
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 text-sm">Pending Payouts</p>
          <p className="text-3xl font-bold mt-2">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 text-sm">Completed Payouts</p>
          <p className="text-3xl font-bold mt-2 text-green-600">{stats.completed}</p>
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
              placeholder="Search payouts..."
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
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredPayouts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No payouts found
          </div>
        ) : (
          <Table
            columns={columns}
            data={filteredPayouts}
            title="Payouts"
          />
        )}
      </div>
    </div>
  );
};

export default ChamaPayoutsManagement;
