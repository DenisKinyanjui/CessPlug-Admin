import React, { useState } from 'react';
import { X, Save, AlertTriangle, Shield, Clock, DollarSign, Bell, Users } from 'lucide-react';
import { PayoutSettings, CommissionRates } from '../../../types/payout';

interface PayoutSettingsModalProps {
  settings: PayoutSettings | null;
  onClose: () => void;
  onSave: (settings: Partial<PayoutSettings>) => void;
}

const PayoutSettingsModal: React.FC<PayoutSettingsModalProps> = ({ 
  settings, 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState<Partial<PayoutSettings>>({
    minWithdrawalAmount: settings?.minWithdrawalAmount || 100,
    maxWithdrawalAmount: settings?.maxWithdrawalAmount || 50000,
    commissionRates: settings?.commissionRates || {
      deliveryAmount: 200, // KSh 200 per delivery
      agentOrder: 0.03 // 3%
    },
    payoutSchedule: settings?.payoutSchedule || {
      enabled: false,
      dayOfWeek: 5, // Friday
      startTime: '07:00',
      endTime: '23:59'
    },
    globalPayoutHold: settings?.globalPayoutHold || false,
    holdReason: settings?.holdReason || '',
    processingFee: settings?.processingFee || 0,
    autoApprovalThreshold: settings?.autoApprovalThreshold || 1000,
    requireManagerApproval: settings?.requireManagerApproval || false,
    notificationSettings: settings?.notificationSettings || {
      emailOnRequest: true,
      emailOnApproval: true,
      emailOnPayment: true,
      smsOnPayment: false
    },
    requireTwoFactorForLargePayouts: settings?.requireTwoFactorForLargePayouts || false,
    twoFactorThreshold: settings?.twoFactorThreshold || 10000,
    maxPayoutsPerDay: settings?.maxPayoutsPerDay || 5,
    maxPayoutAmountPerDay: settings?.maxPayoutAmountPerDay || 100000
  });

  const [activeTab, setActiveTab] = useState('limits');

  const daysOfWeek = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];

  const tabs = [
    { id: 'limits', label: 'Limits & Rates', icon: DollarSign },
    { id: 'schedule', label: 'Schedule', icon: Clock },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'advanced', label: 'Advanced', icon: Users }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  // Helper function to safely update commission rates
  const updateCommissionRate = (type: 'deliveryAmount' | 'agentOrder', value: number) => {
    const currentRates = formData.commissionRates || { deliveryAmount: 200, agentOrder: 0.03 };
    
    setFormData({
      ...formData,
      commissionRates: {
        ...currentRates,
        [type]: value
      } as CommissionRates
    });
  };

  // Helper function to get commission rate value safely
  const getCommissionRate = (type: 'deliveryAmount' | 'agentOrder'): number => {
    return formData.commissionRates?.[type] ?? (type === 'deliveryAmount' ? 200 : 0.03);
  };

  const validateForm = () => {
    const errors = [];
    
    if (formData.minWithdrawalAmount! >= formData.maxWithdrawalAmount!) {
      errors.push('Minimum withdrawal amount must be less than maximum');
    }
    
    if (formData.payoutSchedule?.enabled && formData.payoutSchedule.startTime >= formData.payoutSchedule.endTime) {
      errors.push('Start time must be before end time');
    }
    
    // Validate commission rates with safe access
    const deliveryAmount = getCommissionRate('deliveryAmount');
    const agentOrderRate = getCommissionRate('agentOrder');
    
    if (deliveryAmount < 0) {
      errors.push('Delivery commission amount cannot be negative');
    }
    
    if (agentOrderRate < 0 || agentOrderRate > 1) {
      errors.push('Agent order commission rate must be between 0% and 100%');
    }
    
    return errors;
  };

  const formErrors = validateForm();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'limits':
        return (
          <div className="space-y-6">
            {/* Commission Rates Configuration */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <div className="flex items-center mb-4">
                <Users className="h-5 w-5 text-blue-600 mr-2" />
                <h4 className="text-lg font-medium text-gray-900">Commission Rates</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Commission Amount (KSh)
                  </label>
                  <input
                    type="number"
                    value={getCommissionRate('deliveryAmount')}
                    onChange={(e) => updateCommissionRate('deliveryAmount', Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    step="1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Fixed amount earned per delivery (regardless of order value)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agent Order Commission Rate (%)
                  </label>
                  <input
                    type="number"
                    value={getCommissionRate('agentOrder') * 100}
                    onChange={(e) => updateCommissionRate('agentOrder', Number(e.target.value) / 100)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Commission earned when agents create orders on behalf of customers
                  </p>
                </div>
              </div>
              
              {/* Commission Rate Preview */}
              <div className="mt-4 p-3 bg-white border border-blue-200 rounded-lg">
                <h5 className="text-sm font-medium text-gray-900 mb-2">Rate Preview</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Per delivery:</span>
                    <span className="ml-2 font-medium text-blue-600">
                      KSh {getCommissionRate('deliveryAmount').toLocaleString()}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      Fixed amount per delivery
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">On KSh 10,000 agent order:</span>
                    <span className="ml-2 font-medium text-green-600">
                      KSh {(10000 * getCommissionRate('agentOrder')).toLocaleString()}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {(getCommissionRate('agentOrder') * 100).toFixed(1)}% of order value
                    </p>
                  </div>
                </div>
              </div>

              {/* Enhanced Commission Examples */}
              <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <h5 className="text-sm font-medium text-gray-900 mb-2">Commission Examples</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <h6 className="font-medium text-blue-800 mb-2">Delivery Commissions</h6>
                    <div className="space-y-1 text-blue-700">
                      <div>1 delivery: KSh {getCommissionRate('deliveryAmount').toLocaleString()}</div>
                      <div>3 deliveries: KSh {(getCommissionRate('deliveryAmount') * 3).toLocaleString()}</div>
                      <div>5 deliveries: KSh {(getCommissionRate('deliveryAmount') * 5).toLocaleString()}</div>
                    </div>
                  </div>
                  <div>
                    <h6 className="font-medium text-green-800 mb-2">Agent Order Commissions</h6>
                    <div className="space-y-1 text-green-700">
                      <div>KSh 5,000 order: KSh {(5000 * getCommissionRate('agentOrder')).toLocaleString()}</div>
                      <div>KSh 10,000 order: KSh {(10000 * getCommissionRate('agentOrder')).toLocaleString()}</div>
                      <div>KSh 20,000 order: KSh {(20000 * getCommissionRate('agentOrder')).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Withdrawal Limits */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                <h4 className="text-lg font-medium text-gray-900">Withdrawal Limits</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Withdrawal (KSh)
                  </label>
                  <input
                    type="number"
                    value={formData.minWithdrawalAmount}
                    onChange={(e) => setFormData({
                      ...formData,
                      minWithdrawalAmount: Number(e.target.value)
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Withdrawal (KSh)
                  </label>
                  <input
                    type="number"
                    value={formData.maxWithdrawalAmount}
                    onChange={(e) => setFormData({
                      ...formData,
                      maxWithdrawalAmount: Number(e.target.value)
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                  />
                </div>
              </div>
            </div>

            {/* Auto-Approval Settings */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Auto-Approval Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Auto-Approval Threshold (KSh)
                  </label>
                  <input
                    type="number"
                    value={formData.autoApprovalThreshold}
                    onChange={(e) => setFormData({
                      ...formData,
                      autoApprovalThreshold: Number(e.target.value)
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Payouts below this amount will be auto-approved
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Processing Fee (KSh)
                  </label>
                  <input
                    type="number"
                    value={formData.processingFee}
                    onChange={(e) => setFormData({
                      ...formData,
                      processingFee: Number(e.target.value)
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    step="0.01"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Fee deducted from each payout (0 for no fee)
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.requireManagerApproval}
                    onChange={(e) => setFormData({
                      ...formData,
                      requireManagerApproval: e.target.checked
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="ml-3 text-sm font-medium text-gray-700">
                    Require manager approval for large payouts
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 'schedule':
        return (
          <div className="space-y-6">
            {/* Payout Schedule */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <Clock className="h-5 w-5 text-blue-600 mr-2" />
                <h4 className="text-lg font-medium text-gray-900">Payout Schedule</h4>
              </div>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.payoutSchedule?.enabled}
                    onChange={(e) => setFormData({
                      ...formData,
                      payoutSchedule: {
                        ...formData.payoutSchedule!,
                        enabled: e.target.checked
                      }
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="ml-3 text-sm font-medium text-gray-700">
                    Enable scheduled payout windows
                  </label>
                </div>

                {formData.payoutSchedule?.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ml-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Day of Week
                      </label>
                      <select
                        value={formData.payoutSchedule?.dayOfWeek}
                        onChange={(e) => setFormData({
                          ...formData,
                          payoutSchedule: {
                            ...formData.payoutSchedule!,
                            dayOfWeek: Number(e.target.value)
                          }
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {daysOfWeek.map((day, index) => (
                          <option key={index} value={index}>{day}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={formData.payoutSchedule?.startTime}
                        onChange={(e) => setFormData({
                          ...formData,
                          payoutSchedule: {
                            ...formData.payoutSchedule!,
                            startTime: e.target.value
                          }
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={formData.payoutSchedule?.endTime}
                        onChange={(e) => setFormData({
                          ...formData,
                          payoutSchedule: {
                            ...formData.payoutSchedule!,
                            endTime: e.target.value
                          }
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}

                {formData.payoutSchedule?.enabled && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg ml-6">
                    <p className="text-sm text-blue-700">
                      Current schedule: {formData.payoutSchedule.enabled 
                        ? `${daysOfWeek[formData.payoutSchedule.dayOfWeek]} ${formData.payoutSchedule.startTime} - ${formData.payoutSchedule.endTime}`
                        : 'Always available'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Global Hold */}
            {formData.globalPayoutHold && (
              <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                  <h4 className="text-lg font-medium text-red-900">Global Payout Hold Active</h4>
                </div>
                <div>
                  <label className="block text-sm font-medium text-red-700 mb-2">
                    Hold Reason
                  </label>
                  <textarea
                    value={formData.holdReason}
                    onChange={(e) => setFormData({
                      ...formData,
                      holdReason: e.target.value
                    })}
                    className="w-full border border-red-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter reason for holding payouts..."
                    rows={3}
                  />
                </div>
              </div>
            )}
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            {/* Security Settings */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <Shield className="h-5 w-5 text-red-600 mr-2" />
                <h4 className="text-lg font-medium text-gray-900">Security Settings</h4>
              </div>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.requireTwoFactorForLargePayouts}
                    onChange={(e) => setFormData({
                      ...formData,
                      requireTwoFactorForLargePayouts: e.target.checked
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="ml-3 text-sm font-medium text-gray-700">
                    Require 2FA for large payouts
                  </label>
                </div>
                
                {formData.requireTwoFactorForLargePayouts && (
                  <div className="ml-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      2FA Threshold (KSh)
                    </label>
                    <input
                      type="number"
                      value={formData.twoFactorThreshold}
                      onChange={(e) => setFormData({
                        ...formData,
                        twoFactorThreshold: Number(e.target.value)
                      })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Payouts above this amount will require 2FA
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            {/* Notification Settings */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <Bell className="h-5 w-5 text-yellow-600 mr-2" />
                <h4 className="text-lg font-medium text-gray-900">Notification Settings</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h5 className="font-medium text-gray-700">Email Notifications</h5>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.notificationSettings?.emailOnRequest}
                      onChange={(e) => setFormData({
                        ...formData,
                        notificationSettings: {
                          ...formData.notificationSettings!,
                          emailOnRequest: e.target.checked
                        }
                      })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label className="ml-3 text-sm text-gray-700">
                      Email on payout request
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.notificationSettings?.emailOnApproval}
                      onChange={(e) => setFormData({
                        ...formData,
                        notificationSettings: {
                          ...formData.notificationSettings!,
                          emailOnApproval: e.target.checked
                        }
                      })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label className="ml-3 text-sm text-gray-700">
                      Email on approval
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.notificationSettings?.emailOnPayment}
                      onChange={(e) => setFormData({
                        ...formData,
                        notificationSettings: {
                          ...formData.notificationSettings!,
                          emailOnPayment: e.target.checked
                        }
                      })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label className="ml-3 text-sm text-gray-700">
                      Email on payment
                    </label>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h5 className="font-medium text-gray-700">SMS Notifications</h5>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.notificationSettings?.smsOnPayment}
                      onChange={(e) => setFormData({
                        ...formData,
                        notificationSettings: {
                          ...formData.notificationSettings!,
                          smsOnPayment: e.target.checked
                        }
                      })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label className="ml-3 text-sm text-gray-700">
                      SMS on payment
                    </label>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-2">
                    SMS notifications may incur additional charges
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'advanced':
        return (
          <div className="space-y-6">
            {/* Rate Limiting */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                <h4 className="text-lg font-medium text-gray-900">Rate Limiting</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Payouts Per Day
                  </label>
                  <input
                    type="number"
                    value={formData.maxPayoutsPerDay}
                    onChange={(e) => setFormData({
                      ...formData,
                      maxPayoutsPerDay: Number(e.target.value)
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum number of payouts per agent per day
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Daily Payout Amount (KSh)
                  </label>
                  <input
                    type="number"
                    value={formData.maxPayoutAmountPerDay}
                    onChange={(e) => setFormData({
                      ...formData,
                      maxPayoutAmountPerDay: Number(e.target.value)
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum total payout amount per agent per day
                  </p>
                </div>
              </div>
            </div>

            {/* System Information */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <h4 className="text-lg font-medium text-gray-900 mb-4">System Information</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-medium">Settings Version:</span> {settings?.version || 1}</p>
                <p><span className="font-medium">Last Modified:</span> {settings?.updatedAt ? new Date(settings.updatedAt).toLocaleString() : 'Never'}</p>
                <p><span className="font-medium">Created:</span> {settings?.createdAt ? new Date(settings.createdAt).toLocaleString() : 'Not available'}</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Payout Settings</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 overflow-hidden">
          {/* Sidebar Navigation */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>

            {/* Validation Errors */}
            {formErrors.length > 0 && (
              <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                  <span className="text-sm font-medium text-red-700">Validation Errors</span>
                </div>
                <ul className="text-xs text-red-600 space-y-1">
                  {formErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-6">
              {renderTabContent()}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formErrors.length > 0}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Settings</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PayoutSettingsModal;