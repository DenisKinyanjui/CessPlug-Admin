import React, { useState, useEffect } from 'react';

// Import the real API functions and types
import {
  getAllPayouts,
  getPayoutStats,
  getPayoutSettings,
  updatePayoutSettings,
  processPayoutRequest,
  bulkProcessPayouts,
  setGlobalPayoutHold,
  checkPayoutWindow,
  exportPayoutData,
  sendPayoutNotification
} from '../../../services/payoutApi';

import {
  PayoutRequest,
  PayoutStats,
  PayoutSettings,
  PayoutFilter,
  ProcessPayoutRequest
} from '../../../types/payout';

// Import components
import PayoutsHeader from '../../../components/admin/payouts/PayoutsHeader';
import PayoutsStats from '../../../components/admin/payouts/PayoutsStats';
import GlobalPayoutControls from '../../../components/admin/payouts/GlobalPayoutControls';
import PayoutsFilters from '../../../components/admin/payouts/PayoutsFilters';
import BulkActions from '../../../components/admin/payouts/BulkActions';
import PayoutsTable from '../../../components/admin/payouts/PayoutsTable';
import ConfirmationDialog from '../../../components/admin/payouts/ConfirmationDialog';
import PayoutSettingsModal from '../../../components/admin/payouts/PayoutSettingsModal';
import NotificationBanner from '../../../components/admin/payouts/NotificationBanner';
import RejectionReasonModal from '../../../components/admin/payouts/RejectionReasonModal';

const PayoutsManagement: React.FC = () => {
  // State management with proper TypeScript types
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [stats, setStats] = useState<PayoutStats | null>(null);
  const [settings, setSettings] = useState<PayoutSettings | null>(null);
  const [windowStatus, setWindowStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPayouts, setSelectedPayouts] = useState<string[]>([]);
  const [filters, setFilters] = useState<PayoutFilter>({
    page: 1,
    limit: 20,
    status: ''
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState<{
    isOpen: boolean;
    action: string;
    payoutId?: string;
    message: string;
  }>({ isOpen: false, action: '', message: '' });
  const [showRejectionModal, setShowRejectionModal] = useState<{
    isOpen: boolean;
    payoutId: string;
    agentName: string;
    amount: number;
  }>({ isOpen: false, payoutId: '', agentName: '', amount: 0 });
  const [processing, setProcessing] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
  } | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 20
  });

  // Load initial data
  useEffect(() => {
    loadAllData();
  }, [filters]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && !refreshing) {
        refreshData();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [loading, refreshing]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadPayouts(),
        loadStats(),
        loadSettings(),
        loadWindowStatus()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      showNotification('error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadPayouts(),
        loadStats(),
        loadWindowStatus()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const loadPayouts = async () => {
    try {
      const response = await getAllPayouts(filters);
      if (response.success) {
        setPayouts(response.data.payoutRequests);
        setPagination(response.data.pagination);
      } else {
        throw new Error(response.message || 'Failed to load payouts');
      }
    } catch (error: any) {
      console.error('Error loading payouts:', error);
      showNotification('error', error.message || 'Failed to load payouts');
    }
  };

  const loadStats = async () => {
    try {
      const response = await getPayoutStats();
      if (response.success) {
        setStats(response.data);
      } else {
        throw new Error(response.message || 'Failed to load stats');
      }
    } catch (error: any) {
      console.error('Error loading stats:', error);
      showNotification('error', error.message || 'Failed to load statistics');
    }
  };

  const loadSettings = async () => {
    try {
      const response = await getPayoutSettings();
      if (response.success) {
        setSettings(response.data);
      } else {
        throw new Error(response.message || 'Failed to load settings');
      }
    } catch (error: any) {
      console.error('Error loading settings:', error);
      // Don't show error notification for settings as it might not be implemented yet
      console.warn('Settings endpoint might not be implemented yet');
    }
  };

  const loadWindowStatus = async () => {
    try {
      const response = await checkPayoutWindow();
      if (response.success) {
        setWindowStatus(response.data);
      } else {
        // Handle case where success is false but no message property exists
        console.warn('Failed to load window status');
      }
    } catch (error: any) {
      console.error('Error loading window status:', error);
      // Don't show error notification for window status as it might not be implemented yet
      console.warn('Window status endpoint might not be implemented yet');
    }
  };

  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const confirmAction = (action: string, payoutId?: string, message?: string) => {
    // Handle rejection differently - show rejection modal instead of confirmation dialog
    if (action === 'reject' && payoutId) {
      const payout = payouts.find(p => p._id === payoutId);
      if (payout) {
        setShowRejectionModal({
          isOpen: true,
          payoutId,
          agentName: payout.agentId.name,
          amount: payout.amount
        });
        return;
      }
    }

    setShowConfirmDialog({
      isOpen: true,
      action,
      payoutId,
      message: message || `Are you sure you want to ${action} this payout?`
    });
  };

  const handleConfirmedAction = async () => {
    const { action, payoutId } = showConfirmDialog;
    setShowConfirmDialog({ isOpen: false, action: '', message: '' });

    try {
      if (action === 'global-hold') {
        await handleGlobalHold();
      } else if (payoutId) {
        await handleProcessPayout(payoutId, { action: action as ProcessPayoutRequest['action'] });
      } else if (selectedPayouts.length > 0) {
        await handleBulkAction(action);
      }
    } catch (error) {
      console.error('Error processing action:', error);
      showNotification('error', 'Failed to process action');
    }
  };

  const handleRejectionConfirm = async (payoutId: string, rejectionReason: string) => {
    try {
      await handleProcessPayout(payoutId, { 
        action: 'reject', 
        rejectionReason 
      });
    } catch (error) {
      console.error('Error rejecting payout:', error);
      throw error; // Re-throw to be handled by the modal
    }
  };

  const handleProcessPayout = async (payoutId: string, actionData: ProcessPayoutRequest) => {
    try {
      setProcessing(payoutId);
      const response = await processPayoutRequest(payoutId, actionData);
      
      if (response.success) {
        showNotification('success', response.message || 'Payout processed successfully');
        await refreshData();
      } else {
        throw new Error(response.message || 'Failed to process payout');
      }
    } catch (error: any) {
      console.error('Error processing payout:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to process payout';
      showNotification('error', errorMessage);
    } finally {
      setProcessing(null);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedPayouts.length === 0) return;
    
    try {
      const response = await bulkProcessPayouts({
        payoutIds: selectedPayouts,
        action: action as ProcessPayoutRequest['action']
      });
      
      if (response.success) {
        showNotification('success', response.message || 'Bulk action completed successfully');
        setSelectedPayouts([]);
        await refreshData();
      } else {
        throw new Error(response.message || 'Failed to process payouts');
      }
    } catch (error: any) {
      console.error('Error processing bulk action:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to process payouts';
      showNotification('error', errorMessage);
    }
  };

  const handleGlobalHold = async () => {
    try {
      const newHoldStatus = !settings?.globalPayoutHold;
      const response = await setGlobalPayoutHold(newHoldStatus);
      
      if (response.success) {
        showNotification('success', response.message || 'Global hold updated successfully');
        await loadSettings();
      } else {
        throw new Error(response.message || 'Failed to update global hold');
      }
    } catch (error: any) {
      console.error('Error updating global hold:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update global hold';
      showNotification('error', errorMessage);
    }
  };

  const exportData = async () => {
    try {
      showNotification('info', 'Preparing export...');
      const blob = await exportPayoutData(filters);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payouts-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      showNotification('success', 'Export completed successfully');
    } catch (error: any) {
      console.error('Error exporting data:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to export data';
      showNotification('error', errorMessage);
    }
  };

  const sendNotification = async (payoutId: string, type: 'approval' | 'payment' | 'rejection' | 'reminder') => {
    try {
      const response = await sendPayoutNotification(payoutId, type);
      if (response.success) {
        showNotification('success', response.message || 'Notification sent successfully');
      } else {
        throw new Error(response.message || 'Failed to send notification');
      }
    } catch (error: any) {
      console.error('Error sending notification:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send notification';
      showNotification('error', errorMessage);
    }
  };

  const isPayoutWindowOpen = windowStatus?.isPayoutWindowOpen ?? true;

  return (
    <div className="min-h-screen bg-gray-50">
      <NotificationBanner 
        notification={notification}
        onClose={() => setNotification(null)}
      />

      <div className="p-6 space-y-6">
        <PayoutsHeader
          windowStatus={windowStatus}
          isPayoutWindowOpen={isPayoutWindowOpen}
          refreshing={refreshing}
          onRefresh={refreshData}
          onToggleFilters={() => setShowFilters(!showFilters)}
          onExport={exportData}
          onShowSettings={() => setShowSettings(!showSettings)}
        />

        <PayoutsStats stats={stats} />

        <GlobalPayoutControls
          windowStatus={windowStatus}
          settings={settings}
          isPayoutWindowOpen={isPayoutWindowOpen}
          onConfirmAction={confirmAction}
        />

        {showFilters && (
          <PayoutsFilters
            filters={filters}
            onFiltersChange={setFilters}
          />
        )}

        {selectedPayouts.length > 0 && (
          <BulkActions
            selectedCount={selectedPayouts.length}
            onConfirmAction={confirmAction}
            onClearSelection={() => setSelectedPayouts([])}
          />
        )}

        <PayoutsTable
          payouts={payouts}
          loading={loading}
          selectedPayouts={selectedPayouts}
          processing={processing}
          pagination={pagination}
          onSelectPayouts={setSelectedPayouts}
          onConfirmAction={confirmAction}
          onSendNotification={sendNotification}
          onFiltersChange={setFilters}
          filters={filters}
        />

        {showConfirmDialog.isOpen && (
          <ConfirmationDialog
            dialog={showConfirmDialog}
            onConfirm={handleConfirmedAction}
            onCancel={() => setShowConfirmDialog({ isOpen: false, action: '', message: '' })}
          />
        )}

        {showRejectionModal.isOpen && (
          <RejectionReasonModal
            isOpen={showRejectionModal.isOpen}
            payoutId={showRejectionModal.payoutId}
            agentName={showRejectionModal.agentName}
            amount={showRejectionModal.amount}
            onClose={() => setShowRejectionModal({ isOpen: false, payoutId: '', agentName: '', amount: 0 })}
            onConfirm={handleRejectionConfirm}
          />
        )}

        {showSettings && (
          <PayoutSettingsModal 
            settings={settings} 
            onClose={() => setShowSettings(false)} 
            onSave={async (newSettings) => {
              try {
                const response = await updatePayoutSettings(newSettings);
                if (response.success) {
                  setShowSettings(false);
                  await loadSettings();
                  showNotification('success', response.message || 'Settings updated successfully');
                } else {
                  throw new Error(response.message || 'Failed to update settings');
                }
              } catch (error: any) {
                console.error('Error updating settings:', error);
                const errorMessage = error.response?.data?.message || error.message || 'Failed to update settings';
                showNotification('error', errorMessage);
              }
            }} 
          />
        )}
      </div>
    </div>
  );
};

export default PayoutsManagement;