/**
 * bnft. Design System v2.1
 * 
 * This file defines the unified design system constants used across all portals.
 * Typography, spacing, and component patterns are standardized here.
 */

// ============= TYPOGRAPHY SCALE =============
// Based on 8px grid with consistent scaling

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
    hero: 'text-4xl lg:text-5xl font-bold tracking-tight', // 36/48px
    lg: 'text-3xl font-bold tracking-tight', // 30px
    md: 'text-2xl font-bold tracking-tight', // 24px
    sm: 'text-xl font-bold', // 20px
  },
} as const;

// ============= SPACING SYSTEM (8px grid) =============

export const spacing = {
  // Page padding
  page: {
    x: 'px-4 sm:px-6 lg:px-8', // 16/24/32px
    y: 'py-6', // 24px
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
    sm: 'p-1.5 rounded-lg',
    md: 'p-2 rounded-xl',
    lg: 'p-2.5 rounded-xl',
    xl: 'p-3 rounded-2xl',
  },
  
  // Content width constraints
  width: {
    prose: 'max-w-prose', // 65ch
    narrow: 'max-w-2xl', // 672px
    medium: 'max-w-4xl', // 896px
    wide: 'max-w-6xl', // 1152px
    full: 'max-w-full',
  },
} as const;

// ============= STATUS & CONFIDENCE COLORS =============

export const status = {
  confidence: {
    high: { bg: 'bg-success/10', text: 'text-success', border: 'border-success/30', label: 'Measured' },
    medium: { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/30', label: 'Estimated' },
    low: { bg: 'bg-destructive/10', text: 'text-destructive', border: 'border-destructive/30', label: 'Proxy' },
  },
  
  health: {
    excellent: { bg: 'bg-success/10', text: 'text-success', label: 'Excellent' },
    good: { bg: 'bg-accent/10', text: 'text-accent', label: 'Good' },
    attention: { bg: 'bg-warning/10', text: 'text-warning', label: 'Needs Attention' },
    critical: { bg: 'bg-destructive/10', text: 'text-destructive', label: 'Critical' },
  },
  
  priority: {
    P0: { bg: 'bg-destructive/10', text: 'text-destructive', border: 'border-destructive/30' },
    P1: { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/30' },
    P2: { bg: 'bg-info/10', text: 'text-info', border: 'border-info/30' },
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
  },
} as const;

// ============= RESPONSIVE BREAKPOINTS REFERENCE =============
// sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px

export const breakpoints = {
  mobile: '(max-width: 639px)',
  tablet: '(min-width: 640px) and (max-width: 1023px)',
  desktop: '(min-width: 1024px)',
} as const;
