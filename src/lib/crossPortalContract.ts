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
 * 
 * WORKFLOW STAGES:
 * 1. SUBMITTED / PENDING - Initial submission
 * 2. PENDING_EMPLOYEE - Waiting for employee to provide docs/info
 * 3. IN_REVIEW - Being reviewed by HR Ops
 * 4. ESCALATED - Escalated to manager/executive for approval
 * 5. APPROVED / REJECTED - Final decision
 * 6. PAID / CLOSED - Fully processed
 */
export const REQUEST_STATUSES = {
  DRAFT: 'draft' as RequestStatus,
  PENDING: 'pending' as RequestStatus,
  SUBMITTED: 'submitted' as RequestStatus,
  PENDING_EMPLOYEE: 'pending_employee' as RequestStatus,
  IN_REVIEW: 'in_review' as RequestStatus,
  INFO_REQUESTED: 'info_requested' as RequestStatus,
  ESCALATED: 'escalated' as RequestStatus,
  APPROVED: 'approved' as RequestStatus,
  REJECTED: 'rejected' as RequestStatus,
  PAID: 'paid' as RequestStatus,
  CLOSED: 'closed' as RequestStatus,
  CANCELLED: 'cancelled' as RequestStatus,
} as const;

/**
 * Workflow stage order for display
 */
export const WORKFLOW_STAGES = [
  { key: 'submitted', label: 'Submitted', statuses: ['pending', 'submitted'] },
  { key: 'pending_employee', label: 'Pending Employee', statuses: ['pending_employee', 'info_requested'] },
  { key: 'in_review', label: 'In Review', statuses: ['in_review'] },
  { key: 'escalated', label: 'Escalated', statuses: ['escalated'] },
  { key: 'approved', label: 'Approved', statuses: ['approved'] },
  { key: 'rejected', label: 'Rejected', statuses: ['rejected'] },
  { key: 'paid', label: 'Paid/Closed', statuses: ['paid', 'closed'] },
  { key: 'cancelled', label: 'Cancelled', statuses: ['cancelled'] },
] as const;

/**
 * Status groups for filtering
 */
export const STATUS_GROUPS = {
  ACTIVE: [REQUEST_STATUSES.PENDING, REQUEST_STATUSES.SUBMITTED, REQUEST_STATUSES.PENDING_EMPLOYEE, REQUEST_STATUSES.INFO_REQUESTED, REQUEST_STATUSES.IN_REVIEW, REQUEST_STATUSES.ESCALATED] as RequestStatus[],
  PENDING_ACTION: [REQUEST_STATUSES.PENDING, REQUEST_STATUSES.SUBMITTED, REQUEST_STATUSES.IN_REVIEW, REQUEST_STATUSES.ESCALATED] as RequestStatus[],
  WAITING_EMPLOYEE: [REQUEST_STATUSES.PENDING_EMPLOYEE, REQUEST_STATUSES.INFO_REQUESTED] as RequestStatus[],
  COMPLETED: [REQUEST_STATUSES.APPROVED, REQUEST_STATUSES.PAID, REQUEST_STATUSES.CLOSED] as RequestStatus[],
  TERMINAL: [REQUEST_STATUSES.APPROVED, REQUEST_STATUSES.REJECTED, REQUEST_STATUSES.PAID, REQUEST_STATUSES.CLOSED, REQUEST_STATUSES.CANCELLED] as RequestStatus[],
} as const;

/**
 * Audit trail event types
 */
export const AUDIT_EVENT_TYPES = {
  CREATED: 'created',
  VIEWED: 'viewed',
  ASSIGNED: 'assigned',
  DOCS_REQUESTED: 'docs_requested',
  DOCS_UPLOADED: 'docs_uploaded',
  STATUS_CHANGED: 'status_changed',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  ESCALATED: 'escalated',
  PAID: 'paid',
  CLOSED: 'closed',
  NOTE_ADDED: 'note_added',
  BULK_ACTION: 'bulk_action',
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
    case 'pending_employee': return 'Pending Employee';
    case 'info_requested': return 'Info Requested';
    case 'in_review': return 'In Review';
    case 'escalated': return 'Escalated';
    case 'approved': return 'Approved';
    case 'rejected': return 'Rejected';
    case 'paid': return 'Paid';
    case 'closed': return 'Closed';
    case 'cancelled': return 'Cancelled';
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
    case 'pending_employee':
    case 'info_requested':
      return { variant: 'secondary', className: 'bg-purple-500/10 text-purple-600 border-purple-500/20' };
    case 'in_review':
      return { variant: 'secondary', className: 'bg-blue-500/10 text-blue-600 border-blue-500/20' };
    case 'escalated':
      return { variant: 'secondary', className: 'bg-orange-500/10 text-orange-600 border-orange-500/20' };
    case 'approved':
    case 'paid':
      return { variant: 'secondary', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' };
    case 'rejected':
      return { variant: 'destructive', className: 'bg-red-500/10 text-red-600 border-red-500/20' };
    case 'closed':
      return { variant: 'secondary', className: 'bg-slate-500/10 text-slate-600 border-slate-500/20' };
    case 'cancelled':
      return { variant: 'outline', className: 'bg-slate-500/10 text-slate-500 border-slate-500/20' };
    default:
      return { variant: 'outline', className: '' };
  }
}

/**
 * Check if a status allows editing by the employee
 */
export function isEditableStatus(status: RequestStatus | string | null): boolean {
  return status === 'draft' || status === 'pending' || status === 'pending_employee';
}

/**
 * Check if a status allows processing by the employer
 */
export function isProcessableStatus(status: RequestStatus | string | null): boolean {
  return status === 'pending' || status === 'submitted' || status === 'in_review' || status === 'escalated';
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
// SLA CALCULATION CONTRACT (with pause logic)
// ============================================================================

/**
 * Statuses where SLA clock is paused (waiting on employee action)
 */
export const SLA_PAUSED_STATUSES = [
  REQUEST_STATUSES.DRAFT,
  REQUEST_STATUSES.PENDING_EMPLOYEE,
  REQUEST_STATUSES.INFO_REQUESTED,
] as const;

/**
 * Check if SLA should be paused for the given status
 * SLA is paused when we are waiting on the employee to take action
 */
export function isSlaPaused(status: RequestStatus | string | null): boolean {
  return SLA_PAUSED_STATUSES.includes(status as RequestStatus);
}

/**
 * Get who the request is currently waiting on
 */
export function getWaitingOnActor(status: RequestStatus | string | null): 'employee' | 'hr' | 'system' | 'none' {
  if (!status) return 'none';
  
  // Waiting on employee
  if (['draft', 'pending_employee', 'info_requested'].includes(status)) {
    return 'employee';
  }
  
  // Waiting on HR
  if (['submitted', 'pending', 'in_review', 'escalated'].includes(status)) {
    return 'hr';
  }
  
  // Processing by system
  if (status === 'approved') {
    return 'system';
  }
  
  // Terminal states - not waiting on anyone
  return 'none';
}

export interface SLAResult {
  hoursRemaining: number;
  daysRemaining: number;
  isOverdue: boolean;
  isUrgent: boolean; // < 24 hours
  isPaused: boolean; // SLA clock paused (waiting on employee)
  status: 'on_track' | 'urgent' | 'overdue' | 'paused';
  waitingOn: 'employee' | 'hr' | 'system' | 'none';
}

/**
 * Calculate SLA status - consistent across portals
 * 
 * CRITICAL: SLA is paused when waiting on employee (pending_employee, info_requested)
 * This ensures HR is never shown as "overdue" while waiting on employee docs
 */
export function calculateSLA(slaDueAt: string | null, currentStatus: RequestStatus | string | null): SLAResult | null {
  // No SLA for completed statuses
  if (!slaDueAt || STATUS_GROUPS.TERMINAL.includes(currentStatus as RequestStatus)) {
    return null;
  }
  
  const waitingOn = getWaitingOnActor(currentStatus);
  const isPaused = isSlaPaused(currentStatus);
  
  const now = new Date();
  const dueDate = new Date(slaDueAt);
  const diffMs = dueDate.getTime() - now.getTime();
  const hoursRemaining = diffMs / (1000 * 60 * 60);
  const daysRemaining = hoursRemaining / 24;
  
  // If SLA is paused, we don't mark as overdue
  const isOverdue = !isPaused && hoursRemaining < 0;
  const isUrgent = !isPaused && !isOverdue && hoursRemaining < 24;
  
  let status: SLAResult['status'];
  if (isPaused) status = 'paused';
  else if (isOverdue) status = 'overdue';
  else if (isUrgent) status = 'urgent';
  else status = 'on_track';
  
  return {
    hoursRemaining: Math.round(hoursRemaining),
    daysRemaining: Math.round(daysRemaining * 10) / 10,
    isOverdue,
    isUrgent,
    isPaused,
    status,
    waitingOn,
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

// ============================================================================
// MARKETPLACE CONTRACT
// ============================================================================

/**
 * Offer sponsorship types
 */
export type OfferSponsorshipType = 'employer' | 'public';

/**
 * Offer verification status
 */
export type OfferVerificationStatus = 'verified' | 'pending' | 'unverified';

/**
 * Marketplace offer with enhanced metadata
 */
export interface MarketplaceOfferContract {
  id: string;
  title: string;
  merchant: string;
  category: string;
  discount_percent: number | null;
  rating: number | null;
  description: string | null;
  terms: string | null;
  image_url: string | null;
  is_active: boolean;
  vendor_id: string | null;
  created_at: string | null;
  // Enhanced fields for cross-portal use
  sponsorship?: OfferSponsorshipType;
  verificationStatus?: OfferVerificationStatus;
  employerNotes?: string;
  maxActivationsPerEmployee?: number;
}

/**
 * Activation event for analytics
 */
export interface MarketplaceActivationEvent {
  offerId: string;
  userId: string;
  organizationId: string | null;
  activatedAt: string;
  category: string;
  sponsorship: OfferSponsorshipType;
  estimatedSavings: number;
}

/**
 * Marketplace analytics summary (for employer portal)
 */
export interface MarketplaceAnalyticsSummary {
  totalActivations: number;
  totalEstimatedSavings: number;
  topCategories: { category: string; count: number; savings: number }[];
  sponsoredVsPublic: { sponsored: number; public: number };
  activationTrend: { period: string; count: number }[];
}

/**
 * Determine offer sponsorship based on offer data
 * In production, this would come from the database
 */
export function getOfferSponsorship(offer: { discount_percent?: number | null; vendor_id?: string | null }): OfferSponsorshipType {
  // Employer-sponsored offers typically have higher discounts or specific vendor relationships
  // This is demo logic - in production, there would be an explicit field
  if (offer.discount_percent && offer.discount_percent >= 15) return 'employer';
  return 'public';
}

/**
 * Get offer verification status
 * In production, this would come from the database
 */
export function getOfferVerificationStatus(offer: { rating?: number | null; vendor_id?: string | null }): OfferVerificationStatus {
  // Demo logic - verified partners have high ratings or explicit vendor records
  if (offer.rating && offer.rating >= 4.5) return 'verified';
  if (offer.vendor_id) return 'verified';
  return 'pending';
}

/**
 * Calculate estimated savings from an offer
 */
export function calculateOfferSavings(discountPercent: number | null, estimatedValue: number = 100): number {
  if (!discountPercent) return 0;
  return Math.round((discountPercent / 100) * estimatedValue);
}

/**
 * Sponsorship badge configuration
 */
export const SPONSORSHIP_CONFIG: Record<OfferSponsorshipType, {
  label: string;
  labelAr: string;
  tooltip: string;
  tooltipAr: string;
  className: string;
}> = {
  employer: {
    label: 'Sponsored',
    labelAr: 'برعاية صاحب العمل',
    tooltip: 'Your employer subsidizes this offer for you',
    tooltipAr: 'يقوم صاحب العمل بدعم هذا العرض لك',
    className: 'bg-accent/10 text-accent border-accent/20',
  },
  public: {
    label: 'Public Offer',
    labelAr: 'عرض عام',
    tooltip: 'Available to all employees on the platform',
    tooltipAr: 'متاح لجميع الموظفين على المنصة',
    className: 'bg-muted text-muted-foreground border-border',
  },
};

/**
 * Verification badge configuration
 */
export const VERIFICATION_CONFIG: Record<OfferVerificationStatus, {
  label: string;
  labelAr: string;
  tooltip: string;
  className: string;
}> = {
  verified: {
    label: 'Verified Partner',
    labelAr: 'شريك موثق',
    tooltip: 'This partner has been vetted and verified by our team',
    className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  },
  pending: {
    label: 'Partner',
    labelAr: 'شريك',
    tooltip: 'Standard marketplace partner',
    className: 'bg-muted text-muted-foreground border-border',
  },
  unverified: {
    label: 'New Partner',
    labelAr: 'شريك جديد',
    tooltip: 'Recently added partner pending full verification',
    className: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  },
};

/**
 * Recommendation reason types for personalization
 */
export type RecommendationReason = 
  | 'location'
  | 'family_status'
  | 'benefit_usage'
  | 'interest'
  | 'popular'
  | 'high_value'
  | 'new_partner'
  | 'expiring_soon';

/**
 * Recommendation with explanation
 */
export interface PersonalizedRecommendation {
  offer: MarketplaceOfferContract;
  reasons: RecommendationReason[];
  explanation: string;
  explanationAr: string;
  score: number; // 0-100 relevance score
}

/**
 * Generate recommendation explanation based on reasons
 */
export function getRecommendationExplanation(reasons: RecommendationReason[], profileContext?: {
  location?: string;
  hasChildren?: boolean;
  interests?: string[];
}): { en: string; ar: string } {
  const primaryReason = reasons[0];
  
  switch (primaryReason) {
    case 'location':
      return {
        en: `Based on your location${profileContext?.location ? `: ${profileContext.location}` : ''}`,
        ar: `بناءً على موقعك${profileContext?.location ? `: ${profileContext.location}` : ''}`,
      };
    case 'family_status':
      return {
        en: 'Great for families with children',
        ar: 'مثالي للعائلات مع الأطفال',
      };
    case 'benefit_usage':
      return {
        en: 'Complements your benefit usage',
        ar: 'يكمل استخدامك للمزايا',
      };
    case 'interest':
      return {
        en: `Matches your interests${profileContext?.interests?.[0] ? `: ${profileContext.interests[0]}` : ''}`,
        ar: `يتوافق مع اهتماماتك`,
      };
    case 'popular':
      return {
        en: 'Popular with colleagues',
        ar: 'شائع بين الزملاء',
      };
    case 'high_value':
      return {
        en: 'Highest value offer in this category',
        ar: 'أعلى قيمة في هذه الفئة',
      };
    case 'new_partner':
      return {
        en: 'New partner on the platform',
        ar: 'شريك جديد على المنصة',
      };
    case 'expiring_soon':
      return {
        en: 'Offer ending soon',
        ar: 'العرض ينتهي قريباً',
      };
    default:
      return {
        en: 'Recommended for you',
        ar: 'موصى به لك',
      };
  }
}
