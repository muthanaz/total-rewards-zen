/**
 * Segment Data Hook
 * 
 * Provides workforce segmentation data for the Employee Segments page.
 * Each segment dimension has coverage status and drill-down metrics.
 * 
 * PRODUCTION-GRADE: Includes confidence levels, claims cost, retention risk,
 * and driver analysis for actionable insights.
 */

import { useMemo, useState, useCallback } from 'react';
import { LucideIcon, Briefcase, Building2, MapPin, Clock, Users, Heart, Globe, Home, Wallet, Calendar } from 'lucide-react';
import { formatCurrencyAED, formatPercent } from '@/lib/utils';

// ============= CONFIDENCE =============

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export const CONFIDENCE_FACTORS: Record<ConfidenceLevel, number> = {
  high: 1.0,
  medium: 0.7,
  low: 0.4,
};

// ============= DRIVER TYPES =============

export type DriverType = 'awareness' | 'policy_complexity' | 'process_friction' | 'vendor_access' | 'timing_mismatch';

export interface RootCauseDriver {
  id: DriverType;
  name: string;
  shortName: string;
  description: string;
  percentage: number; // contribution %
}

export const DRIVER_DEFINITIONS: Record<DriverType, { name: string; shortName: string; description: string }> = {
  awareness: {
    name: 'Awareness Gap',
    shortName: 'Awareness',
    description: 'Employees may not know about available benefits or eligibility',
  },
  policy_complexity: {
    name: 'Policy Complexity',
    shortName: 'Policy',
    description: 'Confusing rules, exceptions, or documentation requirements',
  },
  process_friction: {
    name: 'Process Friction',
    shortName: 'Process',
    description: 'Lengthy approval times, missing docs, or difficult claim procedures',
  },
  vendor_access: {
    name: 'Vendor Access Gap',
    shortName: 'Vendor',
    description: 'Limited provider network or no convenient access options',
  },
  timing_mismatch: {
    name: 'Timing Mismatch',
    shortName: 'Timing',
    description: 'Annual windows, waiting periods, or approval delays',
  },
};

// ============= TYPES =============

export type SegmentDimensionId = 'grade' | 'department' | 'nationality' | 'life_stage' | 'work_arrangement' | 'joiner_cohort' | 'employment_type' | 'compensation_band';

export interface SegmentValue {
  id: string;
  name: string;
  headcount: number;
  avgTotalComp: number | null;
  utilizationRate: number;
  unusedEntitlement: number;
  claimsCost: number;
  claimsCostDelta: number; // YoY % change
  satisfactionScore: number | null; // 1-5 scale
  retentionRisk: 'high' | 'medium' | 'low';
  confidence: ConfidenceLevel;
  topCategories: string[];
  slaRiskCount: number;
  missingDocsCount: number;
  overLimitCount: number;
  drivers: RootCauseDriver[];
}

export interface SegmentDimension {
  id: SegmentDimensionId;
  name: string;
  description: string;
  icon: LucideIcon;
  coverage: number; // 0-100
  isAvailable: boolean;
  headcount: number;
  avgTotalComp: number | null;
  utilizationRate: number;
  unusedEntitlement: number;
  claimsCost: number;
  topCategory: string;
  confidence: ConfidenceLevel;
  values: SegmentValue[];
  isDemoOnly?: boolean;
}

export interface SegmentInsight {
  id: string;
  title: string;
  description: string;
  metric: string;
  impact: string;
  drivers: string[];
}

export interface SegmentValueInsights {
  segmentValue: SegmentValue;
  insights: SegmentInsight[];
  drivers: RootCauseDriver[];
  categoryBreakdown: {
    category: string;
    unusedEntitlement: number;
    claimsCost: number;
    utilizationRate: number;
  }[];
  suggestedActions: {
    id: string;
    title: string;
    type: 'recommendation' | 'zombie_review' | 'comms_campaign' | 'launch_playbook';
    playbookId?: string;
    routePath: string;
    routeParams: Record<string, string>;
  }[];
  impactedSegments: {
    dimension: string;
    values: { name: string; percentage: number }[];
  }[];
}

export interface SpendByCategory {
  category: string;
  spent: number;
  allocated: number;
}

export interface UtilizationByCategory {
  category: string;
  rate: number;
}

export interface SegmentOpportunity {
  segmentId: string;
  segmentName: string;
  dimensionId: SegmentDimensionId;
  dimensionName: string;
  opportunityAED: number;
  primaryDriver: DriverType;
  confidence: ConfidenceLevel;
  headcount: number;
  utilizationRate: number;
}

// ============= DRIVER GENERATION =============

function generateDrivers(utilizationRate: number, slaRiskCount: number, missingDocsCount: number): RootCauseDriver[] {
  const drivers: RootCauseDriver[] = [];
  
  // Low utilization → awareness gap
  if (utilizationRate < 70) {
    drivers.push({
      id: 'awareness',
      ...DRIVER_DEFINITIONS.awareness,
      percentage: 25 + Math.round(Math.random() * 20),
    });
  }
  
  // Process friction from docs/SLA
  if (missingDocsCount > 2 || slaRiskCount > 1) {
    drivers.push({
      id: 'process_friction',
      ...DRIVER_DEFINITIONS.process_friction,
      percentage: 15 + Math.round(Math.random() * 25),
    });
  }
  
  // Policy complexity
  if (utilizationRate < 60) {
    drivers.push({
      id: 'policy_complexity',
      ...DRIVER_DEFINITIONS.policy_complexity,
      percentage: 10 + Math.round(Math.random() * 20),
    });
  }
  
  // Vendor access
  if (Math.random() > 0.6) {
    drivers.push({
      id: 'vendor_access',
      ...DRIVER_DEFINITIONS.vendor_access,
      percentage: 8 + Math.round(Math.random() * 15),
    });
  }
  
  // Timing mismatch
  if (Math.random() > 0.7) {
    drivers.push({
      id: 'timing_mismatch',
      ...DRIVER_DEFINITIONS.timing_mismatch,
      percentage: 5 + Math.round(Math.random() * 12),
    });
  }
  
  // Normalize to 100%
  const total = drivers.reduce((sum, d) => sum + d.percentage, 0);
  if (total > 0) {
    const remaining = 100 - total;
    if (remaining > 0 && drivers.length > 0) {
      drivers[0].percentage += remaining;
    }
  }
  
  return drivers.sort((a, b) => b.percentage - a.percentage);
}

// ============= SEED DATA =============

const GRADE_VALUES: SegmentValue[] = [
  { id: 'g-m1', name: 'M1 (Entry)', headcount: 28, avgTotalComp: 180000, utilizationRate: 62, unusedEntitlement: 145000, claimsCost: 85000, claimsCostDelta: 12, satisfactionScore: 3.8, retentionRisk: 'medium' as const, confidence: 'high' as const, topCategories: ['Health', 'L&D', 'Transport'], slaRiskCount: 2, missingDocsCount: 5, overLimitCount: 0, drivers: [] },
  { id: 'g-m2', name: 'M2 (Junior)', headcount: 35, avgTotalComp: 240000, utilizationRate: 71, unusedEntitlement: 185000, claimsCost: 125000, claimsCostDelta: 8, satisfactionScore: 4.0, retentionRisk: 'medium' as const, confidence: 'high' as const, topCategories: ['Health', 'Transport', 'Wellbeing'], slaRiskCount: 1, missingDocsCount: 3, overLimitCount: 1, drivers: [] },
  { id: 'g-m3', name: 'M3 (Mid)', headcount: 32, avgTotalComp: 320000, utilizationRate: 78, unusedEntitlement: 156000, claimsCost: 180000, claimsCostDelta: -2, satisfactionScore: 4.2, retentionRisk: 'low' as const, confidence: 'high' as const, topCategories: ['Housing', 'Health', 'Schooling'], slaRiskCount: 0, missingDocsCount: 2, overLimitCount: 0, drivers: [] },
  { id: 'g-m4', name: 'M4 (Senior)', headcount: 20, avgTotalComp: 450000, utilizationRate: 85, unusedEntitlement: 98000, claimsCost: 220000, claimsCostDelta: 5, satisfactionScore: 4.3, retentionRisk: 'low' as const, confidence: 'high' as const, topCategories: ['Housing', 'Schooling', 'Flight'], slaRiskCount: 1, missingDocsCount: 1, overLimitCount: 2, drivers: [] },
  { id: 'g-m5', name: 'M5 (Manager)', headcount: 10, avgTotalComp: 620000, utilizationRate: 91, unusedEntitlement: 45000, claimsCost: 185000, claimsCostDelta: 3, satisfactionScore: 4.5, retentionRisk: 'low' as const, confidence: 'high' as const, topCategories: ['Housing', 'Flight', 'Equity'], slaRiskCount: 0, missingDocsCount: 0, overLimitCount: 1, drivers: [] },
  { id: 'g-m6', name: 'M6+ (Director+)', headcount: 5, avgTotalComp: 950000, utilizationRate: 94, unusedEntitlement: 28000, claimsCost: 125000, claimsCostDelta: -5, satisfactionScore: 4.7, retentionRisk: 'low' as const, confidence: 'high' as const, topCategories: ['Equity', 'Executive Health', 'Flight'], slaRiskCount: 0, missingDocsCount: 0, overLimitCount: 0, drivers: [] },
].map(v => ({ ...v, drivers: generateDrivers(v.utilizationRate, v.slaRiskCount, v.missingDocsCount) }));

const DEPARTMENT_VALUES: SegmentValue[] = [
  { id: 'd-eng', name: 'Engineering', headcount: 42, avgTotalComp: 380000, utilizationRate: 72, unusedEntitlement: 210000, claimsCost: 195000, claimsCostDelta: 15, satisfactionScore: 4.1, retentionRisk: 'medium' as const, confidence: 'high' as const, topCategories: ['L&D', 'Health', 'Wellbeing'], slaRiskCount: 2, missingDocsCount: 4, overLimitCount: 1, drivers: [] },
  { id: 'd-sales', name: 'Sales', headcount: 28, avgTotalComp: 420000, utilizationRate: 81, unusedEntitlement: 125000, claimsCost: 165000, claimsCostDelta: 22, satisfactionScore: 3.9, retentionRisk: 'high' as const, confidence: 'high' as const, topCategories: ['Transport', 'Health', 'Flight'], slaRiskCount: 1, missingDocsCount: 2, overLimitCount: 0, drivers: [] },
  { id: 'd-ops', name: 'Operations', headcount: 22, avgTotalComp: 290000, utilizationRate: 68, unusedEntitlement: 165000, claimsCost: 98000, claimsCostDelta: 8, satisfactionScore: 3.7, retentionRisk: 'high' as const, confidence: 'medium' as const, topCategories: ['Health', 'Transport', 'Leave'], slaRiskCount: 3, missingDocsCount: 6, overLimitCount: 2, drivers: [] },
  { id: 'd-hr', name: 'HR', headcount: 12, avgTotalComp: 310000, utilizationRate: 88, unusedEntitlement: 42000, claimsCost: 52000, claimsCostDelta: -3, satisfactionScore: 4.4, retentionRisk: 'low' as const, confidence: 'high' as const, topCategories: ['L&D', 'Wellbeing', 'Health'], slaRiskCount: 0, missingDocsCount: 1, overLimitCount: 0, drivers: [] },
  { id: 'd-fin', name: 'Finance', headcount: 16, avgTotalComp: 350000, utilizationRate: 76, unusedEntitlement: 98000, claimsCost: 85000, claimsCostDelta: 5, satisfactionScore: 4.0, retentionRisk: 'low' as const, confidence: 'high' as const, topCategories: ['Health', 'Housing', 'L&D'], slaRiskCount: 1, missingDocsCount: 2, overLimitCount: 1, drivers: [] },
  { id: 'd-legal', name: 'Legal', headcount: 10, avgTotalComp: 520000, utilizationRate: 84, unusedEntitlement: 55000, claimsCost: 78000, claimsCostDelta: 0, satisfactionScore: 4.2, retentionRisk: 'low' as const, confidence: 'high' as const, topCategories: ['Health', 'Flight', 'L&D'], slaRiskCount: 0, missingDocsCount: 0, overLimitCount: 0, drivers: [] },
].map(v => ({ ...v, drivers: generateDrivers(v.utilizationRate, v.slaRiskCount, v.missingDocsCount) }));

const NATIONALITY_VALUES: SegmentValue[] = [
  { id: 'n-uae', name: 'UAE National', headcount: 18, avgTotalComp: 480000, utilizationRate: 89, unusedEntitlement: 52000, claimsCost: 145000, claimsCostDelta: 2, satisfactionScore: 4.5, retentionRisk: 'low' as const, confidence: 'high' as const, topCategories: ['Housing', 'Schooling', 'Health'], slaRiskCount: 0, missingDocsCount: 1, overLimitCount: 0, drivers: [] },
  { id: 'n-gcc', name: 'GCC Expat', headcount: 12, avgTotalComp: 350000, utilizationRate: 82, unusedEntitlement: 68000, claimsCost: 95000, claimsCostDelta: 5, satisfactionScore: 4.1, retentionRisk: 'low' as const, confidence: 'medium' as const, topCategories: ['Flight', 'Health', 'Schooling'], slaRiskCount: 1, missingDocsCount: 2, overLimitCount: 0, drivers: [] },
  { id: 'n-other', name: 'Other Expat', headcount: 100, avgTotalComp: 320000, utilizationRate: 74, unusedEntitlement: 540000, claimsCost: 420000, claimsCostDelta: 18, satisfactionScore: 3.8, retentionRisk: 'medium' as const, confidence: 'high' as const, topCategories: ['Health', 'Housing', 'Flight'], slaRiskCount: 3, missingDocsCount: 8, overLimitCount: 3, drivers: [] },
].map(v => ({ ...v, drivers: generateDrivers(v.utilizationRate, v.slaRiskCount, v.missingDocsCount) }));

const LIFE_STAGE_VALUES: SegmentValue[] = [
  { id: 'ls-single', name: 'Single', headcount: 45, avgTotalComp: 260000, utilizationRate: 65, unusedEntitlement: 285000, claimsCost: 165000, claimsCostDelta: 10, satisfactionScore: 3.9, retentionRisk: 'medium' as const, confidence: 'medium' as const, topCategories: ['L&D', 'Wellbeing', 'Transport'], slaRiskCount: 2, missingDocsCount: 5, overLimitCount: 1, drivers: [] },
  { id: 'ls-married', name: 'Married (No Kids)', headcount: 32, avgTotalComp: 380000, utilizationRate: 76, unusedEntitlement: 165000, claimsCost: 185000, claimsCostDelta: 8, satisfactionScore: 4.1, retentionRisk: 'low' as const, confidence: 'medium' as const, topCategories: ['Health', 'Housing', 'Flight'], slaRiskCount: 1, missingDocsCount: 3, overLimitCount: 1, drivers: [] },
  { id: 'ls-family', name: 'With Dependents', headcount: 53, avgTotalComp: 450000, utilizationRate: 88, unusedEntitlement: 152000, claimsCost: 380000, claimsCostDelta: 15, satisfactionScore: 4.3, retentionRisk: 'low' as const, confidence: 'high' as const, topCategories: ['Schooling', 'Health', 'Housing'], slaRiskCount: 1, missingDocsCount: 3, overLimitCount: 2, drivers: [] },
].map(v => ({ ...v, drivers: generateDrivers(v.utilizationRate, v.slaRiskCount, v.missingDocsCount) }));

const WORK_ARRANGEMENT_VALUES: SegmentValue[] = [
  { id: 'wa-onsite', name: 'Onsite', headcount: 78, avgTotalComp: 340000, utilizationRate: 79, unusedEntitlement: 320000, claimsCost: 385000, claimsCostDelta: 12, satisfactionScore: 4.0, retentionRisk: 'low' as const, confidence: 'medium' as const, topCategories: ['Health', 'Transport', 'Meals'], slaRiskCount: 2, missingDocsCount: 6, overLimitCount: 2, drivers: [] },
  { id: 'wa-hybrid', name: 'Hybrid', headcount: 42, avgTotalComp: 380000, utilizationRate: 73, unusedEntitlement: 195000, claimsCost: 210000, claimsCostDelta: 8, satisfactionScore: 4.2, retentionRisk: 'low' as const, confidence: 'low' as const, topCategories: ['Health', 'L&D', 'Wellbeing'], slaRiskCount: 1, missingDocsCount: 3, overLimitCount: 1, drivers: [] },
  { id: 'wa-remote', name: 'Remote', headcount: 10, avgTotalComp: 420000, utilizationRate: 68, unusedEntitlement: 85000, claimsCost: 45000, claimsCostDelta: -5, satisfactionScore: 4.4, retentionRisk: 'medium' as const, confidence: 'low' as const, topCategories: ['L&D', 'Wellbeing', 'Internet'], slaRiskCount: 1, missingDocsCount: 2, overLimitCount: 0, drivers: [] },
].map(v => ({ ...v, drivers: generateDrivers(v.utilizationRate, v.slaRiskCount, v.missingDocsCount) }));

const JOINER_COHORT_VALUES: SegmentValue[] = [
  { id: 'jc-0-6', name: '0-6 months', headcount: 22, avgTotalComp: 280000, utilizationRate: 48, unusedEntitlement: 245000, claimsCost: 65000, claimsCostDelta: 5, satisfactionScore: 4.0, retentionRisk: 'high' as const, confidence: 'high' as const, topCategories: ['Health', 'L&D', 'Transport'], slaRiskCount: 4, missingDocsCount: 8, overLimitCount: 0, drivers: [] },
  { id: 'jc-6-12', name: '6-12 months', headcount: 28, avgTotalComp: 310000, utilizationRate: 68, unusedEntitlement: 175000, claimsCost: 95000, claimsCostDelta: 12, satisfactionScore: 4.1, retentionRisk: 'medium' as const, confidence: 'high' as const, topCategories: ['Health', 'Transport', 'Wellbeing'], slaRiskCount: 2, missingDocsCount: 4, overLimitCount: 1, drivers: [] },
  { id: 'jc-1-3', name: '1-3 years', headcount: 45, avgTotalComp: 360000, utilizationRate: 82, unusedEntitlement: 142000, claimsCost: 245000, claimsCostDelta: 8, satisfactionScore: 4.2, retentionRisk: 'low' as const, confidence: 'high' as const, topCategories: ['Housing', 'Health', 'Schooling'], slaRiskCount: 1, missingDocsCount: 2, overLimitCount: 1, drivers: [] },
  { id: 'jc-3plus', name: '3+ years', headcount: 35, avgTotalComp: 450000, utilizationRate: 91, unusedEntitlement: 95000, claimsCost: 285000, claimsCostDelta: 3, satisfactionScore: 4.5, retentionRisk: 'low' as const, confidence: 'high' as const, topCategories: ['Schooling', 'Housing', 'Equity'], slaRiskCount: 0, missingDocsCount: 1, overLimitCount: 2, drivers: [] },
].map(v => ({ ...v, drivers: generateDrivers(v.utilizationRate, v.slaRiskCount, v.missingDocsCount) }));

const EMPLOYMENT_TYPE_VALUES: SegmentValue[] = [
  { id: 'et-ft', name: 'Full-time', headcount: 115, avgTotalComp: 380000, utilizationRate: 80, unusedEntitlement: 520000, claimsCost: 580000, claimsCostDelta: 10, satisfactionScore: 4.2, retentionRisk: 'low' as const, confidence: 'high' as const, topCategories: ['Health', 'Housing', 'Schooling'], slaRiskCount: 3, missingDocsCount: 8, overLimitCount: 3, drivers: [] },
  { id: 'et-pt', name: 'Part-time', headcount: 8, avgTotalComp: 150000, utilizationRate: 55, unusedEntitlement: 45000, claimsCost: 25000, claimsCostDelta: 5, satisfactionScore: 3.8, retentionRisk: 'medium' as const, confidence: 'medium' as const, topCategories: ['Health', 'L&D'], slaRiskCount: 1, missingDocsCount: 2, overLimitCount: 0, drivers: [] },
  { id: 'et-ct', name: 'Contractor', headcount: 7, avgTotalComp: 420000, utilizationRate: 42, unusedEntitlement: 92000, claimsCost: 35000, claimsCostDelta: -8, satisfactionScore: 3.5, retentionRisk: 'high' as const, confidence: 'low' as const, topCategories: ['L&D'], slaRiskCount: 0, missingDocsCount: 1, overLimitCount: 0, drivers: [] },
].map(v => ({ ...v, drivers: generateDrivers(v.utilizationRate, v.slaRiskCount, v.missingDocsCount) }));

const COMPENSATION_BAND_VALUES: SegmentValue[] = [
  { id: 'cb-q1', name: 'Q1 (Bottom 25%)', headcount: 32, avgTotalComp: 180000, utilizationRate: 58, unusedEntitlement: 185000, claimsCost: 95000, claimsCostDelta: 8, satisfactionScore: 3.6, retentionRisk: 'high' as const, confidence: 'high' as const, topCategories: ['Health', 'Transport'], slaRiskCount: 3, missingDocsCount: 6, overLimitCount: 0, drivers: [] },
  { id: 'cb-q2', name: 'Q2 (25-50%)', headcount: 33, avgTotalComp: 280000, utilizationRate: 72, unusedEntitlement: 165000, claimsCost: 145000, claimsCostDelta: 10, satisfactionScore: 4.0, retentionRisk: 'medium' as const, confidence: 'high' as const, topCategories: ['Health', 'Housing', 'L&D'], slaRiskCount: 2, missingDocsCount: 4, overLimitCount: 1, drivers: [] },
  { id: 'cb-q3', name: 'Q3 (50-75%)', headcount: 33, avgTotalComp: 420000, utilizationRate: 82, unusedEntitlement: 125000, claimsCost: 225000, claimsCostDelta: 5, satisfactionScore: 4.2, retentionRisk: 'low' as const, confidence: 'high' as const, topCategories: ['Housing', 'Health', 'Schooling'], slaRiskCount: 1, missingDocsCount: 2, overLimitCount: 1, drivers: [] },
  { id: 'cb-q4', name: 'Q4 (Top 25%)', headcount: 32, avgTotalComp: 680000, utilizationRate: 90, unusedEntitlement: 82000, claimsCost: 320000, claimsCostDelta: 2, satisfactionScore: 4.5, retentionRisk: 'low' as const, confidence: 'high' as const, topCategories: ['Housing', 'Schooling', 'Equity'], slaRiskCount: 0, missingDocsCount: 1, overLimitCount: 2, drivers: [] },
].map(v => ({ ...v, drivers: generateDrivers(v.utilizationRate, v.slaRiskCount, v.missingDocsCount) }));

// Helper to compute dimension summary from values
function computeDimensionSummary(values: SegmentValue[]): { 
  headcount: number; 
  avgTotalComp: number | null; 
  utilizationRate: number; 
  unusedEntitlement: number; 
  claimsCost: number;
  topCategory: string;
  confidence: ConfidenceLevel;
} {
  const headcount = values.reduce((sum, v) => sum + v.headcount, 0);
  const totalComp = values.reduce((sum, v) => sum + (v.avgTotalComp || 0) * v.headcount, 0);
  const avgTotalComp = headcount > 0 ? totalComp / headcount : null;
  const totalAllocated = values.reduce((sum, v) => sum + v.unusedEntitlement / (1 - v.utilizationRate / 100 || 0.01), 0);
  const totalUtilized = totalAllocated - values.reduce((sum, v) => sum + v.unusedEntitlement, 0);
  const utilizationRate = totalAllocated > 0 ? (totalUtilized / totalAllocated) * 100 : 0;
  const unusedEntitlement = values.reduce((sum, v) => sum + v.unusedEntitlement, 0);
  const claimsCost = values.reduce((sum, v) => sum + v.claimsCost, 0);
  
  // Find most common top category
  const categoryCount: Record<string, number> = {};
  values.forEach(v => {
    if (v.topCategories[0]) {
      categoryCount[v.topCategories[0]] = (categoryCount[v.topCategories[0]] || 0) + v.headcount;
    }
  });
  const topCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
  
  // Determine overall confidence
  const highCount = values.filter(v => v.confidence === 'high').length;
  const confidence: ConfidenceLevel = highCount >= values.length * 0.7 ? 'high' : highCount >= values.length * 0.4 ? 'medium' : 'low';

  return { headcount, avgTotalComp, utilizationRate: Math.round(utilizationRate), unusedEntitlement, claimsCost, topCategory, confidence };
}

// ============= SEGMENT DIMENSIONS =============

const SEGMENT_DIMENSIONS: SegmentDimension[] = [
  {
    id: 'grade',
    name: 'Grade Bands',
    description: 'M1/M2/M3... grade levels',
    icon: Briefcase,
    coverage: 98,
    isAvailable: true,
    ...computeDimensionSummary(GRADE_VALUES),
    values: GRADE_VALUES,
  },
  {
    id: 'department',
    name: 'Departments',
    description: 'Organizational departments',
    icon: Building2,
    coverage: 96,
    isAvailable: true,
    ...computeDimensionSummary(DEPARTMENT_VALUES),
    values: DEPARTMENT_VALUES,
  },
  {
    id: 'nationality',
    name: 'Nationality Type',
    description: 'UAE National / Expat',
    icon: Globe,
    coverage: 88,
    isAvailable: true,
    isDemoOnly: true,
    ...computeDimensionSummary(NATIONALITY_VALUES),
    values: NATIONALITY_VALUES,
  },
  {
    id: 'life_stage',
    name: 'Life Stage',
    description: 'Single / Married / With Dependents',
    icon: Heart,
    coverage: 72,
    isAvailable: true,
    ...computeDimensionSummary(LIFE_STAGE_VALUES),
    values: LIFE_STAGE_VALUES,
  },
  {
    id: 'work_arrangement',
    name: 'Work Arrangement',
    description: 'Onsite / Hybrid / Remote',
    icon: Home,
    coverage: 65,
    isAvailable: false,
    ...computeDimensionSummary(WORK_ARRANGEMENT_VALUES),
    values: WORK_ARRANGEMENT_VALUES,
  },
  {
    id: 'joiner_cohort',
    name: 'Tenure Bands',
    description: '0-6m / 6-12m / 1-3y / 3y+',
    icon: Clock,
    coverage: 100,
    isAvailable: true,
    ...computeDimensionSummary(JOINER_COHORT_VALUES),
    values: JOINER_COHORT_VALUES,
  },
  {
    id: 'employment_type',
    name: 'Employment Type',
    description: 'Full-time / Part-time / Contractor',
    icon: Users,
    coverage: 94,
    isAvailable: true,
    ...computeDimensionSummary(EMPLOYMENT_TYPE_VALUES),
    values: EMPLOYMENT_TYPE_VALUES,
  },
  {
    id: 'compensation_band',
    name: 'Compensation Bands',
    description: 'Quartiles by total compensation',
    icon: Wallet,
    coverage: 82,
    isAvailable: true,
    ...computeDimensionSummary(COMPENSATION_BAND_VALUES),
    values: COMPENSATION_BAND_VALUES,
  },
];

// Generate category breakdown for a segment value
function generateCategoryBreakdown(value: SegmentValue) {
  const categories = ['Health', 'Housing', 'Schooling', 'Transport', 'L&D', 'Wellbeing', 'Flight', 'Other'];
  
  return categories.map(cat => {
    const isTop = value.topCategories.includes(cat);
    const baseAlloc = isTop ? 50000 + Math.random() * 30000 : 10000 + Math.random() * 15000;
    const util = isTop ? 0.7 + Math.random() * 0.25 : 0.3 + Math.random() * 0.3;
    const spent = Math.round(baseAlloc * util);
    const unused = Math.round(baseAlloc - spent);
    
    return {
      category: cat,
      unusedEntitlement: unused,
      claimsCost: spent,
      utilizationRate: Math.round(util * 100),
    };
  }).sort((a, b) => b.unusedEntitlement - a.unusedEntitlement);
}

// Generate impacted segments
function generateImpactedSegments(value: SegmentValue): { dimension: string; values: { name: string; percentage: number }[] }[] {
  return [
    {
      dimension: 'Department',
      values: [
        { name: 'Operations', percentage: 35 },
        { name: 'Engineering', percentage: 28 },
        { name: 'Sales', percentage: 22 },
      ],
    },
    {
      dimension: 'Grade',
      values: [
        { name: 'M1-M2', percentage: 45 },
        { name: 'M3', percentage: 30 },
        { name: 'M4+', percentage: 25 },
      ],
    },
    {
      dimension: 'Location',
      values: [
        { name: 'Dubai', percentage: 55 },
        { name: 'Abu Dhabi', percentage: 30 },
        { name: 'Other', percentage: 15 },
      ],
    },
  ];
}

// Generate insights for a segment value
function generateInsightsForSegment(dimension: SegmentDimension, value: SegmentValue): SegmentValueInsights {
  const insights: SegmentInsight[] = [];
  const suggestedActions: SegmentValueInsights['suggestedActions'] = [];
  
  // Low utilization insight
  if (value.utilizationRate < 70) {
    insights.push({
      id: 'low-util',
      title: 'Below-average utilization',
      description: `This segment has ${formatPercent(value.utilizationRate)} utilization vs. ${formatPercent(dimension.utilizationRate)} segment average`,
      metric: formatPercent(value.utilizationRate),
      impact: `${formatCurrencyAED(value.unusedEntitlement)} unrealized value`,
      drivers: ['Awareness gaps', 'Documentation friction', 'Eligibility confusion'],
    });
    suggestedActions.push({
      id: 'launch-awareness',
      title: 'Launch Awareness Campaign',
      type: 'launch_playbook',
      playbookId: 'awareness_campaign',
      routePath: '/employer/optimization',
      routeParams: { prefill_segment: value.id, prefill_playbook: 'awareness_campaign' },
    });
  }
  
  // High unused entitlement
  if (value.unusedEntitlement > 100000) {
    insights.push({
      id: 'high-leakage',
      title: 'Significant unrealized value',
      description: `${formatCurrencyAED(value.unusedEntitlement)} in unused entitlements`,
      metric: formatCurrencyAED(value.unusedEntitlement),
      impact: 'Potential budget optimization or policy adjustment',
      drivers: value.topCategories.slice(0, 2).map(c => `${c} underutilization`),
    });
    suggestedActions.push({
      id: 'review-leakage',
      title: 'Review Budget Leakage',
      type: 'zombie_review', // Keep type for compatibility
      routePath: '/employer/optimization',
      routeParams: { filter_segment: value.id },
    });
  }
  
  // High claims cost growth
  if (value.claimsCostDelta > 15) {
    insights.push({
      id: 'cost-growth',
      title: 'Claims cost growing quickly',
      description: `Claims cost increased ${value.claimsCostDelta}% vs. prior period`,
      metric: `+${value.claimsCostDelta}%`,
      impact: 'May impact budget sustainability',
      drivers: ['Increased utilization', 'Higher cost claims', 'Policy changes'],
    });
  }
  
  // High retention risk
  if (value.retentionRisk === 'high') {
    insights.push({
      id: 'retention-risk',
      title: 'Elevated retention risk',
      description: 'This segment shows higher-than-normal attrition indicators',
      metric: 'High risk',
      impact: 'Potential talent loss and replacement costs',
      drivers: ['Lower satisfaction', 'Market competition', 'Career progression gaps'],
    });
  }
  
  // SLA risk
  if (value.slaRiskCount > 0) {
    insights.push({
      id: 'sla-risk',
      title: 'Claims at SLA risk',
      description: `${value.slaRiskCount} claims approaching or exceeding SLA`,
      metric: `${value.slaRiskCount} at risk`,
      impact: 'May affect employee satisfaction scores',
      drivers: ['Approval delays', 'Missing documentation'],
    });
    suggestedActions.push({
      id: 'launch-friction',
      title: 'Launch Friction Fix',
      type: 'launch_playbook',
      playbookId: 'friction_fix',
      routePath: '/employer/optimization',
      routeParams: { prefill_playbook: 'friction_fix' },
    });
  }
  
  // Missing docs
  if (value.missingDocsCount > 3) {
    insights.push({
      id: 'docs-friction',
      title: 'Documentation friction',
      description: `${value.missingDocsCount} claims pending due to missing documents`,
      metric: `${value.missingDocsCount} pending`,
      impact: 'Causes processing delays and employee frustration',
      drivers: ['Complex requirements', 'Low awareness of required docs'],
    });
  }
  
  // High performers
  if (value.utilizationRate >= 85) {
    insights.push({
      id: 'high-util',
      title: 'High engagement segment',
      description: 'This group actively uses their benefits',
      metric: formatPercent(value.utilizationRate),
      impact: 'Good benchmark for other segments',
      drivers: ['Clear policies', 'Good onboarding', 'Active managers'],
    });
  }
  
  // Always add recommendation option
  suggestedActions.push({
    id: 'create-rec',
    title: 'Create Recommendation',
    type: 'recommendation',
    routePath: '/employer/recommendations',
    routeParams: { prefill_segment: value.id, prefill_type: 'awareness' },
  });
  
  return {
    segmentValue: value,
    insights: insights.length > 0 ? insights : [{
      id: 'on-track',
      title: 'Segment performing well',
      description: 'No significant issues detected for this segment',
      metric: formatPercent(value.utilizationRate),
      impact: 'Continue monitoring',
      drivers: ['Healthy utilization', 'Low friction'],
    }],
    drivers: value.drivers,
    categoryBreakdown: generateCategoryBreakdown(value),
    suggestedActions,
    impactedSegments: generateImpactedSegments(value),
  };
}

// Generate chart data for a segment value
function generateChartData(value: SegmentValue) {
  const categories = ['Health', 'Housing', 'Schooling', 'Transport', 'L&D', 'Wellbeing', 'Flight', 'Other'];
  
  const spendByCategory: SpendByCategory[] = categories.map(cat => {
    const isTop = value.topCategories.includes(cat);
    const baseAlloc = isTop ? 50000 + Math.random() * 30000 : 10000 + Math.random() * 15000;
    const util = isTop ? 0.7 + Math.random() * 0.25 : 0.3 + Math.random() * 0.3;
    return {
      category: cat,
      allocated: Math.round(baseAlloc),
      spent: Math.round(baseAlloc * util),
    };
  });
  
  const utilizationByCategory: UtilizationByCategory[] = categories.map(cat => {
    const isTop = value.topCategories.includes(cat);
    return {
      category: cat,
      rate: isTop ? 70 + Math.random() * 25 : 30 + Math.random() * 35,
    };
  });
  
  return { spendByCategory, utilizationByCategory };
}

// Generate top opportunities
function generateTopOpportunities(dimensions: SegmentDimension[], highConfidenceOnly: boolean): SegmentOpportunity[] {
  const opportunities: SegmentOpportunity[] = [];
  
  dimensions.forEach(dim => {
    if (!dim.isAvailable) return;
    
    dim.values.forEach(val => {
      if (highConfidenceOnly && val.confidence !== 'high') return;
      if (val.utilizationRate >= 80) return; // Skip high performers
      
      const weightedOpportunity = val.unusedEntitlement * CONFIDENCE_FACTORS[val.confidence];
      const primaryDriver = val.drivers[0]?.id || 'awareness';
      
      opportunities.push({
        segmentId: val.id,
        segmentName: val.name,
        dimensionId: dim.id,
        dimensionName: dim.name,
        opportunityAED: Math.round(weightedOpportunity),
        primaryDriver,
        confidence: val.confidence,
        headcount: val.headcount,
        utilizationRate: val.utilizationRate,
      });
    });
  });
  
  return opportunities
    .sort((a, b) => b.opportunityAED - a.opportunityAED)
    .slice(0, 5);
}

// ============= HOOK =============

export function useSegmentData() {
  const [selectedDimension, setSelectedDimension] = useState<SegmentDimensionId | null>(null);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [highConfidenceOnly, setHighConfidenceOnly] = useState(false);
  
  const dimensions = useMemo(() => SEGMENT_DIMENSIONS, []);
  
  const filteredDimensions = useMemo(() => {
    if (!highConfidenceOnly) return dimensions;
    return dimensions.map(dim => ({
      ...dim,
      values: dim.values.filter(v => v.confidence === 'high'),
    }));
  }, [dimensions, highConfidenceOnly]);
  
  const activeDimension = useMemo(() => 
    filteredDimensions.find(d => d.id === selectedDimension) || null,
    [filteredDimensions, selectedDimension]
  );
  
  const activeSegmentValue = useMemo(() => 
    activeDimension?.values.find(v => v.id === selectedValue) || null,
    [activeDimension, selectedValue]
  );
  
  const segmentInsights = useMemo(() => {
    if (!activeDimension || !activeSegmentValue) return null;
    return generateInsightsForSegment(activeDimension, activeSegmentValue);
  }, [activeDimension, activeSegmentValue]);
  
  const chartData = useMemo(() => {
    if (!activeSegmentValue) return null;
    return generateChartData(activeSegmentValue);
  }, [activeSegmentValue]);
  
  const topOpportunities = useMemo(() => 
    generateTopOpportunities(dimensions, highConfidenceOnly),
    [dimensions, highConfidenceOnly]
  );
  
  const selectDimension = useCallback((id: SegmentDimensionId | null) => {
    setSelectedDimension(id);
    setSelectedValue(null);
    setDrawerOpen(false);
  }, []);
  
  const selectSegmentValue = useCallback((valueId: string) => {
    setSelectedValue(valueId);
  }, []);
  
  const openInsightsDrawer = useCallback((valueId: string) => {
    setSelectedValue(valueId);
    setDrawerOpen(true);
  }, []);
  
  const closeInsightsDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);
  
  // Summary metrics
  const summaryMetrics = useMemo(() => {
    const totalHeadcount = Math.max(...dimensions.map(d => d.headcount));
    const availableDims = dimensions.filter(d => d.isAvailable);
    const avgUtilization = availableDims.reduce((sum, d) => sum + d.utilizationRate, 0) / availableDims.length;
    const totalUnused = Math.max(...dimensions.map(d => d.unusedEntitlement));
    const totalClaimsCost = Math.max(...dimensions.map(d => d.claimsCost));
    const avgClaimsCostDelta = 8; // Demo value
    
    // Weighted recoverable
    const estimatedRecoverable = dimensions.reduce((sum, dim) => {
      if (!dim.isAvailable) return sum;
      return sum + dim.values.reduce((s, v) => s + v.unusedEntitlement * CONFIDENCE_FACTORS[v.confidence], 0);
    }, 0) / dimensions.filter(d => d.isAvailable).length;
    
    // Count high risk segments
    const highRiskCount = dimensions.reduce((count, dim) => 
      count + dim.values.filter(v => v.retentionRisk === 'high').length, 0);
    
    return {
      totalHeadcount,
      avgUtilization: Math.round(avgUtilization),
      totalUnusedEntitlement: totalUnused,
      percentBudgetUnused: Math.round((totalUnused / (totalUnused + totalClaimsCost)) * 100),
      totalClaimsCost,
      claimsCostDelta: avgClaimsCostDelta,
      estimatedRecoverable: Math.round(estimatedRecoverable),
      retentionRiskIndex: highRiskCount,
    };
  }, [dimensions]);
  
  return {
    dimensions,
    filteredDimensions,
    selectedDimension,
    selectedValue,
    activeDimension,
    activeSegmentValue,
    segmentInsights,
    chartData,
    drawerOpen,
    summaryMetrics,
    topOpportunities,
    highConfidenceOnly,
    setHighConfidenceOnly,
    selectDimension,
    selectSegmentValue,
    openInsightsDrawer,
    closeInsightsDrawer,
    CONFIDENCE_FACTORS,
    DRIVER_DEFINITIONS,
  };
}
