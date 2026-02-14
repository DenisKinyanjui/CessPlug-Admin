import React, { useState, useEffect } from 'react';
import { PiggyBank, Download, Filter } from 'lucide-react';
import { getChamaPayouts } from '../../../services/payoutApi';
import { ChamaPayout } from '../../../types/payout';

interface ChamaPayoutsSectionProps {
  onExport?: () => void;
}

const ChamaPayoutsSection: React.FC<ChamaPayoutsSectionProps> = ({ onExport }) => {
  const [chamaPayouts, setChamaPayouts] = useState<ChamaPayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadChamaPayouts();
  }, [filter]);

  const loadChamaPayouts = async () => {
    try {
      setLoading(true);
      const response = await getChamaPayouts({
        status: filter !== 'all' ? filter : undefined,
        limit: 10
      });
      if (response.success) {
        setChamaPayouts(response.data);
      }
    } catch (error) {
      console.error('Error loading chama payouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <PiggyBank className="text-purple-600" size={24} />
          <h2 className="text-lg font-semibold text-gray-900">Chama Payouts</h2>
        </div>
        <button
          onClick={onExport}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <Download size={18} /> Export
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="paid">Paid</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chama Group</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Week</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Loading chama payouts...
                </td>
              </tr>
            ) : chamaPayouts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No chama payouts found
                </td>
              </tr>
            ) : (
              chamaPayouts.map((payout) => (
                <tr key={payout._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {payout.chamaId.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {payout.week}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    KES {payout.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div>
                      <div className="font-medium">{payout.recipientId.name}</div>
                      <div className="text-xs text-gray-500">{payout.recipientId.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payout.status)}`}>
                      {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {payout.paymentMethod === 'mpesa' ? '📱 M-Pesa' : '🏦 Bank'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ChamaPayoutsSection;
