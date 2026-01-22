// =============================================================================
// BENEFIT CATEGORY SYSTEM - SINGLE SOURCE OF TRUTH
// =============================================================================
// Unified benefit naming, colors, and categorization across the entire platform
// Psychology-based color choices for intuitive recognition

import { 
  Home, GraduationCap, Heart, Car, Dumbbell, PiggyBank, 
  BookOpen, TrendingUp, Award, Calendar, LucideIcon
} from 'lucide-react';

// =============================================================================
// COLOR DEFINITIONS (Psychology-based)
// =============================================================================
// Sky Blue: Trust, stability → Housing (home = security)
// Purple: Wisdom, education → Schooling
// Rose: Care, compassion → Health
// Amber: Energy, warmth → Transport
// Teal: Balance, wellness → Wellbeing (brand accent)
// Emerald: Growth, prosperity → Financial
// Indigo: Knowledge, depth → Learning
// Orange: Enthusiasm, success → Bonus/Rewards
// Violet: Premium, ownership → Equity
// Cyan: Freedom, clarity → Leave/Time Off

export const BENEFIT_CATEGORIES = {
  housing: {
    key: 'housing',
    label: 'Housing',
    fullLabel: 'Housing Allowance',
    // Sky blue - trust, stability, security
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
  schooling: {
    key: 'schooling',
    label: 'Schooling',
    fullLabel: 'Schooling Allowance',
    // Purple - wisdom, creativity, education
    color: 'hsl(270, 70%, 55%)',
    bgClass: 'bg-purple-500',
    bgLightClass: 'bg-purple-500/10',
    textClass: 'text-purple-600 dark:text-purple-400',
    borderClass: 'border-purple-500/20',
    gradientClass: 'from-purple-500 to-violet-600',
    icon: GraduationCap,
    route: '/employee/schooling',
    description: 'Schooling support for dependents',
  },
  health: {
    key: 'health',
    label: 'Health Insurance',
    fullLabel: 'Health Insurance',
    // Rose - care, compassion, heart
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
  transport: {
    key: 'transport',
    label: 'Transport',
    fullLabel: 'Transport & Mobility',
    // Amber - energy, movement, warmth
    color: 'hsl(35, 95%, 50%)',
    bgClass: 'bg-amber-500',
    bgLightClass: 'bg-amber-500/10',
    textClass: 'text-amber-600 dark:text-amber-400',
    borderClass: 'border-amber-500/20',
    gradientClass: 'from-amber-500 to-orange-500',
    icon: Car,
    route: '/employee/transport',
    description: 'Monthly transport and annual flight tickets',
  },
  wellbeing: {
    key: 'wellbeing',
    label: 'Wellbeing',
    fullLabel: 'Wellbeing Program',
    // Teal - balance, calm, wellness (brand accent)
    color: 'hsl(174, 60%, 45%)',
    bgClass: 'bg-teal-500',
    bgLightClass: 'bg-teal-500/10',
    textClass: 'text-teal-600 dark:text-teal-400',
    borderClass: 'border-teal-500/20',
    gradientClass: 'from-teal-500 to-emerald-500',
    icon: Dumbbell,
    route: '/employee/wellbeing',
    description: 'Health and wellness benefits for mind and body',
  },
  financial: {
    key: 'financial',
    label: 'Financial',
    fullLabel: 'Financial Planning',
    // Emerald - growth, prosperity, money
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
    // Indigo - knowledge, depth, wisdom
    color: 'hsl(235, 75%, 58%)',
    bgClass: 'bg-indigo-500',
    bgLightClass: 'bg-indigo-500/10',
    textClass: 'text-indigo-600 dark:text-indigo-400',
    borderClass: 'border-indigo-500/20',
    gradientClass: 'from-indigo-500 to-blue-600',
    icon: BookOpen,
    route: '/employee/learning',
    description: 'Professional development and training budget',
  },
  rewards: {
    key: 'rewards',
    label: 'Bonus',
    fullLabel: 'Annual Bonus',
    // Orange - enthusiasm, success, achievement
    color: 'hsl(25, 95%, 55%)',
    bgClass: 'bg-orange-500',
    bgLightClass: 'bg-orange-500/10',
    textClass: 'text-orange-600 dark:text-orange-400',
    borderClass: 'border-orange-500/20',
    gradientClass: 'from-orange-500 to-red-500',
    icon: Award,
    route: '/employee/bonus',
    description: 'Performance-based annual bonus',
  },
  equity: {
    key: 'equity',
    label: 'Equity',
    fullLabel: 'Equity & Options',
    // Violet - premium, luxury, ownership
    color: 'hsl(280, 70%, 55%)',
    bgClass: 'bg-violet-500',
    bgLightClass: 'bg-violet-500/10',
    textClass: 'text-violet-600 dark:text-violet-400',
    borderClass: 'border-violet-500/20',
    gradientClass: 'from-violet-500 to-purple-600',
    icon: TrendingUp,
    route: '/employee/equity',
    description: 'Stock options and equity compensation',
  },
  timeoff: {
    key: 'timeoff',
    label: 'Leave',
    fullLabel: 'Leave Management',
    // Cyan - freedom, clarity, refreshment
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
    key: 'schooling',
    name: 'Schooling Allowance',
    nameKey: 'benefit.education',
    category: 'schooling',
    icon: GraduationCap,
    route: '/employee/schooling',
    description: 'Schooling support for dependents',
    bullets: ['Per child up to 18 years', 'Covers tuition fees only'],
    bulletsAr: ['لكل طفل حتى 18 عاماً', 'يغطي الرسوم الدراسية فقط'],
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
    key: 'rewards',
    name: 'Annual Bonus',
    nameKey: 'benefit.bonus',
    category: 'rewards',
    icon: Award,
    route: '/employee/bonus',
    description: 'Performance-based annual bonus',
    bullets: ['Performance-based (0-200%)', 'Target: 2 months salary'],
    bulletsAr: ['مبني على الأداء (0-200%)', 'الهدف: راتب شهرين'],
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
    bulletsAr: ['مطابقة 5% من صاحب العمل', 'خيارات صناديق متعددة'],
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
    bulletsAr: ['الاستحقاق على 4 سنوات', 'التمارين بعد فترة الهاوية'],
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
    bulletsAr: ['30 يوم إجازة سنوية', 'ترحيل حتى 5 أيام'],
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export const BENEFIT_TO_CATEGORY: Record<string, BenefitCategoryKey> = {
  'Housing Allowance': 'housing',
  'Housing': 'housing',
  'housing': 'housing',
  'Education Allowance': 'schooling',
  'Education': 'schooling',
  'education': 'schooling',
  'schooling': 'schooling',
  'Schooling': 'schooling',
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
    '/employee/schooling': 'schooling',
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