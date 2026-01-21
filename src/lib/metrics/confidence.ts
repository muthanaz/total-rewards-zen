/**
 * Data Confidence Computation
 * 
 * Determines the reliability level of computed metrics based on
 * data completeness, sample size, and freshness.
 */

import { ConfidenceLevel } from './types';

export interface ConfidenceInputs {
  hasRequiredFields: boolean;
  sampleSize?: number;
  minSampleSize?: number;
  dataFreshness?: Date;
  maxStaleHours?: number;
  fieldsComplete?: number;
  fieldsTotal?: number;
}

export interface ConfidenceResult {
  level: ConfidenceLevel;
  reason: string;
  score: number; // 0-100
}

/**
 * Compute confidence level for a metric
 */
export function computeConfidence(inputs: ConfidenceInputs): ConfidenceResult {
  const {
    hasRequiredFields,
    sampleSize = 0,
    minSampleSize = 10,
    dataFreshness,
    maxStaleHours = 24,
    fieldsComplete,
    fieldsTotal,
  } = inputs;

  // Missing required data
  if (!hasRequiredFields) {
    return {
      level: 'missing',
      reason: 'Required data fields not available',
      score: 0,
    };
  }

  let score = 100;
  const issues: string[] = [];

  // Sample size check
  if (sampleSize < minSampleSize) {
    const samplePenalty = ((minSampleSize - sampleSize) / minSampleSize) * 30;
    score -= samplePenalty;
    issues.push(`Sample size (${sampleSize}) below minimum (${minSampleSize})`);
  }

  // Data freshness check
  if (dataFreshness) {
    const hoursOld = (Date.now() - dataFreshness.getTime()) / (1000 * 60 * 60);
    if (hoursOld > maxStaleHours) {
      const stalePenalty = Math.min(20, (hoursOld - maxStaleHours) / maxStaleHours * 20);
      score -= stalePenalty;
      issues.push(`Data is ${Math.round(hoursOld)} hours old`);
    }
  }

  // Field completeness check
  if (fieldsComplete !== undefined && fieldsTotal !== undefined && fieldsTotal > 0) {
    const completeness = fieldsComplete / fieldsTotal;
    if (completeness < 0.9) {
      const completenessPenalty = (1 - completeness) * 30;
      score -= completenessPenalty;
      issues.push(`Only ${Math.round(completeness * 100)}% of fields complete`);
    }
  }

  // Determine level based on score
  let level: ConfidenceLevel;
  let reason: string;

  if (score >= 85) {
    level = 'measured';
    reason = 'Based on complete, current data';
  } else if (score >= 70) {
    level = 'estimated';
    reason = issues.length > 0 ? issues[0] : 'Minor data gaps present';
  } else if (score >= 40) {
    level = 'proxy';
    reason = issues.length > 0 ? issues.join('; ') : 'Significant data limitations';
  } else {
    level = 'missing';
    reason = 'Insufficient data for reliable calculation';
  }

  return { level, reason, score: Math.max(0, Math.round(score)) };
}

/**
 * Get display properties for confidence level
 */
export function getConfidenceDisplay(level: ConfidenceLevel): {
  label: string;
  labelAr: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: 'check' | 'trendingUp' | 'alertTriangle' | 'helpCircle';
} {
  switch (level) {
    case 'measured':
      return {
        label: 'Real',
        labelAr: 'حقيقي',
        color: 'text-success',
        bgColor: 'bg-success/10',
        borderColor: 'border-success/30',
        icon: 'check',
      };
    case 'estimated':
      return {
        label: 'Estimated',
        labelAr: 'تقديري',
        color: 'text-warning',
        bgColor: 'bg-warning/10',
        borderColor: 'border-warning/30',
        icon: 'trendingUp',
      };
    case 'proxy':
      return {
        label: 'Proxy',
        labelAr: 'بديل',
        color: 'text-muted-foreground',
        bgColor: 'bg-muted/50',
        borderColor: 'border-muted',
        icon: 'alertTriangle',
      };
    case 'missing':
    default:
      return {
        label: 'Missing',
        labelAr: 'مفقود',
        color: 'text-destructive',
        bgColor: 'bg-destructive/10',
        borderColor: 'border-destructive/30',
        icon: 'helpCircle',
      };
  }
}
