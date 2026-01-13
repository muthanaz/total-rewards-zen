// Benefit Category Color System - Consistent across the entire platform
// These colors are used in sidebar icons, benefit cards, charts, and badges

import { 
  Home, GraduationCap, Heart, Car, Dumbbell, PiggyBank, 
  BookOpen, Gift, TrendingUp, Award, Plane, Shield, 
  Calendar, Users, Briefcase, Wallet
} from 'lucide-react';

// Primary Benefit Categories with consistent colors (HSL values matching index.css tokens)
export const BENEFIT_CATEGORIES = {
  // Housing & Living - Blue
  housing: {
    label: 'Housing & Living',
    color: 'hsl(199, 89%, 48%)',
    bgClass: 'bg-blue-500',
    bgLightClass: 'bg-blue-500/10',
    textClass: 'text-blue-600 dark:text-blue-400',
    borderClass: 'border-blue-500/20',
    icon: Home,
  },
  // Education & Family - Purple
  education: {
    label: 'Education & Family',
    color: 'hsl(262, 52%, 55%)',
    bgClass: 'bg-purple-500',
    bgLightClass: 'bg-purple-500/10',
    textClass: 'text-purple-600 dark:text-purple-400',
    borderClass: 'border-purple-500/20',
    icon: GraduationCap,
  },
  // Health & Protection - Rose
  health: {
    label: 'Health & Protection',
    color: 'hsl(340, 65%, 55%)',
    bgClass: 'bg-rose-500',
    bgLightClass: 'bg-rose-500/10',
    textClass: 'text-rose-600 dark:text-rose-400',
    borderClass: 'border-rose-500/20',
    icon: Heart,
  },
  // Transport & Mobility - Amber
  transport: {
    label: 'Transport & Mobility',
    color: 'hsl(38, 92%, 50%)',
    bgClass: 'bg-amber-500',
    bgLightClass: 'bg-amber-500/10',
    textClass: 'text-amber-600 dark:text-amber-400',
    borderClass: 'border-amber-500/20',
    icon: Car,
  },
  // Wellbeing - Teal (Primary accent)
  wellbeing: {
    label: 'Wellbeing',
    color: 'hsl(174, 60%, 45%)',
    bgClass: 'bg-teal-500',
    bgLightClass: 'bg-teal-500/10',
    textClass: 'text-teal-600 dark:text-teal-400',
    borderClass: 'border-teal-500/20',
    icon: Dumbbell,
  },
  // Financial & Wealth - Emerald
  financial: {
    label: 'Financial & Wealth',
    color: 'hsl(160, 84%, 39%)',
    bgClass: 'bg-emerald-500',
    bgLightClass: 'bg-emerald-500/10',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    borderClass: 'border-emerald-500/20',
    icon: PiggyBank,
  },
  // Learning & Growth - Indigo
  learning: {
    label: 'Learning & Growth',
    color: 'hsl(234, 89%, 63%)',
    bgClass: 'bg-indigo-500',
    bgLightClass: 'bg-indigo-500/10',
    textClass: 'text-indigo-600 dark:text-indigo-400',
    borderClass: 'border-indigo-500/20',
    icon: BookOpen,
  },
  // Rewards & Bonus - Orange
  rewards: {
    label: 'Rewards & Bonus',
    color: 'hsl(24, 75%, 55%)',
    bgClass: 'bg-orange-500',
    bgLightClass: 'bg-orange-500/10',
    textClass: 'text-orange-600 dark:text-orange-400',
    borderClass: 'border-orange-500/20',
    icon: Award,
  },
  // Equity & Ownership - Violet
  equity: {
    label: 'Equity & Ownership',
    color: 'hsl(280, 55%, 55%)',
    bgClass: 'bg-violet-500',
    bgLightClass: 'bg-violet-500/10',
    textClass: 'text-violet-600 dark:text-violet-400',
    borderClass: 'border-violet-500/20',
    icon: TrendingUp,
  },
  // Time Off - Cyan
  timeoff: {
    label: 'Time Off',
    color: 'hsl(189, 94%, 43%)',
    bgClass: 'bg-cyan-500',
    bgLightClass: 'bg-cyan-500/10',
    textClass: 'text-cyan-600 dark:text-cyan-400',
    borderClass: 'border-cyan-500/20',
    icon: Calendar,
  },
} as const;

// Map benefit names to categories
export const BENEFIT_TO_CATEGORY: Record<string, keyof typeof BENEFIT_CATEGORIES> = {
  'Housing Allowance': 'housing',
  'housing': 'housing',
  'Education Allowance': 'education',
  'schooling': 'education',
  'Health Insurance': 'health',
  'health': 'health',
  'Transport & Mobility': 'transport',
  'transport': 'transport',
  'Flight Tickets': 'transport',
  'Wellbeing Program': 'wellbeing',
  'wellbeing': 'wellbeing',
  'Financial Planning': 'financial',
  'financial': 'financial',
  'Savings Plan': 'financial',
  'Learning & Development': 'learning',
  'learning': 'learning',
  'Annual Bonus': 'rewards',
  'bonus': 'rewards',
  'Equity Options': 'equity',
  'equity': 'equity',
  'Leave Management': 'timeoff',
  'leave': 'timeoff',
};

// Get category for a benefit
export function getBenefitCategory(benefitName: string): typeof BENEFIT_CATEGORIES[keyof typeof BENEFIT_CATEGORIES] {
  const key = BENEFIT_TO_CATEGORY[benefitName] || BENEFIT_TO_CATEGORY[benefitName.toLowerCase()];
  return BENEFIT_CATEGORIES[key] || BENEFIT_CATEGORIES.wellbeing; // Default to accent color
}

// Get color classes for sidebar icons
export function getSidebarIconColor(path: string): string {
  const pathMap: Record<string, keyof typeof BENEFIT_CATEGORIES> = {
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

// Export benefit type to category mapping for legacy support
export const BENEFIT_TYPE_TO_CATEGORY: Record<string, keyof typeof BENEFIT_CATEGORIES> = {
  cash_allowances: 'financial',
  health_protection: 'health',
  time_off_flex: 'timeoff',
  growth_career: 'learning',
  wealth_ownership: 'equity',
  wellbeing: 'wellbeing',
};

// Get all colors as an array for charts
export function getCategoryColorsArray(): string[] {
  return Object.values(BENEFIT_CATEGORIES).map(cat => cat.color);
}
