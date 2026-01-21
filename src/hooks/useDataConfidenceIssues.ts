/**
 * Data Confidence Issues Hook
 * 
 * Manages data quality/confidence issues with filtering, resolution, and score calculation.
 */

import { useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export type IssueDomain = 'Employees' | 'Entitlements' | 'Policies' | 'Claims';
export type IssueConfidence = 'Low' | 'Medium' | 'High';
export type IssueStatus = 'Open' | 'In Progress' | 'Resolved';
export type IssueOwner = 'HR Ops' | 'Comp & Ben' | 'IT' | 'Finance';
export type ResolutionType = 'integration' | 'data_source' | 'quality_rule' | 'accepted_risk';

export interface DataConfidenceIssue {
  id: string;
  title: string;
  domain: IssueDomain;
  confidence: IssueConfidence;
  impactedInsights: string[];
  rootCause: string;
  recommendedFix: string;
  status: IssueStatus;
  owner: IssueOwner;
  dataSource?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
  resolutionType?: ResolutionType;
  resolutionNote?: string;
  scoreImpact: number; // How much this issue affects the domain score (negative)
}

export interface IssueFilters {
  domain: IssueDomain | 'all';
  confidence: IssueConfidence | 'all';
  status: IssueStatus | 'all';
  dataSource: string | 'all';
  owner: IssueOwner | 'all';
  search: string;
}

export interface DomainScores {
  employees: number;
  entitlements: number;
  policies: number;
  claims: number;
  overall: number;
}

// Seed issues based on existing limitations
const SEED_ISSUES: DataConfidenceIssue[] = [
  {
    id: 'issue-001',
    title: 'Exit interview data not integrated',
    domain: 'Employees',
    confidence: 'Low',
    impactedInsights: ['Retention Impact', 'Turnover Analysis', 'Exit Trends'],
    rootCause: 'HR exit survey system not connected',
    recommendedFix: 'Connect HR exit survey system to enable retention insights',
    status: 'Open',
    owner: 'IT',
    dataSource: 'Exit Survey System',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    scoreImpact: -15,
  },
  {
    id: 'issue-002',
    title: 'Incomplete benchmark data sources',
    domain: 'Entitlements',
    confidence: 'Medium',
    impactedInsights: ['Market Competitiveness', 'Salary Benchmarking'],
    rootCause: 'Only 3 of 5 benchmark sources active',
    recommendedFix: 'Add industry-specific salary data from remaining 2 providers',
    status: 'In Progress',
    owner: 'Comp & Ben',
    dataSource: 'Salary Benchmarks',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    scoreImpact: -8,
  },
  {
    id: 'issue-003',
    title: 'Low survey response rate',
    domain: 'Employees',
    confidence: 'Low',
    impactedInsights: ['Employee Satisfaction', 'Engagement Score', 'ESAT Trends'],
    rootCause: 'Survey response rate below 30%',
    recommendedFix: 'Launch engagement campaign to increase participation',
    status: 'Open',
    owner: 'HR Ops',
    dataSource: 'Employee Surveys',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    scoreImpact: -12,
  },
  {
    id: 'issue-004',
    title: 'Claims system partial sync',
    domain: 'Claims',
    confidence: 'Low',
    impactedInsights: ['Claims Processing Time', 'Cost Analysis', 'Utilization Accuracy'],
    rootCause: 'Claims data syncing intermittently - 3 days stale',
    recommendedFix: 'Restore full sync connection with claims provider',
    status: 'Open',
    owner: 'IT',
    dataSource: 'Claims System',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    scoreImpact: -20,
  },
  {
    id: 'issue-005',
    title: 'Missing policy version history',
    domain: 'Policies',
    confidence: 'Medium',
    impactedInsights: ['Policy Compliance', 'Change Tracking'],
    rootCause: 'Policy versioning not enabled in source system',
    recommendedFix: 'Enable policy audit trail in HR system',
    status: 'Open',
    owner: 'HR Ops',
    dataSource: 'HRIS (SAP)',
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    scoreImpact: -10,
  },
];

// Base scores before issue impacts
const BASE_SCORES: DomainScores = {
  employees: 95,
  entitlements: 90,
  policies: 80,
  claims: 85,
  overall: 88,
};

export function useDataConfidenceIssues() {
  const { user } = useAuth();
  const [issues, setIssues] = useState<DataConfidenceIssue[]>(SEED_ISSUES);
  const [filters, setFilters] = useState<IssueFilters>({
    domain: 'all',
    confidence: 'all',
    status: 'all',
    dataSource: 'all',
    owner: 'all',
    search: '',
  });
  const [lastScoreChange, setLastScoreChange] = useState<{ domain: string; change: number } | null>(null);

  // Calculate domain scores based on open/in-progress issues
  const domainScores = useMemo((): DomainScores => {
    const scores = { ...BASE_SCORES };
    
    issues.forEach(issue => {
      if (issue.status !== 'Resolved') {
        const domainKey = issue.domain.toLowerCase() as keyof Omit<DomainScores, 'overall'>;
        if (scores[domainKey] !== undefined) {
          scores[domainKey] = Math.max(0, scores[domainKey] + issue.scoreImpact);
        }
      }
    });
    
    // Calculate overall as weighted average
    scores.overall = Math.round(
      (scores.employees * 0.3 + scores.entitlements * 0.25 + scores.policies * 0.2 + scores.claims * 0.25)
    );
    
    return scores;
  }, [issues]);

  // Get unique data sources for filter dropdown
  const dataSources = useMemo(() => {
    return [...new Set(issues.map(i => i.dataSource).filter(Boolean))] as string[];
  }, [issues]);

  // Filter and sort issues
  const filteredIssues = useMemo(() => {
    let result = [...issues];
    
    // Apply filters
    if (filters.domain !== 'all') {
      result = result.filter(i => i.domain === filters.domain);
    }
    if (filters.confidence !== 'all') {
      result = result.filter(i => i.confidence === filters.confidence);
    }
    if (filters.status !== 'all') {
      result = result.filter(i => i.status === filters.status);
    }
    if (filters.dataSource !== 'all') {
      result = result.filter(i => i.dataSource === filters.dataSource);
    }
    if (filters.owner !== 'all') {
      result = result.filter(i => i.owner === filters.owner);
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(i => 
        i.title.toLowerCase().includes(search) ||
        i.rootCause.toLowerCase().includes(search) ||
        i.impactedInsights.some(insight => insight.toLowerCase().includes(search))
      );
    }
    
    // Sort by confidence (Low first), then by age (oldest first)
    const confidenceOrder: Record<IssueConfidence, number> = { 'Low': 0, 'Medium': 1, 'High': 2 };
    result.sort((a, b) => {
      // Open issues first
      if (a.status === 'Resolved' && b.status !== 'Resolved') return 1;
      if (a.status !== 'Resolved' && b.status === 'Resolved') return -1;
      // Then by confidence
      const confDiff = confidenceOrder[a.confidence] - confidenceOrder[b.confidence];
      if (confDiff !== 0) return confDiff;
      // Then by age
      return a.createdAt.getTime() - b.createdAt.getTime();
    });
    
    return result;
  }, [issues, filters]);

  // Issue counts for tabs/badges
  const issueCounts = useMemo(() => ({
    total: issues.length,
    open: issues.filter(i => i.status === 'Open').length,
    inProgress: issues.filter(i => i.status === 'In Progress').length,
    resolved: issues.filter(i => i.status === 'Resolved').length,
    lowConfidence: issues.filter(i => i.confidence === 'Low' && i.status !== 'Resolved').length,
    claimsRelated: issues.filter(i => i.domain === 'Claims' && i.status !== 'Resolved').length,
    needsIntegration: issues.filter(i => 
      i.rootCause.toLowerCase().includes('not connected') || 
      i.rootCause.toLowerCase().includes('not integrated') ||
      i.recommendedFix.toLowerCase().includes('connect')
    ).length,
  }), [issues]);

  // Resolve an issue
  const resolveIssue = useCallback((
    issueId: string, 
    resolutionType: ResolutionType, 
    resolutionNote: string
  ) => {
    setIssues(prev => {
      const updated = prev.map(issue => {
        if (issue.id === issueId) {
          // Calculate score change for feedback
          const scoreChange = Math.abs(issue.scoreImpact);
          setLastScoreChange({ domain: issue.domain, change: scoreChange });
          
          // Clear the score change indicator after 3 seconds
          setTimeout(() => setLastScoreChange(null), 3000);
          
          return {
            ...issue,
            status: 'Resolved' as IssueStatus,
            resolvedAt: new Date(),
            resolvedBy: user?.email || 'Unknown',
            resolutionType,
            resolutionNote,
            updatedAt: new Date(),
          };
        }
        return issue;
      });
      return updated;
    });
  }, [user]);

  // Update issue status
  const updateIssueStatus = useCallback((issueId: string, status: IssueStatus) => {
    setIssues(prev => prev.map(issue => 
      issue.id === issueId 
        ? { ...issue, status, updatedAt: new Date() }
        : issue
    ));
  }, []);

  // Assign issue to owner
  const assignIssue = useCallback((issueId: string, owner: IssueOwner) => {
    setIssues(prev => prev.map(issue => 
      issue.id === issueId 
        ? { ...issue, owner, status: 'In Progress' as IssueStatus, updatedAt: new Date() }
        : issue
    ));
  }, []);

  // Get issue by ID
  const getIssueById = useCallback((issueId: string) => {
    return issues.find(i => i.id === issueId);
  }, [issues]);

  // Quick filter presets
  const applyQuickFilter = useCallback((preset: 'lowConfidence' | 'open' | 'needsIntegration' | 'claimsRelated' | 'clear') => {
    switch (preset) {
      case 'lowConfidence':
        setFilters(prev => ({ ...prev, confidence: 'Low', status: 'all' }));
        break;
      case 'open':
        setFilters(prev => ({ ...prev, status: 'Open', confidence: 'all' }));
        break;
      case 'needsIntegration':
        setFilters(prev => ({ ...prev, search: 'connect', status: 'all', confidence: 'all' }));
        break;
      case 'claimsRelated':
        setFilters(prev => ({ ...prev, domain: 'Claims', status: 'all', confidence: 'all' }));
        break;
      case 'clear':
        setFilters({ domain: 'all', confidence: 'all', status: 'all', dataSource: 'all', owner: 'all', search: '' });
        break;
    }
  }, []);

  return {
    issues: filteredIssues,
    allIssues: issues,
    filters,
    setFilters,
    domainScores,
    issueCounts,
    dataSources,
    resolveIssue,
    updateIssueStatus,
    assignIssue,
    getIssueById,
    applyQuickFilter,
    lastScoreChange,
  };
}
