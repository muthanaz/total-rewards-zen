/**
 * Policy-Driven Submission Hook
 * 
 * Provides complete policy validation for employee claim/request submissions.
 * Auto-selects the applicable published policy, validates eligibility, limits,
 * and required documents.
 *
 * Supports configurable enforcement modes:
 * - soft: allow submit but mark as non-compliant
 * - strict: block submit on policy violations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  EligibilityRules,
  LimitsCaps,
  WorkflowRules,
  EmployeeContext,
  checkEligibility,
  DEFAULT_ELIGIBILITY_RULES,
  DEFAULT_LIMITS_CAPS,
  DEFAULT_WORKFLOW,
} from '@/lib/policyEngine';
import { generateChecklistSnapshot, snapshotToRequestDocuments } from '@/lib/checklistSnapshot';
import type { EnforcementMode } from '@/hooks/useEnforcementMode';

// ============================================================================
// TYPES
// ============================================================================

export interface PolicyMatch {
  policyId: string;
  policyRef: string;
  policyTitle: string;
  policyVersionId: string;
  versionNumber: number;
  transactionModel: 'request_only' | 'claim_only' | 'hybrid';
  eligibilityRules: EligibilityRules;
  limits: LimitsCaps;
  workflow: WorkflowRules;
  requiredDocs: PolicyRequiredDoc[];
  slaDays: number | null;
}

export interface PolicyRequiredDoc {
  id: string;
  doc_type: string;
  doc_name: string;
  description: string | null;
  is_required: boolean;
  transaction_type: 'request' | 'claim' | 'both';
}

export interface SubmissionValidation {
  canSubmit: boolean;
  blockers: ValidationIssue[];
  warnings: ValidationIssue[];
  info: ValidationIssue[];
}

export interface ValidationIssue {
  type: 'eligibility' | 'limit' | 'document' | 'policy';
  code: string;
  message: string;
  details?: string;
}

export interface PolicySubmissionParams {
  category: string;
  type: 'claim' | 'request' | 'question';
  title: string;
  description: string;
  amount?: number;
  priority?: 'low' | 'standard' | 'high' | 'urgent';
}

function normalizeTransactionModel(model: unknown): PolicyMatch['transactionModel'] {
  // Backwards compatibility: older code used request_and_claim
  if (model === 'request_and_claim') return 'hybrid';
  if (model === 'hybrid') return 'hybrid';
  if (model === 'request_only') return 'request_only';
  return 'claim_only';
}

function getEffectiveTransactionType(params: PolicySubmissionParams, policy: PolicyMatch | null): 'claim' | 'request' | null {
  if (params.type === 'question') return null;
  if (!policy) return params.type;

  const amount = params.amount ?? null;
  const threshold = policy.limits.pre_approval_threshold ?? null;

  switch (policy.transactionModel) {
    case 'request_only':
      return 'request';
    case 'claim_only':
      return 'claim';
    case 'hybrid':
      if (amount && threshold && amount > threshold) return 'request';
      return 'claim';
    default:
      return params.type;
  }
}

// ============================================================================
// CATEGORY TO POLICY MAPPING
// ============================================================================

const CATEGORY_POLICY_MAP: Record<string, string[]> = {
  'Health Insurance': ['health', 'medical', 'insurance'],
  'Housing': ['housing', 'accommodation', 'rent'],
  'Education Allowance': ['education', 'school', 'tuition'],
  'Schooling': ['education', 'school', 'tuition'],
  'Transport': ['transport', 'travel', 'commute'],
  'Learning & Development': ['learning', 'training', 'development', 'l&d'],
  'Wellbeing': ['wellbeing', 'wellness', 'health'],
  'Leave': ['leave', 'absence', 'vacation'],
  'Per Diem': ['per diem', 'travel', 'allowance'],
  'Financial': ['financial', 'loan', 'advance'],
};

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Fetch the applicable policy for a given category
 */
export function usePolicyForCategory(category: string | null) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['policy_for_category', category, user?.id],
    queryFn: async (): Promise<PolicyMatch | null> => {
      if (!category || !user?.id) return null;
      
      // Get user's org
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();
      
      if (!profile?.organization_id) return null;
      
      // Build search terms
      const searchTerms = CATEGORY_POLICY_MAP[category] || [category.toLowerCase()];
      
      // Find matching published policy
      let policy = null;
      
      // Try direct category match first
      const { data: directMatch } = await supabase
        .from('policies')
        .select('id, policy_ref, title, transaction_model, status, category')
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true)
        .eq('status', 'published')
        .ilike('category', category)
        .maybeSingle();
      
      if (directMatch) {
        policy = directMatch;
      } else {
        // Try title/benefit_key match
        for (const term of searchTerms) {
          const { data: titleMatch } = await supabase
            .from('policies')
            .select('id, policy_ref, title, transaction_model, status, category')
            .eq('organization_id', profile.organization_id)
            .eq('is_active', true)
            .eq('status', 'published')
            .ilike('title', `%${term}%`)
            .limit(1)
            .maybeSingle();
          
          if (titleMatch) {
            policy = titleMatch;
            break;
          }
        }
      }
      
      if (!policy) return null;
      
      // Fetch the published version
      const { data: version } = await supabase
        .from('policy_versions')
        .select('id, version_number, logic_json')
        .eq('policy_id', policy.id)
        .eq('status', 'published')
        .order('version_number', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (!version) return null;
      
      // Fetch required docs
      const { data: docs } = await supabase
        .from('policy_required_docs')
        .select('id, doc_type, doc_name, description, is_required, transaction_type')
        .eq('policy_version_id', version.id);
      
      // Parse logic_json
      const logic = version.logic_json as Record<string, unknown> | null;
      
       return {
        policyId: policy.id,
        policyRef: policy.policy_ref,
        policyTitle: policy.title,
        policyVersionId: version.id,
        versionNumber: version.version_number,
         transactionModel: normalizeTransactionModel(logic?.transaction_model),
        eligibilityRules: (logic?.eligibility_rules as EligibilityRules) || DEFAULT_ELIGIBILITY_RULES,
        limits: (logic?.limits_caps as LimitsCaps) || DEFAULT_LIMITS_CAPS,
        workflow: (logic?.workflow as WorkflowRules) || DEFAULT_WORKFLOW,
        requiredDocs: (docs || []) as PolicyRequiredDoc[],
         slaDays: ((logic?.workflow as WorkflowRules)?.sla_days as number | null | undefined) ?? null,
      };
    },
    enabled: !!category && !!user?.id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get employee context for eligibility checks
 */
export function useEmployeeContext() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['employee_context', user?.id],
    queryFn: async (): Promise<EmployeeContext | null> => {
      if (!user?.id) return null;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('grade, department, work_location, employment_date')
        .eq('user_id', user.id)
        .single();
      
      if (!profile) return null;
      
      // Calculate tenure in months
      const employmentDate = profile.employment_date 
        ? new Date(profile.employment_date) 
        : new Date();
      const tenureMonths = Math.floor(
        (Date.now() - employmentDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
      );
      
      return {
        user_id: user.id,
        grade: profile.grade || null,
        department: profile.department || null,
        location: profile.work_location || null,
        contract_type: 'permanent', // Default - could be fetched from profile
        tenure_months: tenureMonths,
        probation_passed: tenureMonths >= 3, // Assume 3-month probation
      };
    },
    enabled: !!user?.id,
  });
}

/**
 * Get employee's current utilization for a benefit
 */
export function useEmployeeUtilization(policyId: string | null) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['employee_utilization', user?.id, policyId],
    queryFn: async (): Promise<number> => {
      if (!user?.id || !policyId) return 0;
      
      // Get year-to-date approved/paid claims for this policy's category
      const startOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString();
      
      const { data } = await supabase
        .from('requests')
        .select('amount')
        .eq('user_id', user.id)
        .eq('policy_id', policyId)
        .in('status', ['approved', 'paid'])
        .gte('created_at', startOfYear);
      
      return (data || []).reduce((sum, r) => sum + (r.amount || 0), 0);
    },
    enabled: !!user?.id && !!policyId,
  });
}

/**
 * Validate submission against policy rules
 */
export function useSubmissionValidation(
  policy: PolicyMatch | null | undefined,
  employeeContext: EmployeeContext | null | undefined,
  transactionType: 'claim' | 'request' | 'question',
  amount: number | null,
  currentUtilization: number
): SubmissionValidation {
  return useMemo(() => {
    const blockers: ValidationIssue[] = [];
    const warnings: ValidationIssue[] = [];
    const info: ValidationIssue[] = [];
    
    // Questions don't need policy validation
    if (transactionType === 'question') {
      return { canSubmit: true, blockers, warnings, info };
    }
    
    // No policy found - warn but allow (legacy behavior)
    if (!policy) {
      warnings.push({
        type: 'policy',
        code: 'NO_POLICY',
        message: 'No policy configured for this category',
        details: 'Your request will be processed manually by HR.',
      });
      return { canSubmit: true, blockers, warnings, info };
    }
    
    // Check eligibility
    if (employeeContext) {
      const eligibility = checkEligibility(employeeContext, policy.eligibilityRules);
      
      if (!eligibility.eligible) {
        blockers.push({
          type: 'eligibility',
          code: 'NOT_ELIGIBLE',
          message: 'You are not eligible for this benefit',
          details: eligibility.reasons[0] || 'Contact HR for more information.',
        });
      } else {
        info.push({
          type: 'eligibility',
          code: 'ELIGIBLE',
          message: 'Eligibility confirmed',
        });
      }
    }
    
    // Check limits if amount provided
    if (amount && amount > 0) {
      const { limits } = policy;
      
      // Per-transaction limit
      if (limits.per_transaction_cap && amount > limits.per_transaction_cap) {
        blockers.push({
          type: 'limit',
          code: 'EXCEEDS_TRANSACTION_LIMIT',
          message: `Amount exceeds per-transaction limit of ${limits.per_transaction_cap.toLocaleString()} ${limits.annual_cap_currency}`,
          details: 'Please reduce the amount or split into multiple claims.',
        });
      }
      
      // Annual cap check
      if (limits.annual_cap) {
        const remaining = limits.annual_cap - currentUtilization;
        const projectedTotal = currentUtilization + amount;
        
        if (projectedTotal > limits.annual_cap) {
          blockers.push({
            type: 'limit',
            code: 'EXCEEDS_ANNUAL_CAP',
            message: `Would exceed annual cap of ${limits.annual_cap.toLocaleString()} ${limits.annual_cap_currency}`,
            details: `You have ${remaining.toLocaleString()} ${limits.annual_cap_currency} remaining this year.`,
          });
        } else if (remaining < amount * 1.2) {
          warnings.push({
            type: 'limit',
            code: 'NEAR_ANNUAL_CAP',
            message: `You're approaching your annual limit`,
            details: `${remaining.toLocaleString()} ${limits.annual_cap_currency} remaining after this claim.`,
          });
        }
      }
      
      // Pre-approval check
      if (limits.pre_approval_threshold && amount > limits.pre_approval_threshold) {
        if (policy.transactionModel === 'claim_only') {
          warnings.push({
            type: 'limit',
            code: 'NEEDS_PREAPPROVAL',
            message: `Amounts over ${limits.pre_approval_threshold.toLocaleString()} may require pre-approval`,
            details: 'HR may request additional documentation.',
          });
        } else {
          info.push({
            type: 'limit',
            code: 'PREAPPROVAL_REQUIRED',
            message: `Pre-approval required for amounts over ${limits.pre_approval_threshold.toLocaleString()}`,
          });
        }
      }
    }
    
    // Check required documents
    const applicableDocs = policy.requiredDocs.filter(d => 
      d.is_required && (d.transaction_type === transactionType || d.transaction_type === 'both')
    );
    
    if (applicableDocs.length > 0) {
      info.push({
        type: 'document',
        code: 'DOCS_REQUIRED',
        message: `${applicableDocs.length} document(s) required`,
        details: applicableDocs.map(d => d.doc_name).join(', '),
      });
    }
    
    return {
      canSubmit: blockers.length === 0,
      blockers,
      warnings,
      info,
    };
  }, [policy, employeeContext, transactionType, amount, currentUtilization]);
}

/**
 * Submit request with policy linkage
 */
export function usePolicyDrivenSubmission() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      params,
      policy,
      validation,
      employeeContext,
      enforcementMode = 'soft',
    }: {
      params: PolicySubmissionParams;
      policy: PolicyMatch | null;
      validation?: SubmissionValidation;
      employeeContext?: EmployeeContext | null;
      enforcementMode?: EnforcementMode;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      // STRICT MODE: block submit if validation has blockers
      if (enforcementMode === 'strict' && validation && validation.blockers.length > 0) {
        const firstBlocker = validation.blockers[0];
        throw new Error(`Cannot submit: ${firstBlocker.message}. ${firstBlocker.details || ''}`);
      }

      // Get user's org
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id, grade, department, work_location, employment_date')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      // Calculate SLA (optional)
      const effectiveType = getEffectiveTransactionType(params, policy);
      const configuredSlaDays = policy?.slaDays ?? null;
      const slaHours = configuredSlaDays ? configuredSlaDays * 24 : null;

      // Get required docs from policy (based on effective transaction type)
      const requiredDocs =
        policy?.requiredDocs
          .filter(
            (d) =>
              d.is_required &&
              (d.transaction_type === (effectiveType || params.type) || d.transaction_type === 'both')
          )
          .map((d) => d.doc_name) || [];

      const initialStatus =
        params.type !== 'question' && requiredDocs.length > 0 ? 'pending_employee' : 'pending';

      // Determine compliance status based on validation
      let complianceStatus: 'compliant' | 'non_compliant' | 'pending_check' | 'exempt' = 'pending_check';
      let complianceReasons: ValidationIssue[] = [];

      if (params.type === 'question') {
        complianceStatus = 'exempt';
      } else if (validation) {
        if (validation.blockers.length > 0 || validation.warnings.length > 0) {
          complianceStatus = 'non_compliant';
          complianceReasons = [...validation.blockers, ...validation.warnings];
        } else {
          complianceStatus = 'compliant';
        }
      }

      // Build employee context for snapshot
      const tenureMonths = profile.employment_date
        ? Math.floor((Date.now() - new Date(profile.employment_date).getTime()) / (1000 * 60 * 60 * 24 * 30))
        : 0;

      const contextSnapshot: EmployeeContext = employeeContext || {
        user_id: user.id,
        grade: profile.grade || null,
        department: profile.department || null,
        location: profile.work_location || null,
        contract_type: 'permanent',
        tenure_months: tenureMonths,
        probation_passed: tenureMonths >= 3,
      };

      // Generate checklist snapshot (for Health vertical slice)
      let checklistSnapshotJson: ReturnType<typeof generateChecklistSnapshot> | null = null;
      if (policy && params.type !== 'question' && effectiveType) {
        checklistSnapshotJson = generateChecklistSnapshot(
          {
            policyId: policy.policyId,
            policyVersionId: policy.policyVersionId,
            policyRef: policy.policyRef,
            requiredDocs: policy.requiredDocs,
          },
          effectiveType,
          contextSnapshot
        );
      }

      // Build request (cast to bypass type lag after migration)
      const insertPayload = {
        user_id: user.id,
        organization_id: profile.organization_id,
        request_type: params.type === 'question' ? 'question' : (effectiveType || params.type),
        transaction_type: params.type === 'question' ? null : (effectiveType || params.type),
        category: params.category,
        subject: params.title,
        description: params.description,
        amount: params.amount || null,
        currency: params.amount ? 'AED' : null,
        status: initialStatus,
        priority: params.priority || 'standard',
        submitted_at: new Date().toISOString(),
        sla_hours: slaHours,
        policy_id: policy?.policyId || null,
        policy_version_id: policy?.policyVersionId || null,
        policy_ref: policy?.policyRef || null,
        required_docs: requiredDocs,
        missing_docs: params.type !== 'question' ? requiredDocs : [],
        grade: profile.grade,
        department: profile.department,
        location: profile.work_location,
        employee_context_json: {
          grade: contextSnapshot.grade,
          department: contextSnapshot.department,
          location: contextSnapshot.location,
          contract_type: contextSnapshot.contract_type,
          tenure_months: contextSnapshot.tenure_months,
          probation_passed: contextSnapshot.probation_passed,
        },
        compliance_status: complianceStatus,
        compliance_reasons_json: complianceReasons,
        checklist_snapshot_json: checklistSnapshotJson,
      };

      const { data: request, error } = await supabase
        .from('requests')
        .insert(insertPayload as any)
        .select()
        .single();

      if (error) throw error;

      // Create document checklist from snapshot (unified model - all categories use request_documents)
      if (checklistSnapshotJson) {
        const docRows = snapshotToRequestDocuments(request.id, checklistSnapshotJson);
        if (docRows.length > 0) {
          await supabase.from('request_documents').insert(docRows);
        }
      } else if (params.type !== 'question' && policy?.requiredDocs.length) {
        // Fallback: create request_documents rows directly from policy docs
        const applicableDocs = policy.requiredDocs.filter(
          (d) =>
            d.is_required &&
            (d.transaction_type === (effectiveType || params.type) || d.transaction_type === 'both')
        );
        const docEntries = applicableDocs.map((doc) => ({
          request_id: request.id,
          policy_version_id: policy.policyVersionId,
          doc_type: doc.doc_type,
          doc_name: doc.doc_name,
          required_for: doc.transaction_type,
          is_required: doc.is_required,
          status: 'missing' as const,
          source_doc_id: doc.id,
          derivation_reason: `Required by policy ${policy.policyRef}`,
        }));
        if (docEntries.length > 0) {
          await supabase.from('request_documents').insert(docEntries);
        }
      }

      // Create initial event
      await supabase.from('request_events').insert({
        request_id: request.id,
        actor_user_id: user.id,
        from_status: null,
        to_status: initialStatus,
        action: 'submitted',
        notes_employee_visible: 'Request submitted successfully',
        meta: policy
          ? {
              policy_ref: policy.policyRef,
              policy_title: policy.policyTitle,
              transaction_model: policy.transactionModel,
              enforcement_mode: enforcementMode,
              compliance_status: complianceStatus,
            }
          : null,
      });

      return { ...request, complianceStatus, complianceReasons };
    },
    onSuccess: (result: any) => {
      queryClient.invalidateQueries({ queryKey: ['employee_requests'] });

      const missingDocs = Array.isArray(result?.missing_docs) ? result.missing_docs : [];
      const hasMissingDocs = missingDocs.length > 0;
      const isNonCompliant = result?.complianceStatus === 'non_compliant';

      if (isNonCompliant && hasMissingDocs) {
        toast({
          title: 'Submitted — review needed',
          description: `Your request was submitted but flagged for review. Upload: ${missingDocs.slice(0, 2).join(', ')}${missingDocs.length > 2 ? '…' : ''}`,
        });
      } else if (isNonCompliant) {
        toast({
          title: 'Submitted — flagged for review',
          description: "Your request was submitted but doesn't fully meet policy requirements. HR will review.",
        });
      } else if (hasMissingDocs) {
        toast({
          title: 'Submitted — documents required',
          description: `Upload: ${missingDocs.slice(0, 3).join(', ')}${missingDocs.length > 3 ? '…' : ''}`,
        });
      } else {
        toast({
          title: 'Request submitted',
          description: 'Your request is now pending review.',
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Submission failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
    },
  });
}
