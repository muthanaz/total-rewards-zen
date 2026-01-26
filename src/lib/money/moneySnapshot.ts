/**
 * Money Snapshot Computation
 * 
 * Computes "Net Pay Snapshot" for employees using ONLY available fields.
 * This is cash-reality focused - never treats benefits as payroll deductions.
 * 
 * Data Sources:
 * - Salary: profiles.monthly_salary (payroll, measured) or DEMO_FALLBACKS
 * - Commitments: employee_budget_items (employee_input, reported)
 * - Savings: employee_budget_items (employee_input, reported)
 */

import { ConfidenceLevel } from '@/lib/metrics/types';
import { DEMO_FALLBACKS } from '@/lib/metrics/computations';
import { formatCurrencyAED } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export type MoneySource = 'payroll' | 'employee_input' | 'demo' | 'missing';
export type MoneyConfidence = 'measured' | 'employee_reported' | 'estimated' | 'missing';

export interface MoneyValue {
  amount: number;
  source: MoneySource;
  confidence: MoneyConfidence;
  lastUpdated?: Date;
  label: string;
  labelAr: string;
}

export interface MoneySnapshotData {
  // Core values
  netPay: MoneyValue;
  totalCommitments: MoneyValue;
  savingsGoal: MoneyValue;
  discretionaryRoom: MoneyValue;
  
  // Derived flags
  hasRealSalary: boolean;
  hasUserCommitments: boolean;
  hasSavingsGoal: boolean;
  isComplete: boolean; // True if all data is available
  
  // Summary
  timeframe: 'this_month';
  lastCalculated: Date;
}

export interface CommitmentItem {
  id: string;
  category: string;
  amount: number;
  source: MoneySource;
  confidence: MoneyConfidence;
}

// ============================================================================
// CONFIDENCE MAPPING
// ============================================================================

export function getConfidenceFromSource(source: MoneySource): MoneyConfidence {
  switch (source) {
    case 'payroll': return 'measured';
    case 'employee_input': return 'employee_reported';
    case 'demo': return 'estimated';
    default: return 'missing';
  }
}

export function mapToMetricConfidence(confidence: MoneyConfidence): ConfidenceLevel {
  switch (confidence) {
    case 'measured': return 'measured';
    case 'employee_reported': return 'measured'; // Employee-reported is treated as measured for their personal data
    case 'estimated': return 'estimated';
    case 'missing': return 'missing';
  }
}

// ============================================================================
// COMPUTATION
// ============================================================================

interface ComputeMoneySnapshotParams {
  /** Monthly salary from profile (null if not available) */
  monthlySalary: number | null;
  /** Whether salary is from real payroll data */
  salaryFromPayroll: boolean;
  /** Commitment items from employee_budget_items */
  commitments: CommitmentItem[];
  /** Savings goal amount from employee_budget_items */
  savingsGoalAmount: number | null;
  /** Force demo mode */
  isDemo?: boolean;
}

export function computeMoneySnapshot(params: ComputeMoneySnapshotParams): MoneySnapshotData {
  const {
    monthlySalary,
    salaryFromPayroll,
    commitments,
    savingsGoalAmount,
    isDemo = false,
  } = params;

  const now = new Date();

  // Determine salary source and value
  const hasRealSalary = monthlySalary !== null && monthlySalary > 0 && !isDemo;
  const salarySource: MoneySource = hasRealSalary 
    ? (salaryFromPayroll ? 'payroll' : 'employee_input')
    : 'demo';
  const salaryAmount = hasRealSalary ? monthlySalary : DEMO_FALLBACKS.employeeMonthlySalary;

  // Compute commitments
  const hasUserCommitments = commitments.length > 0 && !isDemo;
  const commitmentsSource: MoneySource = hasUserCommitments ? 'employee_input' : 'demo';
  const totalCommitmentsAmount = hasUserCommitments
    ? commitments.reduce((sum, c) => sum + c.amount, 0)
    : 9500; // Demo: Rent 6500 + Loan 2200 + Utilities 800

  // Compute savings
  const hasSavingsGoal = savingsGoalAmount !== null && savingsGoalAmount > 0 && !isDemo;
  const savingsSource: MoneySource = hasSavingsGoal ? 'employee_input' : 'demo';
  const savingsAmount = hasSavingsGoal ? savingsGoalAmount : 2000; // Demo

  // Compute discretionary room
  const discretionaryAmount = salaryAmount - totalCommitmentsAmount - savingsAmount;

  // Determine overall completeness
  const isComplete = hasRealSalary && hasUserCommitments;

  return {
    netPay: {
      amount: salaryAmount,
      source: salarySource,
      confidence: getConfidenceFromSource(salarySource),
      lastUpdated: now,
      label: 'Net Pay',
      labelAr: 'صافي الراتب',
    },
    totalCommitments: {
      amount: totalCommitmentsAmount,
      source: commitmentsSource,
      confidence: getConfidenceFromSource(commitmentsSource),
      lastUpdated: now,
      label: 'Fixed Commitments',
      labelAr: 'الالتزامات الثابتة',
    },
    savingsGoal: {
      amount: savingsAmount,
      source: savingsSource,
      confidence: getConfidenceFromSource(savingsSource),
      lastUpdated: now,
      label: 'Savings Goal',
      labelAr: 'هدف الادخار',
    },
    discretionaryRoom: {
      amount: discretionaryAmount,
      source: isComplete ? 'employee_input' : 'demo',
      confidence: isComplete ? 'employee_reported' : 'estimated',
      lastUpdated: now,
      label: 'Discretionary Room',
      labelAr: 'المبلغ المتبقي',
    },
    hasRealSalary,
    hasUserCommitments,
    hasSavingsGoal,
    isComplete,
    timeframe: 'this_month',
    lastCalculated: now,
  };
}

// ============================================================================
// DISPLAY HELPERS
// ============================================================================

export function getConfidenceLabel(confidence: MoneyConfidence, language: 'en' | 'ar' = 'en'): string {
  const labels: Record<MoneyConfidence, { en: string; ar: string }> = {
    measured: { en: 'Measured', ar: 'مقاس' },
    employee_reported: { en: 'Reported', ar: 'مُبلَّغ' },
    estimated: { en: 'Estimated', ar: 'تقدير' },
    missing: { en: 'Missing', ar: 'مفقود' },
  };
  return labels[confidence][language];
}

export function getSourceLabel(source: MoneySource, language: 'en' | 'ar' = 'en'): string {
  const labels: Record<MoneySource, { en: string; ar: string }> = {
    payroll: { en: 'Payroll', ar: 'كشوف المرتبات' },
    employee_input: { en: 'Your input', ar: 'إدخالك' },
    demo: { en: 'Demo data', ar: 'بيانات تجريبية' },
    missing: { en: 'Not available', ar: 'غير متوفر' },
  };
  return labels[source][language];
}

export function getHowCalculatedText(
  type: 'netPay' | 'commitments' | 'savings' | 'discretionary',
  snapshot: MoneySnapshotData,
  language: 'en' | 'ar' = 'en'
): string {
  const isEn = language === 'en';
  
  switch (type) {
    case 'netPay':
      if (snapshot.hasRealSalary) {
        return isEn 
          ? 'Based on your monthly salary from payroll data.'
          : 'بناءً على راتبك الشهري من بيانات كشوف المرتبات.';
      }
      return isEn
        ? 'Using estimated salary. Connect payroll for accurate data.'
        : 'باستخدام راتب تقديري. اربط كشوف المرتبات للحصول على بيانات دقيقة.';
    
    case 'commitments':
      if (snapshot.hasUserCommitments) {
        return isEn
          ? `Sum of ${snapshot.totalCommitments.amount > 0 ? 'your' : ''} monthly fixed expenses (rent, loans, etc.) that you entered.`
          : 'مجموع نفقاتك الشهرية الثابتة (الإيجار، القروض، إلخ) التي أدخلتها.';
      }
      return isEn
        ? 'Add your monthly commitments for personalized calculations.'
        : 'أضف التزاماتك الشهرية للحصول على حسابات مخصصة.';
    
    case 'savings':
      if (snapshot.hasSavingsGoal) {
        return isEn
          ? 'Monthly savings target you set for yourself.'
          : 'هدف الادخار الشهري الذي حددته لنفسك.';
      }
      return isEn
        ? 'Set a savings goal to track your progress.'
        : 'حدد هدفًا للادخار لتتبع تقدمك.';
    
    case 'discretionary':
      return isEn
        ? 'Net Pay − Fixed Commitments − Savings Goal = what you can safely spend.'
        : 'صافي الراتب − الالتزامات الثابتة − هدف الادخار = ما يمكنك إنفاقه بأمان.';
  }
}

export function formatMoneyValue(value: MoneyValue): string {
  return formatCurrencyAED(value.amount);
}

// ============================================================================
// TIMEFRAME LABELS
// ============================================================================

export function getTimeframeLabel(timeframe: 'this_month' | 'one_time' | 'this_year', language: 'en' | 'ar' = 'en'): string {
  const labels: Record<string, { en: string; ar: string }> = {
    this_month: { en: 'This month', ar: 'هذا الشهر' },
    one_time: { en: 'One-time', ar: 'مرة واحدة' },
    this_year: { en: 'This year', ar: 'هذا العام' },
  };
  return labels[timeframe][language];
}
