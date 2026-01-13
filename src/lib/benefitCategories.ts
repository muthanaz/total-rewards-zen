// =============================================================================
// BENEFIT CATEGORY SYSTEM - Re-exports from unified color system
// =============================================================================
// This file maintains backward compatibility while using the new color system

import { LucideIcon } from 'lucide-react';
import {
  BENEFIT_COLORS,
  type BenefitColorConfig,
  type RAGStatus,
  type RAGConfig,
  RAG_CONFIG,
  RAG_THRESHOLDS,
  getRAGStatus as getRAGStatusFromColors,
  getBenefitColor,
  getSidebarIconColor as getSidebarIconColorFromColors,
  getBenefitChartColors as getBenefitChartColorsFromColors,
} from './benefitColors';

// Re-export types
export type { RAGStatus, BenefitColorConfig };

// =============================================================================
// RAG STATUS SYSTEM (for utilization indicators)
// =============================================================================

export interface RAGStatusConfig {
  status: RAGStatus;
  label: string;
  labelAr: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  progressClass: string;
}

export function getRAGStatus(utilizationPercent: number): RAGStatusConfig {
  const rag = RAG_CONFIG[getRAGStatusFromColors(utilizationPercent)];
  return {
    status: rag.status,
    label: rag.label,
    labelAr: rag.labelAr,
    bgClass: rag.bgClass,
    textClass: rag.textClass,
    borderClass: rag.borderClass,
    progressClass: rag.progressClass,
  };
}

// =============================================================================
// BENEFIT CATEGORIES - Mapped from new color system
// =============================================================================

export interface BenefitCategory {
  key: string;
  label: string;
  fullLabel: string;
  color: string;
  bgClass: string;
  bgLightClass: string;
  textClass: string;
  borderClass: string;
  icon: LucideIcon;
  route: string;
  description: string;
}

// Build BENEFIT_CATEGORIES from the new color system
export const BENEFIT_CATEGORIES: Record<string, BenefitCategory> = Object.fromEntries(
  Object.entries(BENEFIT_COLORS).map(([key, config]) => [
    key,
    {
      key: config.key,
      label: config.label,
      fullLabel: config.label,
      color: config.chartColor,
      bgClass: config.bg,
      bgLightClass: config.bgLight,
      textClass: `${config.text} dark:${config.textDark}`,
      borderClass: config.border,
      icon: config.icon,
      route: config.route,
      description: '',
    },
  ])
) as Record<string, BenefitCategory>;

export type BenefitCategoryKey = keyof typeof BENEFIT_CATEGORIES;

// =============================================================================
// BENEFIT DEFINITIONS
// =============================================================================

export interface BenefitDefinition {
  key: BenefitCategoryKey;
  name: string;
  nameKey: string;
  category: BenefitCategoryKey;
  icon: LucideIcon;
  route: string;
  description: string;
  bullets: string[];
  bulletsAr: string[];
}

export const BENEFIT_DEFINITIONS: BenefitDefinition[] = Object.entries(BENEFIT_COLORS).map(([key, config]) => ({
  key: key as BenefitCategoryKey,
  name: config.label,
  nameKey: `benefit.${key}`,
  category: key as BenefitCategoryKey,
  icon: config.icon,
  route: config.route,
  description: '',
  bullets: [],
  bulletsAr: [],
}));

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export const BENEFIT_TO_CATEGORY: Record<string, BenefitCategoryKey> = {
  'Housing Allowance': 'housing',
  'Housing': 'housing',
  'housing': 'housing',
  'Education Allowance': 'education',
  'Education': 'education',
  'education': 'education',
  'schooling': 'education',
  'Schooling': 'education',
  'Health Insurance': 'health',
  'Health': 'health',
  'health': 'health',
  'Transport & Mobility': 'transport',
  'Transport': 'transport',
  'transport': 'transport',
  'Flight Tickets': 'transport',
  'Wellbeing Program': 'wellbeing',
  'Wellbeing': 'wellbeing',
  'wellbeing': 'wellbeing',
  'Financial Planning': 'financial',
  'Financial': 'financial',
  'financial': 'financial',
  'Savings Plan': 'financial',
  'Learning & Development': 'learning',
  'Learning': 'learning',
  'learning': 'learning',
  'Annual Bonus': 'rewards',
  'Bonus': 'rewards',
  'bonus': 'rewards',
  'rewards': 'rewards',
  'Equity & Options': 'equity',
  'Equity': 'equity',
  'equity': 'equity',
  'Leave Management': 'timeoff',
  'Leave': 'timeoff',
  'leave': 'timeoff',
  'timeoff': 'timeoff',
};

export function getBenefitCategory(benefitName: string): BenefitCategory {
  const colorConfig = getBenefitColor(benefitName);
  return {
    key: colorConfig.key,
    label: colorConfig.label,
    fullLabel: colorConfig.label,
    color: colorConfig.chartColor,
    bgClass: colorConfig.bg,
    bgLightClass: colorConfig.bgLight,
    textClass: `${colorConfig.text} dark:${colorConfig.textDark}`,
    borderClass: colorConfig.border,
    icon: colorConfig.icon,
    route: colorConfig.route,
    description: '',
  };
}

export function getBenefitDefinition(key: BenefitCategoryKey): BenefitDefinition | undefined {
  return BENEFIT_DEFINITIONS.find(b => b.key === key);
}

export function getSidebarIconColor(path: string): string {
  return getSidebarIconColorFromColors(path);
}

export const BENEFIT_TYPE_TO_CATEGORY: Record<string, BenefitCategoryKey> = {
  cash_allowances: 'financial',
  health_protection: 'health',
  time_off_flex: 'timeoff',
  growth_career: 'learning',
  wealth_ownership: 'equity',
  wellbeing: 'wellbeing',
};

export function getCategoryColorsArray(): string[] {
  return Object.values(BENEFIT_COLORS).map(c => c.chartColor);
}

export function getBenefitChartColors(): { name: string; color: string }[] {
  return getBenefitChartColorsFromColors();
}
