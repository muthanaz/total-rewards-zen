/**
 * Integration Sources Hook
 * 
 * Manages integration sources with connection, validation, and issue resolution.
 */

import { useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export type IntegrationStatus = 'connected' | 'not_connected' | 'degraded' | 'syncing';
export type ConnectionMethod = 'api' | 'sftp' | 'csv';
export type IntegrationType = 'hris' | 'payroll' | 'benefits' | 'claims' | 'survey' | 'benchmark';

export interface RequiredField {
  id: string;
  name: string;
  description: string;
  required: boolean;
  mapped?: boolean;
  sourceField?: string;
}

export interface ValidationResult {
  field: string;
  status: 'valid' | 'warning' | 'error';
  message: string;
  recordsAffected?: number;
}

export interface IntegrationSource {
  id: string;
  name: string;
  type: IntegrationType;
  icon: string;
  status: IntegrationStatus;
  coverage: number;
  lastSync: string | null;
  recordCount: number;
  requiredFields: RequiredField[];
  mappedFields: string[];
  validationResults: ValidationResult[];
  connectionMethod?: ConnectionMethod;
  unlocksInsights: string[];
  relatedIssueIds: string[]; // Links to DataConfidenceIssues
}

// Seed integration sources
const SEED_INTEGRATIONS: IntegrationSource[] = [
  {
    id: 'int-hris',
    name: 'HRIS System (SAP)',
    type: 'hris',
    icon: '👥',
    status: 'connected',
    coverage: 95,
    lastSync: '2 hours ago',
    recordCount: 12847,
    requiredFields: [
      { id: 'emp_id', name: 'Employee ID', description: 'Unique identifier', required: true, mapped: true, sourceField: 'SAP_EMPLOYEE_ID' },
      { id: 'first_name', name: 'First Name', description: 'Legal first name', required: true, mapped: true, sourceField: 'FIRST_NAME' },
      { id: 'last_name', name: 'Last Name', description: 'Legal last name', required: true, mapped: true, sourceField: 'LAST_NAME' },
      { id: 'email', name: 'Email', description: 'Work email address', required: true, mapped: true, sourceField: 'WORK_EMAIL' },
      { id: 'department', name: 'Department', description: 'Department code', required: true, mapped: true, sourceField: 'DEPT_CODE' },
      { id: 'grade', name: 'Grade Level', description: 'Employee grade', required: true, mapped: true, sourceField: 'PAY_GRADE' },
      { id: 'hire_date', name: 'Hire Date', description: 'Employment start date', required: true, mapped: true, sourceField: 'START_DATE' },
      { id: 'work_location', name: 'Work Location', description: 'Office location', required: false, mapped: false },
    ],
    mappedFields: ['emp_id', 'first_name', 'last_name', 'email', 'department', 'grade', 'hire_date'],
    validationResults: [
      { field: 'work_location', status: 'warning', message: 'Missing for 2% of records', recordsAffected: 257 },
    ],
    connectionMethod: 'api',
    unlocksInsights: ['Employee Demographics', 'Tenure Analysis', 'Department Metrics'],
    relatedIssueIds: [],
  },
  {
    id: 'int-payroll',
    name: 'Payroll Provider',
    type: 'payroll',
    icon: '💰',
    status: 'connected',
    coverage: 88,
    lastSync: '1 day ago',
    recordCount: 12650,
    requiredFields: [
      { id: 'emp_id', name: 'Employee ID', description: 'Unique identifier', required: true, mapped: true, sourceField: 'PAYROLL_EMP_ID' },
      { id: 'base_salary', name: 'Base Salary', description: 'Monthly base salary', required: true, mapped: true, sourceField: 'MONTHLY_GROSS' },
      { id: 'allowances', name: 'Allowances', description: 'Total allowances', required: true, mapped: true, sourceField: 'ALLOWANCE_TOTAL' },
      { id: 'bank_details', name: 'Bank Details', description: 'Payment account', required: false, mapped: false },
      { id: 'tax_id', name: 'Tax ID', description: 'Tax identification', required: false, mapped: false },
    ],
    mappedFields: ['emp_id', 'base_salary', 'allowances'],
    validationResults: [
      { field: 'bank_details', status: 'warning', message: 'Missing for 3% of records', recordsAffected: 380 },
      { field: 'tax_id', status: 'warning', message: 'Missing for 2% of records', recordsAffected: 253 },
    ],
    connectionMethod: 'sftp',
    unlocksInsights: ['Compensation Analysis', 'Salary Benchmarking', 'Benefits Costing'],
    relatedIssueIds: [],
  },
  {
    id: 'int-benefits',
    name: 'Benefits Platform',
    type: 'benefits',
    icon: '🎁',
    status: 'degraded',
    coverage: 87,
    lastSync: '3 days ago',
    recordCount: 11200,
    requiredFields: [
      { id: 'emp_id', name: 'Employee ID', description: 'Unique identifier', required: true, mapped: true, sourceField: 'BENEFITS_EMP_REF' },
      { id: 'plan_type', name: 'Plan Type', description: 'Benefit plan category', required: true, mapped: true, sourceField: 'PLAN_CODE' },
      { id: 'enrollment_date', name: 'Enrollment Date', description: 'Plan enrollment date', required: true, mapped: false },
      { id: 'dependents', name: 'Dependent Info', description: 'Covered dependents', required: false, mapped: false },
    ],
    mappedFields: ['emp_id', 'plan_type'],
    validationResults: [
      { field: 'enrollment_date', status: 'error', message: 'Missing for 5% of records', recordsAffected: 560 },
      { field: 'dependents', status: 'warning', message: 'Missing for 8% of records', recordsAffected: 896 },
    ],
    connectionMethod: 'api',
    unlocksInsights: ['Benefits Utilization', 'Plan Effectiveness', 'Coverage Gaps'],
    relatedIssueIds: [],
  },
  {
    id: 'int-claims',
    name: 'Claims System',
    type: 'claims',
    icon: '📋',
    status: 'degraded',
    coverage: 65,
    lastSync: '3 days ago',
    recordCount: 45200,
    requiredFields: [
      { id: 'claim_id', name: 'Claim ID', description: 'Unique claim identifier', required: true, mapped: true, sourceField: 'CLAIM_REF' },
      { id: 'emp_id', name: 'Employee ID', description: 'Claimant identifier', required: true, mapped: true, sourceField: 'EMP_ID' },
      { id: 'claim_type', name: 'Claim Type', description: 'Category of claim', required: true, mapped: true, sourceField: 'TYPE_CODE' },
      { id: 'amount', name: 'Amount', description: 'Claim amount', required: true, mapped: true, sourceField: 'AMOUNT_REQUESTED' },
      { id: 'status', name: 'Status', description: 'Processing status', required: true, mapped: true, sourceField: 'CLAIM_STATUS' },
      { id: 'submitted_date', name: 'Submitted Date', description: 'Submission timestamp', required: true, mapped: true, sourceField: 'SUBMITTED_AT' },
    ],
    mappedFields: ['claim_id', 'emp_id', 'claim_type', 'amount', 'status', 'submitted_date'],
    validationResults: [
      { field: 'sync', status: 'error', message: 'Connection intermittent - 3 days stale', recordsAffected: 0 },
    ],
    connectionMethod: 'api',
    unlocksInsights: ['Claims Processing Time', 'Cost Analysis', 'Utilization Accuracy'],
    relatedIssueIds: ['issue-004'],
  },
  {
    id: 'int-exit-survey',
    name: 'Exit Survey System',
    type: 'survey',
    icon: '📊',
    status: 'not_connected',
    coverage: 0,
    lastSync: null,
    recordCount: 0,
    requiredFields: [
      { id: 'emp_id', name: 'Employee ID', description: 'Departing employee', required: true, mapped: false },
      { id: 'exit_date', name: 'Exit Date', description: 'Last working day', required: true, mapped: false },
      { id: 'exit_reason', name: 'Exit Reason', description: 'Primary reason for leaving', required: true, mapped: false },
      { id: 'satisfaction', name: 'Satisfaction Score', description: 'Overall satisfaction rating', required: false, mapped: false },
      { id: 'feedback', name: 'Feedback', description: 'Open-ended feedback', required: false, mapped: false },
    ],
    mappedFields: [],
    validationResults: [],
    connectionMethod: undefined,
    unlocksInsights: ['Retention Impact', 'Turnover Analysis', 'Exit Trends'],
    relatedIssueIds: ['issue-001'],
  },
  {
    id: 'int-engagement',
    name: 'Engagement Survey',
    type: 'survey',
    icon: '💬',
    status: 'not_connected',
    coverage: 0,
    lastSync: null,
    recordCount: 0,
    requiredFields: [
      { id: 'emp_id', name: 'Employee ID', description: 'Survey respondent', required: true, mapped: false },
      { id: 'survey_date', name: 'Survey Date', description: 'Response timestamp', required: true, mapped: false },
      { id: 'engagement_score', name: 'Engagement Score', description: 'Overall engagement', required: true, mapped: false },
      { id: 'nps', name: 'eNPS Score', description: 'Employee Net Promoter Score', required: false, mapped: false },
    ],
    mappedFields: [],
    validationResults: [],
    connectionMethod: undefined,
    unlocksInsights: ['Employee Satisfaction', 'Engagement Score', 'ESAT Trends'],
    relatedIssueIds: ['issue-003'],
  },
  {
    id: 'int-benchmark',
    name: 'Salary Benchmark Sources',
    type: 'benchmark',
    icon: '📈',
    status: 'degraded',
    coverage: 60,
    lastSync: '7 days ago',
    recordCount: 3,
    requiredFields: [
      { id: 'provider', name: 'Provider Name', description: 'Benchmark data provider', required: true, mapped: true },
      { id: 'industry', name: 'Industry', description: 'Industry vertical', required: true, mapped: true },
      { id: 'region', name: 'Region', description: 'Geographic region', required: true, mapped: true },
      { id: 'salary_data', name: 'Salary Ranges', description: 'Compensation percentiles', required: true, mapped: true },
    ],
    mappedFields: ['provider', 'industry', 'region', 'salary_data'],
    validationResults: [
      { field: 'providers', status: 'warning', message: 'Only 3 of 5 benchmark sources active', recordsAffected: 0 },
    ],
    connectionMethod: 'api',
    unlocksInsights: ['Market Competitiveness', 'Salary Benchmarking'],
    relatedIssueIds: ['issue-002'],
  },
];

export function useIntegrationSources() {
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState<IntegrationSource[]>(SEED_INTEGRATIONS);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  // Stats
  const stats = useMemo(() => ({
    total: integrations.length,
    connected: integrations.filter(i => i.status === 'connected').length,
    degraded: integrations.filter(i => i.status === 'degraded').length,
    notConnected: integrations.filter(i => i.status === 'not_connected').length,
    avgCoverage: Math.round(
      integrations.filter(i => i.status !== 'not_connected')
        .reduce((sum, i) => sum + i.coverage, 0) / 
      Math.max(1, integrations.filter(i => i.status !== 'not_connected').length)
    ),
  }), [integrations]);

  // Get integration by ID
  const getIntegration = useCallback((id: string) => {
    return integrations.find(i => i.id === id);
  }, [integrations]);

  // Get integration linked to an issue
  const getIntegrationByIssueId = useCallback((issueId: string) => {
    return integrations.find(i => i.relatedIssueIds.includes(issueId));
  }, [integrations]);

  // Simulate connection process
  const connectIntegration = useCallback(async (
    integrationId: string,
    connectionMethod: ConnectionMethod,
    fieldMappings: Record<string, string>
  ): Promise<{ success: boolean; coverage: number; recordCount: number }> => {
    setConnectingId(integrationId);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mappedFieldIds = Object.keys(fieldMappings).filter(k => fieldMappings[k]);
    
    setIntegrations(prev => prev.map(integration => {
      if (integration.id === integrationId) {
        const updatedFields = integration.requiredFields.map(f => ({
          ...f,
          mapped: mappedFieldIds.includes(f.id),
          sourceField: fieldMappings[f.id] || undefined,
        }));
        
        const coverage = Math.min(95, 60 + mappedFieldIds.length * 5);
        const recordCount = Math.floor(Math.random() * 5000) + 8000;
        
        return {
          ...integration,
          status: 'connected' as IntegrationStatus,
          connectionMethod,
          requiredFields: updatedFields,
          mappedFields: mappedFieldIds,
          coverage,
          recordCount,
          lastSync: 'Just now',
          validationResults: [],
        };
      }
      return integration;
    }));
    
    setConnectingId(null);
    return { success: true, coverage: 85, recordCount: 10000 };
  }, []);

  // Fix degraded connection
  const fixConnection = useCallback(async (integrationId: string): Promise<boolean> => {
    setSyncingId(integrationId);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIntegrations(prev => prev.map(integration => {
      if (integration.id === integrationId) {
        return {
          ...integration,
          status: 'connected' as IntegrationStatus,
          lastSync: 'Just now',
          coverage: Math.min(95, integration.coverage + 20),
          validationResults: integration.validationResults.filter(v => v.status !== 'error'),
        };
      }
      return integration;
    }));
    
    setSyncingId(null);
    return true;
  }, []);

  // Run sync
  const syncIntegration = useCallback(async (integrationId: string): Promise<boolean> => {
    setSyncingId(integrationId);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIntegrations(prev => prev.map(integration => {
      if (integration.id === integrationId) {
        return {
          ...integration,
          lastSync: 'Just now',
          recordCount: integration.recordCount + Math.floor(Math.random() * 100),
        };
      }
      return integration;
    }));
    
    setSyncingId(null);
    return true;
  }, []);

  // Test connection
  const testConnection = useCallback(async (integrationId: string): Promise<{ success: boolean; message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return { success: true, message: 'Connection successful. API responding correctly.' };
  }, []);

  // Run validation
  const runValidation = useCallback(async (integrationId: string): Promise<ValidationResult[]> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const integration = integrations.find(i => i.id === integrationId);
    if (!integration) return [];
    
    // Simulate validation results
    const results: ValidationResult[] = [];
    const unmappedRequired = integration.requiredFields.filter(f => f.required && !f.mapped);
    
    unmappedRequired.forEach(field => {
      results.push({
        field: field.name,
        status: 'error',
        message: `Required field not mapped`,
        recordsAffected: integration.recordCount,
      });
    });
    
    return results;
  }, [integrations]);

  // Get issue IDs that will be resolved by connecting an integration
  const getResolvableIssueIds = useCallback((integrationId: string): string[] => {
    const integration = integrations.find(i => i.id === integrationId);
    return integration?.relatedIssueIds || [];
  }, [integrations]);

  return {
    integrations,
    stats,
    connectingId,
    syncingId,
    getIntegration,
    getIntegrationByIssueId,
    connectIntegration,
    fixConnection,
    syncIntegration,
    testConnection,
    runValidation,
    getResolvableIssueIds,
  };
}
