import React from "react";
import {
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  PauseCircle,
  PlayCircle,
  XCircle,
  Bell,
  RefreshCw,
  Users,
  Square,
} from "lucide-react";
import { PayoutRequest, PayoutFilter } from "../../../types/payout";

interface PayoutsTableProps {
  payouts: PayoutRequest[];
  loading: boolean;
  selectedPayouts: string[];
  processing: string | null;
  pagination: {
    page: number;
    pages: number;
    total: number;
    limit: number;
  };
  filters: PayoutFilter;
  onSelectPayouts: (payouts: string[]) => void;
  onConfirmAction: (
    action: string,
    payoutId?: string,
    message?: string
  ) => void;
  onSendNotification: (
    payoutId: string,
    type: "approval" | "payment" | "rejection" | "reminder"
  ) => void;
  onFiltersChange: (filters: PayoutFilter) => void;
}

const PayoutsTable: React.FC<PayoutsTableProps> = ({
  payouts,
  loading,
  selectedPayouts,
  processing,
  pagination,
  filters,
  onSelectPayouts,
  onConfirmAction,
  onSendNotification,
  onFiltersChange,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "approved":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "on_hold":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-3 w-3" />;
      case "approved":
        return <CheckCircle className="h-3 w-3" />;
      case "paid":
        return <DollarSign className="h-3 w-3" />;
      case "rejected":
        return <XCircle className="h-3 w-3" />;
      case "on_hold":
        return <PauseCircle className="h-3 w-3" />;
      default:
        return <AlertCircle className="h-3 w-3" />;
    }
  };

  const getMethodIcon = (method: string) => {
    return method === "mpesa" ? "📱" : "🏦";
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectPayouts(payouts.map((p) => p._id));
    } else {
      onSelectPayouts([]);
    }
  };

  const handleSelectPayout = (payoutId: string, checked: boolean) => {
    if (checked) {
      onSelectPayouts([...selectedPayouts, payoutId]);
    } else {
      onSelectPayouts(selectedPayouts.filter((id) => id !== payoutId));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={
                    selectedPayouts.length === payouts.length &&
                    payouts.length > 0
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Agent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Method
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Requested
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-gray-400 mb-2" />
                    <span>Loading payouts...</span>
                  </div>
                </td>
              </tr>
            ) : payouts.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center">
                    <Square className="h-8 w-8 text-gray-300 mb-2" />
                    <span>No payouts found</span>
                    <span className="text-sm text-gray-400 mt-1">
                      Try adjusting your filters
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              payouts.map((payout) => (
                <tr
                  key={payout._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedPayouts.includes(payout._id)}
                      onChange={(e) =>
                        handleSelectPayout(payout._id, e.target.checked)
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <Users className="h-4 w-4 text-gray-500" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {payout.agentId.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payout.agentId.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-900">
                      KSh {payout.amount.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className="mr-2 text-lg">
                        {getMethodIcon(payout.method)}
                      </span>
                      <div>
                        <div className="text-sm text-gray-900 capitalize font-medium">
                          {payout.method}
                        </div>
                        <div className="text-xs text-gray-500 font-mono">
                          {payout.accountDetails}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(
                        payout.status
                      )}`}
                    >
                      {getStatusIcon(payout.status)}
                      <span className="ml-1 capitalize">
                        {payout.status.replace("_", " ")}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {new Date(payout.requestedAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(payout.requestedAt).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-1">
                      {payout.status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              onConfirmAction("approve", payout._id)
                            }
                            disabled={processing === payout._id}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded disabled:opacity-50 transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onConfirmAction("hold", payout._id)}
                            disabled={processing === payout._id}
                            className="p-1.5 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded disabled:opacity-50 transition-colors"
                            title="Hold"
                          >
                            <PauseCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() =>
                              onConfirmAction("reject", payout._id)
                            }
                            disabled={processing === payout._id}
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded disabled:opacity-50 transition-colors"
                            title="Reject"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {payout.status === "approved" && (
                        <button
                          onClick={() => onConfirmAction("pay", payout._id)}
                          disabled={processing === payout._id}
                          className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded disabled:opacity-50 transition-colors"
                          title="Mark as Paid"
                        >
                          <DollarSign className="h-4 w-4" />
                        </button>
                      )}
                      {payout.status === "on_hold" && (
                        <button
                          onClick={() => onConfirmAction("release", payout._id)}
                          disabled={processing === payout._id}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded disabled:opacity-50 transition-colors"
                          title="Release Hold"
                        >
                          <PlayCircle className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() =>
                          onSendNotification(payout._id, "reminder")
                        }
                        className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded transition-colors"
                        title="Send Notification"
                      >
                        <Bell className="h-4 w-4" />
                      </button>
                      {processing === payout._id && (
                        <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="text-sm text-gray-700">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              of {pagination.total} results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onFiltersChange({ ...filters, page: 1 })}
                disabled={pagination.page === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                First
              </button>
              <button
                onClick={() =>
                  onFiltersChange({ ...filters, page: pagination.page - 1 })
                }
                disabled={pagination.page === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() =>
                  onFiltersChange({ ...filters, page: pagination.page + 1 })
                }
                disabled={pagination.page === pagination.pages}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
              <button
                onClick={() =>
                  onFiltersChange({ ...filters, page: pagination.pages })
                }
                disabled={pagination.page === pagination.pages}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Last
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayoutsTable;
