// =============================================================================
// BENEFIT CATEGORY SYSTEM - SINGLE SOURCE OF TRUTH
// =============================================================================
// Unified benefit grouping, colors, and categorization across the entire platform
// Benefits are grouped by TYPE for consistent color coding

import { 
  Home, GraduationCap, Heart, Car, Dumbbell, PiggyBank, 
  BookOpen, TrendingUp, Award, Calendar, LucideIcon
} from 'lucide-react';

// =============================================================================
// BENEFIT GROUP COLORS (3 Main Groups)
// =============================================================================
// Allowances (Housing, Education, Transport): Sky Blue - trust, stability
// Health & Protection (Health Insurance, Wellbeing): Rose - care, compassion  
// Financial & Rewards (Bonus, Financial, Equity, Learning): Emerald - growth, prosperity

export type BenefitGroupKey = 'allowances' | 'health_protection' | 'financial_rewards';

export interface BenefitGroup {
  key: BenefitGroupKey;
  label: string;
  labelAr: string;
  color: string;
  bgClass: string;
  bgLightClass: string;
  textClass: string;
  borderClass: string;
  gradientClass: string;
}

export const BENEFIT_GROUPS: Record<BenefitGroupKey, BenefitGroup> = {
  allowances: {
    key: 'allowances',
    label: 'Allowances',
    labelAr: 'البدلات',
    color: 'hsl(200, 95%, 48%)',
    bgClass: 'bg-sky-500',
    bgLightClass: 'bg-sky-500/10',
    textClass: 'text-sky-600 dark:text-sky-400',
    borderClass: 'border-sky-500/20',
    gradientClass: 'from-sky-500 to-blue-600',
  },
  health_protection: {
    key: 'health_protection',
    label: 'Health & Protection',
    labelAr: 'الصحة والحماية',
    color: 'hsl(350, 80%, 55%)',
    bgClass: 'bg-rose-500',
    bgLightClass: 'bg-rose-500/10',
    textClass: 'text-rose-600 dark:text-rose-400',
    borderClass: 'border-rose-500/20',
    gradientClass: 'from-rose-500 to-pink-600',
  },
  financial_rewards: {
    key: 'financial_rewards',
    label: 'Financial & Rewards',
    labelAr: 'المالية والمكافآت',
    color: 'hsl(155, 75%, 40%)',
    bgClass: 'bg-emerald-500',
    bgLightClass: 'bg-emerald-500/10',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    borderClass: 'border-emerald-500/20',
    gradientClass: 'from-emerald-500 to-green-600',
  },
};

// =============================================================================
// INDIVIDUAL BENEFIT CATEGORIES (for specific styling per benefit)
// =============================================================================

export const BENEFIT_CATEGORIES = {
  housing: {
    key: 'housing',
    label: 'Housing',
    fullLabel: 'Housing Allowance',
    group: 'allowances' as BenefitGroupKey,
    color: 'hsl(200, 95%, 48%)',
    bgClass: 'bg-sky-500',
    bgLightClass: 'bg-sky-500/10',
    textClass: 'text-sky-600 dark:text-sky-400',
    borderClass: 'border-sky-500/20',
    gradientClass: 'from-sky-500 to-blue-600',
    icon: Home,
    route: '/employee/housing',
    description: 'Monthly housing allowance paid with salary',
  },
  education: {
    key: 'education',
    label: 'Education',
    fullLabel: 'Education Allowance',
    group: 'allowances' as BenefitGroupKey,
    color: 'hsl(200, 95%, 48%)',
    bgClass: 'bg-sky-500',
    bgLightClass: 'bg-sky-500/10',
    textClass: 'text-sky-600 dark:text-sky-400',
    borderClass: 'border-sky-500/20',
    gradientClass: 'from-sky-500 to-blue-600',
    icon: GraduationCap,
    route: '/employee/schooling',
    description: 'Education support for dependents',
  },
  transport: {
    key: 'transport',
    label: 'Transport',
    fullLabel: 'Transport & Mobility',
    group: 'allowances' as BenefitGroupKey,
    color: 'hsl(200, 95%, 48%)',
    bgClass: 'bg-sky-500',
    bgLightClass: 'bg-sky-500/10',
    textClass: 'text-sky-600 dark:text-sky-400',
    borderClass: 'border-sky-500/20',
    gradientClass: 'from-sky-500 to-blue-600',
    icon: Car,
    route: '/employee/transport',
    description: 'Monthly transport and annual flight tickets',
  },
  health: {
    key: 'health',
    label: 'Health Insurance',
    fullLabel: 'Health Insurance',
    group: 'health_protection' as BenefitGroupKey,
    color: 'hsl(350, 80%, 55%)',
    bgClass: 'bg-rose-500',
    bgLightClass: 'bg-rose-500/10',
    textClass: 'text-rose-600 dark:text-rose-400',
    borderClass: 'border-rose-500/20',
    gradientClass: 'from-rose-500 to-pink-600',
    icon: Heart,
    route: '/employee/health',
    description: 'Comprehensive health coverage for you and family',
  },
  wellbeing: {
    key: 'wellbeing',
    label: 'Wellbeing',
    fullLabel: 'Wellbeing Program',
    group: 'health_protection' as BenefitGroupKey,
    color: 'hsl(350, 80%, 55%)',
    bgClass: 'bg-rose-500',
    bgLightClass: 'bg-rose-500/10',
    textClass: 'text-rose-600 dark:text-rose-400',
    borderClass: 'border-rose-500/20',
    gradientClass: 'from-rose-500 to-pink-600',
    icon: Dumbbell,
    route: '/employee/wellbeing',
    description: 'Health and wellness benefits for mind and body',
  },
  financial: {
    key: 'financial',
    label: 'Financial',
    fullLabel: 'Financial Planning',
    group: 'financial_rewards' as BenefitGroupKey,
    color: 'hsl(155, 75%, 40%)',
    bgClass: 'bg-emerald-500',
    bgLightClass: 'bg-emerald-500/10',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    borderClass: 'border-emerald-500/20',
    gradientClass: 'from-emerald-500 to-green-600',
    icon: PiggyBank,
    route: '/employee/financial',
    description: 'Retirement savings with employer match',
  },
  learning: {
    key: 'learning',
    label: 'Learning',
    fullLabel: 'Learning & Development',
    group: 'financial_rewards' as BenefitGroupKey,
    color: 'hsl(155, 75%, 40%)',
    bgClass: 'bg-emerald-500',
    bgLightClass: 'bg-emerald-500/10',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    borderClass: 'border-emerald-500/20',
    gradientClass: 'from-emerald-500 to-green-600',
    icon: BookOpen,
    route: '/employee/learning',
    description: 'Professional development and training budget',
  },
  rewards: {
    key: 'rewards',
    label: 'Bonus',
    fullLabel: 'Annual Bonus',
    group: 'financial_rewards' as BenefitGroupKey,
    color: 'hsl(155, 75%, 40%)',
    bgClass: 'bg-emerald-500',
    bgLightClass: 'bg-emerald-500/10',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    borderClass: 'border-emerald-500/20',
    gradientClass: 'from-emerald-500 to-green-600',
    icon: Award,
    route: '/employee/bonus',
    description: 'Performance-based annual bonus',
  },
  equity: {
    key: 'equity',
    label: 'Equity',
    fullLabel: 'Equity & Options',
    group: 'financial_rewards' as BenefitGroupKey,
    color: 'hsl(155, 75%, 40%)',
    bgClass: 'bg-emerald-500',
    bgLightClass: 'bg-emerald-500/10',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    borderClass: 'border-emerald-500/20',
    gradientClass: 'from-emerald-500 to-green-600',
    icon: TrendingUp,
    route: '/employee/equity',
    description: 'Stock options and equity compensation',
  },
  timeoff: {
    key: 'timeoff',
    label: 'Leave',
    fullLabel: 'Leave Management',
    group: 'allowances' as BenefitGroupKey, // Leave is separate but uses neutral
    color: 'hsl(190, 90%, 45%)',
    bgClass: 'bg-cyan-500',
    bgLightClass: 'bg-cyan-500/10',
    textClass: 'text-cyan-600 dark:text-cyan-400',
    borderClass: 'border-cyan-500/20',
    gradientClass: 'from-cyan-500 to-sky-500',
    icon: Calendar,
    route: '/employee/leave',
    description: 'Annual, sick, and other leave types',
  },
} as const;

export type BenefitCategoryKey = keyof typeof BENEFIT_CATEGORIES;
export type BenefitCategory = typeof BENEFIT_CATEGORIES[BenefitCategoryKey];

// =============================================================================
// UNIFIED BENEFIT DEFINITIONS
// =============================================================================

export interface BenefitDefinition {
  key: BenefitCategoryKey;
  name: string;
  nameKey: string;
  category: BenefitCategoryKey;
  group: BenefitGroupKey;
  icon: LucideIcon;
  route: string;
  description: string;
  bullets: string[];
  bulletsAr: string[];
}

export const BENEFIT_DEFINITIONS: BenefitDefinition[] = [
  {
    key: 'housing',
    name: 'Housing Allowance',
    nameKey: 'benefit.housing',
    category: 'housing',
    group: 'allowances',
    icon: Home,
    route: '/employee/housing',
    description: 'Monthly housing allowance paid with salary',
    bullets: ['Paid monthly with salary', 'Can be used for rent or mortgage'],
    bulletsAr: ['يُدفع شهرياً مع الراتب', 'يمكن استخدامه للإيجار أو الرهن العقاري'],
  },
  {
    key: 'education',
    name: 'Education Allowance',
    nameKey: 'benefit.education',
    category: 'education',
    group: 'allowances',
    icon: GraduationCap,
    route: '/employee/schooling',
    description: 'Education support for dependents',
    bullets: ['Per child up to 18 years', 'Covers tuition fees only'],
    bulletsAr: ['لكل طفل حتى ١٨ عاماً', 'يغطي الرسوم الدراسية فقط'],
  },
  {
    key: 'transport',
    name: 'Transport & Mobility',
    nameKey: 'benefit.transport',
    category: 'transport',
    group: 'allowances',
    icon: Car,
    route: '/employee/transport',
    description: 'Monthly transport and flight tickets',
    bullets: ['Paid monthly with salary', 'Includes annual flight tickets'],
    bulletsAr: ['يُدفع شهرياً مع الراتب', 'يشمل تذاكر الطيران السنوية'],
  },
  {
    key: 'health',
    name: 'Health Insurance',
    nameKey: 'benefit.health',
    category: 'health',
    group: 'health_protection',
    icon: Heart,
    route: '/employee/health',
    description: 'Comprehensive health coverage',
    bullets: ['Includes dental and optical', 'Covers spouse and children'],
    bulletsAr: ['يشمل طب الأسنان والبصريات', 'يغطي الزوج/الزوجة والأطفال'],
  },
  {
    key: 'wellbeing',
    name: 'Wellbeing Program',
    nameKey: 'benefit.wellbeing',
    category: 'wellbeing',
    group: 'health_protection',
    icon: Dumbbell,
    route: '/employee/wellbeing',
    description: 'Health and wellness benefits',
    bullets: ['Gym membership covered', 'Wellness app subscription'],
    bulletsAr: ['عضوية النادي الرياضي مغطاة', 'اشتراك تطبيق العافية'],
  },
  {
    key: 'financial',
    name: 'Financial Planning',
    nameKey: 'benefit.financial',
    category: 'financial',
    group: 'financial_rewards',
    icon: PiggyBank,
    route: '/employee/financial',
    description: 'Retirement savings with employer match',
    bullets: ['5% employer match', 'Multiple fund options'],
    bulletsAr: ['مطابقة ٥٪ من صاحب العمل', 'خيارات صناديق متعددة'],
  },
  {
    key: 'rewards',
    name: 'Annual Bonus',
    nameKey: 'benefit.bonus',
    category: 'rewards',
    group: 'financial_rewards',
    icon: Award,
    route: '/employee/bonus',
    description: 'Performance-based annual bonus',
    bullets: ['Performance-based (0-200%)', 'Target: 2 months salary'],
    bulletsAr: ['مبني على الأداء (٠-٢٠٠٪)', 'الهدف: راتب شهرين'],
  },
  {
    key: 'learning',
    name: 'Learning & Development',
    nameKey: 'benefit.learning',
    category: 'learning',
    group: 'financial_rewards',
    icon: BookOpen,
    route: '/employee/learning',
    description: 'Professional development budget',
    bullets: ['Courses and certifications', 'Pre-approval required'],
    bulletsAr: ['الدورات والشهادات', 'يتطلب موافقة مسبقة'],
  },
  {
    key: 'equity',
    name: 'Equity & Options',
    nameKey: 'benefit.equity',
    category: 'equity',
    group: 'financial_rewards',
    icon: TrendingUp,
    route: '/employee/equity',
    description: 'Stock options and equity compensation',
    bullets: ['Vesting over 4 years', 'Exercise after cliff period'],
    bulletsAr: ['الاستحقاق على ٤ سنوات', 'التمارين بعد فترة الهاوية'],
  },
  {
    key: 'timeoff',
    name: 'Leave Management',
    nameKey: 'benefit.leave',
    category: 'timeoff',
    group: 'allowances',
    icon: Calendar,
    route: '/employee/leave',
    description: 'Annual, sick, and other leave types',
    bullets: ['30 days annual leave', 'Carry over up to 5 days'],
    bulletsAr: ['٣٠ يوم إجازة سنوية', 'ترحيل حتى ٥ أيام'],
  },
];

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
  const key = BENEFIT_TO_CATEGORY[benefitName] || BENEFIT_TO_CATEGORY[benefitName.toLowerCase()];
  return BENEFIT_CATEGORIES[key] || BENEFIT_CATEGORIES.wellbeing;
}

export function getBenefitGroup(benefitName: string): BenefitGroup {
  const cat = getBenefitCategory(benefitName);
  return BENEFIT_GROUPS[cat.group];
}

export function getBenefitDefinition(key: BenefitCategoryKey): BenefitDefinition | undefined {
  return BENEFIT_DEFINITIONS.find(b => b.key === key);
}

export function getSidebarIconColor(path: string): string {
  const pathMap: Record<string, BenefitCategoryKey> = {
    '/employee/housing': 'housing',
    '/employee/schooling': 'education',
    '/employee/health': 'health',
    '/employee/transport': 'transport',
    '/employee/wellbeing': 'wellbeing',
    '/employee/financial': 'financial',
    '/employee/learning': 'learning',
    '/employee/bonus': 'rewards',
    '/employee/equity': 'equity',
    '/employee/leave': 'timeoff',
  };
  
  const categoryKey = pathMap[path];
  if (categoryKey) {
    return BENEFIT_CATEGORIES[categoryKey].textClass;
  }
  return 'text-sidebar-foreground/70';
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
  return Object.values(BENEFIT_CATEGORIES).map(cat => cat.color);
}

// Get chart colors based on benefit groups (for consistent pie/bar charts)
export function getGroupChartColors(): { name: string; color: string }[] {
  return Object.values(BENEFIT_GROUPS).map(g => ({
    name: g.label,
    color: g.color,
  }));
}
