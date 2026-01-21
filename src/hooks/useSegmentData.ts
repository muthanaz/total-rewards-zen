/**
 * Segment Data Hook
 * 
 * Provides workforce segmentation data for the Employee Segments page.
 * Each segment dimension has coverage status and drill-down metrics.
 */

import { useMemo, useState, useCallback } from 'react';
import { LucideIcon, Briefcase, Building2, MapPin, Clock, Users, Heart, Globe, Home } from 'lucide-react';
import { formatCurrencyAED, formatPercent } from '@/lib/utils';

// ============= TYPES =============

export type SegmentDimensionId = 'grade' | 'department' | 'nationality' | 'life_stage' | 'work_arrangement' | 'joiner_cohort';

export interface SegmentValue {
  id: string;
  name: string;
  headcount: number;
  avgTotalComp: number | null;
  utilizationRate: number;
  unusedEntitlement: number;
  topCategories: string[];
  slaRiskCount: number;
  missingDocsCount: number;
  overLimitCount: number;
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
  topCategory: string;
  values: SegmentValue[];
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
  suggestedActions: {
    id: string;
    title: string;
    type: 'recommendation' | 'zombie_review' | 'comms_campaign';
    routePath: string;
    routeParams: Record<string, string>;
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

// ============= SEED DATA =============

const GRADE_VALUES: SegmentValue[] = [
  { id: 'g-m1', name: 'M1 (Entry)', headcount: 28, avgTotalComp: 180000, utilizationRate: 62, unusedEntitlement: 145000, topCategories: ['Health', 'L&D', 'Transport'], slaRiskCount: 2, missingDocsCount: 5, overLimitCount: 0 },
  { id: 'g-m2', name: 'M2 (Junior)', headcount: 35, avgTotalComp: 240000, utilizationRate: 71, unusedEntitlement: 185000, topCategories: ['Health', 'Transport', 'Wellbeing'], slaRiskCount: 1, missingDocsCount: 3, overLimitCount: 1 },
  { id: 'g-m3', name: 'M3 (Mid)', headcount: 32, avgTotalComp: 320000, utilizationRate: 78, unusedEntitlement: 156000, topCategories: ['Housing', 'Health', 'Schooling'], slaRiskCount: 0, missingDocsCount: 2, overLimitCount: 0 },
  { id: 'g-m4', name: 'M4 (Senior)', headcount: 20, avgTotalComp: 450000, utilizationRate: 85, unusedEntitlement: 98000, topCategories: ['Housing', 'Schooling', 'Flight'], slaRiskCount: 1, missingDocsCount: 1, overLimitCount: 2 },
  { id: 'g-m5', name: 'M5 (Manager)', headcount: 10, avgTotalComp: 620000, utilizationRate: 91, unusedEntitlement: 45000, topCategories: ['Housing', 'Flight', 'Equity'], slaRiskCount: 0, missingDocsCount: 0, overLimitCount: 1 },
  { id: 'g-m6', name: 'M6+ (Director+)', headcount: 5, avgTotalComp: 950000, utilizationRate: 94, unusedEntitlement: 28000, topCategories: ['Equity', 'Executive Health', 'Flight'], slaRiskCount: 0, missingDocsCount: 0, overLimitCount: 0 },
];

const DEPARTMENT_VALUES: SegmentValue[] = [
  { id: 'd-eng', name: 'Engineering', headcount: 42, avgTotalComp: 380000, utilizationRate: 72, unusedEntitlement: 210000, topCategories: ['L&D', 'Health', 'Wellbeing'], slaRiskCount: 2, missingDocsCount: 4, overLimitCount: 1 },
  { id: 'd-sales', name: 'Sales', headcount: 28, avgTotalComp: 420000, utilizationRate: 81, unusedEntitlement: 125000, topCategories: ['Transport', 'Health', 'Flight'], slaRiskCount: 1, missingDocsCount: 2, overLimitCount: 0 },
  { id: 'd-ops', name: 'Operations', headcount: 22, avgTotalComp: 290000, utilizationRate: 68, unusedEntitlement: 165000, topCategories: ['Health', 'Transport', 'Leave'], slaRiskCount: 3, missingDocsCount: 6, overLimitCount: 2 },
  { id: 'd-hr', name: 'HR', headcount: 12, avgTotalComp: 310000, utilizationRate: 88, unusedEntitlement: 42000, topCategories: ['L&D', 'Wellbeing', 'Health'], slaRiskCount: 0, missingDocsCount: 1, overLimitCount: 0 },
  { id: 'd-fin', name: 'Finance', headcount: 16, avgTotalComp: 350000, utilizationRate: 76, unusedEntitlement: 98000, topCategories: ['Health', 'Housing', 'L&D'], slaRiskCount: 1, missingDocsCount: 2, overLimitCount: 1 },
  { id: 'd-legal', name: 'Legal', headcount: 10, avgTotalComp: 520000, utilizationRate: 84, unusedEntitlement: 55000, topCategories: ['Health', 'Flight', 'L&D'], slaRiskCount: 0, missingDocsCount: 0, overLimitCount: 0 },
];

const NATIONALITY_VALUES: SegmentValue[] = [
  { id: 'n-uae', name: 'UAE National', headcount: 18, avgTotalComp: 480000, utilizationRate: 89, unusedEntitlement: 52000, topCategories: ['Housing', 'Schooling', 'Health'], slaRiskCount: 0, missingDocsCount: 1, overLimitCount: 0 },
  { id: 'n-gcc', name: 'GCC Expat', headcount: 12, avgTotalComp: 350000, utilizationRate: 82, unusedEntitlement: 68000, topCategories: ['Flight', 'Health', 'Schooling'], slaRiskCount: 1, missingDocsCount: 2, overLimitCount: 0 },
  { id: 'n-other', name: 'Other Expat', headcount: 100, avgTotalComp: 320000, utilizationRate: 74, unusedEntitlement: 540000, topCategories: ['Health', 'Housing', 'Flight'], slaRiskCount: 3, missingDocsCount: 8, overLimitCount: 3 },
];

const LIFE_STAGE_VALUES: SegmentValue[] = [
  { id: 'ls-single', name: 'Single', headcount: 45, avgTotalComp: 260000, utilizationRate: 65, unusedEntitlement: 285000, topCategories: ['L&D', 'Wellbeing', 'Transport'], slaRiskCount: 2, missingDocsCount: 5, overLimitCount: 1 },
  { id: 'ls-married', name: 'Married (No Kids)', headcount: 32, avgTotalComp: 380000, utilizationRate: 76, unusedEntitlement: 165000, topCategories: ['Health', 'Housing', 'Flight'], slaRiskCount: 1, missingDocsCount: 3, overLimitCount: 1 },
  { id: 'ls-family', name: 'With Dependents', headcount: 53, avgTotalComp: 450000, utilizationRate: 88, unusedEntitlement: 152000, topCategories: ['Schooling', 'Health', 'Housing'], slaRiskCount: 1, missingDocsCount: 3, overLimitCount: 2 },
];

const WORK_ARRANGEMENT_VALUES: SegmentValue[] = [
  { id: 'wa-onsite', name: 'Onsite', headcount: 78, avgTotalComp: 340000, utilizationRate: 79, unusedEntitlement: 320000, topCategories: ['Health', 'Transport', 'Meals'], slaRiskCount: 2, missingDocsCount: 6, overLimitCount: 2 },
  { id: 'wa-hybrid', name: 'Hybrid', headcount: 42, avgTotalComp: 380000, utilizationRate: 73, unusedEntitlement: 195000, topCategories: ['Health', 'L&D', 'Wellbeing'], slaRiskCount: 1, missingDocsCount: 3, overLimitCount: 1 },
  { id: 'wa-remote', name: 'Remote', headcount: 10, avgTotalComp: 420000, utilizationRate: 68, unusedEntitlement: 85000, topCategories: ['L&D', 'Wellbeing', 'Internet'], slaRiskCount: 1, missingDocsCount: 2, overLimitCount: 0 },
];

const JOINER_COHORT_VALUES: SegmentValue[] = [
  { id: 'jc-0-6', name: '0-6 months', headcount: 22, avgTotalComp: 280000, utilizationRate: 48, unusedEntitlement: 245000, topCategories: ['Health', 'L&D', 'Transport'], slaRiskCount: 4, missingDocsCount: 8, overLimitCount: 0 },
  { id: 'jc-6-12', name: '6-12 months', headcount: 28, avgTotalComp: 310000, utilizationRate: 68, unusedEntitlement: 175000, topCategories: ['Health', 'Transport', 'Wellbeing'], slaRiskCount: 2, missingDocsCount: 4, overLimitCount: 1 },
  { id: 'jc-1-3', name: '1-3 years', headcount: 45, avgTotalComp: 360000, utilizationRate: 82, unusedEntitlement: 142000, topCategories: ['Housing', 'Health', 'Schooling'], slaRiskCount: 1, missingDocsCount: 2, overLimitCount: 1 },
  { id: 'jc-3plus', name: '3+ years', headcount: 35, avgTotalComp: 450000, utilizationRate: 91, unusedEntitlement: 95000, topCategories: ['Schooling', 'Housing', 'Equity'], slaRiskCount: 0, missingDocsCount: 1, overLimitCount: 2 },
];

// Helper to compute dimension summary from values
function computeDimensionSummary(values: SegmentValue[]): { headcount: number; avgTotalComp: number | null; utilizationRate: number; unusedEntitlement: number; topCategory: string } {
  const headcount = values.reduce((sum, v) => sum + v.headcount, 0);
  const totalComp = values.reduce((sum, v) => sum + (v.avgTotalComp || 0) * v.headcount, 0);
  const avgTotalComp = headcount > 0 ? totalComp / headcount : null;
  const totalAllocated = values.reduce((sum, v) => sum + v.unusedEntitlement / (1 - v.utilizationRate / 100 || 0.01), 0);
  const totalUtilized = totalAllocated - values.reduce((sum, v) => sum + v.unusedEntitlement, 0);
  const utilizationRate = totalAllocated > 0 ? (totalUtilized / totalAllocated) * 100 : 0;
  const unusedEntitlement = values.reduce((sum, v) => sum + v.unusedEntitlement, 0);
  
  // Find most common top category
  const categoryCount: Record<string, number> = {};
  values.forEach(v => {
    if (v.topCategories[0]) {
      categoryCount[v.topCategories[0]] = (categoryCount[v.topCategories[0]] || 0) + v.headcount;
    }
  });
  const topCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

  return { headcount, avgTotalComp, utilizationRate: Math.round(utilizationRate), unusedEntitlement, topCategory };
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
    isAvailable: false, // Below 70% threshold
    ...computeDimensionSummary(WORK_ARRANGEMENT_VALUES),
    values: WORK_ARRANGEMENT_VALUES,
  },
  {
    id: 'joiner_cohort',
    name: 'Joiner Cohort',
    description: 'Tenure-based cohorts',
    icon: Clock,
    coverage: 100,
    isAvailable: true,
    ...computeDimensionSummary(JOINER_COHORT_VALUES),
    values: JOINER_COHORT_VALUES,
  },
];

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
      id: 'create-rec',
      title: 'Create Recommendation',
      type: 'recommendation',
      routePath: '/employer/recommendations',
      routeParams: { prefill_segment: value.id, prefill_type: 'awareness' },
    });
  }
  
  // High unused entitlement
  if (value.unusedEntitlement > 100000) {
    insights.push({
      id: 'high-zombie',
      title: 'Significant unrealized value',
      description: `${formatCurrencyAED(value.unusedEntitlement)} in unused entitlements`,
      metric: formatCurrencyAED(value.unusedEntitlement),
      impact: 'Potential budget optimization or policy adjustment',
      drivers: value.topCategories.slice(0, 2).map(c => `${c} underutilization`),
    });
    suggestedActions.push({
      id: 'review-zombie',
      title: 'Review Zombie Spend',
      type: 'zombie_review',
      routePath: '/employer/zombie',
      routeParams: { filter_segment: value.id },
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
  
  // Always add comms campaign option
  suggestedActions.push({
    id: 'launch-comms',
    title: 'Launch Comms Campaign',
    type: 'comms_campaign',
    routePath: '/employer/recommendations',
    routeParams: { prefill_segment: value.id, prefill_type: 'comms' },
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
    suggestedActions,
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

// ============= HOOK =============

export function useSegmentData() {
  const [selectedDimension, setSelectedDimension] = useState<SegmentDimensionId | null>(null);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const dimensions = useMemo(() => SEGMENT_DIMENSIONS, []);
  
  const activeDimension = useMemo(() => 
    dimensions.find(d => d.id === selectedDimension) || null,
    [dimensions, selectedDimension]
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
    const totalHeadcount = dimensions.reduce((sum, d) => Math.max(sum, d.headcount), 0);
    const avgUtilization = dimensions.filter(d => d.isAvailable).reduce((sum, d) => sum + d.utilizationRate, 0) / dimensions.filter(d => d.isAvailable).length;
    const totalUnused = Math.max(...dimensions.map(d => d.unusedEntitlement));
    const totalRiskFlags = dimensions.reduce((sum, d) => sum + d.values.reduce((s, v) => s + v.slaRiskCount + v.missingDocsCount + v.overLimitCount, 0), 0) / dimensions.length;
    
    return {
      totalHeadcount,
      avgUtilization: Math.round(avgUtilization),
      totalUnusedEntitlement: totalUnused,
      avgRiskFlags: Math.round(totalRiskFlags),
    };
  }, [dimensions]);
  
  return {
    dimensions,
    selectedDimension,
    selectedValue,
    activeDimension,
    activeSegmentValue,
    segmentInsights,
    chartData,
    drawerOpen,
    summaryMetrics,
    selectDimension,
    selectSegmentValue,
    openInsightsDrawer,
    closeInsightsDrawer,
  };
}
