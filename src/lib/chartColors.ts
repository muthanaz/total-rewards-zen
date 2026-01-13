// Chart color palette - Unified platform theme
// Single source of truth for all chart colors across the platform

import { CHART_COLORS, getChartColorArray, getChartColor } from './benefitColors';

export const chartColors = {
  // Primary palette - platform teal theme
  primary: CHART_COLORS.primary,
  secondary: CHART_COLORS.secondary,
  
  // Categorical palette - unified for all charts
  categorical: CHART_COLORS.sequence,
  
  // Status colors
  success: CHART_COLORS.success,
  warning: CHART_COLORS.warning,
  info: CHART_COLORS.info,
  error: 'hsl(0, 84%, 60%)',
  
  // Performance indicators
  excellent: CHART_COLORS.success,
  good: CHART_COLORS.primary,
  average: CHART_COLORS.warning,
  poor: 'hsl(0, 84%, 60%)',
  
  // Region colors for benchmarking
  regions: {
    uae: CHART_COLORS.primary,
    gcc: CHART_COLORS.secondary,
    mena: 'hsl(185, 70%, 42%)',
    global: 'hsl(222, 47%, 30%)',
  },
  
  // Industry colors
  industries: {
    technology: 'hsl(199, 89%, 48%)',
    finance: CHART_COLORS.success,
    healthcare: CHART_COLORS.primary,
    manufacturing: CHART_COLORS.warning,
    retail: 'hsl(185, 70%, 42%)',
    energy: 'hsl(38, 92%, 52%)',
  },
};

// Re-export helpers
export { getChartColorArray, getChartColor };

// Get colors for a stacked chart
export const getStackedColors = (count: number): string[] => {
  return CHART_COLORS.sequence.slice(0, count);
};

export default chartColors;
