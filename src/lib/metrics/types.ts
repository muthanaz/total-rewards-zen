/**
 * Metrics Type Definitions
 */

export type MetricUnit = 'currency' | 'percent' | 'days' | 'count' | 'ratio';
export type ConfidenceLevel = 'measured' | 'estimated' | 'proxy' | 'missing';
export type MetricCategory = 'utilization' | 'financial' | 'operational' | 'satisfaction' | 'retention';

export interface MetricDefinition {
  key: string;
  name: string;
  nameAr?: string;
  description: string;
  descriptionAr?: string;
  formula: string;
  formulaAr?: string;
  unit: MetricUnit;
  category: MetricCategory;
  timeWindow?: string;
  exclusions?: string[];
  dataSource: string;
  minSampleSize?: number;
  benchmarkRange?: { low: number; target: number; high: number };
}

export interface ComputedMetric {
  key: string;
  value: number;
  formattedValue: string;
  confidence: ConfidenceLevel;
  confidenceReason?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'flat';
    isPositive: boolean;
  };
}

export interface MetricInputs {
  // Employee/Benefits data
  totalEntitlement?: number;
  utilizedAmount?: number;
  remainingAmount?: number;
  
  // Operational data
  pendingClaims?: number;
  approvedClaims?: number;
  rejectedClaims?: number;
  totalClaims?: number;
  claimsThisMonth?: number;
  totalProcessingDays?: number;
  claimsProcessed?: number;
  
  // Financial data
  totalInvestment?: number;
  totalBudget?: number;
  employeeCount?: number;
  
  // Satisfaction/Retention
  satisfactionRatings?: number[];
  employeesStart?: number;
  employeesEnd?: number;
  newHires?: number;
  terminations?: number;
  
  // Data quality
  sampleSize?: number;
  dataFreshness?: Date;
  fieldsComplete?: number;
  fieldsTotal?: number;
}
