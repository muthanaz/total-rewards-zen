/**
 * Zombie Spend Data Hook
 * 
 * Provides zombie spend (unused entitlement) data with category breakdowns,
 * root-cause analysis, and playbook tracking.
 */

import { useState, useMemo, useCallback } from 'react';
import { LucideIcon, Eye, FileWarning, Clock, AlertCircle, Store, Calendar, Megaphone, Settings, BookOpen, Zap, RefreshCcw, DollarSign } from 'lucide-react';
import { formatCurrencyAED, formatPercent } from '@/lib/utils';

// ============= TYPES =============

export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type RootCauseId = 'awareness' | 'process_friction' | 'policy_constraints' | 'vendor_access' | 'timing_mismatch';
export type PlaybookId = 'awareness_campaign' | 'friction_fix' | 'vendor_enablement' | 'policy_simplification' | 'reallocation_proposal';
export type PlaybookStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface ZombieCategory {
  id: string;
  name: string;
  allocatedBudget: number;
  entitledValue: number;
  claimedAmount: number;
  unusedEntitlement: number;
  utilizationRate: number;
  confidence: ConfidenceLevel;
  eligibleHeadcount: number;
  // Evidence metrics
  missingDocsRate: number;
  avgProcessingDays: number;
  rejectedCount: number;
  returnedCount: number;
  // Root causes (auto-detected)
  primaryRootCause: RootCauseId;
  secondaryRootCauses: RootCauseId[];
  // Segment breakdown
  topDepartments: { name: string; unused: number }[];
  topGrades: { name: string; unused: number }[];
  lifeStageBreakdown?: { name: string; unused: number }[];
  // Trend data
  trendData: { month: string; unused: number }[];
}

export interface RootCauseDefinition {
  id: RootCauseId;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
  detectionRule: string;
}

export interface RecoveryPlaybook {
  id: PlaybookId;
  title: string;
  description: string;
  icon: LucideIcon;
  expectedImpactPercent: number;
  effortLevel: 'low' | 'medium' | 'high';
  timeToImpact: string;
  targetRootCauses: RootCauseId[];
  outputs: string[];
  steps: string[];
}

export interface PlaybookRun {
  id: string;
  playbookId: PlaybookId;
  categoryId: string;
  categoryName: string;
  targetSegment?: string;
  owner: string;
  dueDate: string;
  expectedImpactAED: number;
  status: PlaybookStatus;
  createdAt: string;
  notes?: string;
}

// ============= ROOT CAUSE DEFINITIONS =============

export const ROOT_CAUSE_DEFINITIONS: Record<RootCauseId, RootCauseDefinition> = {
  awareness: {
    id: 'awareness',
    label: 'Awareness Gap',
    description: 'Low claims despite high eligibility - employees may not know about the benefit',
    icon: Eye,
    color: 'text-blue-500',
    detectionRule: 'Low claim rate + high eligible headcount',
  },
  process_friction: {
    id: 'process_friction',
    label: 'Process Friction',
    description: 'High missing docs or long processing times causing drop-offs',
    icon: FileWarning,
    color: 'text-amber-500',
    detectionRule: 'Missing docs rate > 20% OR avg processing > 5 days',
  },
  policy_constraints: {
    id: 'policy_constraints',
    label: 'Policy Constraints',
    description: 'Narrow eligibility criteria or confusing rules causing rejections',
    icon: AlertCircle,
    color: 'text-purple-500',
    detectionRule: 'Rejection rate > 15% OR high returned-for-info count',
  },
  vendor_access: {
    id: 'vendor_access',
    label: 'Vendor Access Gap',
    description: 'Limited or no approved vendors in employee locations',
    icon: Store,
    color: 'text-orange-500',
    detectionRule: 'Category has vendor dependency + low network coverage',
  },
  timing_mismatch: {
    id: 'timing_mismatch',
    label: 'Timing Mismatch',
    description: 'Annual claim windows or approval delays causing missed deadlines',
    icon: Calendar,
    color: 'text-teal-500',
    detectionRule: 'Claims spike in Q4 + low year-round activity',
  },
};

// ============= PLAYBOOK DEFINITIONS =============

export const RECOVERY_PLAYBOOKS: RecoveryPlaybook[] = [
  {
    id: 'awareness_campaign',
    title: 'Awareness Campaign',
    description: 'Launch targeted communications to increase benefit visibility and understanding.',
    icon: Megaphone,
    expectedImpactPercent: 25,
    effortLevel: 'low',
    timeToImpact: '2-4 weeks',
    targetRootCauses: ['awareness', 'timing_mismatch'],
    outputs: ['Draft comms', 'FAQ link', 'Eligibility reminder', 'Dashboard banner'],
    steps: [
      'Identify target employee segments with low utilization',
      'Create benefit explainer content with examples',
      'Schedule email and Slack campaign',
      'Add dashboard banners with claim CTAs',
      'Track open rates and claims uplift',
    ],
  },
  {
    id: 'friction_fix',
    title: 'Friction Fix (Docs & SLA)',
    description: 'Reduce documentation requirements and improve processing times.',
    icon: Settings,
    expectedImpactPercent: 35,
    effortLevel: 'medium',
    timeToImpact: '4-6 weeks',
    targetRootCauses: ['process_friction'],
    outputs: ['Required-doc checklist', 'Form improvements', 'SLA routing rules'],
    steps: [
      'Map current claim journey and identify drop-off points',
      'Audit documentation requirements for necessity',
      'Remove unnecessary steps and consolidate forms',
      'Implement auto-approval rules for low-risk claims',
      'A/B test new flow and measure completion rate',
    ],
  },
  {
    id: 'vendor_enablement',
    title: 'Vendor Enablement',
    description: 'Expand vendor network or improve vendor integration for better access.',
    icon: Store,
    expectedImpactPercent: 40,
    effortLevel: 'high',
    timeToImpact: '8-12 weeks',
    targetRootCauses: ['vendor_access'],
    outputs: ['Vendor shortlist', 'Onboarding checklist', 'Suggested discounts'],
    steps: [
      'Survey employee location and preference needs',
      'Identify vendor gaps by geography',
      'Negotiate new partnerships with coverage targets',
      'Integrate direct booking and claiming',
      'Announce expanded network to employees',
    ],
  },
  {
    id: 'policy_simplification',
    title: 'Policy Simplification',
    description: 'Rewrite policy for clarity, add examples, and reduce ambiguity.',
    icon: BookOpen,
    expectedImpactPercent: 20,
    effortLevel: 'medium',
    timeToImpact: '3-5 weeks',
    targetRootCauses: ['policy_constraints'],
    outputs: ['Simplified policy summary', 'Real-world examples', 'Edge case guidance'],
    steps: [
      'Audit current policy language for complexity',
      'Identify clauses with high rejection correlation',
      'Rewrite in plain language with employee input',
      'Add decision trees and worked examples',
      'Publish updated version and track claim success',
    ],
  },
  {
    id: 'reallocation_proposal',
    title: 'Reallocation Proposal',
    description: 'Propose moving budget to high-demand categories or cash-out options.',
    icon: RefreshCcw,
    expectedImpactPercent: 50,
    effortLevel: 'high',
    timeToImpact: 'Varies (budget cycle)',
    targetRootCauses: ['awareness', 'policy_constraints', 'timing_mismatch'],
    outputs: ['Budget reallocation proposal', 'Cost-benefit analysis', 'Employee survey results'],
    steps: [
      'Analyze structurally unused categories (multi-year trend)',
      'Survey employees on preferred alternatives',
      'Model budget reallocation scenarios',
      'Present proposal to Finance and HR leadership',
      'Implement changes in next budget cycle',
    ],
  },
];

// ============= SEED DATA =============

const ZOMBIE_CATEGORIES: ZombieCategory[] = [
  {
    id: 'cat-ld',
    name: 'Learning & Development',
    allocatedBudget: 450000,
    entitledValue: 420000,
    claimedAmount: 210000,
    unusedEntitlement: 210000,
    utilizationRate: 50,
    confidence: 'high',
    eligibleHeadcount: 120,
    missingDocsRate: 18,
    avgProcessingDays: 3.2,
    rejectedCount: 12,
    returnedCount: 8,
    primaryRootCause: 'awareness',
    secondaryRootCauses: ['timing_mismatch'],
    topDepartments: [
      { name: 'Operations', unused: 65000 },
      { name: 'Sales', unused: 52000 },
      { name: 'Finance', unused: 38000 },
    ],
    topGrades: [
      { name: 'M1-M2', unused: 95000 },
      { name: 'M3', unused: 62000 },
      { name: 'M4+', unused: 53000 },
    ],
    lifeStageBreakdown: [
      { name: 'With Dependents', unused: 85000 },
      { name: 'Single', unused: 78000 },
      { name: 'Married (No Kids)', unused: 47000 },
    ],
    trendData: [
      { month: 'Jul', unused: 180000 },
      { month: 'Aug', unused: 175000 },
      { month: 'Sep', unused: 190000 },
      { month: 'Oct', unused: 205000 },
      { month: 'Nov', unused: 210000 },
      { month: 'Dec', unused: 210000 },
    ],
  },
  {
    id: 'cat-well',
    name: 'Wellbeing Program',
    allocatedBudget: 280000,
    entitledValue: 260000,
    claimedAmount: 130000,
    unusedEntitlement: 130000,
    utilizationRate: 50,
    confidence: 'high',
    eligibleHeadcount: 130,
    missingDocsRate: 35,
    avgProcessingDays: 4.8,
    rejectedCount: 28,
    returnedCount: 15,
    primaryRootCause: 'process_friction',
    secondaryRootCauses: ['policy_constraints'],
    topDepartments: [
      { name: 'Engineering', unused: 48000 },
      { name: 'Operations', unused: 35000 },
      { name: 'HR', unused: 22000 },
    ],
    topGrades: [
      { name: 'M1-M2', unused: 58000 },
      { name: 'M3', unused: 42000 },
      { name: 'M4+', unused: 30000 },
    ],
    trendData: [
      { month: 'Jul', unused: 110000 },
      { month: 'Aug', unused: 115000 },
      { month: 'Sep', unused: 120000 },
      { month: 'Oct', unused: 125000 },
      { month: 'Nov', unused: 128000 },
      { month: 'Dec', unused: 130000 },
    ],
  },
  {
    id: 'cat-flight',
    name: 'Annual Flight Tickets',
    allocatedBudget: 320000,
    entitledValue: 300000,
    claimedAmount: 225000,
    unusedEntitlement: 75000,
    utilizationRate: 75,
    confidence: 'high',
    eligibleHeadcount: 85,
    missingDocsRate: 8,
    avgProcessingDays: 2.1,
    rejectedCount: 5,
    returnedCount: 3,
    primaryRootCause: 'timing_mismatch',
    secondaryRootCauses: ['awareness'],
    topDepartments: [
      { name: 'Engineering', unused: 28000 },
      { name: 'Sales', unused: 22000 },
      { name: 'Legal', unused: 15000 },
    ],
    topGrades: [
      { name: 'M3', unused: 32000 },
      { name: 'M4+', unused: 28000 },
      { name: 'M1-M2', unused: 15000 },
    ],
    trendData: [
      { month: 'Jul', unused: 85000 },
      { month: 'Aug', unused: 82000 },
      { month: 'Sep', unused: 80000 },
      { month: 'Oct', unused: 78000 },
      { month: 'Nov', unused: 76000 },
      { month: 'Dec', unused: 75000 },
    ],
  },
  {
    id: 'cat-gym',
    name: 'Gym Membership',
    allocatedBudget: 120000,
    entitledValue: 110000,
    claimedAmount: 55000,
    unusedEntitlement: 55000,
    utilizationRate: 50,
    confidence: 'medium',
    eligibleHeadcount: 130,
    missingDocsRate: 5,
    avgProcessingDays: 1.5,
    rejectedCount: 2,
    returnedCount: 1,
    primaryRootCause: 'vendor_access',
    secondaryRootCauses: ['awareness'],
    topDepartments: [
      { name: 'Operations', unused: 22000 },
      { name: 'Finance', unused: 15000 },
      { name: 'Legal', unused: 10000 },
    ],
    topGrades: [
      { name: 'M3', unused: 25000 },
      { name: 'M4+', unused: 18000 },
      { name: 'M1-M2', unused: 12000 },
    ],
    trendData: [
      { month: 'Jul', unused: 48000 },
      { month: 'Aug', unused: 50000 },
      { month: 'Sep', unused: 52000 },
      { month: 'Oct', unused: 53000 },
      { month: 'Nov', unused: 54000 },
      { month: 'Dec', unused: 55000 },
    ],
  },
  {
    id: 'cat-leave',
    name: 'Leave Encashment',
    allocatedBudget: 180000,
    entitledValue: 165000,
    claimedAmount: 125000,
    unusedEntitlement: 40000,
    utilizationRate: 76,
    confidence: 'high',
    eligibleHeadcount: 95,
    missingDocsRate: 2,
    avgProcessingDays: 5.5,
    rejectedCount: 8,
    returnedCount: 4,
    primaryRootCause: 'policy_constraints',
    secondaryRootCauses: ['process_friction'],
    topDepartments: [
      { name: 'Engineering', unused: 15000 },
      { name: 'Sales', unused: 12000 },
      { name: 'Operations', unused: 8000 },
    ],
    topGrades: [
      { name: 'M4+', unused: 18000 },
      { name: 'M3', unused: 14000 },
      { name: 'M1-M2', unused: 8000 },
    ],
    trendData: [
      { month: 'Jul', unused: 45000 },
      { month: 'Aug', unused: 44000 },
      { month: 'Sep', unused: 43000 },
      { month: 'Oct', unused: 42000 },
      { month: 'Nov', unused: 41000 },
      { month: 'Dec', unused: 40000 },
    ],
  },
  {
    id: 'cat-transport',
    name: 'Transport Allowance',
    allocatedBudget: 200000,
    entitledValue: 185000,
    claimedAmount: 145000,
    unusedEntitlement: 40000,
    utilizationRate: 78,
    confidence: 'medium',
    eligibleHeadcount: 110,
    missingDocsRate: 12,
    avgProcessingDays: 2.8,
    rejectedCount: 6,
    returnedCount: 4,
    primaryRootCause: 'awareness',
    secondaryRootCauses: ['process_friction'],
    topDepartments: [
      { name: 'HR', unused: 12000 },
      { name: 'Finance', unused: 10000 },
      { name: 'Legal', unused: 8000 },
    ],
    topGrades: [
      { name: 'M1-M2', unused: 18000 },
      { name: 'M3', unused: 14000 },
      { name: 'M4+', unused: 8000 },
    ],
    trendData: [
      { month: 'Jul', unused: 38000 },
      { month: 'Aug', unused: 38000 },
      { month: 'Sep', unused: 39000 },
      { month: 'Oct', unused: 39000 },
      { month: 'Nov', unused: 40000 },
      { month: 'Dec', unused: 40000 },
    ],
  },
];

// ============= CONFIDENCE FACTORS =============

export const CONFIDENCE_FACTORS: Record<ConfidenceLevel, number> = {
  high: 1.0,
  medium: 0.7,
  low: 0.4,
};

// ============= HOOK =============

export function useZombieSpendData() {
  const [categories] = useState<ZombieCategory[]>(ZOMBIE_CATEGORIES);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showHighConfidenceOnly, setShowHighConfidenceOnly] = useState(false);
  const [playbookRuns, setPlaybookRuns] = useState<PlaybookRun[]>([]);
  
  // Filter categories
  const filteredCategories = useMemo(() => {
    if (showHighConfidenceOnly) {
      return categories.filter(c => c.confidence === 'high');
    }
    return categories;
  }, [categories, showHighConfidenceOnly]);
  
  // Summary metrics
  const summaryMetrics = useMemo(() => {
    const totalUnused = filteredCategories.reduce((sum, c) => sum + c.unusedEntitlement, 0);
    const totalAllocated = filteredCategories.reduce((sum, c) => sum + c.allocatedBudget, 0);
    const unusedPercent = totalAllocated > 0 ? (totalUnused / totalAllocated) * 100 : 0;
    
    // Top 3 categories
    const sortedByUnused = [...filteredCategories].sort((a, b) => b.unusedEntitlement - a.unusedEntitlement);
    const topCategories = sortedByUnused.slice(0, 3).map(c => c.name);
    
    // Estimated recoverable (weighted by confidence)
    const estimatedRecoverable = filteredCategories.reduce((sum, c) => {
      return sum + c.unusedEntitlement * CONFIDENCE_FACTORS[c.confidence];
    }, 0);
    
    return {
      totalUnused,
      unusedPercent: Math.round(unusedPercent * 10) / 10,
      topCategories,
      estimatedRecoverable: Math.round(estimatedRecoverable),
    };
  }, [filteredCategories]);
  
  // Selected category
  const selectedCategory = useMemo(() => 
    categories.find(c => c.id === selectedCategoryId) || null,
    [categories, selectedCategoryId]
  );
  
  // Get recommended playbooks for category
  const getRecommendedPlaybooks = useCallback((category: ZombieCategory): RecoveryPlaybook[] => {
    const allCauses = [category.primaryRootCause, ...category.secondaryRootCauses];
    return RECOVERY_PLAYBOOKS.filter(pb => 
      pb.targetRootCauses.some(cause => allCauses.includes(cause))
    );
  }, []);
  
  // Actions
  const openCategoryDrawer = useCallback((categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setDrawerOpen(true);
  }, []);
  
  const closeCategoryDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);
  
  const launchPlaybook = useCallback((run: Omit<PlaybookRun, 'id' | 'createdAt' | 'status'>) => {
    const newRun: PlaybookRun = {
      ...run,
      id: `run-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    setPlaybookRuns(prev => [newRun, ...prev]);
    return newRun;
  }, []);
  
  const updatePlaybookRunStatus = useCallback((runId: string, status: PlaybookStatus) => {
    setPlaybookRuns(prev => prev.map(run => 
      run.id === runId ? { ...run, status } : run
    ));
  }, []);
  
  return {
    categories: filteredCategories,
    allCategories: categories,
    selectedCategory,
    drawerOpen,
    showHighConfidenceOnly,
    playbookRuns,
    summaryMetrics,
    playbooks: RECOVERY_PLAYBOOKS,
    rootCauseDefinitions: ROOT_CAUSE_DEFINITIONS,
    confidenceFactors: CONFIDENCE_FACTORS,
    setShowHighConfidenceOnly,
    openCategoryDrawer,
    closeCategoryDrawer,
    getRecommendedPlaybooks,
    launchPlaybook,
    updatePlaybookRunStatus,
  };
}
