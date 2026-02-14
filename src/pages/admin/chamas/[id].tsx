import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Users, TrendingUp, Pause, Play } from 'lucide-react';
import { getChamaById, pauseChama, activateChama } from '../../../services/chamaApi';

const ChamaDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [chama, setChama] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (id) {
      fetchChama();
    }
  }, [id]);

  const fetchChama = async () => {
    try {
      setLoading(true);
      const data = await getChamaById(id!);
      setChama(data.chama);
    } catch (error) {
      console.error('Error fetching chama:', error);
      navigate('/admin/chamas');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: 'active' | 'paused') => {
    try {
      if (newStatus === 'active') {
        await activateChama(id!);
      } else {
        await pauseChama(id!);
      }
      fetchChama();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading chama details...</div>
      </div>
    );
  }

  if (!chama) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Chama not found</div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Members',
      value: chama.members?.length || 0,
      icon: <Users className="text-blue-500" size={24} />
    },
    {
      label: 'Weekly Contribution',
      value: `KES ${chama.weeklyContribution?.toLocaleString()}`,
      icon: <TrendingUp className="text-green-500" size={24} />
    },
    {
      label: 'Current Week',
      value: `${chama.currentWeek}/${chama.totalWeeks}`,
      icon: <TrendingUp className="text-purple-500" size={24} />
    },
    {
      label: 'Status',
      value: chama.status.charAt(0).toUpperCase() + chama.status.slice(1),
      icon: null
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/chamas')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{chama.name}</h1>
            <p className="text-gray-600 mt-1">{chama.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/admin/chamas/${id}/edit`)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Edit2 size={20} /> Edit
          </button>
          {chama.status === 'active' ? (
            <button
              onClick={() => handleStatusChange('paused')}
              className="flex items-center gap-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition"
            >
              <Pause size={20} /> Pause
            </button>
          ) : chama.status === 'paused' ? (
            <button
              onClick={() => handleStatusChange('active')}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              <Play size={20} /> Activate
            </button>
          ) : null}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold mt-2">{stat.value}</p>
              </div>
              {stat.icon && <div className="text-3xl">{stat.icon}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-8">
          {['overview', 'members', 'contributions', 'payouts'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-2 font-medium border-b-2 transition ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Group Name</p>
                <p className="text-lg font-semibold">{chama.name}</p>
              </div>
              <div>
                <p className="text-gray-600">Status</p>
                <p className="text-lg font-semibold">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    chama.status === 'active' ? 'bg-green-100 text-green-800' :
                    chama.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {chama.status.charAt(0).toUpperCase() + chama.status.slice(1)}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-gray-600">Total Weeks</p>
                <p className="text-lg font-semibold">{chama.totalWeeks}</p>
              </div>
              <div>
                <p className="text-gray-600">Weekly Contribution</p>
                <p className="text-lg font-semibold">KES {chama.weeklyContribution?.toLocaleString()}</p>
              </div>
            </div>
            <div>
              <p className="text-gray-600">Description</p>
              <p className="text-gray-900 mt-2">{chama.description}</p>
            </div>
            <div>
              <p className="text-gray-600">Created</p>
              <p className="text-gray-900">{new Date(chama.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <button
            onClick={() => navigate(`/admin/chamas/${id}/members`)}
            className="text-blue-600 hover:underline font-medium"
          >
            View Members Management →
          </button>
        )}

        {activeTab === 'contributions' && (
          <button
            onClick={() => navigate(`/admin/chamas/${id}/contributions`)}
            className="text-blue-600 hover:underline font-medium"
          >
            View Contributions Management →
          </button>
        )}

        {activeTab === 'payouts' && (
          <button
            onClick={() => navigate(`/admin/chamas/${id}/payouts`)}
            className="text-blue-600 hover:underline font-medium"
          >
            View Payouts Management →
          </button>
        )}
      </div>
    </div>
  );
};

export default ChamaDetail;
