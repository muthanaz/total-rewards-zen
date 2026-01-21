/**
 * Metric Computation Functions
 * 
 * Consistent calculation logic for all platform metrics.
 * All functions return both raw values and formatted strings.
 */

import { formatCurrencyAED, formatPercent, formatInteger } from '@/lib/utils';
import { ComputedMetric, MetricInputs, ConfidenceLevel } from './types';
import { METRIC_DEFINITIONS } from './definitions';
import { computeConfidence } from './confidence';

/**
 * Compute Utilization Rate
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
    confidenceReason: confidence.reason,
  };
}

/**
 * Compute Unused Entitlement
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
    confidenceReason: confidence.reason,
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
