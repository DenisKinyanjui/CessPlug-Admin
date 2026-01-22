import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, UserX, Crown } from 'lucide-react';
import Table from '../../../components/admin/Table';
import { User } from '../../../types';
import { getAllUsers, deleteUser } from '../../../services/adminApi';

interface ApiUser {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const UsersPage: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    admins: 0,
    inactive: 0
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      if (response.success) {
        const fetchedUsers = response.data.users.map((user: any) => ({
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          createdAt: user.createdAt,
          status: user.isActive ? 'active' as const : 'inactive' as const
        }));
        
        setUsers(fetchedUsers);
        
        // Calculate stats
        setStats({
          total: response.data.pagination.total,
          active: fetchedUsers.filter(u => u.status === 'active').length,
          admins: fetchedUsers.filter(u => u.role === 'admin').length,
          inactive: fetchedUsers.filter(u => u.status === 'inactive').length
        });
      } else {
        setError(response.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError('An error occurred while fetching users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const columns = [
    {
      key: 'name',
      label: 'User',
      sortable: true,
      render: (value: string, row: User) => (
        <div className="flex items-center">
          <img 
            src={row.avatar || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=400'} 
            alt={value}
            className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover mr-2 sm:mr-3"
          />
          <div className="truncate">
            <p className="font-medium text-gray-900 truncate">{value}</p>
            <p className="text-xs sm:text-sm text-gray-500 truncate">{row.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (value: string) => (
        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
          value === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value === 'admin' && <Crown className="h-3 w-3 mr-1" />}
          {value}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Joined',
      sortable: true,
      render: (value: string) => (
        <span className="whitespace-nowrap">
          {new Date(value).toLocaleDateString()}
        </span>
      )
    }
  ];

  const handleView = (user: User) => {
    navigate(`/admin/users/${user.id}`);
  };

  const handleEdit = (user: User) => {
    console.log('Edit user:', user.id);
  };

  const handleDelete = async (user: User) => {
    if (user.role === 'admin') {
      alert('Cannot delete admin users');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${user.name}"? This action will deactivate the user account.`
    );

    if (!confirmed) return;

    try {
      setDeleteLoading(user.id);
      const response = await deleteUser(user.id);

      if (response.success) {
        alert('User deleted successfully');
        await fetchUsers();
      } else {
        throw new Error(response.message || 'Failed to delete user');
      }
    } catch (err: any) {
      console.error('Error deleting user:', err);
      alert(err.message || 'An error occurred while deleting the user');
    } finally {
      setDeleteLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-4 sm:mx-0">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Users Management</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage user accounts and permissions</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 mr-2 sm:mr-3" />
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Total Users</p>
              <p className="text-lg sm:text-xl font-semibold">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <UserCheck className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 mr-2 sm:mr-3" />
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Active Users</p>
              <p className="text-lg sm:text-xl font-semibold">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <Crown className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500 mr-2 sm:mr-3" />
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Admins</p>
              <p className="text-lg sm:text-xl font-semibold">{stats.admins}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <UserX className="h-6 w-6 sm:h-8 sm:w-8 text-red-500 mr-2 sm:mr-3" />
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Inactive Users</p>
              <p className="text-lg sm:text-xl font-semibold">{stats.inactive}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table
          title="All Users"
          columns={columns}
          data={users}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default UsersPage;