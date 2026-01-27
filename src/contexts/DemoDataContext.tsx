/**
 * Demo Data Context - Shared Reactive State
 * 
 * Central data store for demo metrics that ensures consistency across all pages.
 * Provides reactive updates when claims are approved/rejected.
 * 
 * IMPORTANT: All pages consuming demo metrics should use this context
 * to ensure numbers match and update reactively.
 */

import React, { createContext, useContext, useState, useCallback, ReactNode, useMemo } from 'react';
import { toast } from 'sonner';

// ============================================
// GLOBAL METRICS - THE SINGLE SOURCE OF TRUTH
// ============================================

// Initial values for global metrics
const createInitialMetrics = (): GlobalMetrics => ({
  // Core Budget Metrics
  totalBudget: 15000000,        // AED 15M (Annual allocated budget)
  ytdSpend: 11250000,           // AED 11.25M (YTD actual spend - 75% of budget)
  projectedSpend: 14800000,     // AED 14.8M (End of year projection)
  
  // Workforce
  activeEmployees: 312,         // Total headcount
  
  // Rates
  utilizationRate: 76.0,        // Float - % of budget utilized
  targetUtilization: 85.0,      // Target utilization %
  
  // Derived metrics (computed from above)
  unutilizedBudget: 3750000,    // totalBudget - ytdSpend
  costPerEmployee: 48077,       // totalBudget / activeEmployees
  
  // Claims queue metrics
  pendingClaims: 47,
  approvedToday: 12,
  rejectedToday: 3,
  
  // ROI & Savings
  budgetLeakage: 2200000,       // Identified waste
  recoveryPotential: 1450000,   // Recoverable amount
  
  // Timestamps
  lastUpdated: new Date().toISOString(),
});

export interface GlobalMetrics {
  // Core Budget Metrics
  totalBudget: number;
  ytdSpend: number;
  projectedSpend: number;
  
  // Workforce
  activeEmployees: number;
  
  // Rates
  utilizationRate: number;
  targetUtilization: number;
  
  // Derived metrics
  unutilizedBudget: number;
  costPerEmployee: number;
  
  // Claims queue metrics
  pendingClaims: number;
  approvedToday: number;
  rejectedToday: number;
  
  // ROI & Savings
  budgetLeakage: number;
  recoveryPotential: number;
  
  // Timestamps
  lastUpdated: string;
}

// Export initial metrics for external use
export const INITIAL_GLOBAL_METRICS = createInitialMetrics();

// ============================================
// CONTEXT TYPES
// ============================================

interface DemoDataContextType {
  metrics: GlobalMetrics;
  
  // Actions
  approveClaim: (amount: number, claimId?: string) => void;
  rejectClaim: (claimId?: string) => void;
  resetMetrics: () => void;
  
  // Segment totals (should roughly equal activeEmployees)
  segmentBreakdown: {
    hqOffice: number;
    fieldOps: number;
    leadership: number;
  };
  
  // Transaction history for audit trail
  recentTransactions: Transaction[];
}

interface Transaction {
  id: string;
  type: 'approve' | 'reject';
  amount: number;
  timestamp: string;
  claimId?: string;
}

const DemoDataContext = createContext<DemoDataContextType | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================

export function DemoDataProvider({ children }: { children: ReactNode }) {
  // Core metrics state
  const [metrics, setMetrics] = useState<GlobalMetrics>(() => createInitialMetrics());
  
  // Transaction history
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  
  // Segment breakdown (sums to ~activeEmployees)
  const segmentBreakdown = useMemo(() => ({
    hqOffice: 142,
    fieldOps: 128,
    leadership: 42,
  }), []);
  
  // Approve a claim - adds to YTD spend and recalculates utilization
  const approveClaim = useCallback((amount: number, claimId?: string) => {
    setMetrics(prev => {
      const newYtdSpend = prev.ytdSpend + amount;
      const newUtilizationRate = (newYtdSpend / prev.totalBudget) * 100;
      const newUnutilizedBudget = prev.totalBudget - newYtdSpend;
      
      // Also update projected spend (simple linear projection)
      const monthsElapsed = new Date().getMonth() + 1;
      const monthlyRate = newYtdSpend / monthsElapsed;
      const newProjectedSpend = Math.min(monthlyRate * 12, prev.totalBudget * 1.1);
      
      return {
        ...prev,
        ytdSpend: newYtdSpend,
        utilizationRate: Math.round(newUtilizationRate * 10) / 10,
        unutilizedBudget: newUnutilizedBudget,
        projectedSpend: Math.round(newProjectedSpend),
        pendingClaims: Math.max(0, prev.pendingClaims - 1),
        approvedToday: prev.approvedToday + 1,
        lastUpdated: new Date().toISOString(),
      };
    });
    
    // Add to transaction history
    const transaction: Transaction = {
      id: `txn-${Date.now()}`,
      type: 'approve',
      amount,
      timestamp: new Date().toISOString(),
      claimId,
    };
    
    setRecentTransactions(prev => [transaction, ...prev].slice(0, 50));
    
    // Show toast notification
    toast.success('Claim Approved', {
      description: `AED ${amount.toLocaleString()} added to YTD spend`,
    });
  }, []);
  
  // Reject a claim - updates pending count only
  const rejectClaim = useCallback((claimId?: string) => {
    setMetrics(prev => ({
      ...prev,
      pendingClaims: Math.max(0, prev.pendingClaims - 1),
      rejectedToday: prev.rejectedToday + 1,
      lastUpdated: new Date().toISOString(),
    }));
    
    // Add to transaction history
    const transaction: Transaction = {
      id: `txn-${Date.now()}`,
      type: 'reject',
      amount: 0,
      timestamp: new Date().toISOString(),
      claimId,
    };
    
    setRecentTransactions(prev => [transaction, ...prev].slice(0, 50));
  }, []);
  
  // Reset to initial values
  const resetMetrics = useCallback(() => {
    setMetrics(createInitialMetrics());
    setRecentTransactions([]);
    toast.info('Demo metrics reset to defaults');
  }, []);
  
  const value = useMemo(() => ({
    metrics,
    approveClaim,
    rejectClaim,
    resetMetrics,
    segmentBreakdown,
    recentTransactions,
  }), [metrics, approveClaim, rejectClaim, resetMetrics, segmentBreakdown, recentTransactions]);
  
  return (
    <DemoDataContext.Provider value={value}>
      {children}
    </DemoDataContext.Provider>
  );
}

// ============================================
// HOOKS
// ============================================

export function useDemoData() {
  const context = useContext(DemoDataContext);
  if (context === undefined) {
    throw new Error('useDemoData must be used within a DemoDataProvider');
  }
  return context;
}

// Safe hook that returns defaults if context is not available
export function useDemoDataSafe() {
  const context = useContext(DemoDataContext);
  
  if (!context) {
    return {
      metrics: INITIAL_GLOBAL_METRICS,
      approveClaim: () => {},
      rejectClaim: () => {},
      resetMetrics: () => {},
      segmentBreakdown: { hqOffice: 142, fieldOps: 128, leadership: 42 },
      recentTransactions: [],
    };
  }
  
  return context;
}

// Hook to get just the metrics (for components that only need to read)
export function useGlobalMetrics() {
  const { metrics } = useDemoDataSafe();
  return metrics;
}

// Hook for claim actions (for Operations Hub)
export function useClaimActions() {
  const { approveClaim, rejectClaim, metrics } = useDemoDataSafe();
  return { 
    approveClaim, 
    rejectClaim,
    pendingClaims: metrics.pendingClaims,
    approvedToday: metrics.approvedToday,
    rejectedToday: metrics.rejectedToday,
  };
}
