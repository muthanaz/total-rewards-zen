// =============================================================================
// COLOR UTILITIES - Re-exports from unified color system
// =============================================================================
// This file re-exports from benefitColors.ts for backward compatibility

export {
  // RAG system
  type RAGStatus,
  type RAGConfig as RAGIndicator,
  RAG_THRESHOLDS,
  RAG_CONFIG as RAG_INDICATORS,
  getRAGStatus,
  getRAGIndicator,
  getProgressColorClass,
  
  // Benefit colors
  type BenefitColorConfig,
  type BenefitKey,
  BENEFIT_COLORS,
  getBenefitColor,
  getBenefitColor as getBenefitColorByKey,
  getBenefitChartColors,
  getChartColorArray,
  getSidebarIconColor,
} from './benefitColors';

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
