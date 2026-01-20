// Chart color palette - consistent, accessible colors for data visualization
// Uses CSS custom properties for seamless light/dark mode support

// Semantic chart colors using CSS variables
export const chartColors = {
  // Primary data series - uses accent color
  primary: 'hsl(var(--accent))',
  primaryMuted: 'hsl(var(--accent) / 0.7)',
  
  // Secondary/comparison data
  secondary: 'hsl(var(--muted-foreground))',
  secondaryMuted: 'hsl(var(--muted-foreground) / 0.5)',
  
  // Brand colors for consistent identity
  accent: 'hsl(var(--accent))',
  navy: 'hsl(var(--primary))',
  
  // Categorical palette - for multiple data series
  // Using consistent HSL values that work in both themes
  categorical: [
    'hsl(174, 60%, 45%)',  // Teal (accent)
    'hsl(199, 89%, 48%)',  // Blue
    'hsl(262, 52%, 55%)',  // Purple
    'hsl(38, 92%, 50%)',   // Amber
    'hsl(340, 65%, 55%)',  // Rose
    'hsl(160, 84%, 39%)',  // Emerald
    'hsl(24, 75%, 55%)',   // Orange
    'hsl(280, 55%, 55%)',  // Violet
  ],
  
  // Named semantic colors for specific use cases
  semantic: {
    success: 'hsl(var(--success))',
    warning: 'hsl(var(--warning))',
    destructive: 'hsl(var(--destructive))',
    info: 'hsl(199, 89%, 48%)',
  },
  
  // Status colors for claims, requests, etc.
  status: {
    pending: 'hsl(38, 92%, 50%)',    // Amber
    approved: 'hsl(160, 84%, 39%)',  // Emerald
    rejected: 'hsl(0, 84%, 60%)',    // Red
    inReview: 'hsl(199, 89%, 48%)',  // Blue
    paid: 'hsl(174, 60%, 45%)',      // Teal
  },
  
  // Spend/benefit categories - consistent across platform
  categories: {
    health: 'hsl(340, 65%, 55%)',      // Rose
    housing: 'hsl(199, 89%, 48%)',     // Blue
    education: 'hsl(262, 52%, 55%)',   // Purple
    transport: 'hsl(38, 92%, 50%)',    // Amber
    wellbeing: 'hsl(174, 60%, 45%)',   // Teal
    financial: 'hsl(160, 84%, 39%)',   // Emerald
    lifestyle: 'hsl(280, 55%, 55%)',   // Violet
    other: 'hsl(var(--muted-foreground))',
  },
  
  // Performance/rating colors
  performance: {
    excellent: 'hsl(160, 84%, 39%)',  // Emerald
    good: 'hsl(174, 60%, 45%)',       // Teal
    average: 'hsl(38, 92%, 50%)',     // Amber
    poor: 'hsl(0, 84%, 60%)',         // Red
  },
  
  // Region colors for benchmarking
  regions: {
    uae: 'hsl(174, 60%, 45%)',
    gcc: 'hsl(199, 89%, 48%)',
    mena: 'hsl(262, 52%, 55%)',
    global: 'hsl(222, 47%, 40%)',
  },
  
  // Industry colors
  industries: {
    technology: 'hsl(262, 52%, 55%)',
    finance: 'hsl(160, 84%, 39%)',
    healthcare: 'hsl(340, 65%, 55%)',
    manufacturing: 'hsl(38, 92%, 50%)',
    retail: 'hsl(199, 89%, 48%)',
    energy: 'hsl(24, 75%, 55%)',
  },
  
  // Gradient definitions for fills
  gradients: {
    primary: {
      start: 'hsl(var(--accent))',
      end: 'hsl(var(--accent) / 0.1)',
    },
    secondary: {
      start: 'hsl(var(--muted-foreground) / 0.4)',
      end: 'hsl(var(--muted-foreground) / 0.05)',
    },
  },
};

// Get color by index (cycles through categorical palette)
export const getChartColor = (index: number): string => {
  return chartColors.categorical[index % chartColors.categorical.length];
};

// Get colors for a stacked chart
export const getStackedColors = (count: number): string[] => {
  return chartColors.categorical.slice(0, count);
};

// Get category color by name
export const getCategoryColor = (category: string): string => {
  const key = category.toLowerCase().replace(/[^a-z]/g, '') as keyof typeof chartColors.categories;
  return chartColors.categories[key] || chartColors.categories.other;
};

// Get status color
export const getStatusColor = (status: string): string => {
  const key = status.toLowerCase().replace(/[_-]/g, '') as keyof typeof chartColors.status;
  return chartColors.status[key] || chartColors.secondary;
};

// Get performance color based on value
export const getPerformanceColor = (value: number, thresholds = { excellent: 85, good: 70, average: 50 }): string => {
  if (value >= thresholds.excellent) return chartColors.performance.excellent;
  if (value >= thresholds.good) return chartColors.performance.good;
  if (value >= thresholds.average) return chartColors.performance.average;
  return chartColors.performance.poor;
};

// Tooltip styling constants - use these in all chart tooltips
export const tooltipStyles = {
  contentStyle: {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '10px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
    padding: '12px 16px',
  },
  labelStyle: {
    fontWeight: 600,
    marginBottom: 6,
    color: 'hsl(var(--foreground))',
    fontSize: 13,
  },
  itemStyle: {
    color: 'hsl(var(--muted-foreground))',
    fontSize: 12,
    padding: '2px 0',
  },
  cursorStyle: {
    fill: 'hsl(var(--accent) / 0.08)',
    radius: 4,
  },
};

// Axis styling constants
export const axisStyles = {
  tick: {
    fill: 'hsl(var(--muted-foreground))',
    fontSize: 11,
  },
  axisLine: false,
  tickLine: false,
};

// Grid styling
export const gridStyles = {
  strokeDasharray: '3 3',
  stroke: 'hsl(var(--border))',
  strokeOpacity: 0.5,
  vertical: false,
};

export default chartColors;
