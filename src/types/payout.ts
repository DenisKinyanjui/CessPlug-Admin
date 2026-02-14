// types/payout.ts - Updated to match fixed delivery commission model

export interface CommissionRates {
  deliveryAmount: number; // Fixed amount in KSh (e.g., 200 for KSh 200 per delivery)
  agentOrder: number; // Decimal format (e.g., 0.03 for 3%)
}

export interface PayoutRequest {
  _id: string;
  agentId?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  chamaId?: {
    _id: string;
    name: string;
    weekNumber?: number;
  };
  payoutSource?: 'agent' | 'chama'; // New field to distinguish payout source
  amount: number;
  method: 'mpesa' | 'bank';
  accountDetails: string;
  status: 'pending' | 'approved' | 'paid' | 'rejected' | 'on_hold';
  requestedAt: string;
  processedAt?: string;
  processedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  notes?: string;
  rejectionReason?: string;
  commissionIds?: string[];
  chamaContributionIds?: string[]; // For chama payouts
  metadata?: {
    settingsVersion?: string;
    processingFee?: number;
    validatedAt?: string;
    validationWarnings?: string[];
    autoApproved?: boolean;
    autoApprovalThreshold?: number;
    autoPaid?: boolean;
    autoProcessedAt?: string;
    originalRequestAmount?: number;
  };
  createdAt: string;
  updatedAt: string;
  formattedAmount?: string;
}

export interface PayoutStats {
  totalPending: number;
  totalPaid: number;
  totalOnHold: number;
  totalRejected: number;
  pendingAmount: number;
  paidAmount: number;
  onHoldAmount: number;
  recentPayouts: number;
  totalPayouts: number;
}

export interface PayoutSettings {
  _id?: string;
  
  // Withdrawal limits
  minWithdrawalAmount: number;
  maxWithdrawalAmount: number;
  
  // UPDATED: Commission rates configuration
  commissionRates: CommissionRates;
  
  // Payout schedule
  payoutSchedule: {
    enabled: boolean;
    dayOfWeek: number; // 0 = Sunday, 6 = Saturday
    startTime: string; // "HH:MM" format
    endTime: string; // "HH:MM" format
  };
  
  // Global controls
  globalPayoutHold: boolean;
  holdReason?: string;
  
  // Processing
  processingFee: number;
  autoApprovalThreshold: number;
  requireManagerApproval: boolean;
  
  // Notification settings
  notificationSettings?: {
    emailOnRequest: boolean;
    emailOnApproval: boolean;
    emailOnPayment: boolean;
    smsOnPayment: boolean;
  };
  
  // Security settings
  requireTwoFactorForLargePayouts?: boolean;
  twoFactorThreshold?: number;
  
  // Rate limiting
  maxPayoutsPerDay?: number;
  maxPayoutAmountPerDay?: number;
  
  // Audit trail
  lastModifiedBy?: string;
  modificationHistory?: Array<{
    modifiedBy: string;
    modifiedAt: string;
    changes: any;
    reason?: string;
  }>;
  version?: number;
  
  // UPDATED: Virtual fields for formatted rates
  formattedSchedule?: string;
  formattedCommissionRates?: {
    deliveryAmount: string; // "KSh 200"
    agentOrder: string; // "3.0%"
  };
  
  createdAt?: string;
  updatedAt?: string;
}

export interface PayoutFilter {
  status?: string;
  agentId?: string;
  chamaId?: string;
  payoutSource?: 'agent' | 'chama'; // New filter for payout source
  method?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PayoutResponse {
  success: boolean;
  data: {
    payoutRequests: PayoutRequest[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  message?: string;
}

export interface PayoutStatsResponse {
  success: boolean;
  data: PayoutStats;
  message?: string;
}

export interface PayoutSettingsResponse {
  success: boolean;
  data: PayoutSettings;
  message?: string;
}

export interface ProcessPayoutRequest {
  action: 'approve' | 'pay' | 'reject' | 'hold' | 'release';
  notes?: string;
  rejectionReason?: string;
}

export interface BulkPayoutAction {
  payoutIds: string[];
  action: 'approve' | 'pay' | 'reject' | 'hold' | 'release';
  notes?: string;
  rejectionReason?: string;
}

// ===== CHAMA PAYOUT TYPES =====

export interface ChamaPayout {
  _id: string;
  chamaId: {
    _id: string;
    name: string;
  };
  week: number;
  recipientId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  amount: number;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  paymentMethod: 'mpesa' | 'bank';
  mpesaReference?: string;
  transactionReference?: string;
  approvedBy?: {
    _id: string;
    name: string;
  };
  approvedAt?: string;
  paidAt?: string;
  notes?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChamaPayoutStats {
  totalChamaPayouts: number;
  pendingPayouts: number;
  processedPayouts: number;
  totalAmount: number;
  averagePayoutAmount: number;
  byStatus: {
    pending: number;
    approved: number;
    paid: number;
    rejected: number;
  };
}

export interface ChamaPayoutFilter {
  chamaId?: string;
  status?: 'pending' | 'approved' | 'paid' | 'rejected';
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
}

export interface PayoutAnalytics {
  totalPayouts: number;
  totalAmount: number;
  avgPayoutAmount: number;
  topAgents: Array<{
    agentId: string;
    agentName: string;
    agentEmail: string;
    totalPayouts: number;
    totalAmount: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    totalPayouts: number;
    totalAmount: number;
  }>;
  statusDistribution: Array<{
    status: string;
    count: number;
    amount: number;
  }>;
}

export interface PayoutAnalyticsResponse {
  success: boolean;
  data: PayoutAnalytics;
  message?: string;
}

// Window status interface that matches the controller response
export interface PayoutWindowStatus {
  isPayoutWindowOpen: boolean;
  reason?: string;
  nextPayoutWindow?: string;
  currentTime: string;
  payoutSchedule: PayoutSettings['payoutSchedule'];
  globalPayoutHold: boolean;
  holdReason?: string;
  formattedSchedule?: string;
}

// Window status response from API
export interface PayoutWindowStatusResponse {
  success: boolean;
  data: PayoutWindowStatus;
  // Note: message property may not always be present
}

// UPDATED: Commission rates response types
export interface CommissionRatesResponse {
  success: boolean;
  data: {
    delivery: {
      amount: number;
      display: string; // "KSh 200"
      description: string;
      type: 'fixed';
    };
    agentOrder: {
      rate: number;
      percentage: string; // "3.0%"
      description: string;
      type: 'percentage';
    };
    examples: Array<{
      orderValue: number;
      itemCount: number;
      deliveryCommission: number;
      agentOrderCommission: number;
      deliveryCalculation: string; // "KSh 200 × 3 items"
      agentOrderCalculation: string; // "KSh 10,000 × 3.0%"
    }>;
  };
}

export interface CommissionPreviewRequest {
  orderTotal: number;
  orderType: 'agent_order' | 'delivery';
  itemCount?: number; // For delivery commissions
}

export interface CommissionPreviewResponse {
  success: boolean;
  data: {
    orderTotal: number;
    commissionType: string;
    calculationMethod: 'percentage' | 'fixed_per_item';
    commissionRate: number;
    commissionRateDisplay: string;
    commissionAmount: number;
    formattedCommission: string;
    itemCount?: number;
    calculation: string;
  };
}

// Validation interfaces
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ValidationRequest {
  amount: number;
  agentId: string;
}

export interface ValidationResponse {
  success: boolean;
  data: ValidationResult;
  message?: string;
}

// Form data interfaces for components
export interface PayoutRequestFormData {
  amount: number;
  method: 'mpesa' | 'bank';
  accountDetails: string;
}

export interface PayoutRequestFormErrors {
  amount?: string;
  method?: string;
  accountDetails?: string;
}

// Enhanced settings update interface
export interface PayoutSettingsUpdateData extends Partial<PayoutSettings> {
  modificationReason?: string;
}

// Auto-approval analytics
export interface AutoApprovalAnalytics {
  summary: {
    totalRequests: number;
    autoApprovedCount: number;
    autoPaidCount: number;
    autoApprovalRate: number;
    autoPaymentRate: number;
  };
  settings: {
    autoApprovalThreshold: number;
    requireManagerApproval: boolean;
    maxWithdrawalAmount: number;
    minWithdrawalAmount: number;
  };
}

export interface AutoApprovalAnalyticsResponse {
  success: boolean;
  data: AutoApprovalAnalytics;
  message?: string;
}

// Commission rate management
export interface CommissionRateUpdate {
  deliveryAmount?: number; // UPDATED: Fixed amount instead of rate
  agentOrder?: number;
  reason?: string;
}

export interface CommissionRateHistory {
  _id: string;
  previousRates: CommissionRates;
  newRates: CommissionRates;
  changedBy: string;
  changeReason: string;
  effectiveDate: string;
  createdAt: string;
}

// Payout request creation with enhanced validation
export interface CreatePayoutRequestData {
  amount: number;
  method: 'mpesa' | 'bank';
  accountDetails: string;
  validateAgainstSettings?: boolean;
}

export interface CreatePayoutRequestResponse {
  success: boolean;
  message: string;
  data: {
    payoutRequest: PayoutRequest;
  };
  warnings?: string[];
  autoApproved?: boolean;
  autoPaid?: boolean;
  autoApprovalThreshold?: number;
}

// Agent-specific payout restrictions
export interface AgentPayoutRestrictions {
  isHeld: boolean;
  reason?: string;
  setBy?: string;
  setAt?: string;
  dailyLimit?: number;
  monthlyLimit?: number;
}

// Payout method configuration
export interface PayoutMethodConfig {
  mpesa: {
    enabled: boolean;
    minAmount?: number;
    maxAmount?: number;
    processingFee?: number;
  };
  bank: {
    enabled: boolean;
    minAmount?: number;
    maxAmount?: number;
    processingFee?: number;
    requireVerification?: boolean;
  };
}

// System configuration
export interface PayoutSystemConfig extends PayoutSettings {
  methodConfig: PayoutMethodConfig;
  maintenanceMode: boolean;
  emergencyContactEmail: string;
  supportPhone: string;
}

// Error types specific to payouts
export interface PayoutError {
  code: string;
  message: string;
  field?: string;
  details?: any;
}

export interface PayoutValidationError extends PayoutError {
  code: 'VALIDATION_ERROR';
  field: string;
}

export interface PayoutBusinessRuleError extends PayoutError {
  code: 'BUSINESS_RULE_ERROR';
}

export interface PayoutSystemError extends PayoutError {
  code: 'SYSTEM_ERROR';
}

// API Error Response
export interface PayoutAPIError {
  success: false;
  message: string;
  error?: string;
  errors?: PayoutError[];
}

// Notification types
export interface PayoutNotification {
  type: 'email' | 'sms' | 'push';
  event: 'request' | 'approval' | 'payment' | 'rejection' | 'hold' | 'release';
  recipient: string;
  template: string;
  data: any;
}

// Audit trail
export interface PayoutAuditEntry {
  _id: string;
  payoutRequestId: string;
  action: string;
  performedBy: string;
  timestamp: string;
  details: any;
  ipAddress?: string;
  userAgent?: string;
}

// Reporting interfaces
export interface PayoutReport {
  reportId: string;
  type: 'summary' | 'detailed' | 'analytics';
  dateRange: {
    start: string;
    end: string;
  };
  filters: PayoutFilter;
  generatedAt: string;
  generatedBy: string;
  data: any;
}

// Constants and Enums
export enum PayoutRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  PAID = 'paid',
  REJECTED = 'rejected',
  ON_HOLD = 'on_hold'
}

export enum PaymentMethod {
  MPESA = 'mpesa',
  BANK = 'bank'
}

export enum PayoutAction {
  APPROVE = 'approve',
  PAY = 'pay',
  REJECT = 'reject',
  HOLD = 'hold',
  RELEASE = 'release'
}

// UPDATED: Default configurations
export const DEFAULT_COMMISSION_RATES: CommissionRates = {
  deliveryAmount: 200, // KSh 200 per delivery
  agentOrder: 0.03 // 3%
};

export const DEFAULT_PAYOUT_SETTINGS: Partial<PayoutSettings> = {
  minWithdrawalAmount: 100,
  maxWithdrawalAmount: 50000,
  commissionRates: DEFAULT_COMMISSION_RATES,
  payoutSchedule: {
    enabled: false,
    dayOfWeek: 5, // Friday
    startTime: '07:00',
    endTime: '23:59'
  },
  globalPayoutHold: false,
  processingFee: 0,
  autoApprovalThreshold: 1000,
  requireManagerApproval: false,
  maxPayoutsPerDay: 5,
  maxPayoutAmountPerDay: 100000
};

// Utility types
export type PayoutSortField = 'requestedAt' | 'amount' | 'status' | 'method' | 'agentName';
export type PayoutSortOrder = 'asc' | 'desc';

export type CommissionRateField = 'deliveryAmount' | 'agentOrder';

// Re-export for convenience
export type {
  PayoutRequest as PayoutRequestRecord,
  PayoutSettings as PayoutSettingsRecord,
  PayoutStats as PayoutStatsRecord
};