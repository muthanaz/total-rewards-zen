// =============================================================================
// UNIFIED COLOR & UTILIZATION SYSTEM
// =============================================================================
// Single source of truth for benefit colors and RAG utilization indicators

import { BENEFIT_CATEGORIES, BenefitCategoryKey } from './benefitCategories';

// =============================================================================
// RAG (Red-Amber-Green) UTILIZATION INDICATORS
// =============================================================================
// Green: 80-100% utilized (fully used or near complete)
// Amber: 30-79% utilized (in progress, room to use more)
// Red: 0-29% utilized (underutilized, action needed)

export type RAGStatus = 'green' | 'amber' | 'red';

export interface RAGIndicator {
  status: RAGStatus;
  label: string;
  labelAr: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  progressClass: string;
  icon: 'check' | 'clock' | 'alert';
}

export const RAG_THRESHOLDS = {
  green: 80,  // 80%+ = fully utilized
  amber: 30,  // 30-79% = in progress
  red: 0,     // 0-29% = underutilized
};

export const RAG_INDICATORS: Record<RAGStatus, RAGIndicator> = {
  green: {
    status: 'green',
    label: 'Fully Utilized',
    labelAr: 'مستخدم بالكامل',
    bgClass: 'bg-emerald-500/10',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    borderClass: 'border-emerald-500/30',
    progressClass: '[&>div]:bg-emerald-500',
    icon: 'check',
  },
  amber: {
    status: 'amber',
    label: 'In Progress',
    labelAr: 'قيد الاستخدام',
    bgClass: 'bg-amber-500/10',
    textClass: 'text-amber-600 dark:text-amber-400',
    borderClass: 'border-amber-500/30',
    progressClass: '[&>div]:bg-amber-500',
    icon: 'clock',
  },
  red: {
    status: 'red',
    label: 'Underutilized',
    labelAr: 'غير مستغل',
    bgClass: 'bg-rose-500/10',
    textClass: 'text-rose-600 dark:text-rose-400',
    borderClass: 'border-rose-500/30',
    progressClass: '[&>div]:bg-rose-500',
    icon: 'alert',
  },
};

// Get RAG status based on utilization percentage
export function getRAGStatus(utilizationPercent: number): RAGStatus {
  if (utilizationPercent >= RAG_THRESHOLDS.green) return 'green';
  if (utilizationPercent >= RAG_THRESHOLDS.amber) return 'amber';
  return 'red';
}

// Get full RAG indicator object
export function getRAGIndicator(utilizationPercent: number): RAGIndicator {
  const status = getRAGStatus(utilizationPercent);
  return RAG_INDICATORS[status];
}

// Get progress bar color class based on utilization
export function getProgressColorClass(utilizationPercent: number): string {
  return getRAGIndicator(utilizationPercent).progressClass;
}

// =============================================================================
// BENEFIT COLOR HELPERS
// =============================================================================
// Ensures consistent colors across all pages

export function getBenefitColorByKey(key: string): typeof BENEFIT_CATEGORIES[BenefitCategoryKey] {
  // Normalize key
  const normalizedKey = key.toLowerCase().replace(/[^a-z]/g, '');
  
  // Map common variations to category keys
  const keyMap: Record<string, BenefitCategoryKey> = {
    housing: 'housing',
    housingallowance: 'housing',
    education: 'schooling',
    educationallowance: 'schooling',
    schooling: 'schooling',
    health: 'health',
    healthinsurance: 'health',
    transport: 'transport',
    transportmobility: 'transport',
    mobility: 'transport',
    wellbeing: 'wellbeing',
    wellbeingprogram: 'wellbeing',
    financial: 'financial',
    financialplanning: 'financial',
    savingsplan: 'financial',
    learning: 'learning',
    learningdevelopment: 'learning',
    rewards: 'rewards',
    bonus: 'rewards',
    annualbonus: 'rewards',
    equity: 'equity',
    equityoptions: 'equity',
    timeoff: 'timeoff',
    leave: 'timeoff',
    leavemanagement: 'timeoff',
  };

  const mappedKey = keyMap[normalizedKey];
  if (mappedKey && BENEFIT_CATEGORIES[mappedKey]) {
    return BENEFIT_CATEGORIES[mappedKey];
  }
  
  // Default fallback
  return BENEFIT_CATEGORIES.wellbeing;
}

// Get benefit color by name (handles any format)
export function getBenefitColor(benefitName: string) {
  return getBenefitColorByKey(benefitName);
}

// Get chart-ready colors array for benefits
export function getBenefitChartColors(): { name: string; color: string }[] {
  return [
    { name: 'Housing', color: BENEFIT_CATEGORIES.housing.color },
    { name: 'Schooling', color: BENEFIT_CATEGORIES.schooling.color },
    { name: 'Health', color: BENEFIT_CATEGORIES.health.color },
    { name: 'Transport', color: BENEFIT_CATEGORIES.transport.color },
    { name: 'Bonus', color: BENEFIT_CATEGORIES.rewards.color },
    { name: 'Financial', color: BENEFIT_CATEGORIES.financial.color },
    { name: 'Wellbeing', color: BENEFIT_CATEGORIES.wellbeing.color },
    { name: 'Learning', color: BENEFIT_CATEGORIES.learning.color },
    { name: 'Equity', color: BENEFIT_CATEGORIES.equity.color },
    { name: 'Leave', color: BENEFIT_CATEGORIES.timeoff.color },
  ];
}

// Get color for chart by benefit name
export function getChartColorByBenefit(benefitName: string): string {
  const category = getBenefitColor(benefitName);
  return category.color;
}

// =============================================================================
// MARKETPLACE CATEGORY COLORS
// =============================================================================

export const MARKETPLACE_CATEGORY_COLORS: Record<string, {
  bg: string;
  bgLight: string;
  text: string;
  border: string;
  gradient: string;
}> = {
  'Everyday Essentials': {
    bg: 'bg-slate-500',
    bgLight: 'bg-slate-500/10',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-500/25',
    gradient: 'from-slate-500 to-gray-600',
  },
  'Food & Coffee': {
    bg: 'bg-orange-500',
    bgLight: 'bg-orange-500/10',
    text: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-500/25',
    gradient: 'from-orange-500 to-amber-500',
  },
  'Health & Fitness': {
    bg: 'bg-rose-500',
    bgLight: 'bg-rose-500/10',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-500/25',
    gradient: 'from-rose-500 to-pink-500',
  },
  'Family & Parenting': {
    bg: 'bg-pink-500',
    bgLight: 'bg-pink-500/10',
    text: 'text-pink-600 dark:text-pink-400',
    border: 'border-pink-500/25',
    gradient: 'from-pink-500 to-rose-400',
  },
  'Learning & Skills': {
    bg: 'bg-indigo-500',
    bgLight: 'bg-indigo-500/10',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-500/25',
    gradient: 'from-indigo-500 to-violet-500',
  },
  'Home & Living': {
    bg: 'bg-sky-500',
    bgLight: 'bg-sky-500/10',
    text: 'text-sky-600 dark:text-sky-400',
    border: 'border-sky-500/25',
    gradient: 'from-sky-500 to-blue-500',
  },
  'Mobility': {
    bg: 'bg-amber-500',
    bgLight: 'bg-amber-500/10',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/25',
    gradient: 'from-amber-500 to-yellow-500',
  },
  'Lifestyle & Shopping': {
    bg: 'bg-violet-500',
    bgLight: 'bg-violet-500/10',
    text: 'text-violet-600 dark:text-violet-400',
    border: 'border-violet-500/25',
    gradient: 'from-violet-500 to-purple-500',
  },
  'Travel & Experiences': {
    bg: 'bg-teal-500',
    bgLight: 'bg-teal-500/10',
    text: 'text-teal-600 dark:text-teal-400',
    border: 'border-teal-500/25',
    gradient: 'from-teal-500 to-emerald-500',
  },
};

export function getMarketplaceCategoryColor(category: string) {
  return MARKETPLACE_CATEGORY_COLORS[category] || {
    bg: 'bg-gray-500',
    bgLight: 'bg-gray-500/10',
    text: 'text-gray-600 dark:text-gray-400',
    border: 'border-gray-500/25',
    gradient: 'from-gray-500 to-slate-500',
  };
}