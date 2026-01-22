import React, { useState, useEffect } from 'react';
import { Users, Package, ShoppingCart, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { getDashboardStats } from '../../services/adminApi';

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  monthlyGrowth?: number;
}

interface DashboardResponse {
  success: boolean;
  message?: string;
  data: {
    stats: DashboardStats;
  };
}

interface StatsCardsProps {
  loading?: boolean;
}


const StatsCards: React.FC<StatsCardsProps> = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response: DashboardResponse = await getDashboardStats();
        
        if (response.success && response.data?.stats) {
          setStats(response.data.stats);
        } else {
          throw new Error(response.message || 'Failed to fetch dashboard stats');
        }
      } catch (err: any) {
        console.error('Error fetching dashboard stats:', err);
        setError(err.message || 'Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-4 sm:p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-3 sm:h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 sm:h-8 bg-gray-200 rounded"></div>
              </div>
              <div className="w-8 sm:w-12 h-8 sm:h-12 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="flex items-center">
          <AlertCircle className="h-4 sm:h-5 w-4 sm:w-5 text-red-400 mr-2" />
          <div>
            <h3 className="text-xs sm:text-sm font-medium text-red-800">Error Loading Statistics</h3>
            <p className="text-xs sm:text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!stats) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="flex items-center">
          <AlertCircle className="h-4 sm:h-5 w-4 sm:w-5 text-yellow-400 mr-2" />
          <div>
            <h3 className="text-xs sm:text-sm font-medium text-yellow-800">No Data Available</h3>
            <p className="text-xs sm:text-sm text-yellow-700 mt-1">Dashboard statistics are not available at the moment.</p>
          </div>
        </div>
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Total Products',
      value: stats.totalProducts.toLocaleString(),
      icon: Package,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Total Revenue',
      value: `Ksh ${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    }
  ];

  // Add monthly growth card if available
  if (stats.monthlyGrowth !== undefined) {
    cards.push({
      title: 'Monthly Growth',
      value: `${stats.monthlyGrowth > 0 ? '+' : ''}${stats.monthlyGrowth.toFixed(1)}%`,
      icon: TrendingUp,
      color: stats.monthlyGrowth >= 0 ? 'bg-emerald-500' : 'bg-red-500',
      bgColor: stats.monthlyGrowth >= 0 ? 'bg-emerald-50' : 'bg-red-50',
      textColor: stats.monthlyGrowth >= 0 ? 'text-emerald-600' : 'text-red-600'
    });
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${cards.length === 5 ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-4 sm:gap-6 mb-6 sm:mb-8`}>
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">{card.title}</p>
              <p className="text-base sm:text-lg font-bold text-gray-900">{card.value}</p>
              {card.title === 'Monthly Growth' && (
                <p className="text-[10px] sm:text-xs text-gray-500 mt-1">vs last month</p>
              )}
            </div>
            <div className={`${card.color} p-2 sm:p-3 rounded-full shadow-sm`}>
              <card.icon className="h-4 sm:h-6 w-4 sm:w-6 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;