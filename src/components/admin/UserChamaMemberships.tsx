import React from 'react';
import { PiggyBank, Users, TrendingUp, Calendar } from 'lucide-react';
import { ChamaMembership } from '../../types/User';

interface UserChamaMembershipsProps {
  memberships?: ChamaMembership[];
}

const UserChamaMemberships: React.FC<UserChamaMembershipsProps> = ({ memberships }) => {
  if (!memberships || memberships.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <PiggyBank size={20} className="text-purple-600" />
          Chama Group Memberships
        </h3>
        <div className="text-center py-8">
          <PiggyBank size={40} className="text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">Not a member of any chama groups yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <PiggyBank size={20} className="text-purple-600" />
        Chama Group Memberships ({memberships.length})
      </h3>

      <div className="space-y-4">
        {memberships.map((membership, idx) => (
          <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900">{membership.chamaName}</h4>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    Joined {new Date(membership.joinedAt).toLocaleDateString()}
                  </span>
                  {membership.position && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                      {membership.position.charAt(0).toUpperCase() + membership.position.slice(1)}
                    </span>
                  )}
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    membership.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {membership.status?.charAt(0).toUpperCase() + (membership.status?.slice(1) || 'active')}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <TrendingUp size={14} />
                  Contributions Paid
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  {membership.contributionsPaid || 0}
                  <span className="text-sm text-gray-600 ml-1">
                    / {membership.totalContributions || 0}
                  </span>
                </div>
                <div className="text-xs text-blue-700 mt-1">
                  {membership.totalContributions ? 
                    `${Math.round(((membership.contributionsPaid || 0) / membership.totalContributions) * 100)}% complete` 
                    : 'No data'}
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Users size={14} />
                  Group Status
                </div>
                <div className="text-2xl font-bold text-purple-900">
                  Active
                </div>
                <div className="text-xs text-purple-700 mt-1">Member</div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <PiggyBank size={14} />
                  Weeks Paid
                </div>
                <div className="text-2xl font-bold text-green-900">
                  {membership.paidWeeks?.length || 0}
                </div>
                <div className="text-xs text-green-700 mt-1">
                  {membership.paidWeeks?.length ? `Weeks: ${membership.paidWeeks.slice(0, 3).join(', ')}${membership.paidWeeks.length > 3 ? '...' : ''}` : 'No payments'}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            {membership.totalContributions && membership.totalContributions > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-gray-600">Overall Contribution Progress</span>
                  <span className="text-xs font-semibold text-gray-900">
                    {Math.round(((membership.contributionsPaid || 0) / membership.totalContributions) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, ((membership.contributionsPaid || 0) / membership.totalContributions) * 100)}%`
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserChamaMemberships;
