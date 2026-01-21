/**
 * Data Quality Rules Hook
 * 
 * Manages data quality rules for the employer portal with run, filtering, and issue resolution.
 */

import { useState, useMemo, useCallback } from 'react';

export type RuleSeverity = 'critical' | 'high' | 'medium' | 'low';
export type RuleStatus = 'active' | 'paused';
export type RuleDataSource = 'HRIS' | 'Payroll' | 'Benefits' | 'Claims' | 'Survey' | 'Benchmark';

export interface DataQualityRule {
  id: string;
  name: string;
  description: string;
  dataSource: RuleDataSource;
  severity: RuleSeverity;
  status: RuleStatus;
  logic: string; // Plain language description of the rule
  violations: number;
  lastRun: Date | null;
  recommendedFix: string;
  relatedIssueId?: string; // Links to DataConfidenceIssue
}

export interface RuleViolation {
  id: string;
  ruleId: string;
  ruleName: string;
  employee?: string;
  record?: string;
  field: string;
  issue: string;
  detectedAt: Date;
  severity: RuleSeverity;
}

// Seed 10 realistic data quality rules
const SEED_RULES: DataQualityRule[] = [
  {
    id: 'rule-001',
    name: 'Missing Employee ID',
    description: 'Every employee record must have a unique employee_id',
    dataSource: 'HRIS',
    severity: 'critical',
    status: 'active',
    logic: 'SELECT * FROM employees WHERE employee_id IS NULL OR employee_id = \'\'',
    violations: 12,
    lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000),
    recommendedFix: 'Add missing employee IDs in HRIS or data import',
  },
  {
    id: 'rule-002',
    name: 'Duplicate Employee ID',
    description: 'Employee IDs must be unique across the organization',
    dataSource: 'HRIS',
    severity: 'critical',
    status: 'active',
    logic: 'SELECT employee_id, COUNT(*) FROM employees GROUP BY employee_id HAVING COUNT(*) > 1',
    violations: 3,
    lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000),
    recommendedFix: 'Merge or correct duplicate employee records',
  },
  {
    id: 'rule-003',
    name: 'Missing Grade/Department/Location',
    description: 'Required fields for benefit eligibility must be populated',
    dataSource: 'HRIS',
    severity: 'high',
    status: 'active',
    logic: 'SELECT * FROM employees WHERE grade IS NULL OR department IS NULL OR work_location IS NULL',
    violations: 45,
    lastRun: new Date(Date.now() - 4 * 60 * 60 * 1000),
    recommendedFix: 'Complete employee profiles with missing classification data',
  },
  {
    id: 'rule-004',
    name: 'Claim Without Policy Reference',
    description: 'Every claim must be linked to a valid policy_ref',
    dataSource: 'Claims',
    severity: 'high',
    status: 'active',
    logic: 'SELECT * FROM claims WHERE policy_ref IS NULL OR policy_ref NOT IN (SELECT policy_ref FROM policies)',
    violations: 8,
    lastRun: new Date(Date.now() - 6 * 60 * 60 * 1000),
    recommendedFix: 'Link orphan claims to appropriate policies',
    relatedIssueId: 'issue-004',
  },
  {
    id: 'rule-005',
    name: 'Claim Amount Exceeds Entitlement',
    description: 'Claim amounts should not exceed remaining entitlement balance',
    dataSource: 'Claims',
    severity: 'high',
    status: 'active',
    logic: 'SELECT c.* FROM claims c JOIN entitlements e ON c.employee_id = e.employee_id WHERE c.amount > e.remaining_balance',
    violations: 23,
    lastRun: new Date(Date.now() - 8 * 60 * 60 * 1000),
    recommendedFix: 'Review flagged claims for manual approval or rejection',
    relatedIssueId: 'issue-004',
  },
  {
    id: 'rule-006',
    name: 'Stale Data Sync',
    description: 'Data sources should sync within configured freshness threshold',
    dataSource: 'HRIS',
    severity: 'medium',
    status: 'active',
    logic: 'SELECT * FROM integration_sources WHERE last_sync < NOW() - INTERVAL \'24 hours\'',
    violations: 2,
    lastRun: new Date(Date.now() - 1 * 60 * 60 * 1000),
    recommendedFix: 'Trigger manual sync or investigate connection issues',
  },
  {
    id: 'rule-007',
    name: 'Entitlement Missing for Claimed Category',
    description: 'Employees with claims must have a corresponding entitlement record',
    dataSource: 'Benefits',
    severity: 'high',
    status: 'active',
    logic: 'SELECT DISTINCT c.employee_id, c.category FROM claims c LEFT JOIN entitlements e ON c.employee_id = e.employee_id AND c.category = e.category WHERE e.id IS NULL',
    violations: 5,
    lastRun: new Date(Date.now() - 12 * 60 * 60 * 1000),
    recommendedFix: 'Create entitlement records for employees with claims',
  },
  {
    id: 'rule-008',
    name: 'Negative Remaining Entitlement',
    description: 'Entitlement remaining balance should not be negative',
    dataSource: 'Benefits',
    severity: 'medium',
    status: 'active',
    logic: 'SELECT * FROM entitlements WHERE remaining_balance < 0',
    violations: 7,
    lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000),
    recommendedFix: 'Audit and correct over-utilized entitlements',
  },
  {
    id: 'rule-009',
    name: 'Survey Response Rate Below Threshold',
    description: 'Survey response rate should be at least 50% for statistical validity',
    dataSource: 'Survey',
    severity: 'medium',
    status: 'active',
    logic: 'SELECT survey_id, response_rate FROM surveys WHERE response_rate < 0.50',
    violations: 1,
    lastRun: new Date(Date.now() - 48 * 60 * 60 * 1000),
    recommendedFix: 'Launch reminder campaign to increase survey participation',
    relatedIssueId: 'issue-003',
  },
  {
    id: 'rule-010',
    name: 'Benchmark Sources Below Minimum',
    description: 'At least 4 benchmark data sources should be active for reliable comparisons',
    dataSource: 'Benchmark',
    severity: 'medium',
    status: 'active',
    logic: 'SELECT COUNT(*) FROM benchmark_sources WHERE status = \'active\' HAVING COUNT(*) < 4',
    violations: 1,
    lastRun: new Date(Date.now() - 72 * 60 * 60 * 1000),
    recommendedFix: 'Connect additional benchmark data providers',
    relatedIssueId: 'issue-002',
  },
];

// Sample violations
const SEED_VIOLATIONS: RuleViolation[] = [
  { id: 'v1', ruleId: 'rule-001', ruleName: 'Missing Employee ID', employee: 'New Hire - John Smith', field: 'employee_id', issue: 'Field is empty', detectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), severity: 'critical' },
  { id: 'v2', ruleId: 'rule-003', ruleName: 'Missing Grade/Department/Location', employee: 'Sarah Johnson', field: 'grade', issue: 'Grade not assigned', detectedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), severity: 'high' },
  { id: 'v3', ruleId: 'rule-004', ruleName: 'Claim Without Policy Reference', record: 'CLM-2024-4521', field: 'policy_ref', issue: 'No policy linked', detectedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), severity: 'high' },
  { id: 'v4', ruleId: 'rule-005', ruleName: 'Claim Amount Exceeds Entitlement', employee: 'Mohammed Hassan', field: 'claim_amount', issue: 'Exceeds remaining by AED 2,500', detectedAt: new Date(Date.now() - 8 * 60 * 60 * 1000), severity: 'high' },
];

export function useDataQualityRules() {
  const [rules, setRules] = useState<DataQualityRule[]>(SEED_RULES);
  const [violations, setViolations] = useState<RuleViolation[]>(SEED_VIOLATIONS);
  const [runningRuleId, setRunningRuleId] = useState<string | null>(null);
  const [highlightedRuleId, setHighlightedRuleId] = useState<string | null>(null);

  // Stats
  const stats = useMemo(() => ({
    total: rules.length,
    active: rules.filter(r => r.status === 'active').length,
    paused: rules.filter(r => r.status === 'paused').length,
    totalViolations: rules.reduce((sum, r) => sum + r.violations, 0),
    criticalViolations: rules.filter(r => r.severity === 'critical').reduce((sum, r) => sum + r.violations, 0),
    complianceRate: Math.round(100 - (rules.reduce((sum, r) => sum + r.violations, 0) / 10)),
  }), [rules]);

  // Get rule by ID
  const getRule = useCallback((id: string) => {
    return rules.find(r => r.id === id);
  }, [rules]);

  // Get rule linked to an issue
  const getRuleByIssueId = useCallback((issueId: string) => {
    return rules.find(r => r.relatedIssueId === issueId);
  }, [rules]);

  // Get violations for a specific rule
  const getViolationsForRule = useCallback((ruleId: string) => {
    return violations.filter(v => v.ruleId === ruleId);
  }, [violations]);

  // Run a rule (simulate validation)
  const runRule = useCallback(async (ruleId: string): Promise<{ success: boolean; violationsCleared: number; newViolations: number }> => {
    setRunningRuleId(ruleId);
    
    // Simulate rule execution
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate clearing some violations
    const rule = rules.find(r => r.id === ruleId);
    const previousViolations = rule?.violations || 0;
    const newViolationCount = Math.max(0, previousViolations - Math.floor(Math.random() * previousViolations));
    const clearedCount = previousViolations - newViolationCount;
    
    setRules(prev => prev.map(r => {
      if (r.id === ruleId) {
        return {
          ...r,
          violations: newViolationCount,
          lastRun: new Date(),
        };
      }
      return r;
    }));
    
    // Remove cleared violations from the list
    if (clearedCount > 0) {
      setViolations(prev => {
        const ruleViolations = prev.filter(v => v.ruleId === ruleId);
        const toRemove = ruleViolations.slice(0, clearedCount).map(v => v.id);
        return prev.filter(v => !toRemove.includes(v.id));
      });
    }
    
    setRunningRuleId(null);
    return { success: true, violationsCleared: clearedCount, newViolations: newViolationCount };
  }, [rules]);

  // Run rule and resolve linked issue if violations go to 0
  const runRuleAndResolve = useCallback(async (
    ruleId: string, 
    resolveIssueFn?: (issueId: string, type: string, note: string) => void
  ): Promise<{ success: boolean; issueResolved: boolean }> => {
    const result = await runRule(ruleId);
    
    const rule = rules.find(r => r.id === ruleId);
    
    if (result.newViolations === 0 && rule?.relatedIssueId && resolveIssueFn) {
      resolveIssueFn(
        rule.relatedIssueId,
        'quality_rule',
        `Data quality rule "${rule.name}" ran successfully with 0 violations remaining.`
      );
      return { success: true, issueResolved: true };
    }
    
    return { success: result.success, issueResolved: false };
  }, [rules, runRule]);

  // Toggle rule status
  const toggleRuleStatus = useCallback((ruleId: string) => {
    setRules(prev => prev.map(r => {
      if (r.id === ruleId) {
        return {
          ...r,
          status: r.status === 'active' ? 'paused' : 'active',
        };
      }
      return r;
    }));
  }, []);

  // Highlight a rule (for deep linking)
  const highlightRule = useCallback((ruleId: string) => {
    setHighlightedRuleId(ruleId);
    setTimeout(() => setHighlightedRuleId(null), 3000);
  }, []);

  return {
    rules,
    violations,
    stats,
    runningRuleId,
    highlightedRuleId,
    getRule,
    getRuleByIssueId,
    getViolationsForRule,
    runRule,
    runRuleAndResolve,
    toggleRuleStatus,
    highlightRule,
  };
}
