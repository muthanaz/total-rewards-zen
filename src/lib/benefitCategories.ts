// =============================================================================
// BENEFIT CATEGORY SYSTEM - SINGLE SOURCE OF TRUTH
// =============================================================================
// Each benefit has a UNIQUE color for consistent chart representation across all pages
// RAG (Red-Amber-Green) is used separately for utilization status indicators

import { 
  Home, GraduationCap, Heart, Car, Dumbbell, PiggyBank, 
  BookOpen, TrendingUp, Award, Calendar, LucideIcon
} from 'lucide-react';

// =============================================================================
// RAG STATUS SYSTEM (for utilization indicators)
// =============================================================================
// Green: 80%+ utilized - Excellent
// Amber: 30-79% utilized - Needs attention  
// Red: <30% utilized - Underutilized

export type RAGStatus = 'green' | 'amber' | 'red';

export interface RAGConfig {
  status: RAGStatus;
  label: string;
  labelAr: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  progressClass: string;
}

export function getRAGStatus(utilizationPercent: number): RAGConfig {
  if (utilizationPercent >= 80) {
    return {
      status: 'green',
      label: 'On Track',
      labelAr: 'على المسار',
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-500/30',
      progressClass: '[&>div]:bg-emerald-500',
    };
  } else if (utilizationPercent >= 30) {
    return {
      status: 'amber',
      label: 'Needs Attention',
      labelAr: 'يحتاج اهتماماً',
      bgClass: 'bg-amber-500/10',
      textClass: 'text-amber-600 dark:text-amber-400',
      borderClass: 'border-amber-500/30',
      progressClass: '[&>div]:bg-amber-500',
    };
  } else {
    return {
      status: 'red',
      label: 'Underutilized',
      labelAr: 'غير مستغل',
      bgClass: 'bg-red-500/10',
      textClass: 'text-red-600 dark:text-red-400',
      borderClass: 'border-red-500/30',
      progressClass: '[&>div]:bg-red-500',
    };
  }
}

// =============================================================================
// INDIVIDUAL BENEFIT CATEGORIES (for specific styling per benefit)
// =============================================================================

// =============================================================================
// INDIVIDUAL BENEFIT CATEGORIES - UNIQUE COLORS FOR CHARTS
// =============================================================================
// Each benefit has a distinct color for consistent chart representation

export const BENEFIT_CATEGORIES = {
  housing: {
    key: 'housing',
    label: 'Housing',
    fullLabel: 'Housing Allowance',
    color: 'hsl(210, 85%, 55%)',  // Blue
    bgClass: 'bg-blue-500',
    bgLightClass: 'bg-blue-500/10',
    textClass: 'text-blue-600 dark:text-blue-400',
    borderClass: 'border-blue-500/20',
    icon: Home,
    route: '/employee/housing',
    description: 'Monthly housing allowance paid with salary',
  },
  education: {
    key: 'education',
    label: 'Education',
    fullLabel: 'Education Allowance',
    color: 'hsl(270, 70%, 55%)',  // Purple
    bgClass: 'bg-purple-500',
    bgLightClass: 'bg-purple-500/10',
    textClass: 'text-purple-600 dark:text-purple-400',
    borderClass: 'border-purple-500/20',
    icon: GraduationCap,
    route: '/employee/schooling',
    description: 'Education support for dependents',
  },
  transport: {
    key: 'transport',
    label: 'Transport',
    fullLabel: 'Transport & Mobility',
    color: 'hsl(35, 90%, 50%)',   // Orange
    bgClass: 'bg-orange-500',
    bgLightClass: 'bg-orange-500/10',
    textClass: 'text-orange-600 dark:text-orange-400',
    borderClass: 'border-orange-500/20',
    icon: Car,
    route: '/employee/transport',
    description: 'Monthly transport and annual flight tickets',
  },
  health: {
    key: 'health',
    label: 'Health Insurance',
    fullLabel: 'Health Insurance',
    color: 'hsl(350, 80%, 55%)',  // Rose
    bgClass: 'bg-rose-500',
    bgLightClass: 'bg-rose-500/10',
    textClass: 'text-rose-600 dark:text-rose-400',
    borderClass: 'border-rose-500/20',
    icon: Heart,
    route: '/employee/health',
    description: 'Comprehensive health coverage for you and family',
  },
  wellbeing: {
    key: 'wellbeing',
    label: 'Wellbeing',
    fullLabel: 'Wellbeing Program',
    color: 'hsl(175, 70%, 45%)',  // Teal
    bgClass: 'bg-teal-500',
    bgLightClass: 'bg-teal-500/10',
    textClass: 'text-teal-600 dark:text-teal-400',
    borderClass: 'border-teal-500/20',
    icon: Dumbbell,
    route: '/employee/wellbeing',
    description: 'Health and wellness benefits for mind and body',
  },
  financial: {
    key: 'financial',
    label: 'Financial',
    fullLabel: 'Financial Planning',
    color: 'hsl(155, 75%, 40%)',  // Emerald
    bgClass: 'bg-emerald-500',
    bgLightClass: 'bg-emerald-500/10',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    borderClass: 'border-emerald-500/20',
    icon: PiggyBank,
    route: '/employee/financial',
    description: 'Retirement savings with employer match',
  },
  learning: {
    key: 'learning',
    label: 'Learning',
    fullLabel: 'Learning & Development',
    color: 'hsl(200, 90%, 50%)',  // Sky
    bgClass: 'bg-sky-500',
    bgLightClass: 'bg-sky-500/10',
    textClass: 'text-sky-600 dark:text-sky-400',
    borderClass: 'border-sky-500/20',
    icon: BookOpen,
    route: '/employee/learning',
    description: 'Professional development and training budget',
  },
  rewards: {
    key: 'rewards',
    label: 'Bonus',
    fullLabel: 'Annual Bonus',
    color: 'hsl(45, 95%, 50%)',   // Amber/Gold
    bgClass: 'bg-amber-500',
    bgLightClass: 'bg-amber-500/10',
    textClass: 'text-amber-600 dark:text-amber-400',
    borderClass: 'border-amber-500/20',
    icon: Award,
    route: '/employee/bonus',
    description: 'Performance-based annual bonus',
  },
  equity: {
    key: 'equity',
    label: 'Equity',
    fullLabel: 'Equity & Options',
    color: 'hsl(260, 60%, 50%)',  // Violet
    bgClass: 'bg-violet-500',
    bgLightClass: 'bg-violet-500/10',
    textClass: 'text-violet-600 dark:text-violet-400',
    borderClass: 'border-violet-500/20',
    icon: TrendingUp,
    route: '/employee/equity',
    description: 'Stock options and equity compensation',
  },
  timeoff: {
    key: 'timeoff',
    label: 'Leave',
    fullLabel: 'Leave Management',
    color: 'hsl(190, 90%, 45%)',  // Cyan
    bgClass: 'bg-cyan-500',
    bgLightClass: 'bg-cyan-500/10',
    textClass: 'text-cyan-600 dark:text-cyan-400',
    borderClass: 'border-cyan-500/20',
    icon: Calendar,
    route: '/employee/leave',
    description: 'Annual, sick, and other leave types',
  },
} as const;

export type BenefitCategoryKey = keyof typeof BENEFIT_CATEGORIES;
export type BenefitCategory = typeof BENEFIT_CATEGORIES[BenefitCategoryKey];

// =============================================================================
// SIMPLIFIED BENEFIT DEFINITIONS (for listings)
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

export const BENEFIT_DEFINITIONS: BenefitDefinition[] = [
  {
    key: 'housing',
    name: 'Housing Allowance',
    nameKey: 'benefit.housing',
    category: 'housing',
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

// Get chart colors for all benefits (consistent across all charts)
export function getBenefitChartColors(): { name: string; color: string }[] {
  return Object.values(BENEFIT_CATEGORIES).map(cat => ({
    name: cat.label,
    color: cat.color,
  }));
}
