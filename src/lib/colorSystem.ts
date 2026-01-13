// =============================================================================
// UNIFIED COLOR SYSTEM - Re-exports from benefitColors.ts
// =============================================================================
// This file is kept for backward compatibility
// All colors are now defined in benefitColors.ts

export {
  // Benefit colors
  type BenefitColorConfig as CategoryColor,
  BENEFIT_COLORS,
  getBenefitColor,
  getBenefitChartColors,
  getChartColorArray,
  getSidebarIconColor,
  
  // RAG system
  type RAGStatus,
  type RAGConfig,
  RAG_CONFIG,
  RAG_THRESHOLDS,
  getRAGStatus,
  getRAGIndicator,
} from './benefitColors';

// Legacy marketplace colors - kept for compatibility
import { 
  Coffee, Utensils, ShoppingBag, Plane, Users, Briefcase,
  Laptop, Sparkles, Activity, Home, Car, BookOpen, LucideIcon
} from 'lucide-react';

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

export function getMarketplaceBadgeClasses(category: string): string {
  const color = getMarketplaceColor(category);
  return `${color.bgLight} ${color.text} dark:${color.textDark} ${color.border}`;
}

export function getBenefitColorsArray(): string[] {
  return Object.values(MARKETPLACE_COLORS).map(c => `hsl(${c.hsl})`);
}

export function getMarketplaceColorsArray(): string[] {
  return Object.values(MARKETPLACE_COLORS).map(c => `hsl(${c.hsl})`);
}
