/**
 * UI Consistency Checklist
 * 
 * Standardized patterns enforced across all bnft pages.
 * Use this as a reference when building or auditing pages.
 */

export const UI_CONSISTENCY_CHECKLIST = {
  /**
   * PAGE STRUCTURE
   * Every page MUST follow this structure:
   */
  pageStructure: {
    '1_header': {
      component: 'PageHeader',
      required: true,
      props: ['title', 'description', 'icon'],
      optional: ['badge', 'confidenceBadge', 'actions'],
      notes: 'Use semantic icon colors from design system',
    },
    '2_summary': {
      component: 'SummaryStatsCard grid',
      required: true,
      layout: '2x2 on mobile, 4 columns on desktop',
      variants: ['primary', 'utilized', 'remaining', 'utilization'],
      notes: 'Always show: Value, Utilized, Remaining, Utilization %',
    },
    '3_highlights': {
      component: 'PolicyHighlightsCard',
      required: true,
      props: ['title', 'policies', 'category'],
      notes: 'Max 6 bullet points, action button placement',
    },
    '4_howItWorks': {
      component: 'Card with numbered steps',
      required: 'recommended',
      layout: '3 columns on desktop',
      notes: 'Use accent-colored step numbers (1, 2, 3)',
    },
    '5_insights': {
      component: 'BenefitPageInsights',
      required: 'recommended',
      notes: 'Show tips, warnings, timeline info based on utilization',
    },
    '6_categoryContent': {
      component: 'Custom per category',
      required: false,
      notes: 'Provider directories, listings, calculators etc.',
    },
    '7_crossLinks': {
      component: 'BenefitCrossLinks',
      required: true,
      notes: 'Links to claims/requests and full policy',
    },
  },

  /**
   * SPACING & LAYOUT
   */
  spacing: {
    pageGap: 'space-y-6',
    sectionGap: 'space-y-4',
    cardPadding: 'p-4 or p-6',
    gridGap: 'gap-3 or gap-4',
    mobileColumns: 'grid-cols-2',
    desktopColumns: 'md:grid-cols-4 or lg:grid-cols-4',
  },

  /**
   * TYPOGRAPHY
   */
  typography: {
    pageTitle: 'text-2xl font-display font-bold',
    sectionTitle: 'text-base font-display',
    cardTitle: 'text-base font-display',
    bodyText: 'text-sm',
    smallText: 'text-xs',
    mutedText: 'text-muted-foreground',
  },

  /**
   * COLORS (semantic tokens only)
   */
  colors: {
    primary: 'from-accent to-accent/80',
    success: 'text-success bg-success/10',
    warning: 'text-warning bg-warning/10',
    destructive: 'text-destructive bg-destructive/10',
    muted: 'text-muted-foreground bg-muted',
    charts: ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5', 'chart-6', 'chart-7'],
  },

  /**
   * BADGES & CHIPS
   */
  badges: {
    status: {
      active: 'bg-success/10 text-success border-0',
      pending: 'bg-warning/10 text-warning border-0',
      completed: 'bg-success/10 text-success border-0',
      rejected: 'bg-destructive/10 text-destructive border-0',
    },
    variant: {
      default: 'variant="outline"',
      secondary: 'variant="secondary"',
    },
  },

  /**
   * EMPTY STATES
   */
  emptyStates: {
    component: 'ZeroState or NoData',
    required: ['icon', 'title', 'description'],
    optional: ['action (CTA button)'],
    notes: 'Use contextual messaging, not generic "No data"',
  },

  /**
   * RTL SUPPORT
   */
  rtl: {
    flexDirection: 'isRTL && "flex-row-reverse"',
    textAlign: 'isRTL && "text-right"',
    margins: 'Use logical properties (ms-*, me-*)',
    numbers: 'Keep Western digits (0-9)',
    charts: 'Keep LTR orientation',
  },

  /**
   * ANIMATIONS
   */
  animations: {
    pageEntrance: 'animate-fade-in',
    cardHover: 'transition-all duration-300',
    progressBars: 'Use Progress component with h-1.5 or h-2',
  },
};

/**
 * Validate a page structure against the checklist
 */
export function auditPageStructure(pageName: string, elements: string[]): {
  score: number;
  missing: string[];
  recommendations: string[];
} {
  const required = [
    'PageHeader',
    'SummaryStatsCard',
    'PolicyHighlightsCard',
    'BenefitCrossLinks',
  ];
  
  const recommended = [
    'HowItWorks section',
    'BenefitPageInsights',
  ];
  
  const missing = required.filter(r => !elements.includes(r));
  const missingRecommended = recommended.filter(r => !elements.includes(r));
  
  const score = Math.round(
    ((required.length - missing.length) / required.length) * 100
  );
  
  return {
    score,
    missing,
    recommendations: missingRecommended.map(m => `Consider adding: ${m}`),
  };
}

/**
 * Standard icon gradient classes by category
 */
export const CATEGORY_ICON_GRADIENTS: Record<string, string> = {
  housing: 'from-accent to-accent/80 shadow-accent/25',
  health: 'from-chart-5 to-chart-5/80 shadow-chart-5/25',
  schooling: 'from-chart-4 to-chart-4/80 shadow-chart-4/25',
  transport: 'from-chart-2 to-chart-2/80 shadow-chart-2/25',
  leave: 'from-info to-info/80 shadow-info/25',
  learning: 'from-chart-3 to-chart-3/80 shadow-chart-3/25',
  wellbeing: 'from-chart-6 to-chart-6/80 shadow-chart-6/25',
  financial: 'from-accent to-accent/80 shadow-accent/25',
  equity: 'from-chart-3 to-chart-3/80 shadow-chart-3/25',
  bonus: 'from-chart-4 to-chart-4/80 shadow-chart-4/25',
  gratuity: 'from-success to-success/80 shadow-success/25',
};

/**
 * Standard SummaryStatsCard configuration for benefit pages
 */
export interface BenefitSummaryConfig {
  annualValue: number;
  utilized: number;
  labels?: {
    annual?: string;
    utilized?: string;
    remaining?: string;
    utilization?: string;
  };
  formulas?: {
    annual?: string;
    utilized?: string;
    remaining?: string;
    utilization?: string;
  };
  dataSources?: {
    annual?: string;
    utilized?: string;
    remaining?: string;
    utilization?: string;
  };
}

export function createBenefitSummaryConfig(
  annualValue: number,
  utilized: number,
  category: string
): BenefitSummaryConfig {
  return {
    annualValue,
    utilized,
    labels: {
      annual: 'Annual Value',
      utilized: 'Utilized',
      remaining: 'Remaining',
      utilization: 'Utilization',
    },
    formulas: {
      annual: `Total annual ${category.toLowerCase()} value`,
      utilized: `Total ${category.toLowerCase()} usage YTD`,
      remaining: 'Annual Value - Utilized',
      utilization: '(Utilized / Value) × 100',
    },
    dataSources: {
      annual: 'HR Policy',
      utilized: 'Benefits System',
      remaining: 'System',
      utilization: 'System',
    },
  };
}
