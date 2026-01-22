import React from 'react';
import { RefreshCw, Filter, Download, Settings } from 'lucide-react';

interface PayoutsHeaderProps {
  windowStatus: any;
  isPayoutWindowOpen: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onToggleFilters: () => void;
  onExport: () => void;
  onShowSettings: () => void;
}

const PayoutsHeader: React.FC<PayoutsHeaderProps> = ({
  windowStatus,
  isPayoutWindowOpen,
  refreshing,
  onRefresh,
  onToggleFilters,
  onExport,
  onShowSettings
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Payouts Management</h1>
        <p className="text-gray-600 mt-1">Manage agent payouts and withdrawal requests</p>
        <div className="mt-2 flex items-center space-x-4">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${isPayoutWindowOpen ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-sm text-gray-600">
              Payout Window: {isPayoutWindowOpen ? 'Open' : 'Closed'}
            </span>
          </div>
          {windowStatus?.nextPayoutWindow && (
            <div className="text-sm text-gray-500">
              Next window: {new Date(windowStatus.nextPayoutWindow).toLocaleString()}
            </div>
          )}
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
        <button
          onClick={onToggleFilters}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
        </button>
        <button
          onClick={onExport}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Export</span>
        </button>
        <button
          onClick={onShowSettings}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
};

export default PayoutsHeader;