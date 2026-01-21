/**
 * Demo Scenario Hooks
 * 
 * Provides access to North Star demo data with type safety.
 * Use these hooks when demo mode is active to display cohesive data.
 */

import { useMemo } from 'react';
import { useDemoMode } from '@/contexts/DemoModeContext';
import {
  DEMO_ORG,
  DEMO_SEGMENTS,
  DEMO_EXEC_METRICS,
  DEMO_SPEND_ALLOCATION,
  DEMO_ZOMBIE_OPPORTUNITIES,
  DEMO_CLAIMS_QUEUE,
  DEMO_POLICIES,
  DEMO_EMPLOYEE,
  DEMO_MARKETPLACE_OFFERS,
  DEMO_AUDIT_EVENTS,
  DEMO_FEATURE_FLAGS,
  DEMO_ALERTS,
  DEMO_CONNECTORS,
  DEMO_INVOICES,
  getDemoClaimsBySLA,
  getDemoClaimsByStatus,
  getDemoEmployeeUtilization,
  getZombieSpendSummary,
} from '@/lib/demoScenario';

// ============================================
// CORE DEMO HOOK
// ============================================

export function useDemoScenario() {
  const { isDemoMode, demoScenario } = useDemoMode();
  
  return {
    isDemoMode,
    demoScenario,
    org: DEMO_ORG,
    segments: DEMO_SEGMENTS,
  };
}

// ============================================
// EXECUTIVE / EMPLOYER HOOKS
// ============================================

export function useDemoExecMetrics() {
  const { isDemoMode } = useDemoMode();
  
  return useMemo(() => {
    if (!isDemoMode) return null;
    return DEMO_EXEC_METRICS;
  }, [isDemoMode]);
}

export function useDemoSpendAllocation() {
  const { isDemoMode } = useDemoMode();
  
  return useMemo(() => {
    if (!isDemoMode) return null;
    return DEMO_SPEND_ALLOCATION;
  }, [isDemoMode]);
}

export function useDemoZombieSpend() {
  const { isDemoMode } = useDemoMode();
  
  return useMemo(() => {
    if (!isDemoMode) return null;
    return {
      opportunities: DEMO_ZOMBIE_OPPORTUNITIES,
      summary: getZombieSpendSummary(),
    };
  }, [isDemoMode]);
}

export function useDemoSegments() {
  const { isDemoMode } = useDemoMode();
  
  return useMemo(() => {
    if (!isDemoMode) return null;
    return DEMO_SEGMENTS;
  }, [isDemoMode]);
}

// ============================================
// HR OPS HOOKS
// ============================================

export function useDemoClaimsQueue() {
  const { isDemoMode } = useDemoMode();
  
  return useMemo(() => {
    if (!isDemoMode) return null;
    
    const bySLA = getDemoClaimsBySLA();
    const byStatus = getDemoClaimsByStatus();
    
    return {
      all: DEMO_CLAIMS_QUEUE,
      bySLA,
      byStatus,
      metrics: {
        total: DEMO_CLAIMS_QUEUE.length,
        pending: byStatus.pending.length + byStatus.inReview.length + byStatus.needInfo.length,
        urgent: bySLA.urgent.length,
        atRisk: bySLA.atRisk.length,
        slaCompliance: DEMO_EXEC_METRICS.claimsSlaCompliance,
        avgProcessingDays: 2.3,
      },
    };
  }, [isDemoMode]);
}

export function useDemoPolicies() {
  const { isDemoMode } = useDemoMode();
  
  return useMemo(() => {
    if (!isDemoMode) return null;
    return DEMO_POLICIES;
  }, [isDemoMode]);
}

// ============================================
// EMPLOYEE HOOKS
// ============================================

export function useDemoEmployee() {
  const { isDemoMode } = useDemoMode();
  
  return useMemo(() => {
    if (!isDemoMode) return null;
    return {
      ...DEMO_EMPLOYEE,
      utilization: getDemoEmployeeUtilization(),
    };
  }, [isDemoMode]);
}

export function useDemoMarketplace() {
  const { isDemoMode } = useDemoMode();
  
  return useMemo(() => {
    if (!isDemoMode) return null;
    return {
      offers: DEMO_MARKETPLACE_OFFERS,
      totalSavings: DEMO_EXEC_METRICS.marketplaceSavings,
      redemptions: DEMO_EXEC_METRICS.redemptions,
    };
  }, [isDemoMode]);
}

// ============================================
// ADMIN HOOKS
// ============================================

export function useDemoAuditLog() {
  const { isDemoMode } = useDemoMode();
  
  return useMemo(() => {
    if (!isDemoMode) return null;
    return DEMO_AUDIT_EVENTS;
  }, [isDemoMode]);
}

export function useDemoFeatureFlags() {
  const { isDemoMode } = useDemoMode();
  
  return useMemo(() => {
    if (!isDemoMode) return null;
    return {
      flags: DEMO_FEATURE_FLAGS,
      orgName: DEMO_ORG.name,
    };
  }, [isDemoMode]);
}

export function useDemoAlerts() {
  const { isDemoMode } = useDemoMode();
  
  return useMemo(() => {
    if (!isDemoMode) return null;
    return {
      all: DEMO_ALERTS,
      unread: DEMO_ALERTS.filter(a => !a.isRead),
      bySeverity: {
        critical: DEMO_ALERTS.filter(a => a.severity === 'critical'),
        high: DEMO_ALERTS.filter(a => a.severity === 'high'),
        medium: DEMO_ALERTS.filter(a => a.severity === 'medium'),
      },
    };
  }, [isDemoMode]);
}

export function useDemoConnectors() {
  const { isDemoMode } = useDemoMode();
  
  return useMemo(() => {
    if (!isDemoMode) return null;
    return {
      all: DEMO_CONNECTORS,
      byStatus: {
        success: DEMO_CONNECTORS.filter(c => c.status === 'success'),
        running: DEMO_CONNECTORS.filter(c => c.status === 'running'),
        failed: DEMO_CONNECTORS.filter(c => c.status === 'failed'),
      },
    };
  }, [isDemoMode]);
}

export function useDemoInvoices() {
  const { isDemoMode } = useDemoMode();
  
  return useMemo(() => {
    if (!isDemoMode) return null;
    return {
      all: DEMO_INVOICES,
      overdue: DEMO_INVOICES.filter(i => i.status === 'overdue'),
      pending: DEMO_INVOICES.filter(i => i.status === 'pending'),
      paid: DEMO_INVOICES.filter(i => i.status === 'paid'),
    };
  }, [isDemoMode]);
}

// ============================================
// DEEP LINK GENERATORS
// ============================================

export function getDemoDeepLinks() {
  return {
    // From Exec Dashboard
    zombieSpend: '/employer/zombie',
    claimsQueue: '/employer/claims?status=pending&priority=urgent',
    spendAnalysis: '/employer/spend',
    recommendations: '/employer/recommendations',
    
    // From HR Ops
    urgentClaim: `/employer/claims?id=${DEMO_CLAIMS_QUEUE[1].id}`, // Most urgent
    policyEditor: `/employer/policies?id=${DEMO_POLICIES[0].id}`,
    
    // From Employee
    submitClaim: '/employee/requests?action=new&type=claim',
    marketplace: '/employee/marketplace',
    
    // From Admin
    auditLog: '/admin/audit',
    featureFlags: '/admin/feature-flags',
    syncMonitor: '/admin/sync-monitor',
  };
}

// ============================================
// DEMO SCRIPT STEPS (for guided tours)
// ============================================

export const DEMO_SCRIPT_STEPS = [
  // Employer/Executive (3 min)
  {
    portal: 'employer',
    step: 1,
    title: 'Executive Dashboard',
    description: 'Show overall benefits investment and key KPIs',
    path: '/employer/dashboard',
    highlights: ['AED 24.6M investment', '68% utilization', 'SLA risk badge'],
    duration: '45s',
  },
  {
    portal: 'employer',
    step: 2,
    title: 'Zombie Spend Analysis',
    description: 'Drill into underutilized benefits',
    path: '/employer/zombie',
    highlights: ['AED 2.95M zombie spend', 'L&D at 36%', 'Recovery actions'],
    duration: '60s',
  },
  {
    portal: 'employer',
    step: 3,
    title: 'Claims SLA Risk',
    description: 'Navigate from dashboard alert to HR queue',
    path: '/employer/claims?priority=urgent',
    highlights: ['8 urgent claims', 'SLA countdown', 'Deep link from exec view'],
    duration: '45s',
  },
  
  // HR Ops (3 min)
  {
    portal: 'employer',
    step: 4,
    title: 'Claims Review',
    description: 'Process an urgent claim with decision guidance',
    path: '/employer/claims',
    highlights: ['Open review sheet', 'Eligibility check', 'Approve with 1 click'],
    duration: '60s',
  },
  {
    portal: 'employer',
    step: 5,
    title: 'Policy Management',
    description: 'Show policy versioning and publish flow',
    path: '/employer/policies',
    highlights: ['v2 vs v3 comparison', 'Publish button', 'Audit log entry'],
    duration: '60s',
  },
  
  // Employee (2 min)
  {
    portal: 'employee',
    step: 6,
    title: 'Employee Dashboard',
    description: 'Show "What you have" and compensation summary',
    path: '/employee/dashboard',
    highlights: ['AED 550K total comp', '72% utilized', 'Quick actions'],
    duration: '45s',
  },
  {
    portal: 'employee',
    step: 7,
    title: 'Request Tracking',
    description: 'View submitted claim and status progression',
    path: '/employee/requests',
    highlights: ['Pending claim visible', 'Status timeline', 'Next step guidance'],
    duration: '45s',
  },
  
  // Admin (2 min)
  {
    portal: 'admin',
    step: 8,
    title: 'Audit Log',
    description: 'Show policy publish and approval events',
    path: '/admin/audit',
    highlights: ['Policy published', 'Claim approved', 'Offer activated'],
    duration: '45s',
  },
  {
    portal: 'admin',
    step: 9,
    title: 'Feature Flags',
    description: 'Show per-org feature control',
    path: '/admin/feature-flags',
    highlights: ['Advanced Analytics OFF', 'Toggle demo', 'Audit logged'],
    duration: '30s',
  },
  {
    portal: 'admin',
    step: 10,
    title: 'Sync Monitor',
    description: 'Show connector statuses including failure',
    path: '/admin/sync-monitor',
    highlights: ['SFTP failed', 'HCM success', 'Error details'],
    duration: '30s',
  },
] as const;
