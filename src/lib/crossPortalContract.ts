/**
 * Cross-Portal Consistency Contract
 * 
 * This module defines shared types, constants, and calculation helpers
 * that ensure data consistency across Employee, Employer, and Admin portals.
 * 
 * CONTRACTS:
 * 1. REQUESTS: All portals use the same requests table, request_status enum, and request_events audit trail
 * 2. POLICIES: Published policies are read from benefit_policy_versions with is_current flag
 * 3. ENTITLEMENTS: Utilization rates are calculated using the same formula everywhere
 */

import { Database } from '@/integrations/supabase/types';

// ============================================================================
// REQUEST STATUS CONTRACT
// ============================================================================

export type RequestStatus = Database['public']['Enums']['request_status'];
export type RequestType = Database['public']['Enums']['request_type'];

/**
 * Canonical request status values - must match database enum
 */
export const REQUEST_STATUSES = {
  DRAFT: 'draft' as RequestStatus,
  PENDING: 'pending' as RequestStatus,
  SUBMITTED: 'submitted' as RequestStatus,
  IN_REVIEW: 'in_review' as RequestStatus,
  APPROVED: 'approved' as RequestStatus,
  REJECTED: 'rejected' as RequestStatus,
  PAID: 'paid' as RequestStatus,
  CLOSED: 'closed' as RequestStatus,
} as const;

/**
 * Status groups for filtering
 */
export const STATUS_GROUPS = {
  ACTIVE: [REQUEST_STATUSES.PENDING, REQUEST_STATUSES.SUBMITTED, REQUEST_STATUSES.IN_REVIEW] as RequestStatus[],
  COMPLETED: [REQUEST_STATUSES.APPROVED, REQUEST_STATUSES.PAID, REQUEST_STATUSES.CLOSED] as RequestStatus[],
  TERMINAL: [REQUEST_STATUSES.APPROVED, REQUEST_STATUSES.REJECTED, REQUEST_STATUSES.PAID, REQUEST_STATUSES.CLOSED] as RequestStatus[],
} as const;

/**
 * Map database status to user-friendly display label
 * Used consistently across Employee and Employer portals
 */
export function getStatusDisplayLabel(status: RequestStatus | string | null): string {
  switch (status) {
    case 'draft': return 'Draft';
    case 'pending': return 'Pending';
    case 'submitted': return 'Submitted';
    case 'in_review': return 'In Review';
    case 'approved': return 'Approved';
    case 'rejected': return 'Rejected';
    case 'paid': return 'Paid';
    case 'closed': return 'Closed';
    default: return 'Unknown';
  }
}

/**
 * Get status badge styling - consistent across portals
 */
export function getStatusBadgeStyle(status: RequestStatus | string | null): {
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  className: string;
} {
  switch (status) {
    case 'draft':
      return { variant: 'outline', className: 'bg-muted text-muted-foreground' };
    case 'pending':
    case 'submitted':
      return { variant: 'secondary', className: 'bg-amber-500/10 text-amber-600 border-amber-500/20' };
    case 'in_review':
      return { variant: 'secondary', className: 'bg-blue-500/10 text-blue-600 border-blue-500/20' };
    case 'approved':
    case 'paid':
      return { variant: 'secondary', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' };
    case 'rejected':
      return { variant: 'destructive', className: 'bg-red-500/10 text-red-600 border-red-500/20' };
    case 'closed':
      return { variant: 'secondary', className: 'bg-slate-500/10 text-slate-600 border-slate-500/20' };
    default:
      return { variant: 'outline', className: '' };
  }
}

/**
 * Check if a status allows editing by the employee
 */
export function isEditableStatus(status: RequestStatus | string | null): boolean {
  return status === 'draft' || status === 'pending';
}

/**
 * Check if a status allows processing by the employer
 */
export function isProcessableStatus(status: RequestStatus | string | null): boolean {
  return status === 'pending' || status === 'submitted' || status === 'in_review';
}

// ============================================================================
// UTILIZATION CALCULATION CONTRACT
// ============================================================================

export interface UtilizationData {
  allocated: number;
  utilized: number;
}

export interface UtilizationResult {
  rate: number; // 0-100 percentage
  remaining: number;
  isFullyUtilized: boolean;
  isOverUtilized: boolean;
  status: 'unused' | 'low' | 'moderate' | 'high' | 'full' | 'over';
}

/**
 * Calculate utilization rate - THE SINGLE SOURCE OF TRUTH
 * Used by both Employee and Employer portals
 */
export function calculateUtilization(data: UtilizationData): UtilizationResult {
  const { allocated, utilized } = data;
  
  // Handle edge cases
  if (allocated <= 0) {
    return {
      rate: 0,
      remaining: 0,
      isFullyUtilized: false,
      isOverUtilized: false,
      status: 'unused',
    };
  }
  
  const rate = Math.round((utilized / allocated) * 100);
  const remaining = Math.max(0, allocated - utilized);
  const isFullyUtilized = utilized >= allocated;
  const isOverUtilized = utilized > allocated;
  
  let status: UtilizationResult['status'];
  if (rate === 0) status = 'unused';
  else if (rate < 30) status = 'low';
  else if (rate < 70) status = 'moderate';
  else if (rate < 100) status = 'high';
  else if (rate === 100) status = 'full';
  else status = 'over';
  
  return {
    rate,
    remaining,
    isFullyUtilized,
    isOverUtilized,
    status,
  };
}

/**
 * Calculate aggregate utilization across multiple entitlements
 */
export function calculateAggregateUtilization(entitlements: UtilizationData[]): UtilizationResult {
  const totals = entitlements.reduce(
    (acc, e) => ({
      allocated: acc.allocated + e.allocated,
      utilized: acc.utilized + e.utilized,
    }),
    { allocated: 0, utilized: 0 }
  );
  
  return calculateUtilization(totals);
}

/**
 * Get utilization status styling - consistent across portals
 */
export function getUtilizationStyle(status: UtilizationResult['status']): {
  badge: string;
  progress: string;
  text: string;
} {
  switch (status) {
    case 'unused':
      return {
        badge: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
        progress: '[&>div]:bg-slate-400',
        text: 'text-slate-600',
      };
    case 'low':
      return {
        badge: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
        progress: '[&>div]:bg-amber-500',
        text: 'text-amber-600',
      };
    case 'moderate':
      return {
        badge: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
        progress: '[&>div]:bg-blue-500',
        text: 'text-blue-600',
      };
    case 'high':
      return {
        badge: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
        progress: '[&>div]:bg-emerald-500',
        text: 'text-emerald-600',
      };
    case 'full':
      return {
        badge: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
        progress: '[&>div]:bg-emerald-500',
        text: 'text-emerald-600',
      };
    case 'over':
      return {
        badge: 'bg-red-500/10 text-red-600 border-red-500/20',
        progress: '[&>div]:bg-red-500',
        text: 'text-red-600',
      };
  }
}

// ============================================================================
// POLICY VERSION CONTRACT
// ============================================================================

export interface PolicyVersion {
  id: string;
  benefit_id: string;
  organization_id: string;
  version: number;
  policy_text: string | null;
  attachment_url: string | null;
  effective_from: string;
  effective_until: string | null;
  created_at: string;
  created_by: string | null;
}

/**
 * Determine if a policy version is currently active
 */
export function isPolicyVersionActive(policy: PolicyVersion): boolean {
  const now = new Date();
  const effectiveFrom = new Date(policy.effective_from);
  const effectiveUntil = policy.effective_until ? new Date(policy.effective_until) : null;
  
  const hasStarted = effectiveFrom <= now;
  const hasNotEnded = !effectiveUntil || effectiveUntil > now;
  
  return hasStarted && hasNotEnded;
}

// ============================================================================
// SLA CALCULATION CONTRACT
// ============================================================================

export interface SLAResult {
  hoursRemaining: number;
  daysRemaining: number;
  isOverdue: boolean;
  isUrgent: boolean; // < 24 hours
  status: 'on_track' | 'urgent' | 'overdue';
}

/**
 * Calculate SLA status - consistent across portals
 */
export function calculateSLA(slaDueAt: string | null, currentStatus: RequestStatus | string | null): SLAResult | null {
  // No SLA for completed statuses
  if (!slaDueAt || STATUS_GROUPS.TERMINAL.includes(currentStatus as RequestStatus)) {
    return null;
  }
  
  const now = new Date();
  const dueDate = new Date(slaDueAt);
  const diffMs = dueDate.getTime() - now.getTime();
  const hoursRemaining = diffMs / (1000 * 60 * 60);
  const daysRemaining = hoursRemaining / 24;
  
  const isOverdue = hoursRemaining < 0;
  const isUrgent = !isOverdue && hoursRemaining < 24;
  
  let status: SLAResult['status'];
  if (isOverdue) status = 'overdue';
  else if (isUrgent) status = 'urgent';
  else status = 'on_track';
  
  return {
    hoursRemaining: Math.round(hoursRemaining),
    daysRemaining: Math.round(daysRemaining * 10) / 10,
    isOverdue,
    isUrgent,
    status,
  };
}

// ============================================================================
// DATA FRESHNESS CONTRACT
// ============================================================================

/**
 * Format relative time consistently across portals
 */
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return then.toLocaleDateString();
}
