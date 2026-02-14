import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Search } from 'lucide-react';
import { getChamaById, addMemberToChama, removeMemberFromChama } from '../../../services/chamaApi';
import { getAllUsers } from '../../../services/adminApi';
import Table from '../../../components/admin/Table';

const ChamaMembersManagement = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [chama, setChama] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [positionError, setPositionError] = useState('');
  const [usersLoading, setUsersLoading] = useState(false);

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
      // Transform members to flatten the userId object
      const transformedMembers = (data.chama.members || []).map((member: any) => ({
        _id: member._id || member.userId?._id,
        userId: member.userId?._id || member.userId,
        name: member.userId?.name || 'Unknown',
        email: member.userId?.email || '',
        phone: member.userId?.phone || '',
        position: member.position,
        joinedAt: member.joinedAt
      }));
      setMembers(transformedMembers);
    } catch (error) {
      console.error('Error fetching chama:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await getAllUsers();
      // Filter out users already in the chama
      const memberIds = members.map((m: any) => m.userId?._id || m.userId);
      const availableUsers = (response.data?.users || []).filter(
        (user: any) => !memberIds.includes(user._id)
      );
      setAllUsers(availableUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  const openAddMemberModal = () => {
    fetchUsers();
    setShowAddMember(true);
  };

  const handleAddMember = async () => {
    if (!selectedUserId || !selectedPosition) {
      setPositionError('Please select both a member and assign a position');
      return;
    }
    try {
      await addMemberToChama(id!, selectedUserId, selectedPosition);
      setSelectedUserId('');
      setSelectedPosition('');
      setPositionError('');
      setShowAddMember(false);
      fetchChama();
    } catch (error: any) {
      console.error('Error adding member:', error);
      setPositionError(error.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;
    try {
      await removeMemberFromChama(id!, userId);
      fetchChama();
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  const filteredMembers = members.filter(member =>
    member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: 'name',
      label: 'Name'
    },
    {
      key: 'email',
      label: 'Email'
    },
    {
      key: 'phone',
      label: 'Phone'
    },
    {
      key: 'position',
      label: 'Position',
      render: (value?: string) => (
        <span className="px-2 py-1 bg-gray-100 rounded text-sm">
          {value || 'Member'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, member: any) => (
        <button
          onClick={() => handleRemoveMember(member._id || member.id)}
          className="text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
        >
          <Trash2 size={16} /> Remove
        </button>
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/admin/chamas/${id}`)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Members</h1>
            <p className="text-gray-600 mt-1">{chama?.name}</p>
          </div>
        </div>
        <button
          onClick={openAddMemberModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={20} /> Add Member
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600">Total Members</p>
          <p className="text-3xl font-bold mt-2">{members.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600">Active Members</p>
          <p className="text-3xl font-bold mt-2">{members.filter(m => m.status === 'active').length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600">Paid Contributions</p>
          <p className="text-3xl font-bold mt-2">{members.filter(m => m.paidWeeks?.length > 0).length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center gap-2">
          <Search className="text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Add Member to Chama</h2>
            <div className="space-y-4">
              {/* User Selection Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select User</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => {
                    setSelectedUserId(e.target.value);
                    setPositionError('');
                  }}
                  disabled={usersLoading}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- Select a user --</option>
                  {usersLoading ? (
                    <option disabled>Loading users...</option>
                  ) : allUsers.length === 0 ? (
                    <option disabled>No available users</option>
                  ) : (
                    allUsers.map((user: any) => (
                      <option key={user._id} value={user._id}>
                        {user.name} ({user.email})
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Position Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assign Position (1-10)</label>
                <select
                  value={selectedPosition}
                  onChange={(e) => {
                    setSelectedPosition(e.target.value);
                    setPositionError('');
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- Select position --</option>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((pos) => (
                    <option key={pos} value={pos.toString()}>
                      Position {pos}
                    </option>
                  ))}
                </select>
              </div>

              {/* Error Message */}
              {positionError && (
                <div className="p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                  {positionError}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setShowAddMember(false);
                    setSelectedUserId('');
                    setSelectedPosition('');
                    setPositionError('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMember}
                  disabled={!selectedUserId || !selectedPosition}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  Add Member
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredMembers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No members found
          </div>
        ) : (
          <Table
            columns={columns}
            data={filteredMembers}
            title="Members"
          />
        )}
      </div>
    </div>
  );
};

export default ChamaMembersManagement;
