// =============================================================================
// UNIFIED COLOR SYSTEM
// =============================================================================
// Single source of truth for all colors across the platform
// Colors chosen for psychological appropriateness, accessibility, and modern aesthetics

import { 
  Home, GraduationCap, Heart, Car, Dumbbell, PiggyBank, 
  BookOpen, TrendingUp, Award, Calendar, 
  Coffee, Utensils, ShoppingBag, Plane, Users, Briefcase,
  Laptop, Sparkles, Zap, Activity, LucideIcon
} from 'lucide-react';

// =============================================================================
// BENEFIT CATEGORY COLORS
// =============================================================================
// Psychology-based color choices:
// - Blue: Trust, stability, security → Housing
// - Purple: Wisdom, creativity, education → Education/Schooling
// - Rose: Care, compassion, health → Health Insurance
// - Amber: Energy, movement, warmth → Transport
// - Teal: Balance, calm, wellness → Wellbeing
// - Emerald: Growth, prosperity, money → Financial
// - Indigo: Knowledge, depth, learning → Learning
// - Orange: Enthusiasm, success, rewards → Bonus/Rewards
// - Violet: Premium, luxury, ownership → Equity
// - Cyan: Freedom, clarity, time → Leave/Time Off

export interface CategoryColor {
  key: string;
  label: string;
  // HSL values for CSS variables
  hsl: string;
  // Tailwind class names
  bg: string;
  bgLight: string;
  text: string;
  textDark: string;
  border: string;
  gradient: string;
  // Icon component
  icon: LucideIcon;
}

export const BENEFIT_COLORS: Record<string, CategoryColor> = {
  housing: {
    key: 'housing',
    label: 'Housing',
    hsl: '210 100% 50%',
    bg: 'bg-sky-500',
    bgLight: 'bg-sky-500/10',
    text: 'text-sky-600',
    textDark: 'text-sky-400',
    border: 'border-sky-500/20',
    gradient: 'from-sky-500 to-blue-600',
    icon: Home,
  },
  education: {
    key: 'education',
    label: 'Education',
    hsl: '270 70% 55%',
    bg: 'bg-purple-500',
    bgLight: 'bg-purple-500/10',
    text: 'text-purple-600',
    textDark: 'text-purple-400',
    border: 'border-purple-500/20',
    gradient: 'from-purple-500 to-violet-600',
    icon: GraduationCap,
  },
  health: {
    key: 'health',
    label: 'Health',
    hsl: '350 80% 55%',
    bg: 'bg-rose-500',
    bgLight: 'bg-rose-500/10',
    text: 'text-rose-600',
    textDark: 'text-rose-400',
    border: 'border-rose-500/20',
    gradient: 'from-rose-500 to-pink-600',
    icon: Heart,
  },
  transport: {
    key: 'transport',
    label: 'Transport',
    hsl: '35 95% 50%',
    bg: 'bg-amber-500',
    bgLight: 'bg-amber-500/10',
    text: 'text-amber-600',
    textDark: 'text-amber-400',
    border: 'border-amber-500/20',
    gradient: 'from-amber-500 to-orange-500',
    icon: Car,
  },
  wellbeing: {
    key: 'wellbeing',
    label: 'Wellbeing',
    hsl: '174 60% 45%',
    bg: 'bg-teal-500',
    bgLight: 'bg-teal-500/10',
    text: 'text-teal-600',
    textDark: 'text-teal-400',
    border: 'border-teal-500/20',
    gradient: 'from-teal-500 to-emerald-500',
    icon: Dumbbell,
  },
  financial: {
    key: 'financial',
    label: 'Financial',
    hsl: '155 75% 40%',
    bg: 'bg-emerald-500',
    bgLight: 'bg-emerald-500/10',
    text: 'text-emerald-600',
    textDark: 'text-emerald-400',
    border: 'border-emerald-500/20',
    gradient: 'from-emerald-500 to-green-600',
    icon: PiggyBank,
  },
  learning: {
    key: 'learning',
    label: 'Learning',
    hsl: '235 80% 60%',
    bg: 'bg-indigo-500',
    bgLight: 'bg-indigo-500/10',
    text: 'text-indigo-600',
    textDark: 'text-indigo-400',
    border: 'border-indigo-500/20',
    gradient: 'from-indigo-500 to-blue-600',
    icon: BookOpen,
  },
  rewards: {
    key: 'rewards',
    label: 'Bonus',
    hsl: '25 95% 55%',
    bg: 'bg-orange-500',
    bgLight: 'bg-orange-500/10',
    text: 'text-orange-600',
    textDark: 'text-orange-400',
    border: 'border-orange-500/20',
    gradient: 'from-orange-500 to-red-500',
    icon: Award,
  },
  equity: {
    key: 'equity',
    label: 'Equity',
    hsl: '280 70% 55%',
    bg: 'bg-violet-500',
    bgLight: 'bg-violet-500/10',
    text: 'text-violet-600',
    textDark: 'text-violet-400',
    border: 'border-violet-500/20',
    gradient: 'from-violet-500 to-purple-600',
    icon: TrendingUp,
  },
  timeoff: {
    key: 'timeoff',
    label: 'Leave',
    hsl: '190 90% 45%',
    bg: 'bg-cyan-500',
    bgLight: 'bg-cyan-500/10',
    text: 'text-cyan-600',
    textDark: 'text-cyan-400',
    border: 'border-cyan-500/20',
    gradient: 'from-cyan-500 to-sky-500',
    icon: Calendar,
  },
};

// =============================================================================
// MARKETPLACE CATEGORY COLORS
// =============================================================================
// Colors chosen to match the nature of each category

export interface MarketplaceCategoryColor {
  key: string;
  label: string;
  hsl: string;
  bg: string;
  bgLight: string;
  text: string;
  textDark: string;
  border: string;
  gradient: string;
  icon: LucideIcon;
}

export const MARKETPLACE_COLORS: Record<string, MarketplaceCategoryColor> = {
  'Everyday Essentials': {
    key: 'everyday-essentials',
    label: 'Everyday Essentials',
    hsl: '220 70% 50%',
    bg: 'bg-blue-500',
    bgLight: 'bg-blue-500/10',
    text: 'text-blue-600',
    textDark: 'text-blue-400',
    border: 'border-blue-500/25',
    gradient: 'from-blue-500 to-indigo-500',
    icon: ShoppingBag,
  },
  'Food & Coffee': {
    key: 'food-coffee',
    label: 'Food & Coffee',
    hsl: '25 85% 50%',
    bg: 'bg-orange-500',
    bgLight: 'bg-orange-500/10',
    text: 'text-orange-600',
    textDark: 'text-orange-400',
    border: 'border-orange-500/25',
    gradient: 'from-orange-500 to-amber-500',
    icon: Coffee,
  },
  'Health & Fitness': {
    key: 'health-fitness',
    label: 'Health & Fitness',
    hsl: '350 75% 55%',
    bg: 'bg-rose-500',
    bgLight: 'bg-rose-500/10',
    text: 'text-rose-600',
    textDark: 'text-rose-400',
    border: 'border-rose-500/25',
    gradient: 'from-rose-500 to-pink-500',
    icon: Activity,
  },
  'Family & Parenting': {
    key: 'family-parenting',
    label: 'Family & Parenting',
    hsl: '330 70% 55%',
    bg: 'bg-pink-500',
    bgLight: 'bg-pink-500/10',
    text: 'text-pink-600',
    textDark: 'text-pink-400',
    border: 'border-pink-500/25',
    gradient: 'from-pink-500 to-rose-500',
    icon: Users,
  },
  'Learning & Skills': {
    key: 'learning-skills',
    label: 'Learning & Skills',
    hsl: '235 75% 58%',
    bg: 'bg-indigo-500',
    bgLight: 'bg-indigo-500/10',
    text: 'text-indigo-600',
    textDark: 'text-indigo-400',
    border: 'border-indigo-500/25',
    gradient: 'from-indigo-500 to-violet-500',
    icon: BookOpen,
  },
  'Home & Living': {
    key: 'home-living',
    label: 'Home & Living',
    hsl: '210 90% 50%',
    bg: 'bg-sky-500',
    bgLight: 'bg-sky-500/10',
    text: 'text-sky-600',
    textDark: 'text-sky-400',
    border: 'border-sky-500/25',
    gradient: 'from-sky-500 to-blue-500',
    icon: Home,
  },
  'Mobility': {
    key: 'mobility',
    label: 'Mobility',
    hsl: '35 90% 50%',
    bg: 'bg-amber-500',
    bgLight: 'bg-amber-500/10',
    text: 'text-amber-600',
    textDark: 'text-amber-400',
    border: 'border-amber-500/25',
    gradient: 'from-amber-500 to-yellow-500',
    icon: Car,
  },
  'Lifestyle & Shopping': {
    key: 'lifestyle-shopping',
    label: 'Lifestyle & Shopping',
    hsl: '280 65% 55%',
    bg: 'bg-violet-500',
    bgLight: 'bg-violet-500/10',
    text: 'text-violet-600',
    textDark: 'text-violet-400',
    border: 'border-violet-500/25',
    gradient: 'from-violet-500 to-purple-500',
    icon: Sparkles,
  },
  'Travel & Experiences': {
    key: 'travel-experiences',
    label: 'Travel & Experiences',
    hsl: '174 65% 45%',
    bg: 'bg-teal-500',
    bgLight: 'bg-teal-500/10',
    text: 'text-teal-600',
    textDark: 'text-teal-400',
    border: 'border-teal-500/25',
    gradient: 'from-teal-500 to-emerald-500',
    icon: Plane,
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function getBenefitColor(key: string): CategoryColor {
  const normalizedKey = key.toLowerCase().replace(/[^a-z]/g, '');
  
  // Map common variations
  const keyMap: Record<string, string> = {
    housing: 'housing',
    housingallowance: 'housing',
    education: 'education',
    educationallowance: 'education',
    schooling: 'education',
    health: 'health',
    healthinsurance: 'health',
    transport: 'transport',
    transportmobility: 'transport',
    mobility: 'transport',
    wellbeing: 'wellbeing',
    wellbeingprogram: 'wellbeing',
    financial: 'financial',
    financialplanning: 'financial',
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

  const mappedKey = keyMap[normalizedKey] || 'wellbeing';
  return BENEFIT_COLORS[mappedKey] || BENEFIT_COLORS.wellbeing;
}

export function getMarketplaceColor(category: string): MarketplaceCategoryColor {
  return MARKETPLACE_COLORS[category] || {
    key: 'default',
    label: category,
    hsl: '220 14% 50%',
    bg: 'bg-slate-500',
    bgLight: 'bg-slate-500/10',
    text: 'text-slate-600',
    textDark: 'text-slate-400',
    border: 'border-slate-500/25',
    gradient: 'from-slate-500 to-gray-500',
    icon: ShoppingBag,
  };
}

// Get color classes for category badge in marketplace
export function getMarketplaceBadgeClasses(category: string): string {
  const color = getMarketplaceColor(category);
  return `${color.bgLight} ${color.text} dark:${color.textDark} ${color.border}`;
}

// Get all benefit colors as array for charts
export function getBenefitColorsArray(): string[] {
  return Object.values(BENEFIT_COLORS).map(c => `hsl(${c.hsl})`);
}

// Get all marketplace colors as array for charts
export function getMarketplaceColorsArray(): string[] {
  return Object.values(MARKETPLACE_COLORS).map(c => `hsl(${c.hsl})`);
}
