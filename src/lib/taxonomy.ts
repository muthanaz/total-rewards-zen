/**
 * =============================================================================
 * TAXONOMY CONTRACT - SINGLE SOURCE OF TRUTH
 * =============================================================================
 * 
 * This module defines the canonical taxonomy for the Universal Benefits Engine:
 * - Canonical enums for life areas, benefit mechanisms, and pillars
 * - Mapping layer between DB enums and canonical values
 * - UI metadata (labels, icons, colors, routes)
 * - Utility functions for normalization and validation
 * 
 * ALL benefit-related types MUST reference this file.
 */

import { 
  Home, GraduationCap, Heart, Car, Dumbbell, PiggyBank, 
  BookOpen, Award, TrendingUp, Calendar, FileText, Gift, Sparkles,
  type LucideIcon 
} from 'lucide-react';

// =============================================================================
// CANONICAL ENUMS
// =============================================================================

/**
 * Canonical Life Area - The primary classification for benefits
 * Maps to employee life domains for intuitive categorization
 */
export type CanonicalLifeArea = 
  | 'housing'
  | 'education' 
  | 'health'
  | 'transport'
  | 'wellbeing'
  | 'financial'
  | 'learning'
  | 'leave'
  | 'bonus'
  | 'equity'
  | 'perks'
  | 'documents'
  | 'other';

/**
 * Benefit Mechanism - How the benefit is delivered/processed
 */
export type BenefitMechanism = 
  | 'allowance'      // Paid with salary (e.g., housing, transport)
  | 'reimbursement'  // Expense submitted after incurred
  | 'program'        // Managed program (e.g., wellbeing)
  | 'leave'          // Time-off related
  | 'insurance'      // Coverage-based (e.g., health)
  | 'other';

/**
 * Benefit Pillar - High-level grouping for employer analytics
 * Kept for backward compatibility with DB enum benefit_type
 */
export type BenefitPillar = 
  | 'cash_allowances'
  | 'health_protection'
  | 'time_off_flex'
  | 'growth_career'
  | 'wealth_ownership'
  | 'wellbeing';

// =============================================================================
// TYPE ALIASES FOR COMPATIBILITY
// =============================================================================

/** @alias CanonicalLifeArea - Use in place of old LifeArea type */
export type LifeArea = CanonicalLifeArea;

/** @alias BenefitMechanism - Use in place of old BenefitPolicyType */
export type BenefitPolicyType = BenefitMechanism;

// =============================================================================
// DATABASE ENUM MAPPING
// =============================================================================

/**
 * Maps legacy DB life_area enum values to canonical values
 * DB uses: home_living, family_parenting, health, money, career, lifestyle, mobility
 */
export const DB_TO_CANONICAL_LIFE_AREA: Record<string, CanonicalLifeArea> = {
  // Direct DB enum mappings
  home_living: 'housing',
  family_parenting: 'education',
  health: 'health',
  money: 'financial',
  career: 'learning',
  lifestyle: 'wellbeing',
  mobility: 'transport',
  // Canonical values (identity mapping)
  housing: 'housing',
  education: 'education',
  transport: 'transport',
  wellbeing: 'wellbeing',
  financial: 'financial',
  learning: 'learning',
  leave: 'leave',
  bonus: 'bonus',
  equity: 'equity',
  perks: 'perks',
  documents: 'documents',
  other: 'other',
};

/**
 * Maps canonical life_area values back to DB enum
 * Used when writing to database
 */
export const CANONICAL_TO_DB_LIFE_AREA: Record<CanonicalLifeArea, string> = {
  housing: 'home_living',
  education: 'family_parenting',
  health: 'health',
  transport: 'mobility',
  wellbeing: 'lifestyle',
  financial: 'money',
  learning: 'career',
  leave: 'lifestyle',      // Closest match
  bonus: 'money',          // Closest match
  equity: 'money',         // Closest match
  perks: 'lifestyle',      // Closest match
  documents: 'career',     // Closest match
  other: 'lifestyle',      // Default fallback
};

/**
 * Maps benefit_pillar (DB benefit_type enum) to primary LifeArea
 */
export const PILLAR_TO_LIFE_AREA: Record<BenefitPillar, CanonicalLifeArea> = {
  cash_allowances: 'financial',
  health_protection: 'health',
  time_off_flex: 'leave',
  growth_career: 'learning',
  wealth_ownership: 'equity',
  wellbeing: 'wellbeing',
};

// =============================================================================
// STRING NORMALIZATION MAP
// =============================================================================

/**
 * Fuzzy string mapping for flexible input handling
 * Handles variations in naming conventions across the codebase
 */
export const STRING_TO_LIFE_AREA: Record<string, CanonicalLifeArea> = {
  // UI keys (from benefitCategories.ts)
  'housing': 'housing',
  'schooling': 'education',
  'health': 'health',
  'transport': 'transport',
  'wellbeing': 'wellbeing',
  'financial': 'financial',
  'learning': 'learning',
  'rewards': 'bonus',
  'bonus': 'bonus',
  'equity': 'equity',
  'timeoff': 'leave',
  'leave': 'leave',
  'perks': 'perks',
  'documents': 'documents',
  'other': 'other',
  // Display names
  'Housing': 'housing',
  'Housing Allowance': 'housing',
  'Education': 'education',
  'Education Allowance': 'education',
  'Schooling': 'education',
  'Schooling Allowance': 'education',
  'Health': 'health',
  'Health Insurance': 'health',
  'Medical': 'health',
  'Transport': 'transport',
  'Transport & Mobility': 'transport',
  'Flight Tickets': 'transport',
  'Per Diem': 'transport',
  'Wellbeing': 'wellbeing',
  'Wellbeing Program': 'wellbeing',
  'Financial': 'financial',
  'Financial Planning': 'financial',
  'Savings Plan': 'financial',
  'Learning': 'learning',
  'Learning & Development': 'learning',
  'Leave': 'leave',
  'Leave Management': 'leave',
  'Annual Leave': 'leave',
  'Bonus': 'bonus',
  'Annual Bonus': 'bonus',
  'Equity': 'equity',
  'Equity & Options': 'equity',
  'Perks': 'perks',
  'Marketplace': 'perks',
  'Documents': 'documents',
  'HR Documents': 'documents',
  'Other': 'other',
  // DB enum values
  'home_living': 'housing',
  'family_parenting': 'education',
  'money': 'financial',
  'career': 'learning',
  'lifestyle': 'wellbeing',
  'mobility': 'transport',
};

// =============================================================================
// UI METADATA - ICONS, COLORS, LABELS
// =============================================================================

export interface LifeAreaMetadata {
  key: CanonicalLifeArea;
  label: string;
  labelAr: string;
  fullLabel: string;
  icon: LucideIcon;
  route: string;
  /** HSL color value for charts and highlights */
  color: string;
  /** Tailwind class for background */
  bgClass: string;
  /** Tailwind class for light background */
  bgLightClass: string;
  /** Tailwind class for text */
  textClass: string;
  /** Tailwind class for border */
  borderClass: string;
  /** Tailwind gradient classes */
  gradientClass: string;
  description: string;
}

/**
 * Complete UI metadata for each canonical life area
 * Psychology-based color choices for intuitive recognition
 */
export const LIFE_AREA_METADATA: Record<CanonicalLifeArea, LifeAreaMetadata> = {
  housing: {
    key: 'housing',
    label: 'Housing',
    labelAr: 'السكن',
    fullLabel: 'Housing Allowance',
    icon: Home,
    route: '/employee/housing',
    color: 'hsl(200, 95%, 48%)',
    bgClass: 'bg-sky-500',
    bgLightClass: 'bg-sky-500/10',
    textClass: 'text-sky-600 dark:text-sky-400',
    borderClass: 'border-sky-500/20',
    gradientClass: 'from-sky-500 to-blue-600',
    description: 'Monthly housing allowance paid with salary',
  },
  education: {
    key: 'education',
    label: 'Education',
    labelAr: 'التعليم',
    fullLabel: 'Education Allowance',
    icon: GraduationCap,
    route: '/employee/schooling',
    color: 'hsl(270, 70%, 55%)',
    bgClass: 'bg-purple-500',
    bgLightClass: 'bg-purple-500/10',
    textClass: 'text-purple-600 dark:text-purple-400',
    borderClass: 'border-purple-500/20',
    gradientClass: 'from-purple-500 to-violet-600',
    description: 'Schooling support for dependents',
  },
  health: {
    key: 'health',
    label: 'Health',
    labelAr: 'الصحة',
    fullLabel: 'Health Insurance',
    icon: Heart,
    route: '/employee/health',
    color: 'hsl(350, 80%, 55%)',
    bgClass: 'bg-rose-500',
    bgLightClass: 'bg-rose-500/10',
    textClass: 'text-rose-600 dark:text-rose-400',
    borderClass: 'border-rose-500/20',
    gradientClass: 'from-rose-500 to-pink-600',
    description: 'Comprehensive health coverage',
  },
  transport: {
    key: 'transport',
    label: 'Transport',
    labelAr: 'النقل',
    fullLabel: 'Transport & Mobility',
    icon: Car,
    route: '/employee/transport',
    color: 'hsl(35, 95%, 50%)',
    bgClass: 'bg-amber-500',
    bgLightClass: 'bg-amber-500/10',
    textClass: 'text-amber-600 dark:text-amber-400',
    borderClass: 'border-amber-500/20',
    gradientClass: 'from-amber-500 to-orange-500',
    description: 'Monthly transport and flight tickets',
  },
  wellbeing: {
    key: 'wellbeing',
    label: 'Wellbeing',
    labelAr: 'الرفاهية',
    fullLabel: 'Wellbeing Program',
    icon: Dumbbell,
    route: '/employee/wellbeing',
    color: 'hsl(174, 60%, 45%)',
    bgClass: 'bg-teal-500',
    bgLightClass: 'bg-teal-500/10',
    textClass: 'text-teal-600 dark:text-teal-400',
    borderClass: 'border-teal-500/20',
    gradientClass: 'from-teal-500 to-emerald-500',
    description: 'Health and wellness benefits',
  },
  financial: {
    key: 'financial',
    label: 'Financial',
    labelAr: 'المالية',
    fullLabel: 'Financial Planning',
    icon: PiggyBank,
    route: '/employee/financial',
    color: 'hsl(155, 75%, 40%)',
    bgClass: 'bg-emerald-500',
    bgLightClass: 'bg-emerald-500/10',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    borderClass: 'border-emerald-500/20',
    gradientClass: 'from-emerald-500 to-green-600',
    description: 'Retirement savings with employer match',
  },
  learning: {
    key: 'learning',
    label: 'Learning',
    labelAr: 'التعلم',
    fullLabel: 'Learning & Development',
    icon: BookOpen,
    route: '/employee/learning',
    color: 'hsl(235, 75%, 58%)',
    bgClass: 'bg-indigo-500',
    bgLightClass: 'bg-indigo-500/10',
    textClass: 'text-indigo-600 dark:text-indigo-400',
    borderClass: 'border-indigo-500/20',
    gradientClass: 'from-indigo-500 to-blue-600',
    description: 'Professional development and training',
  },
  leave: {
    key: 'leave',
    label: 'Leave',
    labelAr: 'الإجازات',
    fullLabel: 'Leave Management',
    icon: Calendar,
    route: '/employee/leave',
    color: 'hsl(190, 90%, 45%)',
    bgClass: 'bg-cyan-500',
    bgLightClass: 'bg-cyan-500/10',
    textClass: 'text-cyan-600 dark:text-cyan-400',
    borderClass: 'border-cyan-500/20',
    gradientClass: 'from-cyan-500 to-sky-500',
    description: 'Annual, sick, and other leave types',
  },
  bonus: {
    key: 'bonus',
    label: 'Bonus',
    labelAr: 'المكافآت',
    fullLabel: 'Annual Bonus',
    icon: Award,
    route: '/employee/bonus',
    color: 'hsl(25, 95%, 55%)',
    bgClass: 'bg-orange-500',
    bgLightClass: 'bg-orange-500/10',
    textClass: 'text-orange-600 dark:text-orange-400',
    borderClass: 'border-orange-500/20',
    gradientClass: 'from-orange-500 to-red-500',
    description: 'Performance-based annual bonus',
  },
  equity: {
    key: 'equity',
    label: 'Equity',
    labelAr: 'الأسهم',
    fullLabel: 'Equity & Options',
    icon: TrendingUp,
    route: '/employee/equity',
    color: 'hsl(280, 70%, 55%)',
    bgClass: 'bg-violet-500',
    bgLightClass: 'bg-violet-500/10',
    textClass: 'text-violet-600 dark:text-violet-400',
    borderClass: 'border-violet-500/20',
    gradientClass: 'from-violet-500 to-purple-600',
    description: 'Stock options and equity compensation',
  },
  perks: {
    key: 'perks',
    label: 'Perks',
    labelAr: 'المزايا',
    fullLabel: 'Perks & Discounts',
    icon: Gift,
    route: '/employee/marketplace',
    color: 'hsl(320, 70%, 55%)',
    bgClass: 'bg-pink-500',
    bgLightClass: 'bg-pink-500/10',
    textClass: 'text-pink-600 dark:text-pink-400',
    borderClass: 'border-pink-500/20',
    gradientClass: 'from-pink-500 to-rose-500',
    description: 'Partner discounts and special offers',
  },
  documents: {
    key: 'documents',
    label: 'Documents',
    labelAr: 'المستندات',
    fullLabel: 'HR Documents',
    icon: FileText,
    route: '/employee/documents',
    color: 'hsl(220, 60%, 50%)',
    bgClass: 'bg-blue-500',
    bgLightClass: 'bg-blue-500/10',
    textClass: 'text-blue-600 dark:text-blue-400',
    borderClass: 'border-blue-500/20',
    gradientClass: 'from-blue-500 to-indigo-500',
    description: 'Salary certificates and official letters',
  },
  other: {
    key: 'other',
    label: 'Other',
    labelAr: 'أخرى',
    fullLabel: 'Other Benefits',
    icon: Sparkles,
    route: '/employee/benefits',
    color: 'hsl(250, 50%, 55%)',
    bgClass: 'bg-slate-500',
    bgLightClass: 'bg-slate-500/10',
    textClass: 'text-slate-600 dark:text-slate-400',
    borderClass: 'border-slate-500/20',
    gradientClass: 'from-slate-500 to-gray-600',
    description: 'Additional benefits',
  },
};

/**
 * UI metadata for benefit pillars (DB benefit_type enum)
 */
export const BENEFIT_PILLAR_METADATA: Record<BenefitPillar, { label: string; labelAr: string; color: string }> = {
  cash_allowances: { 
    label: 'Cash Entitlements', 
    labelAr: 'الاستحقاقات النقدية',
    color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400',
  },
  health_protection: { 
    label: 'Health & Protection', 
    labelAr: 'الصحة والحماية',
    color: 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400',
  },
  time_off_flex: { 
    label: 'Leave & Flexibility', 
    labelAr: 'الإجازات والمرونة',
    color: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400',
  },
  growth_career: { 
    label: 'Career Development', 
    labelAr: 'التطوير المهني',
    color: 'bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400',
  },
  wealth_ownership: { 
    label: 'Wealth & Equity', 
    labelAr: 'الثروة والأسهم',
    color: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400',
  },
  wellbeing: { 
    label: 'Wellbeing', 
    labelAr: 'الرفاهية',
    color: 'bg-pink-500/10 text-pink-600 border-pink-500/20 dark:text-pink-400',
  },
};

/**
 * UI metadata for benefit mechanisms
 */
export const BENEFIT_MECHANISM_METADATA: Record<BenefitMechanism, { label: string; labelAr: string; description: string }> = {
  allowance: { 
    label: 'Allowance', 
    labelAr: 'بدل',
    description: 'Fixed amount paid regularly with salary',
  },
  reimbursement: { 
    label: 'Reimbursement', 
    labelAr: 'تعويض',
    description: 'Expense submitted after incurred',
  },
  program: { 
    label: 'Program', 
    labelAr: 'برنامج',
    description: 'Managed benefit program',
  },
  leave: { 
    label: 'Leave', 
    labelAr: 'إجازة',
    description: 'Time-off entitlement',
  },
  insurance: { 
    label: 'Insurance', 
    labelAr: 'تأمين',
    description: 'Coverage-based benefit',
  },
  other: { 
    label: 'Other', 
    labelAr: 'أخرى',
    description: 'Other benefit type',
  },
};

// =============================================================================
// ROUTE MAPPING
// =============================================================================

/**
 * Maps routes to canonical life areas
 * Used for sidebar highlighting and navigation
 */
export const ROUTE_TO_LIFE_AREA: Record<string, CanonicalLifeArea> = {
  '/employee/housing': 'housing',
  '/employee/schooling': 'education',
  '/employee/health': 'health',
  '/employee/transport': 'transport',
  '/employee/wellbeing': 'wellbeing',
  '/employee/financial': 'financial',
  '/employee/learning': 'learning',
  '/employee/leave': 'leave',
  '/employee/bonus': 'bonus',
  '/employee/equity': 'equity',
  '/employee/marketplace': 'perks',
  '/employee/documents': 'documents',
  '/employee/benefits': 'other',
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/** All valid canonical life area values */
export const CANONICAL_LIFE_AREAS: CanonicalLifeArea[] = [
  'housing', 'education', 'health', 'transport', 'wellbeing', 
  'financial', 'learning', 'leave', 'bonus', 'equity', 'perks', 'documents', 'other'
];

/** All valid benefit mechanism values */
export const BENEFIT_MECHANISMS: BenefitMechanism[] = [
  'allowance', 'reimbursement', 'program', 'leave', 'insurance', 'other'
];

/** All valid benefit pillar values */
export const BENEFIT_PILLARS: BenefitPillar[] = [
  'cash_allowances', 'health_protection', 'time_off_flex', 
  'growth_career', 'wealth_ownership', 'wellbeing'
];

/**
 * Normalize any string input to canonical LifeArea
 * Returns 'other' if no match found
 */
export function normalizeToLifeArea(input: string | null | undefined): CanonicalLifeArea {
  if (!input) return 'other';
  
  const normalized = input.toLowerCase().trim();
  
  // Check direct mapping first
  if (STRING_TO_LIFE_AREA[input]) {
    return STRING_TO_LIFE_AREA[input];
  }
  
  // Check DB enum mapping
  if (DB_TO_CANONICAL_LIFE_AREA[normalized]) {
    return DB_TO_CANONICAL_LIFE_AREA[normalized];
  }
  
  // Check if it's already a canonical value
  if (CANONICAL_LIFE_AREAS.includes(normalized as CanonicalLifeArea)) {
    return normalized as CanonicalLifeArea;
  }
  
  return 'other';
}

/**
 * Check if a string is a valid canonical life area
 */
export function isValidLifeArea(value: unknown): value is CanonicalLifeArea {
  return typeof value === 'string' && CANONICAL_LIFE_AREAS.includes(value as CanonicalLifeArea);
}

/**
 * Check if a string is a valid benefit mechanism
 */
export function isValidBenefitMechanism(value: unknown): value is BenefitMechanism {
  return typeof value === 'string' && BENEFIT_MECHANISMS.includes(value as BenefitMechanism);
}

/**
 * Check if a string is a valid benefit pillar
 */
export function isValidBenefitPillar(value: unknown): value is BenefitPillar {
  return typeof value === 'string' && BENEFIT_PILLARS.includes(value as BenefitPillar);
}

/**
 * Get display label for a life area
 */
export function getLifeAreaLabel(area: CanonicalLifeArea | string, language: 'en' | 'ar' = 'en'): string {
  const normalized = normalizeToLifeArea(area);
  const metadata = LIFE_AREA_METADATA[normalized];
  return language === 'ar' ? metadata.labelAr : metadata.label;
}

/**
 * Get full display label for a life area
 */
export function getLifeAreaFullLabel(area: CanonicalLifeArea | string): string {
  const normalized = normalizeToLifeArea(area);
  return LIFE_AREA_METADATA[normalized].fullLabel;
}

/**
 * Get icon component for a life area
 */
export function getLifeAreaIcon(area: CanonicalLifeArea | string): LucideIcon {
  const normalized = normalizeToLifeArea(area);
  return LIFE_AREA_METADATA[normalized].icon;
}

/**
 * Get color classes for a life area
 */
export function getLifeAreaColors(area: CanonicalLifeArea | string): Pick<LifeAreaMetadata, 'color' | 'bgClass' | 'bgLightClass' | 'textClass' | 'borderClass' | 'gradientClass'> {
  const normalized = normalizeToLifeArea(area);
  const metadata = LIFE_AREA_METADATA[normalized];
  return {
    color: metadata.color,
    bgClass: metadata.bgClass,
    bgLightClass: metadata.bgLightClass,
    textClass: metadata.textClass,
    borderClass: metadata.borderClass,
    gradientClass: metadata.gradientClass,
  };
}

/**
 * Get route for a life area
 */
export function getLifeAreaRoute(area: CanonicalLifeArea | string): string {
  const normalized = normalizeToLifeArea(area);
  return LIFE_AREA_METADATA[normalized].route;
}

/**
 * Get benefit pillar label
 */
export function getBenefitPillarLabel(pillar: BenefitPillar | string, language: 'en' | 'ar' = 'en'): string {
  const metadata = BENEFIT_PILLAR_METADATA[pillar as BenefitPillar];
  if (!metadata) return pillar;
  return language === 'ar' ? metadata.labelAr : metadata.label;
}

/**
 * Get benefit mechanism label
 */
export function getBenefitMechanismLabel(mechanism: BenefitMechanism | string, language: 'en' | 'ar' = 'en'): string {
  const metadata = BENEFIT_MECHANISM_METADATA[mechanism as BenefitMechanism];
  if (!metadata) return mechanism;
  return language === 'ar' ? metadata.labelAr : metadata.label;
}

/**
 * Convert canonical life area to DB enum value
 */
export function toDBLifeArea(area: CanonicalLifeArea): string {
  return CANONICAL_TO_DB_LIFE_AREA[area] || 'lifestyle';
}

/**
 * Convert DB enum value to canonical life area
 */
export function fromDBLifeArea(dbValue: string): CanonicalLifeArea {
  return DB_TO_CANONICAL_LIFE_AREA[dbValue] || 'other';
}

// =============================================================================
// LEGACY COMPATIBILITY EXPORTS
// =============================================================================

/**
 * @deprecated Use LIFE_AREA_METADATA instead
 * Simple label map for backward compatibility with constants.ts
 */
export const LIFE_AREA_LABELS_SIMPLE: Record<string, string> = Object.fromEntries(
  CANONICAL_LIFE_AREAS.map(area => [area, LIFE_AREA_METADATA[area].label])
);

/**
 * @deprecated Use BENEFIT_PILLAR_METADATA instead
 * Simple label map for backward compatibility with constants.ts
 */
export const BENEFIT_TYPE_LABELS_SIMPLE: Record<string, string> = Object.fromEntries(
  BENEFIT_PILLARS.map(pillar => [pillar, BENEFIT_PILLAR_METADATA[pillar].label])
);

/**
 * @deprecated Use DB_TO_CANONICAL_LIFE_AREA instead
 * Legacy DB enum labels for backward compatibility
 */
export const LEGACY_DB_LIFE_AREA_LABELS: Record<string, string> = {
  home_living: 'Home & Living',
  family_parenting: 'Family & Parenting',
  health: 'Health',
  money: 'Money',
  career: 'Career',
  lifestyle: 'Lifestyle',
  mobility: 'Mobility',
};
