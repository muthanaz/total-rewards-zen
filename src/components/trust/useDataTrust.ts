/**
 * useDataTrust Hook
 * 
 * Computes deterministic data trust state from available sources.
 * Designed to integrate with existing useDataCoverageMetrics.
 */

import { useMemo } from 'react';
import { useDataCoverageMetrics, DataCoverageMetrics } from '@/components/employer/DataConfidenceBadge';
import { 
  DataTrustState, 
  DataSource, 
  DataQualityViolation,
  computeConfidenceBand,
  PAGE_LIMITATIONS,
} from './types';

// Expected data sources for full coverage
const EXPECTED_SOURCES: Array<{ id: string; name: string; nameAr: string }> = [
  { id: 'hris', name: 'HRIS / Employee Data', nameAr: 'نظام الموارد البشرية' },
  { id: 'payroll', name: 'Payroll Provider', nameAr: 'مزود الرواتب' },
  { id: 'benefits', name: 'Benefits Platform', nameAr: 'منصة المزايا' },
  { id: 'claims', name: 'Claims System', nameAr: 'نظام المطالبات' },
  { id: 'policies', name: 'Policy Documents', nameAr: 'وثائق السياسات' },
];

/**
 * Convert DataCoverageMetrics to DataTrustState
 */
function buildTrustState(
  metrics: DataCoverageMetrics,
  pageName?: string
): DataTrustState {
  // Calculate which sources are "connected" based on coverage thresholds
  const coverageBySource: Record<string, number> = {
    hris: metrics.employeeCoverage,
    payroll: metrics.employeeCoverage * 0.9, // Assume payroll tracks with HRIS
    benefits: metrics.entitlementCoverage,
    claims: metrics.claimsCoverage,
    policies: metrics.policyCoverage,
  };
  
  const connectedSources = Object.entries(coverageBySource)
    .filter(([_, coverage]) => coverage >= 50)
    .map(([id]) => id);
  
  const missingSources = EXPECTED_SOURCES
    .filter(s => !connectedSources.includes(s.id))
    .map(s => s.name);
  
  // Calculate overall coverage
  const avgCoverage = (
    metrics.employeeCoverage +
    metrics.entitlementCoverage +
    metrics.policyCoverage +
    metrics.claimsCoverage
  ) / 4;
  
  // Calculate data age
  const lastSync = metrics.lastSyncTime || new Date(Date.now() - 1000 * 60 * 60 * 4);
  const dataAgeHours = (Date.now() - lastSync.getTime()) / (1000 * 60 * 60);
  
  // Mock violations based on coverage (in real app, fetch from data quality API)
  const violations: DataQualityViolation[] = [];
  if (metrics.missingFields && metrics.missingFields.length > 0) {
    violations.push({
      id: 'missing-fields',
      rule: 'Required fields present',
      severity: metrics.missingFields.length > 5 ? 'critical' : 'warning',
      count: metrics.missingFields.length,
      impactedMetric: 'Coverage',
    });
  }
  
  const criticalViolations = violations.filter(v => v.severity === 'critical').length;
  const warningViolations = violations.filter(v => v.severity === 'warning').length;
  
  // Compute confidence band
  const { band, reason } = computeConfidenceBand(avgCoverage, dataAgeHours, criticalViolations);
  
  // Get page-specific limitations
  const pageKey = pageName?.toLowerCase().replace(/\s+/g, '-') || 'dashboard';
  const baseLimitations = PAGE_LIMITATIONS[pageKey] || PAGE_LIMITATIONS.dashboard;
  
  // Add dynamic limitations based on state
  const dynamicLimitations: string[] = [];
  if (missingSources.length > 0) {
    dynamicLimitations.push(`Missing data from: ${missingSources.slice(0, 2).join(', ')}${missingSources.length > 2 ? ` +${missingSources.length - 2}` : ''}`);
  }
  
  return {
    sourcesConnected: connectedSources.length,
    sourcesExpected: EXPECTED_SOURCES.length,
    missingSources,
    lastSyncAt: lastSync,
    nextSyncAt: new Date(lastSync.getTime() + 1000 * 60 * 60 * 6), // +6h
    dataAgeHours,
    criticalViolations,
    warningViolations,
    violations,
    coveragePercent: avgCoverage,
    confidenceBand: band,
    confidenceReason: reason,
    limitations: [...dynamicLimitations, ...baseLimitations.slice(0, 2 - dynamicLimitations.length)],
  };
}

export interface UseDataTrustOptions {
  /** Page name for context-specific limitations */
  pageName?: string;
  /** Override metrics (for custom pages) */
  customMetrics?: DataCoverageMetrics;
}

/**
 * Hook to get data trust state for a page
 */
export function useDataTrust(options: UseDataTrustOptions = {}): DataTrustState {
  const { pageName, customMetrics } = options;
  const defaultMetrics = useDataCoverageMetrics();
  const metrics = customMetrics || defaultMetrics;
  
  return useMemo(
    () => buildTrustState(metrics, pageName),
    [metrics, pageName]
  );
}

/**
 * Get formatted strings for display
 */
export function formatDataTrust(state: DataTrustState) {
  const formatDate = (date?: Date): string => {
    if (!date) return 'Unknown';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 0) {
      // Future date (next sync)
      const absHours = Math.abs(diffHours);
      if (absHours < 1) return 'In < 1h';
      if (absHours < 24) return `In ${absHours}h`;
      return `In ${Math.ceil(absHours / 24)}d`;
    }
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };
  
  const formatNextSync = (date?: Date): string => {
    if (!date) return 'Not scheduled';
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 0) return 'Overdue';
    if (diffHours < 1) return 'In < 1h';
    if (diffHours < 24) return `In ${diffHours}h`;
    return `In ${Math.ceil(diffHours / 24)}d`;
  };
  
  return {
    coverage: `${state.sourcesConnected}/${state.sourcesExpected}`,
    coveragePercent: `${Math.round(state.coveragePercent)}%`,
    lastSync: formatDate(state.lastSyncAt),
    nextSync: formatNextSync(state.nextSyncAt),
    confidenceBandLabel: state.confidenceBand.charAt(0).toUpperCase() + state.confidenceBand.slice(1),
  };
}
