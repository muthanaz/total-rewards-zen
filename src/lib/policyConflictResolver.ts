/**
 * Policy Conflict Resolver
 * 
 * Deterministic selection when multiple policies match a category.
 * Priority: effective_from (latest) > version_number > explicit priority field
 */

// =============================================================================
// TYPES
// =============================================================================

export interface PolicyCandidate {
  id: string;
  policy_ref: string;
  title: string;
  category: string;
  status: string;
  is_active: boolean;
  effective_from: string;
  effective_to: string | null;
  priority: number;
  is_pilot: boolean;
  pilot_group_ids: string[] | null;
  pilot_end_date: string | null;
  version_number?: number;
}

export interface ConflictResolutionResult {
  selected_policy: PolicyCandidate | null;
  had_conflict: boolean;
  conflict_count: number;
  selection_reason: string;
  rejected_policies: Array<{
    policy: PolicyCandidate;
    rejection_reason: string;
  }>;
  warnings: string[];
}

export interface PilotCheckContext {
  user_id: string;
  current_date?: Date;
}

// =============================================================================
// CONFLICT DETECTION
// =============================================================================

/**
 * Check if a policy is currently active (within effective dates)
 */
export function isPolicyEffective(policy: PolicyCandidate, asOfDate: Date = new Date()): boolean {
  const effectiveFrom = new Date(policy.effective_from);
  const effectiveTo = policy.effective_to ? new Date(policy.effective_to) : null;
  
  if (asOfDate < effectiveFrom) return false;
  if (effectiveTo && asOfDate > effectiveTo) return false;
  
  return true;
}

/**
 * Check if user is in pilot group
 */
export function isInPilotGroup(
  policy: PolicyCandidate,
  context: PilotCheckContext
): boolean {
  if (!policy.is_pilot) return true; // Not a pilot = everyone eligible
  
  const currentDate = context.current_date || new Date();
  
  // Check if pilot has expired
  if (policy.pilot_end_date) {
    const endDate = new Date(policy.pilot_end_date);
    if (currentDate > endDate) return false;
  }
  
  // Check if user is in pilot group
  if (policy.pilot_group_ids && policy.pilot_group_ids.length > 0) {
    return policy.pilot_group_ids.includes(context.user_id);
  }
  
  // Empty pilot_group_ids means everyone is eligible (public pilot)
  return true;
}

/**
 * Compare two policies for priority
 * Returns: negative if a < b, positive if a > b, 0 if equal
 */
function comparePolicies(a: PolicyCandidate, b: PolicyCandidate): number {
  // 1. Explicit priority (higher = better)
  if (a.priority !== b.priority) {
    return b.priority - a.priority;
  }
  
  // 2. Effective from date (later = better, more recent)
  const aDate = new Date(a.effective_from).getTime();
  const bDate = new Date(b.effective_from).getTime();
  if (aDate !== bDate) {
    return bDate - aDate;
  }
  
  // 3. Version number (higher = better)
  const aVersion = a.version_number || 0;
  const bVersion = b.version_number || 0;
  if (aVersion !== bVersion) {
    return bVersion - aVersion;
  }
  
  // 4. Alphabetical by policy_ref (for determinism)
  return a.policy_ref.localeCompare(b.policy_ref);
}

// =============================================================================
// RESOLUTION ENGINE
// =============================================================================

/**
 * Resolve conflicts among multiple matching policies
 */
export function resolveConflict(
  candidates: PolicyCandidate[],
  pilotContext?: PilotCheckContext
): ConflictResolutionResult {
  const warnings: string[] = [];
  const asOfDate = pilotContext?.current_date || new Date();
  
  if (candidates.length === 0) {
    return {
      selected_policy: null,
      had_conflict: false,
      conflict_count: 0,
      selection_reason: 'No matching policies found',
      rejected_policies: [],
      warnings,
    };
  }
  
  // Filter to only active and effective policies
  const effectivePolicies = candidates.filter(p => 
    p.is_active && 
    p.status === 'published' && 
    isPolicyEffective(p, asOfDate)
  );
  
  // Filter by pilot eligibility if context provided
  const eligiblePolicies = pilotContext
    ? effectivePolicies.filter(p => isInPilotGroup(p, pilotContext))
    : effectivePolicies;
  
  if (eligiblePolicies.length === 0) {
    return {
      selected_policy: null,
      had_conflict: false,
      conflict_count: 0,
      selection_reason: 'No eligible policies (may be outside effective dates or pilot group)',
      rejected_policies: effectivePolicies.map(p => ({
        policy: p,
        rejection_reason: pilotContext && !isInPilotGroup(p, pilotContext) 
          ? 'Not in pilot group'
          : 'Outside effective dates',
      })),
      warnings,
    };
  }
  
  // Single policy = no conflict
  if (eligiblePolicies.length === 1) {
    return {
      selected_policy: eligiblePolicies[0],
      had_conflict: false,
      conflict_count: 1,
      selection_reason: 'Only matching policy',
      rejected_policies: [],
      warnings,
    };
  }
  
  // Multiple policies = conflict
  warnings.push(
    `${eligiblePolicies.length} policies match this category. Selecting based on priority, effective date, and version.`
  );
  
  // Sort by priority criteria
  const sorted = [...eligiblePolicies].sort(comparePolicies);
  const selected = sorted[0];
  const rejected = sorted.slice(1);
  
  // Build selection reason
  const reasons: string[] = [];
  if (selected.priority > 0) {
    reasons.push(`priority ${selected.priority}`);
  }
  reasons.push(`effective ${new Date(selected.effective_from).toLocaleDateString()}`);
  if (selected.version_number) {
    reasons.push(`version ${selected.version_number}`);
  }
  
  return {
    selected_policy: selected,
    had_conflict: true,
    conflict_count: eligiblePolicies.length,
    selection_reason: `Selected by: ${reasons.join(', ')}`,
    rejected_policies: rejected.map(p => ({
      policy: p,
      rejection_reason: buildRejectionReason(p, selected),
    })),
    warnings,
  };
}

/**
 * Build rejection reason comparing to selected policy
 */
function buildRejectionReason(rejected: PolicyCandidate, selected: PolicyCandidate): string {
  if (rejected.priority < selected.priority) {
    return `Lower priority (${rejected.priority} < ${selected.priority})`;
  }
  
  const rejectedDate = new Date(rejected.effective_from);
  const selectedDate = new Date(selected.effective_from);
  if (rejectedDate < selectedDate) {
    return `Earlier effective date (${rejectedDate.toLocaleDateString()})`;
  }
  
  const rejectedVersion = rejected.version_number || 0;
  const selectedVersion = selected.version_number || 0;
  if (rejectedVersion < selectedVersion) {
    return `Lower version (${rejectedVersion} < ${selectedVersion})`;
  }
  
  return 'Superseded by higher priority policy';
}

// =============================================================================
// DISPLAY HELPERS
// =============================================================================

/**
 * Format pilot badge info
 */
export function getPilotBadgeInfo(policy: PolicyCandidate): {
  isPilot: boolean;
  label: string;
  endDate: string | null;
} | null {
  if (!policy.is_pilot) return null;
  
  return {
    isPilot: true,
    label: 'Pilot Program',
    endDate: policy.pilot_end_date,
  };
}

/**
 * Check for overlapping policies (warning only)
 */
export function checkForOverlaps(
  policies: PolicyCandidate[]
): Array<{ policy1: string; policy2: string; reason: string }> {
  const overlaps: Array<{ policy1: string; policy2: string; reason: string }> = [];
  
  for (let i = 0; i < policies.length; i++) {
    for (let j = i + 1; j < policies.length; j++) {
      const p1 = policies[i];
      const p2 = policies[j];
      
      // Same category
      if (p1.category.toLowerCase() !== p2.category.toLowerCase()) continue;
      
      // Both active and published
      if (!p1.is_active || !p2.is_active) continue;
      if (p1.status !== 'published' || p2.status !== 'published') continue;
      
      // Check date overlap
      const p1Start = new Date(p1.effective_from);
      const p2Start = new Date(p2.effective_from);
      const p1End = p1.effective_to ? new Date(p1.effective_to) : new Date('2099-12-31');
      const p2End = p2.effective_to ? new Date(p2.effective_to) : new Date('2099-12-31');
      
      if (p1Start <= p2End && p2Start <= p1End) {
        overlaps.push({
          policy1: p1.policy_ref,
          policy2: p2.policy_ref,
          reason: `Both active for ${p1.category} with overlapping dates`,
        });
      }
    }
  }
  
  return overlaps;
}
