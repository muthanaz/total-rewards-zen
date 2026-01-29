/**
 * Demo Data - Coherent Single Source of Truth
 * 
 * This module provides consistent, reconciled demo data across:
 * - Employee portal (remaining balances, claims history)
 * - Employer executive dashboards (spend, leakage, recovery)
 * - HR Ops (claims queue, settlements)
 * 
 * KEY PRINCIPLE: utilized_amount ONLY reflects PAID claims.
 * Pending/approved claims do NOT affect utilization until paid.
 */

export * from './demoOrganization';
export * from './demoEmployees';
export * from './demoClaims';

import { DEMO_ORG, DEMO_BENEFIT_CATEGORIES } from './demoOrganization';
import { DEMO_EMPLOYEES, DEMO_ENTITLEMENTS, getTotalEntitlements, getEntitlementsByCategory, EMPLOYEE_STATS } from './demoEmployees';
import { DEMO_CLAIMS, CLAIMS_SUMMARY, getPaidClaimsTotalByCategory, getApprovedClaimsTotalByCategory, getPendingClaimsTotalByCategory } from './demoClaims';

// ============================================================
// RECONCILED EXECUTIVE METRICS
// ============================================================

const paidByCategory = getPaidClaimsTotalByCategory();
const approvedByCategory = getApprovedClaimsTotalByCategory();
const pendingByCategory = getPendingClaimsTotalByCategory();
const entitlementsByCategory = getEntitlementsByCategory();

// Total entitled (annual budget allocated to employees)
const totalEntitled = getTotalEntitlements();

// Total paid (only paid claims count as utilized)
const totalPaid = Object.values(paidByCategory).reduce((a, b) => a + b, 0);

// Total approved pending payment
const totalApprovedPending = Object.values(approvedByCategory).reduce((a, b) => a + b, 0);

// Total pending review
const totalPendingReview = Object.values(pendingByCategory).reduce((a, b) => a + b, 0);

// Committed = Paid + Approved
const totalCommitted = totalPaid + totalApprovedPending;

// Remaining = Entitled - Paid
const totalRemaining = totalEntitled - totalPaid;

// Unutilized = Entitled - Committed (includes approved pending payment)
const totalUnutilized = totalEntitled - totalCommitted;

// Utilization rate (based on paid only)
const utilizationRate = (totalPaid / totalEntitled) * 100;

// ============================================================
// CATEGORY-LEVEL BREAKDOWN
// ============================================================

export interface CategoryMetrics {
  id: string;
  name: string;
  entitled: number;
  paid: number;
  approvedPending: number;
  pendingReview: number;
  remaining: number;
  utilizationRate: number;
}

export const CATEGORY_METRICS: CategoryMetrics[] = DEMO_BENEFIT_CATEGORIES.map(cat => {
  const entitled = entitlementsByCategory[cat.name] || 0;
  const paid = paidByCategory[cat.name] || 0;
  const approved = approvedByCategory[cat.name] || 0;
  const pending = pendingByCategory[cat.name] || 0;
  const remaining = entitled - paid;
  const rate = entitled > 0 ? (paid / entitled) * 100 : 0;
  
  return {
    id: cat.id,
    name: cat.name,
    entitled,
    paid,
    approvedPending: approved,
    pendingReview: pending,
    remaining,
    utilizationRate: Math.round(rate * 10) / 10,
  };
});

// ============================================================
// EXECUTIVE DASHBOARD METRICS (Reconciled)
// ============================================================

export const EXECUTIVE_METRICS = {
  // Organization
  organizationName: DEMO_ORG.name,
  employeeCount: DEMO_EMPLOYEES.length,
  
  // Budget & Spend
  totalBudget: totalEntitled,
  ytdSpend: totalPaid,
  approvedPending: totalApprovedPending,
  pendingReview: totalPendingReview,
  committed: totalCommitted,
  remaining: totalRemaining,
  unutilized: totalUnutilized,
  
  // Rates
  utilizationRate: Math.round(utilizationRate * 10) / 10,
  targetUtilization: 80,
  
  // Cost efficiency
  costPerEmployee: Math.round(totalPaid / DEMO_EMPLOYEES.length),
  entitlementPerEmployee: Math.round(totalEntitled / DEMO_EMPLOYEES.length),
  
  // Leakage & Recovery (estimate ~15% of unutilized is recoverable)
  budgetLeakage: Math.round(totalUnutilized * 0.6), // 60% of unutilized is "leakage"
  recoveryPotential: Math.round(totalUnutilized * 0.4), // 40% is recoverable
  
  // Claims Pipeline
  claimsTotal: CLAIMS_SUMMARY.total,
  claimsPaid: CLAIMS_SUMMARY.byStatus.paid,
  claimsApproved: CLAIMS_SUMMARY.byStatus.approved,
  claimsPending: CLAIMS_SUMMARY.byStatus.submitted + CLAIMS_SUMMARY.byStatus.in_review,
  claimsInfoRequested: CLAIMS_SUMMARY.byStatus.info_requested,
  claimsRejected: CLAIMS_SUMMARY.byStatus.rejected,
  
  // Timestamps
  lastUpdated: new Date().toISOString(),
  fiscalYear: 2025,
};

// ============================================================
// VALIDATION CHECKS (for debugging)
// ============================================================

export function validateDemoDataCoherence(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check 1: Total paid should equal sum of paid claims
  const sumPaidClaims = DEMO_CLAIMS
    .filter(c => c.status === 'paid')
    .reduce((sum, c) => sum + c.payableAmount, 0);
  
  if (sumPaidClaims !== totalPaid) {
    errors.push(`Paid mismatch: claims sum ${sumPaidClaims} vs computed ${totalPaid}`);
  }
  
  // Check 2: Remaining should be positive for most categories
  for (const cat of CATEGORY_METRICS) {
    if (cat.remaining < 0) {
      errors.push(`${cat.name} has negative remaining: ${cat.remaining}`);
    }
  }
  
  // Check 3: Utilization should be between 0-100%
  if (utilizationRate < 0 || utilizationRate > 100) {
    errors.push(`Invalid utilization rate: ${utilizationRate}%`);
  }
  
  // Check 4: Employee count should match
  if (DEMO_EMPLOYEES.length !== 30) {
    errors.push(`Expected 30 employees, got ${DEMO_EMPLOYEES.length}`);
  }
  
  // Check 5: Claims count should match
  if (DEMO_CLAIMS.length !== 20) {
    errors.push(`Expected 20 claims, got ${DEMO_CLAIMS.length}`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================
// SEGMENT BREAKDOWN (for Drivers & Segments)
// ============================================================

export const SEGMENT_METRICS = {
  byDepartment: EMPLOYEE_STATS.byDepartment.map(dept => {
    const deptEmployees = DEMO_EMPLOYEES.filter(e => e.departmentId === dept.id);
    const deptClaims = DEMO_CLAIMS.filter(c => 
      deptEmployees.some(e => e.id === c.employeeId) && c.status === 'paid'
    );
    const spent = deptClaims.reduce((sum, c) => sum + c.payableAmount, 0);
    const entitled = deptEmployees.reduce((sum, e) => {
      const empEntitlements = DEMO_ENTITLEMENTS.filter(ent => ent.employeeId === e.id);
      return sum + empEntitlements.reduce((s, ent) => s + ent.annualCap, 0);
    }, 0);
    
    return {
      id: dept.id,
      name: dept.name,
      employeeCount: dept.count,
      entitled,
      spent,
      utilizationRate: entitled > 0 ? Math.round((spent / entitled) * 100 * 10) / 10 : 0,
    };
  }),
  
  byGrade: EMPLOYEE_STATS.byGrade.map(grade => {
    const gradeEmployees = DEMO_EMPLOYEES.filter(e => e.grade === grade.id);
    const gradeClaims = DEMO_CLAIMS.filter(c =>
      gradeEmployees.some(e => e.id === c.employeeId) && c.status === 'paid'
    );
    const spent = gradeClaims.reduce((sum, c) => sum + c.payableAmount, 0);
    const entitled = gradeEmployees.reduce((sum, e) => {
      const empEntitlements = DEMO_ENTITLEMENTS.filter(ent => ent.employeeId === e.id);
      return sum + empEntitlements.reduce((s, ent) => s + ent.annualCap, 0);
    }, 0);
    
    return {
      id: grade.id,
      name: grade.name,
      employeeCount: grade.count,
      entitled,
      spent,
      utilizationRate: entitled > 0 ? Math.round((spent / entitled) * 100 * 10) / 10 : 0,
    };
  }),
};

// ============================================================
// PRINTABLE SUMMARY (for debugging)
// ============================================================

export function printDemoDataSummary(): void {
  console.group('📊 Demo Data Summary');
  console.log('Organization:', DEMO_ORG.name);
  console.log('Employees:', DEMO_EMPLOYEES.length);
  console.log('Claims:', DEMO_CLAIMS.length);
  console.log('---');
  console.log('Total Entitled:', totalEntitled.toLocaleString(), 'AED');
  console.log('Total Paid:', totalPaid.toLocaleString(), 'AED');
  console.log('Utilization:', utilizationRate.toFixed(1), '%');
  console.log('---');
  console.table(CATEGORY_METRICS.map(c => ({
    Category: c.name,
    Entitled: c.entitled.toLocaleString(),
    Paid: c.paid.toLocaleString(),
    Remaining: c.remaining.toLocaleString(),
    'Rate %': c.utilizationRate,
  })));
  console.log('---');
  console.log('Validation:', validateDemoDataCoherence());
  console.groupEnd();
}
