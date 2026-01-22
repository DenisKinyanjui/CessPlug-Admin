import React from 'react';
import { AlertCircle, Play, Pause } from 'lucide-react';
import { PayoutSettings } from '../../../types/payout';

interface GlobalPayoutControlsProps {
  windowStatus: any;
  settings: PayoutSettings | null;
  isPayoutWindowOpen: boolean;
  onConfirmAction: (action: string, payoutId?: string, message?: string) => void;
}

const GlobalPayoutControls: React.FC<GlobalPayoutControlsProps> = ({
  windowStatus,
  settings,
  isPayoutWindowOpen,
  onConfirmAction
}) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Global Payout Controls</h3>
          <div className="flex flex-wrap items-center gap-4 mt-2">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${isPayoutWindowOpen ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-sm text-gray-600">
                Payout Window: {isPayoutWindowOpen ? 'Open' : 'Closed'}
              </span>
            </div>
            {windowStatus?.payoutSchedule?.enabled && (
              <div className="text-sm text-gray-500">
                Schedule: {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][windowStatus.payoutSchedule.dayOfWeek]}s {windowStatus.payoutSchedule.startTime} - {windowStatus.payoutSchedule.endTime}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onConfirmAction('global-hold', undefined, 
              `Are you sure you want to ${settings?.globalPayoutHold ? 'resume' : 'hold'} all payouts?`)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              settings?.globalPayoutHold
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {settings?.globalPayoutHold ? (
              <>
                <Play className="h-4 w-4" />
                <span>Resume Payouts</span>
              </>
            ) : (
              <>
                <Pause className="h-4 w-4" />
                <span>Hold All Payouts</span>
              </>
            )}
          </button>
        </div>
      </div>

      {settings?.globalPayoutHold && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-700 font-medium">All payouts are currently on hold</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalPayoutControls;