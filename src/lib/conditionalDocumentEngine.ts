/**
 * Conditional Document Evaluation Engine
 * 
 * Dynamically evaluates policy_required_docs.conditions_json at submission time.
 * Supports: amount_threshold, location, category, and boolean AND rules.
 */

import type { EmployeeContext } from '@/lib/policyEngine';
import type { PolicyRequiredDoc } from '@/lib/policyEngine';

// =============================================================================
// TYPES
// =============================================================================

export interface DocumentCondition {
  /** Amount must be >= this threshold */
  amount_threshold?: number;
  /** Employee location must match */
  location?: string | string[];
  /** Category must match (for cross-category docs) */
  category?: string | string[];
  /** Specific grades only */
  grade?: string | string[];
  /** Minimum tenure in months */
  min_tenure_months?: number;
  /** All conditions must match (AND logic) - default true */
  match_all?: boolean;
}

export interface EvaluatedDocument {
  id: string;
  doc_type: string;
  doc_name: string;
  description: string | null;
  is_required: boolean;
  transaction_type: 'request' | 'claim' | 'both';
  // Evaluation results
  was_conditionally_required: boolean;
  condition_met: boolean;
  condition_evaluation: ConditionEvaluation;
  derivation_reason: string;
}

export interface ConditionEvaluation {
  conditions_checked: string[];
  conditions_met: string[];
  conditions_failed: string[];
  amount_checked?: number;
  location_checked?: string;
  grade_checked?: string;
  tenure_checked?: number;
}

export interface ConditionContext {
  amount: number | null;
  employee: EmployeeContext | null;
  category: string;
  transactionType: 'claim' | 'request';
}

// =============================================================================
// EVALUATION ENGINE
// =============================================================================

/**
 * Check if a single condition is met
 */
function checkCondition(
  conditionType: string,
  conditionValue: unknown,
  context: ConditionContext
): { met: boolean; reason: string } {
  switch (conditionType) {
    case 'amount_threshold': {
      const threshold = Number(conditionValue);
      const amount = context.amount ?? 0;
      const met = amount >= threshold;
      return {
        met,
        reason: met 
          ? `Amount ${amount} >= threshold ${threshold}` 
          : `Amount ${amount} < threshold ${threshold}`,
      };
    }

    case 'location': {
      const allowedLocations = Array.isArray(conditionValue) 
        ? conditionValue 
        : [conditionValue];
      const employeeLocation = context.employee?.location || '';
      const met = allowedLocations.some(
        loc => loc.toLowerCase() === employeeLocation.toLowerCase()
      );
      return {
        met,
        reason: met 
          ? `Location ${employeeLocation} matches required` 
          : `Location ${employeeLocation} not in ${allowedLocations.join(', ')}`,
      };
    }

    case 'category': {
      const allowedCategories = Array.isArray(conditionValue) 
        ? conditionValue 
        : [conditionValue];
      const met = allowedCategories.some(
        cat => cat.toLowerCase() === context.category.toLowerCase()
      );
      return {
        met,
        reason: met 
          ? `Category ${context.category} matches` 
          : `Category ${context.category} not in ${allowedCategories.join(', ')}`,
      };
    }

    case 'grade': {
      const allowedGrades = Array.isArray(conditionValue) 
        ? conditionValue 
        : [conditionValue];
      const employeeGrade = context.employee?.grade || '';
      const met = allowedGrades.some(
        g => g.toLowerCase() === employeeGrade.toLowerCase()
      );
      return {
        met,
        reason: met 
          ? `Grade ${employeeGrade} matches` 
          : `Grade ${employeeGrade} not in ${allowedGrades.join(', ')}`,
      };
    }

    case 'min_tenure_months': {
      const minTenure = Number(conditionValue);
      const tenure = context.employee?.tenure_months ?? 0;
      const met = tenure >= minTenure;
      return {
        met,
        reason: met 
          ? `Tenure ${tenure} months >= ${minTenure}` 
          : `Tenure ${tenure} months < ${minTenure}`,
      };
    }

    default:
      return { met: true, reason: `Unknown condition type: ${conditionType}` };
  }
}

/**
 * Evaluate all conditions for a document
 */
function evaluateConditions(
  conditions: DocumentCondition,
  context: ConditionContext
): ConditionEvaluation {
  const conditionsChecked: string[] = [];
  const conditionsMet: string[] = [];
  const conditionsFailed: string[] = [];

  // Default to AND logic
  const matchAll = conditions.match_all !== false;

  const conditionEntries = Object.entries(conditions).filter(
    ([key]) => key !== 'match_all'
  );

  for (const [conditionType, conditionValue] of conditionEntries) {
    if (conditionValue === undefined || conditionValue === null) continue;
    
    conditionsChecked.push(conditionType);
    const result = checkCondition(conditionType, conditionValue, context);
    
    if (result.met) {
      conditionsMet.push(`${conditionType}: ${result.reason}`);
    } else {
      conditionsFailed.push(`${conditionType}: ${result.reason}`);
    }
  }

  return {
    conditions_checked: conditionsChecked,
    conditions_met: conditionsMet,
    conditions_failed: conditionsFailed,
    amount_checked: context.amount ?? undefined,
    location_checked: context.employee?.location ?? undefined,
    grade_checked: context.employee?.grade ?? undefined,
    tenure_checked: context.employee?.tenure_months,
  };
}

/**
 * Determine if conditions are satisfied (based on AND/OR logic)
 */
function areConditionsSatisfied(
  conditions: DocumentCondition,
  evaluation: ConditionEvaluation
): boolean {
  if (evaluation.conditions_checked.length === 0) {
    // No conditions means always required
    return true;
  }

  const matchAll = conditions.match_all !== false;
  
  if (matchAll) {
    // AND logic: all conditions must be met
    return evaluation.conditions_failed.length === 0;
  } else {
    // OR logic: at least one condition must be met
    return evaluation.conditions_met.length > 0;
  }
}

/**
 * Evaluate a list of policy required docs against submission context
 */
export function evaluateConditionalDocuments(
  docs: PolicyRequiredDoc[],
  context: ConditionContext,
  policyRef: string
): EvaluatedDocument[] {
  return docs
    .filter(doc => 
      doc.transaction_type === context.transactionType || 
      doc.transaction_type === 'both'
    )
    .map(doc => {
      const conditions = (doc.conditions_json || {}) as DocumentCondition;
      const hasConditions = Object.keys(conditions).filter(k => k !== 'match_all').length > 0;
      
      const evaluation = evaluateConditions(conditions, context);
      const conditionMet = areConditionsSatisfied(conditions, evaluation);

      // Document is required if:
      // 1. It's marked as required AND
      // 2. Either has no conditions OR conditions are met
      const isRequired = doc.is_required && (!hasConditions || conditionMet);

      // Build derivation reason
      let derivationReason: string;
      if (!doc.is_required) {
        derivationReason = `Optional per policy ${policyRef}`;
      } else if (!hasConditions) {
        derivationReason = `Required by policy ${policyRef} for ${context.transactionType}`;
      } else if (conditionMet) {
        derivationReason = `Required: ${evaluation.conditions_met.join('; ')}`;
      } else {
        derivationReason = `Not required: ${evaluation.conditions_failed.join('; ')}`;
      }

      return {
        id: doc.id || '',
        doc_type: doc.doc_type,
        doc_name: doc.doc_name,
        description: doc.description || null,
        is_required: isRequired,
        transaction_type: doc.transaction_type,
        was_conditionally_required: hasConditions && conditionMet,
        condition_met: conditionMet,
        condition_evaluation: evaluation,
        derivation_reason: derivationReason,
      };
    });
}

/**
 * Generate derivation summary for HR review
 */
export function generateDerivationSummary(docs: EvaluatedDocument[]): string {
  const required = docs.filter(d => d.is_required);
  const conditional = docs.filter(d => d.was_conditionally_required);
  const skipped = docs.filter(d => !d.is_required && !d.condition_met);

  const parts: string[] = [];
  
  if (required.length > 0) {
    parts.push(`${required.length} required document(s)`);
  }
  if (conditional.length > 0) {
    parts.push(`${conditional.length} conditionally triggered`);
  }
  if (skipped.length > 0) {
    parts.push(`${skipped.length} skipped (conditions not met)`);
  }

  return parts.join(', ') || 'No documents applicable';
}
