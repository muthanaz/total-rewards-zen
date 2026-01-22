/**
 * Marketplace helper utilities
 * Shared formatting and display logic for marketplace offers
 */

interface DiscountInfo {
  discountPercent?: number | null;
  discountAmount?: number | null;
}

/**
 * Format discount label with positive language
 * "Save 25%" instead of "-25%"
 */
export function formatDiscountLabel(
  offer: DiscountInfo,
  language: 'en' | 'ar' = 'en'
): string | null {
  const { discountPercent, discountAmount } = offer;

  if (discountAmount && discountAmount > 0) {
    return language === 'ar'
      ? `وفر AED ${discountAmount}`
      : `Save AED ${discountAmount}`;
  }

  if (discountPercent && discountPercent > 0) {
    return language === 'ar'
      ? `وفر ${discountPercent}%`
      : `Save ${discountPercent}%`;
  }

  return null;
}

/**
 * Generate contextual microcopy for offer cards
 * Data-driven when possible, with smart fallbacks
 */
export function getOfferMicrocopy(
  offer: {
    rating?: number | null;
    category: string;
    merchant: string;
    discount_percent?: number | null;
  },
  language: 'en' | 'ar' = 'en'
): string {
  const t = (en: string, ar: string) => (language === 'ar' ? ar : en);

  // High rating
  if (offer.rating && offer.rating >= 4.5) {
    return t('Top rated partner', 'شريك عالي التقييم');
  }

  // Great discount
  if (offer.discount_percent && offer.discount_percent >= 25) {
    return t('Best value offer', 'أفضل عرض قيمة');
  }

  // Category-based
  const categoryMicrocopy: Record<string, { en: string; ar: string }> = {
    'Health & Fitness': { en: 'Popular wellness choice', ar: 'خيار صحي شائع' },
    'Wellness': { en: 'Popular wellness choice', ar: 'خيار صحي شائع' },
    'Food & Coffee': { en: 'Local favorite', ar: 'المفضل المحلي' },
    'Food & Dining': { en: 'Local favorite', ar: 'المفضل المحلي' },
    'Family & Parenting': { en: 'Great for families', ar: 'رائع للعائلات' },
    'Family': { en: 'Great for families', ar: 'رائع للعائلات' },
    'Learning & Skills': { en: 'Grow your skills', ar: 'طور مهاراتك' },
    'Learning': { en: 'Grow your skills', ar: 'طور مهاراتك' },
    'Travel & Experiences': { en: 'Adventure awaits', ar: 'المغامرة بانتظارك' },
    'Experiences': { en: 'Adventure awaits', ar: 'المغامرة بانتظارك' },
    'Mobility': { en: 'Smart commute choice', ar: 'خيار تنقل ذكي' },
    'Transport': { en: 'Smart commute choice', ar: 'خيار تنقل ذكي' },
    'Home & Living': { en: 'Home essentials', ar: 'أساسيات المنزل' },
    'Lifestyle & Shopping': { en: 'Trending now', ar: 'الأكثر رواجاً' },
    'Everyday Essentials': { en: 'Daily savings', ar: 'وفورات يومية' },
  };

  const match = categoryMicrocopy[offer.category];
  if (match) {
    return t(match.en, match.ar);
  }

  // Default fallback
  return t('Exclusive partner offer', 'عرض شريك حصري');
}

// Semantic category color tokens (replaces hardcoded colors)
export type CategoryColorToken = 'accent' | 'chart-1' | 'chart-2' | 'chart-3' | 'chart-4' | 'chart-5' | 'chart-6' | 'chart-7';

export interface CategoryStyleConfig {
  icon: string;
  token: CategoryColorToken;
  bgClass: string;
  textClass: string;
  borderClass: string;
  solidBgClass: string;
}

// Semantic category styles using design system tokens
export const SEMANTIC_CATEGORY_STYLES: Record<string, CategoryStyleConfig> = {
  'Everyday Essentials': {
    icon: 'ShoppingBag',
    token: 'chart-5',
    bgClass: 'bg-chart-5/10 dark:bg-chart-5/15',
    textClass: 'text-chart-5',
    borderClass: 'border-chart-5/30',
    solidBgClass: 'bg-chart-5',
  },
  'Food & Coffee': {
    icon: 'Coffee',
    token: 'chart-4',
    bgClass: 'bg-chart-4/10 dark:bg-chart-4/15',
    textClass: 'text-chart-4',
    borderClass: 'border-chart-4/30',
    solidBgClass: 'bg-chart-4',
  },
  'Health & Fitness': {
    icon: 'Activity',
    token: 'chart-6',
    bgClass: 'bg-chart-6/10 dark:bg-chart-6/15',
    textClass: 'text-chart-6',
    borderClass: 'border-chart-6/30',
    solidBgClass: 'bg-chart-6',
  },
  'Family & Parenting': {
    icon: 'Users',
    token: 'chart-2',
    bgClass: 'bg-chart-2/10 dark:bg-chart-2/15',
    textClass: 'text-chart-2',
    borderClass: 'border-chart-2/30',
    solidBgClass: 'bg-chart-2',
  },
  'Learning & Skills': {
    icon: 'BookOpen',
    token: 'chart-3',
    bgClass: 'bg-chart-3/10 dark:bg-chart-3/15',
    textClass: 'text-chart-3',
    borderClass: 'border-chart-3/30',
    solidBgClass: 'bg-chart-3',
  },
  'Home & Living': {
    icon: 'Home',
    token: 'chart-7',
    bgClass: 'bg-chart-7/10 dark:bg-chart-7/15',
    textClass: 'text-chart-7',
    borderClass: 'border-chart-7/30',
    solidBgClass: 'bg-chart-7',
  },
  'Mobility': {
    icon: 'Car',
    token: 'chart-1',
    bgClass: 'bg-chart-1/10 dark:bg-chart-1/15',
    textClass: 'text-chart-1',
    borderClass: 'border-chart-1/30',
    solidBgClass: 'bg-chart-1',
  },
  'Lifestyle & Shopping': {
    icon: 'Sparkles',
    token: 'chart-5',
    bgClass: 'bg-chart-5/10 dark:bg-chart-5/15',
    textClass: 'text-chart-5',
    borderClass: 'border-chart-5/30',
    solidBgClass: 'bg-chart-5',
  },
  'Travel & Experiences': {
    icon: 'Plane',
    token: 'chart-3',
    bgClass: 'bg-chart-3/10 dark:bg-chart-3/15',
    textClass: 'text-chart-3',
    borderClass: 'border-chart-3/30',
    solidBgClass: 'bg-chart-3',
  },
  // Simplified category tab names
  'Wellness': {
    icon: 'Heart',
    token: 'chart-5',
    bgClass: 'bg-chart-5/10 dark:bg-chart-5/15',
    textClass: 'text-chart-5',
    borderClass: 'border-chart-5/30',
    solidBgClass: 'bg-chart-5',
  },
  'Food & Dining': {
    icon: 'Coffee',
    token: 'chart-4',
    bgClass: 'bg-chart-4/10 dark:bg-chart-4/15',
    textClass: 'text-chart-4',
    borderClass: 'border-chart-4/30',
    solidBgClass: 'bg-chart-4',
  },
  'Fitness': {
    icon: 'Activity',
    token: 'chart-6',
    bgClass: 'bg-chart-6/10 dark:bg-chart-6/15',
    textClass: 'text-chart-6',
    borderClass: 'border-chart-6/30',
    solidBgClass: 'bg-chart-6',
  },
  'Family': {
    icon: 'Users',
    token: 'chart-2',
    bgClass: 'bg-chart-2/10 dark:bg-chart-2/15',
    textClass: 'text-chart-2',
    borderClass: 'border-chart-2/30',
    solidBgClass: 'bg-chart-2',
  },
  'Learning': {
    icon: 'BookOpen',
    token: 'chart-3',
    bgClass: 'bg-chart-3/10 dark:bg-chart-3/15',
    textClass: 'text-chart-3',
    borderClass: 'border-chart-3/30',
    solidBgClass: 'bg-chart-3',
  },
  'Transport': {
    icon: 'Car',
    token: 'chart-1',
    bgClass: 'bg-chart-1/10 dark:bg-chart-1/15',
    textClass: 'text-chart-1',
    borderClass: 'border-chart-1/30',
    solidBgClass: 'bg-chart-1',
  },
  'Experiences': {
    icon: 'Plane',
    token: 'chart-3',
    bgClass: 'bg-chart-3/10 dark:bg-chart-3/15',
    textClass: 'text-chart-3',
    borderClass: 'border-chart-3/30',
    solidBgClass: 'bg-chart-3',
  },
};

// Default style for unknown categories
export const DEFAULT_CATEGORY_STYLE: CategoryStyleConfig = {
  icon: 'ShoppingBag',
  token: 'accent',
  bgClass: 'bg-muted',
  textClass: 'text-muted-foreground',
  borderClass: 'border-border',
  solidBgClass: 'bg-muted-foreground',
};

export function getCategoryStyle(category: string): CategoryStyleConfig {
  return SEMANTIC_CATEGORY_STYLES[category] || DEFAULT_CATEGORY_STYLE;
}
