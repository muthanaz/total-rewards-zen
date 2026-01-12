// Chart color palette - consistent, accessible colors for data visualization
// Using HSL values that work in both light and dark modes

export const chartColors = {
  // Primary palette - for main data series
  primary: 'hsl(174, 60%, 45%)', // Teal accent
  secondary: 'hsl(222, 47%, 30%)', // Navy
  
  // Categorical palette - for multiple data series
  categorical: [
    'hsl(174, 60%, 45%)',  // Teal
    'hsl(199, 89%, 48%)',  // Blue
    'hsl(262, 52%, 55%)',  // Purple
    'hsl(38, 92%, 50%)',   // Amber
    'hsl(340, 65%, 55%)',  // Rose
    'hsl(160, 84%, 39%)',  // Emerald
    'hsl(24, 75%, 55%)',   // Orange
    'hsl(280, 55%, 55%)',  // Violet
  ],
  
  // Status colors
  success: 'hsl(160, 84%, 39%)',
  warning: 'hsl(38, 92%, 50%)',
  error: 'hsl(0, 84%, 60%)',
  info: 'hsl(199, 89%, 48%)',
  
  // Spend categories
  health: 'hsl(340, 65%, 55%)',
  housing: 'hsl(199, 89%, 48%)',
  education: 'hsl(262, 52%, 55%)',
  transport: 'hsl(38, 92%, 50%)',
  wellbeing: 'hsl(174, 60%, 45%)',
  financial: 'hsl(160, 84%, 39%)',
  
  // Performance indicators
  excellent: 'hsl(160, 84%, 39%)',
  good: 'hsl(174, 60%, 45%)',
  average: 'hsl(38, 92%, 50%)',
  poor: 'hsl(0, 84%, 60%)',
  
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
};

// Get color by index (cycles through categorical palette)
export const getChartColor = (index: number): string => {
  return chartColors.categorical[index % chartColors.categorical.length];
};

// Get colors for a stacked chart
export const getStackedColors = (count: number): string[] => {
  return chartColors.categorical.slice(0, count);
};

export default chartColors;
