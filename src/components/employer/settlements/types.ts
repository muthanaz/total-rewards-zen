/**
 * Settlement Batch Types
 * Finance-grade lifecycle tracking with reconciliation
 */

export type BatchStatus = 'draft' | 'ready' | 'exported' | 'paid';
export type ReconciliationStatus = 'pending' | 'matched' | 'partial' | 'unmatched';

export interface SettlementBatch {
  id: string;
  batchRef: string;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
  };
  period: string;
  claimsCount: number;
  totalAED: number;
  status: BatchStatus;
  bankReference?: string;
  exportArtifactUrl?: string;
  exportedAt?: string;
  exportedBy?: string;
  paidAt?: string;
  markedPaidBy?: string;
  reconciliation: {
    status: ReconciliationStatus;
    matchedCount: number;
    partialCount: number;
    unmatchedCount: number;
    lastRunAt?: string;
    runBy?: string;
  };
  exceptions: BatchException[];
}

export interface BatchException {
  id: string;
  type: 'failed_payment' | 'amount_mismatch' | 'missing_bank_details' | 'duplicate_entry';
  severity: 'critical' | 'warning' | 'info';
  employeeId: string;
  employeeName: string;
  employeeGrade: string;
  claimId: string;
  expectedAmount: number;
  actualAmount?: number;
  bankDetails?: {
    hasIban: boolean;
    hasBankName: boolean;
    hasAccountHolder: boolean;
  };
  description: string;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface SettlementClaim {
  id: string;
  claimRef: string;
  employeeId: string;
  employeeName: string;
  employeeGrade: string;
  category: string;
  amount: number;
  approvedAt: string;
  bankIban?: string;
  bankName?: string;
  status: 'pending_batch' | 'batched' | 'exported' | 'paid' | 'failed';
  batchId?: string;
  paymentRef?: string;
}

export interface ReconciliationResult {
  batchId: string;
  runAt: string;
  runBy: string;
  bankStatementRef: string;
  totalExpected: number;
  totalActual: number;
  variance: number;
  matchedTransactions: number;
  unmatchedTransactions: number;
  partialMatches: number;
  exceptions: BatchException[];
}

export interface BatchFilters {
  status?: BatchStatus | 'all';
  reconciliation?: ReconciliationStatus | 'all';
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}
