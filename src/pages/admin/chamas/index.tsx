import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, ChevronRight } from 'lucide-react';
import { getAllChamas, getChamaStats } from '../../../services/chamaApi';
import Table from '../../../components/admin/Table';

const ChamaManagement = () => {
  const navigate = useNavigate();
  const [chamas, setChamas] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchData();
  }, [filterStatus]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [chamasData, statsData] = await Promise.all([
        getAllChamas({ status: filterStatus !== 'all' ? filterStatus : undefined }),
        getChamaStats()
      ]);
      setChamas(chamasData.chamas || []);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching chamas:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredChamas = chamas.filter(chama =>
    chama.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const chamaColumns = [
    { key: 'name', label: 'Group Name' },
    { key: 'members.length', label: 'Members' },
    {
      key: 'weeklyContribution',
      label: 'Weekly Amount',
      render: (value: any) => `KES ${value.toLocaleString()}`
    },
    {
      key: 'currentWeek',
      label: 'Progress',
      render: (value: any, row: any) => `${value}/${row.totalWeeks}`
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          value === 'active' ? 'bg-green-100 text-green-800' :
          value === 'paused' ? 'bg-yellow-100 text-yellow-800' :
          value === 'completed' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: any) => (
        <button
          onClick={() => navigate(`/admin/chamas/${row._id}`)}
          className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
        >
          View <ChevronRight size={16} />
        </button>
      )
    }
  ];

  const statsData = stats ? [
    {
      title: 'Total Groups',
      value: stats.totalChamas || 0,
      icon: '👥',
      color: 'bg-blue-50'
    },
    {
      title: 'Active Groups',
      value: stats.activeChamas || 0,
      icon: '✅',
      color: 'bg-green-50'
    },
    {
      title: 'Total Members',
      value: stats.totalMembers || 0,
      icon: '👫',
      color: 'bg-purple-50'
    },
    {
      title: 'Total Contributions',
      value: `KES ${(stats.totalContributions || 0).toLocaleString()}`,
      icon: '💰',
      color: 'bg-yellow-50'
    }
  ] : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chama Groups</h1>
          <p className="text-gray-600 mt-2">Manage group savings and contributions</p>
        </div>
        <button
          onClick={() => navigate('/admin/chamas/create')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={20} /> New Chama Group
        </button>
      </div>

      {/* Statistics */}
      {statsData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {statsData.map((stat: any, idx: number) => (
            <div key={idx} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className="text-3xl">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search groups..."
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
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading chama groups...</div>
        ) : filteredChamas.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No chama groups found. <button onClick={() => navigate('/admin/chamas/create')} className="text-blue-600">Create one</button>
          </div>
        ) : (
          <Table
            columns={chamaColumns}
            data={filteredChamas}
            title="Chama Groups"
          />
        )}
      </div>
    </div>
  );
};

export default ChamaManagement;
