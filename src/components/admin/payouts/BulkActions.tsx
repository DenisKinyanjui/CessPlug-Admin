import React from 'react';
import { CheckSquare, AlertTriangle } from 'lucide-react';

interface BulkActionsProps {
  selectedCount: number;
  onConfirmAction: (action: string, payoutId?: string, message?: string) => void;
  onClearSelection: () => void;
}

const BulkActions: React.FC<BulkActionsProps> = ({
  selectedCount,
  onConfirmAction,
  onClearSelection
}) => {
  const handleBulkReject = () => {
    // For bulk rejection, we'll show a warning that individual rejection reasons won't be collected
    const message = `Reject ${selectedCount} selected payout(s)? Note: A generic rejection reason will be applied to all selected payouts. For individual rejection reasons, please reject payouts one by one.`;
    onConfirmAction('reject', undefined, message);
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <CheckSquare className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">
            {selectedCount} payout(s) selected
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onConfirmAction('approve', undefined, 
              `Approve ${selectedCount} selected payout(s)?`)}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
          >
            Approve Selected
          </button>
          <button
            onClick={() => onConfirmAction('hold', undefined, 
              `Put ${selectedCount} selected payout(s) on hold?`)}
            className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors"
          >
            Hold Selected
          </button>
          <div className="relative group">
            <button
              onClick={handleBulkReject}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
            >
              Reject Selected
            </button>
            {/* Tooltip for bulk rejection */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
              <div className="flex items-center space-x-1">
                <AlertTriangle className="h-3 w-3" />
                <span>Bulk rejection uses generic reason</span>
              </div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
            </div>
          </div>
          <button
            onClick={onClearSelection}
            className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors"
          >
            Clear Selection
          </button>
        </div>
      </div>
      
      {/* Bulk Action Notice */}
      <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start">
          <AlertTriangle className="h-4 w-4 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-amber-800">
              <span className="font-medium">Bulk Action Notice:</span> For rejections with specific reasons, 
              please process payouts individually. Bulk rejection will apply a generic reason to all selected requests.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkActions;