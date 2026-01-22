/**
 * bnft. Design System v3.0
 * 
 * Comprehensive design tokens and patterns for premium, consistent UI.
 * All values follow an 8px grid and semantic naming.
 */

// ============= TYPOGRAPHY SCALE =============

export const typography = {
  // Display - Hero sections, page titles
  display: {
    xl: 'text-4xl lg:text-5xl font-display font-bold tracking-tight', // 36/48px
    lg: 'text-3xl lg:text-4xl font-display font-bold tracking-tight', // 30/36px
  },
  
  // Headings - Section titles, card headers
  heading: {
    h1: 'text-2xl lg:text-3xl font-display font-bold tracking-tight', // 24/30px
    h2: 'text-xl lg:text-2xl font-display font-semibold tracking-tight', // 20/24px
    h3: 'text-lg font-display font-semibold', // 18px
    h4: 'text-base font-display font-semibold', // 16px
  },
  
  // Body - Main content
  body: {
    lg: 'text-base leading-relaxed', // 16px
    md: 'text-sm leading-relaxed', // 14px
    sm: 'text-xs leading-relaxed', // 12px
  },
  
  // Caption - Labels, metadata
  caption: {
    md: 'text-sm text-muted-foreground', // 14px
    sm: 'text-xs text-muted-foreground', // 12px
    xs: 'text-[10px] text-muted-foreground', // 10px
  },
  
  // Stat - Numeric values
  stat: {
    hero: 'text-4xl lg:text-5xl font-bold tracking-tight tabular-nums', // 36/48px
    lg: 'text-3xl font-bold tracking-tight tabular-nums', // 30px
    md: 'text-2xl font-bold tracking-tight tabular-nums', // 24px
    sm: 'text-xl font-bold tabular-nums', // 20px
    xs: 'text-lg font-semibold tabular-nums', // 18px
  },
} as const;

// ============= SPACING SYSTEM (8px grid) =============

export const spacing = {
  // Page padding
  page: {
    x: 'px-4 sm:px-6 lg:px-8', // 16/24/32px
    y: 'py-6', // 24px
    all: 'p-4 sm:p-6 lg:p-8',
  },
  
  // Section spacing
  section: {
    gap: 'space-y-6', // 24px between sections
    gapCompact: 'space-y-4', // 16px
    gapLarge: 'space-y-8', // 32px
  },
  
  // Card internal padding
  card: {
    padding: 'p-6', // 24px
    paddingCompact: 'p-4', // 16px
    paddingTight: 'p-3', // 12px
    paddingLarge: 'p-8', // 32px
  },
  
  // Grid gaps
  grid: {
    gap: 'gap-6', // 24px
    gapCompact: 'gap-4', // 16px
    gapTight: 'gap-3', // 12px
    gapLarge: 'gap-8', // 32px
  },
  
  // Inline spacing
  inline: {
    xs: 'gap-1', // 4px
    sm: 'gap-2', // 8px
    md: 'gap-3', // 12px
    lg: 'gap-4', // 16px
    xl: 'gap-6', // 24px
  },

  // Stack spacing
  stack: {
    xs: 'space-y-1', // 4px
    sm: 'space-y-2', // 8px
    md: 'space-y-3', // 12px
    lg: 'space-y-4', // 16px
    xl: 'space-y-6', // 24px
  },
} as const;

// ============= COMPONENT PATTERNS =============

export const patterns = {
  // Card variants
  card: {
    base: 'rounded-xl border border-border/40 bg-card shadow-sm',
    elevated: 'rounded-xl border border-border/40 bg-card shadow-md hover:shadow-lg transition-shadow',
    interactive: 'rounded-xl border border-border/40 bg-card shadow-sm hover:border-accent/50 hover:shadow-md transition-all cursor-pointer',
    gradient: 'rounded-xl border border-border/40 bg-gradient-to-br from-card to-accent/5 shadow-sm',
    glass: 'rounded-xl border border-border/30 bg-card/95 backdrop-blur-xl shadow-md',
    selected: 'rounded-xl border-2 border-accent bg-card shadow-md ring-2 ring-accent/20',
    muted: 'rounded-xl border border-border/30 bg-muted/30 shadow-sm',
  },
  
  // Badge/chip variants
  badge: {
    success: 'bg-success/10 text-success border-success/30',
    warning: 'bg-warning/10 text-warning border-warning/30',
    destructive: 'bg-destructive/10 text-destructive border-destructive/30',
    info: 'bg-info/10 text-info border-info/30',
    accent: 'bg-accent/10 text-accent border-accent/30',
    muted: 'bg-muted text-muted-foreground border-border',
    primary: 'bg-primary/10 text-primary border-primary/30',
  },
  
  // Icon container
  icon: {
    xs: 'p-1 rounded-md',
    sm: 'p-1.5 rounded-lg',
    md: 'p-2 rounded-xl',
    lg: 'p-2.5 rounded-xl',
    xl: 'p-3 rounded-2xl',
  },

  // Icon colors for benefit categories
  iconColor: {
    housing: 'bg-chart-4/10 text-chart-4',
    health: 'bg-destructive/10 text-destructive',
    education: 'bg-chart-3/10 text-chart-3',
    transport: 'bg-info/10 text-info',
    wellbeing: 'bg-success/10 text-success',
    financial: 'bg-warning/10 text-warning',
    leave: 'bg-chart-2/10 text-chart-2',
    general: 'bg-accent/10 text-accent',
  },
  
  // Content width constraints
  width: {
    prose: 'max-w-prose', // 65ch
    narrow: 'max-w-2xl', // 672px
    medium: 'max-w-4xl', // 896px
    wide: 'max-w-6xl', // 1152px
    full: 'max-w-full',
  },

  // Table styles
  table: {
    header: 'bg-muted/50 text-muted-foreground font-medium text-xs uppercase tracking-wide',
    row: 'border-b border-border/50 hover:bg-muted/30 transition-colors',
    cell: 'py-3 px-4',
    cellCompact: 'py-2 px-3',
    numeric: 'text-end tabular-nums',
  },

  // Form elements
  form: {
    group: 'space-y-2',
    label: 'text-sm font-medium text-foreground',
    hint: 'text-xs text-muted-foreground mt-1',
    error: 'text-xs text-destructive mt-1',
    input: 'h-10 border-border focus:border-accent focus:ring-accent',
  },
} as const;

// ============= STATUS & SEMANTIC COLORS =============

export const status = {
  confidence: {
    high: { bg: 'bg-success/10', text: 'text-success', border: 'border-success/30', label: 'Measured', labelAr: 'مُقاس' },
    medium: { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/30', label: 'Estimated', labelAr: 'تقديري' },
    low: { bg: 'bg-destructive/10', text: 'text-destructive', border: 'border-destructive/30', label: 'Proxy', labelAr: 'تقريبي' },
  },
  
  health: {
    excellent: { bg: 'bg-success/10', text: 'text-success', label: 'Excellent', labelAr: 'ممتاز' },
    good: { bg: 'bg-accent/10', text: 'text-accent', label: 'Good', labelAr: 'جيد' },
    attention: { bg: 'bg-warning/10', text: 'text-warning', label: 'Needs Attention', labelAr: 'يحتاج اهتمام' },
    critical: { bg: 'bg-destructive/10', text: 'text-destructive', label: 'Critical', labelAr: 'حرج' },
  },
  
  priority: {
    P0: { bg: 'bg-destructive/10', text: 'text-destructive', border: 'border-destructive/30', label: 'Critical' },
    P1: { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/30', label: 'High' },
    P2: { bg: 'bg-info/10', text: 'text-info', border: 'border-info/30', label: 'Medium' },
    P3: { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border', label: 'Low' },
  },

  request: {
    pending: { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/30', label: 'Pending', labelAr: 'معلق' },
    approved: { bg: 'bg-success/10', text: 'text-success', border: 'border-success/30', label: 'Approved', labelAr: 'موافق عليه' },
    rejected: { bg: 'bg-destructive/10', text: 'text-destructive', border: 'border-destructive/30', label: 'Rejected', labelAr: 'مرفوض' },
    in_review: { bg: 'bg-info/10', text: 'text-info', border: 'border-info/30', label: 'In Review', labelAr: 'قيد المراجعة' },
    draft: { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border', label: 'Draft', labelAr: 'مسودة' },
    completed: { bg: 'bg-accent/10', text: 'text-accent', border: 'border-accent/30', label: 'Completed', labelAr: 'مكتمل' },
  },

  sync: {
    success: { bg: 'bg-success/10', text: 'text-success', label: 'Success' },
    running: { bg: 'bg-info/10', text: 'text-info', label: 'Running' },
    partial: { bg: 'bg-warning/10', text: 'text-warning', label: 'Partial' },
    failed: { bg: 'bg-destructive/10', text: 'text-destructive', label: 'Failed' },
    pending: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Pending' },
  },
} as const;

// ============= GRID LAYOUTS =============

export const grids = {
  // Metric grids
  metrics: {
    2: 'grid grid-cols-1 sm:grid-cols-2',
    3: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid grid-cols-2 lg:grid-cols-4',
    5: 'grid grid-cols-2 lg:grid-cols-5',
    6: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
  },
  
  // Content grids
  content: {
    twoCol: 'grid grid-cols-1 lg:grid-cols-2',
    threeCol: 'grid grid-cols-1 lg:grid-cols-3',
    sidebar: 'grid grid-cols-1 lg:grid-cols-[2fr_1fr]',
    sidebarReverse: 'grid grid-cols-1 lg:grid-cols-[1fr_2fr]',
    asymmetric: 'grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr]',
  },

  // Card grids
  cards: {
    auto: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    fixed2: 'grid grid-cols-1 md:grid-cols-2',
    fixed3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    fixed4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  },
} as const;

// ============= ANIMATION PRESETS =============

export const animations = {
  fadeIn: 'animate-fade-in',
  slideIn: 'animate-slide-in',
  scaleIn: 'animate-scale-in',
  pulseGlow: 'animate-pulse-glow',
  
  // Transition utilities
  transition: {
    fast: 'transition-all duration-150',
    normal: 'transition-all duration-200',
    slow: 'transition-all duration-300',
    colors: 'transition-colors duration-150',
    shadow: 'transition-shadow duration-200',
  },

  // Framer motion presets
  motion: {
    fadeIn: { initial: { opacity: 0 }, animate: { opacity: 1 } },
    slideUp: { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } },
    slideIn: { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 } },
    scale: { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 } },
  },
} as const;

// ============= BORDER RADIUS =============

export const radius = {
  none: 'rounded-none',
  sm: 'rounded-sm', // 4px
  md: 'rounded-md', // 6px
  lg: 'rounded-lg', // 10px - default
  xl: 'rounded-xl', // 12px - cards
  '2xl': 'rounded-2xl', // 16px - hero
  full: 'rounded-full', // pills, avatars
} as const;

// ============= SHADOWS =============

export const shadows = {
  none: 'shadow-none',
  xs: 'shadow-xs',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  glow: 'shadow-glow',
} as const;

// ============= RESPONSIVE BREAKPOINTS =============

export const breakpoints = {
  mobile: '(max-width: 639px)',
  tablet: '(min-width: 640px) and (max-width: 1023px)',
  desktop: '(min-width: 1024px)',
  wide: '(min-width: 1280px)',
} as const;

// ============= Z-INDEX SCALE =============

export const zIndex = {
  base: 'z-0',
  dropdown: 'z-10',
  sticky: 'z-20',
  fixed: 'z-30',
  modal: 'z-40',
  popover: 'z-50',
  tooltip: 'z-50',
  toast: 'z-[100]',
} as const;

// ============= UTILITY FUNCTIONS =============

/**
 * Combine multiple class patterns with spacing
 */
export function cx(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Get semantic status styling
 */
export function getStatusStyle(
  type: keyof typeof status,
  value: string
): { bg: string; text: string; border?: string; label: string } {
  const statusMap = status[type] as Record<string, { bg: string; text: string; border?: string; label: string }>;
  return statusMap[value] || { bg: 'bg-muted', text: 'text-muted-foreground', label: value };
}

/**
 * Get icon color for benefit category
 */
export function getCategoryIconColor(category: string): string {
  const colorMap: Record<string, string> = {
    housing: patterns.iconColor.housing,
    health: patterns.iconColor.health,
    education: patterns.iconColor.education,
    transport: patterns.iconColor.transport,
    wellbeing: patterns.iconColor.wellbeing,
    financial: patterns.iconColor.financial,
    leave: patterns.iconColor.leave,
  };
  return colorMap[category.toLowerCase()] || patterns.iconColor.general;
}
