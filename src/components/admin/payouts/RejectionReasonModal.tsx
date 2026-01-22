// components/admin/payouts/RejectionReasonModal.tsx
import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface RejectionReasonModalProps {
  isOpen: boolean;
  payoutId: string;
  agentName: string;
  amount: number;
  onClose: () => void;
  onConfirm: (payoutId: string, reason: string) => void;
}

const RejectionReasonModal: React.FC<RejectionReasonModalProps> = ({
  isOpen,
  payoutId,
  agentName,
  amount,
  onClose,
  onConfirm
}) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedReason = reason.trim();
    
    if (!trimmedReason || trimmedReason.length < 3) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(payoutId, trimmedReason);
      handleClose();
    } catch (error) {
      console.error('Error rejecting payout:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setIsSubmitting(false);
    onClose();
  };

  const isFormValid = () => {
    return reason.trim().length >= 3 && reason.trim().length <= 500;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] flex flex-col">
        {/* Fixed Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Reject Payout Request</h3>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6">
            {/* Payout Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Payout Details</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Agent:</span> {agentName}</p>
                <p><span className="font-medium">Amount:</span> KSh {amount.toLocaleString()}</p>
                <p><span className="font-medium">Request ID:</span> {payoutId.slice(-8).toUpperCase()}</p>
              </div>
            </div>

            {/* Rejection Reason Input */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Rejection <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                  rows={4}
                  placeholder="Please provide a clear and specific reason for rejecting this payout request. This will be visible to the agent."
                  minLength={3}
                  maxLength={500}
                  required
                />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-gray-500">
                    {reason.trim().length < 3 ? 'Minimum 3 characters required' : 'Provide clear, specific details'}
                  </p>
                  <p className={`text-xs ${reason.length > 450 ? 'text-red-500' : 'text-gray-500'}`}>
                    {reason.length}/500
                  </p>
                </div>
              </div>

              {/* Common reasons as helper text */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm font-medium text-blue-800 mb-1">Common rejection reasons:</p>
                <p className="text-xs text-blue-700">
                  Insufficient documentation, invalid account details,<br/> duplicate request, 
                  policy violation,<br/> account verification required,<br/> exceeds limits, etc.
                </p>
              </div>
            </div>

            {/* Warning Notice */}
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-red-800">Important Notice</h4>
                  <p className="text-sm text-red-700 mt-1">
                    This action will permanently reject the payout request. The agent will be notified 
                    with the rejection reason you provide. This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Fixed Footer with Action Buttons */}
        <div className="flex space-x-3 p-6 pt-4 border-t border-gray-200 flex-shrink-0">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={!isFormValid() || isSubmitting}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Rejecting...' : 'Reject Payout'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectionReasonModal;