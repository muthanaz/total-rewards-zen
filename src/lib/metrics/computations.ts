/**
 * Metric Computation Functions
 * 
 * Consistent calculation logic for all platform metrics.
 * All functions return both raw values and formatted strings.
 * 
 * IMPORTANT: This is part of the Unified Metrics Layer.
 * All hooks should use these functions for consistency.
 */

import { formatCurrencyAED, formatPercent, formatInteger } from '@/lib/utils';
import { ComputedMetric, MetricInputs, ConfidenceLevel } from './types';
import { METRIC_DEFINITIONS } from './definitions';
import { computeConfidence } from './confidence';

// ============================================================================
// UNIFIED DEMO FALLBACKS - THE SINGLE SOURCE OF TRUTH
// ============================================================================

/**
 * Consolidated demo fallback values
 * All hooks should use these values when real data is unavailable
 * 
 * These values are consistent with DEMO_ORG, DEMO_EXEC_METRICS, and DEMO_EMPLOYEE
 * from src/lib/demoScenario.ts
 */
export const DEMO_FALLBACKS = {
  // Organization
  employeeCount: 312,
  organizationName: 'Nexa Holdings',
  currency: 'AED',
  
  // Investment & Budget
  totalInvestment: 24600000, // AED 24.6M
  budgetUtilized: 16728000, // AED 16.7M
  
  // Rates & Benchmarks
  utilizationRate: 68,
  targetUtilization: 80,
  costPerEmployee: 78846, // AED 78.8K
  industryBenchmark: 82000,
  peerBenchmark: 79500,
  
  // ROI & Value
  roi: 3.4,
  roiBenchmark: 2.9,
  zombieSpend: 2952000, // AED 2.95M
  recoveryPotential: 1870000, // AED 1.87M
  
  // Satisfaction & Retention
  esatScore: 76,
  esatBenchmark: 72,
  esatTrend: 4.2,
  retentionRate: 91,
  retentionBenchmark: 86,
  turnoverRate: 9,
  turnoverBenchmark: 14,
  
  // Claims SLA
  claimsSlaCompliance: 87,
  claimsSlaTarget: 95,
  pendingClaims: 47,
  urgentClaims: 8,
  
  // Employee-specific
  employeeMonthlySalary: 35000, // Senior professional in UAE
  employeeAnnualSalary: 420000, // 35000 * 12
  employeeTotalBenefits: 282000, // Housing + Schooling + Transport + Health + Wellbeing + Learning
  employeeGuaranteedBenefits: 219000, // Housing + Schooling + Transport (cash allowances)
  employeeUtilized: 215200, // ~76% utilization
  
  // Data quality
  dataConfidence: 'high' as const,
  dataSources: ['Oracle HCM', 'Benefits Platform', 'Claims System'],
} as const;

// ============================================================================
// TYPE-SPECIFIC UTILIZATION FUNCTIONS
// ============================================================================
// CRITICAL: These functions should only receive data for cap-based benefits
// (cash, reimbursement, budget). Coverage and deferred are EXCLUDED.

import { BenefitValueType, BENEFIT_VALUE_TYPES } from '@/lib/taxonomy';

/**
 * Value types that should be included in utilization/unused calculations
 * Coverage, Deferred, and Access are EXCLUDED
 */
export const UTILIZATION_ELIGIBLE_TYPES: BenefitValueType[] = ['cash', 'reimbursement', 'budget'];

/**
 * Check if a benefit type should be included in utilization metrics
 */
export function isUtilizationEligible(valueType: BenefitValueType): boolean {
  return UTILIZATION_ELIGIBLE_TYPES.includes(valueType);
}

/**
 * Compute Utilization Rate
 * 
 * IMPORTANT: This should only be called with data from cap-based benefits
 * (cash, reimbursement, budget). Coverage/deferred/access are excluded.
 */
export function computeUtilizationRate(
  utilized: number,
  total: number,
  sampleSize?: number
): ComputedMetric {
  const value = total > 0 ? (utilized / total) * 100 : 0;
  const confidence = computeConfidence({
    hasRequiredFields: total > 0,
    sampleSize,
    minSampleSize: 10,
  });

  return {
    key: 'utilizationRate',
    value: Math.round(value * 10) / 10,
    formattedValue: formatPercent(value),
    confidence: confidence.level,
    confidenceReason: confidence.reason + ' [cap-based benefits only]',
  };
}

/**
 * Compute Unused Entitlement
 * 
 * IMPORTANT: This should only be called with data from cap-based benefits.
 * Coverage and deferred benefits do NOT have an "unused" concept.
 */
export function computeUnusedEntitlement(
  total: number,
  utilized: number,
  sampleSize?: number
): ComputedMetric {
  const value = Math.max(0, total - utilized);
  const confidence = computeConfidence({
    hasRequiredFields: total > 0,
    sampleSize,
  });

  return {
    key: 'unusedEntitlement',
    value,
    formattedValue: formatCurrencyAED(value),
    confidence: confidence.level,
    confidenceReason: confidence.reason + ' [excludes coverage/deferred]',
  };
}

/**
 * Compute Average Processing Time
 */
export function computeAvgProcessingTime(
  totalDays: number,
  claimsProcessed: number,
  sampleSize?: number
): ComputedMetric {
  const value = claimsProcessed > 0 ? totalDays / claimsProcessed : 0;
  const confidence = computeConfidence({
    hasRequiredFields: claimsProcessed > 0,
    sampleSize: sampleSize ?? claimsProcessed,
    minSampleSize: 5,
  });

  return {
    key: 'avgProcessingTime',
    value: Math.round(value * 10) / 10,
    formattedValue: `${value.toFixed(1)} days`,
    confidence: confidence.level,
    confidenceReason: confidence.reason,
  };
}

/**
 * Compute Approval Rate
 */
export function computeApprovalRate(
  approved: number,
  totalDecided: number,
  sampleSize?: number
): ComputedMetric {
  const value = totalDecided > 0 ? (approved / totalDecided) * 100 : 0;
  const confidence = computeConfidence({
    hasRequiredFields: totalDecided > 0,
    sampleSize: sampleSize ?? totalDecided,
    minSampleSize: 10,
  });

  return {
    key: 'approvalRate',
    value: Math.round(value * 10) / 10,
    formattedValue: formatPercent(value),
    confidence: confidence.level,
    confidenceReason: confidence.reason,
  };
}

/**
 * Compute Claims This Month (simple count)
 */
export function computeClaimsThisMonth(count: number): ComputedMetric {
  return {
    key: 'claimsThisMonth',
    value: count,
    formattedValue: formatInteger(count),
    confidence: 'measured',
    confidenceReason: 'Direct count from database',
  };
}

/**
 * Compute Cost per Employee
 * 
 * IMPORTANT: Uses realistic calculation to avoid inflated values.
 * Formula: Total Annual Investment ÷ Employee Count
 */
export function computeCostPerEmployee(
  totalInvestment: number,
  employeeCount: number,
  sampleSize?: number
): ComputedMetric {
  // Guard against division errors and unrealistic values
  if (employeeCount <= 0) {
    return {
      key: 'costPerEmployee',
      value: 0,
      formattedValue: 'AED 0',
      confidence: 'missing',
      confidenceReason: 'No employee count available',
    };
  }

  const value = totalInvestment / employeeCount;
  
  // Sanity check: typical GCC benefits cost is AED 20K-80K per employee
  // If value is unrealistic, flag as estimated
  const isRealistic = value >= 5000 && value <= 150000;
  
  const confidence = computeConfidence({
    hasRequiredFields: totalInvestment > 0 && employeeCount > 0,
    sampleSize,
    minSampleSize: 20,
  });

  return {
    key: 'costPerEmployee',
    value: Math.round(value),
    formattedValue: formatCurrencyAED(value),
    confidence: isRealistic ? confidence.level : 'estimated',
    confidenceReason: isRealistic 
      ? confidence.reason 
      : 'Value outside typical range; verify data inputs',
  };
}

/**
 * Compute ROI (Return on Investment)
 * 
 * Simplified ROI based on retention savings estimate.
 * Formula: (Retained Employees × Replacement Cost Avoided) ÷ Benefits Investment
 */
export function computeROI(
  retentionRate: number,
  employeeCount: number,
  avgSalary: number,
  totalInvestment: number
): ComputedMetric {
  if (totalInvestment <= 0 || employeeCount <= 0) {
    return {
      key: 'roi',
      value: 0,
      formattedValue: '0.0x',
      confidence: 'missing',
      confidenceReason: 'Insufficient data for ROI calculation',
    };
  }

  // Estimate replacement cost as 50% of annual salary (conservative)
  const replacementCostPerEmployee = avgSalary * 0.5;
  
  // Retained employees vs industry average (assume 85% baseline)
  const baselineRetention = 85;
  const retentionLift = Math.max(0, retentionRate - baselineRetention) / 100;
  const employeesRetained = employeeCount * retentionLift;
  
  // Savings from avoided turnover
  const retentionSavings = employeesRetained * replacementCostPerEmployee;
  
  // ROI ratio
  const value = (retentionSavings / totalInvestment) + 1; // +1 for base investment value

  return {
    key: 'roi',
    value: Math.round(value * 10) / 10,
    formattedValue: `${value.toFixed(1)}x`,
    confidence: 'estimated',
    confidenceReason: 'Calculated estimate based on retention savings model',
  };
}

/**
 * Compute Satisfaction Score
 */
export function computeSatisfactionScore(
  ratings: number[],
  maxRating: number = 5
): ComputedMetric {
  if (ratings.length === 0) {
    return {
      key: 'satisfactionScore',
      value: 0,
      formattedValue: '—',
      confidence: 'missing',
      confidenceReason: 'No survey responses collected',
    };
  }

  const avgRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
  const percentScore = (avgRating / maxRating) * 100;
  
  const confidence = computeConfidence({
    hasRequiredFields: true,
    sampleSize: ratings.length,
    minSampleSize: 30,
  });

  return {
    key: 'satisfactionScore',
    value: Math.round(percentScore * 10) / 10,
    formattedValue: formatPercent(percentScore),
    confidence: confidence.level,
    confidenceReason: confidence.reason,
  };
}

/**
 * Compute Retention Rate
 */
export function computeRetentionRate(
  startCount: number,
  endCount: number,
  newHires: number
): ComputedMetric {
  if (startCount <= 0) {
    return {
      key: 'retentionRate',
      value: 0,
      formattedValue: '—',
      confidence: 'missing',
      confidenceReason: 'No baseline headcount available',
    };
  }

  // Retention = (End - New Hires) / Start
  const retained = endCount - newHires;
  const value = (retained / startCount) * 100;
  
  const confidence = computeConfidence({
    hasRequiredFields: true,
    sampleSize: startCount,
    minSampleSize: 20,
  });

  return {
    key: 'retentionRate',
    value: Math.min(100, Math.max(0, Math.round(value * 10) / 10)),
    formattedValue: formatPercent(Math.min(100, value)),
    confidence: confidence.level,
    confidenceReason: confidence.reason,
  };
}

/**
 * Compute SLA Compliance
 */
export function computeSLACompliance(
  claimsWithinSLA: number,
  totalProcessed: number
): ComputedMetric {
  if (totalProcessed <= 0) {
    return {
      key: 'slaCompliance',
      value: 0,
      formattedValue: '—',
      confidence: 'missing',
      confidenceReason: 'No processed claims in period',
    };
  }

  const value = (claimsWithinSLA / totalProcessed) * 100;
  
  const confidence = computeConfidence({
    hasRequiredFields: true,
    sampleSize: totalProcessed,
    minSampleSize: 10,
  });

  return {
    key: 'slaCompliance',
    value: Math.round(value * 10) / 10,
    formattedValue: formatPercent(value),
    confidence: confidence.level,
    confidenceReason: confidence.reason,
  };
}

// ============================================================================
// FORECAST CONSTRAINT LOGIC
// ============================================================================

/**
 * Forecast constraint: Cap-based benefits can never exceed 100% utilization
 * This prevents impossible states in year-end forecasts.
 */
export interface ForecastResult {
  forecastedUtilization: number;
  forecastedAmount: number;
  maxPossible: number;
  isConstrained: boolean;
  constraintReason?: string;
}

/**
 * Compute constrained forecast for cap-based benefits
 * 
 * CRITICAL: Ensures forecasted utilization never exceeds 100% for cap-based types.
 * Coverage/deferred benefits don't have a cap so they're excluded from this logic.
 */
export function computeConstrainedForecast(
  currentUtilized: number,
  totalEntitlement: number,
  monthsElapsed: number,
  totalMonths: number = 12,
  valueType?: string
): ForecastResult {
  // Coverage and deferred don't have utilization caps
  if (valueType === 'coverage' || valueType === 'deferred' || valueType === 'access') {
    return {
      forecastedUtilization: 0,
      forecastedAmount: 0,
      maxPossible: 0,
      isConstrained: false,
      constraintReason: 'N/A for coverage/deferred benefits',
    };
  }

  if (totalEntitlement <= 0 || monthsElapsed <= 0) {
    return {
      forecastedUtilization: 0,
      forecastedAmount: 0,
      maxPossible: totalEntitlement,
      isConstrained: false,
    };
  }

  // Calculate run-rate
  const monthlyRunRate = currentUtilized / monthsElapsed;
  const remainingMonths = Math.max(0, totalMonths - monthsElapsed);
  const projectedAdditional = monthlyRunRate * remainingMonths;
  
  // Raw forecast
  const rawForecast = currentUtilized + projectedAdditional;
  const rawUtilization = (rawForecast / totalEntitlement) * 100;
  
  // CONSTRAINT: Cannot exceed 100% for cap-based benefits
  const maxPossible = totalEntitlement;
  const isConstrained = rawForecast > maxPossible;
  
  const constrainedForecast = Math.min(rawForecast, maxPossible);
  const constrainedUtilization = Math.min(100, rawUtilization);
  
  return {
    forecastedUtilization: Math.round(constrainedUtilization * 10) / 10,
    forecastedAmount: Math.round(constrainedForecast),
    maxPossible,
    isConstrained,
    constraintReason: isConstrained 
      ? `Capped at 100% entitlement (would have been ${Math.round(rawUtilization)}%)`
      : undefined,
  };
}

/**
 * Generate year-end forecast with constraints
 */
export function generateYearEndForecast(
  currentData: {
    utilized: number;
    entitled: number;
    monthsElapsed: number;
  },
  benefitValueType?: string
): {
  forecast: ForecastResult;
  confidence: ConfidenceLevel;
  confidenceReason: string;
} {
  const forecast = computeConstrainedForecast(
    currentData.utilized,
    currentData.entitled,
    currentData.monthsElapsed,
    12,
    benefitValueType
  );
  
  // Confidence based on how much of the year has passed
  let confidence: ConfidenceLevel = 'estimated';
  let confidenceReason = 'Linear projection based on current run-rate';
  
  if (currentData.monthsElapsed >= 9) {
    confidence = 'high' as ConfidenceLevel;
    confidenceReason = `Based on ${currentData.monthsElapsed} months of actuals`;
  } else if (currentData.monthsElapsed >= 6) {
    confidence = 'medium' as ConfidenceLevel;
    confidenceReason = `Based on ${currentData.monthsElapsed} months; may vary`;
  } else {
    confidence = 'low' as ConfidenceLevel;
    confidenceReason = `Early forecast with only ${currentData.monthsElapsed} months of data`;
  }
  
  if (forecast.isConstrained) {
    confidenceReason += ' [capped at entitlement limit]';
  }
  
  return { forecast, confidence, confidenceReason };
}

/**
 * Compute all metrics from a unified input object
 */
export function computeAllMetrics(inputs: MetricInputs): Record<string, ComputedMetric> {
  const metrics: Record<string, ComputedMetric> = {};

  // Utilization metrics
  if (inputs.totalEntitlement !== undefined && inputs.utilizedAmount !== undefined) {
    metrics.utilizationRate = computeUtilizationRate(
      inputs.utilizedAmount,
      inputs.totalEntitlement,
      inputs.sampleSize
    );
    metrics.unusedEntitlement = computeUnusedEntitlement(
      inputs.totalEntitlement,
      inputs.utilizedAmount,
      inputs.sampleSize
    );
  }

  // Operational metrics
  if (inputs.totalProcessingDays !== undefined && inputs.claimsProcessed !== undefined) {
    metrics.avgProcessingTime = computeAvgProcessingTime(
      inputs.totalProcessingDays,
      inputs.claimsProcessed,
      inputs.sampleSize
    );
  }

  if (inputs.approvedClaims !== undefined && inputs.totalClaims !== undefined) {
    const decided = (inputs.approvedClaims || 0) + (inputs.rejectedClaims || 0);
    metrics.approvalRate = computeApprovalRate(
      inputs.approvedClaims,
      decided,
      inputs.sampleSize
    );
  }

  if (inputs.claimsThisMonth !== undefined) {
    metrics.claimsThisMonth = computeClaimsThisMonth(inputs.claimsThisMonth);
  }

  // Financial metrics
  if (inputs.totalInvestment !== undefined && inputs.employeeCount !== undefined) {
    metrics.costPerEmployee = computeCostPerEmployee(
      inputs.totalInvestment,
      inputs.employeeCount,
      inputs.sampleSize
    );
  }

  // Satisfaction
  if (inputs.satisfactionRatings !== undefined) {
    metrics.satisfactionScore = computeSatisfactionScore(inputs.satisfactionRatings);
  }

  // Retention
  if (inputs.employeesStart !== undefined && inputs.employeesEnd !== undefined) {
    metrics.retentionRate = computeRetentionRate(
      inputs.employeesStart,
      inputs.employeesEnd,
      inputs.newHires || 0
    );
  }

  return metrics;
}
