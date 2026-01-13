// Chart color palette - consistent, accessible colors for data visualization
// Re-exports benefit colors for chart usage

import { BENEFIT_COLORS, getChartColorArray } from './benefitColors';

export const chartColors = {
  // Primary palette - for main data series
  primary: 'hsl(172, 66%, 42%)', // Teal (wellbeing)
  secondary: 'hsl(230, 70%, 58%)', // Indigo (learning)
  
  // Categorical palette - benefit colors for charts
  categorical: getChartColorArray(),
  
  // Status colors (not RAG - these are for general status)
  success: 'hsl(152, 70%, 42%)',   // Emerald
  warning: 'hsl(38, 92%, 52%)',     // Amber
  error: 'hsl(345, 75%, 55%)',      // Rose
  info: 'hsl(200, 85%, 55%)',       // Sky
  
  // Spend categories - mapped from benefit colors
  health: BENEFIT_COLORS.health.chartColor,
  housing: BENEFIT_COLORS.housing.chartColor,
  education: BENEFIT_COLORS.education.chartColor,
  transport: BENEFIT_COLORS.transport.chartColor,
  wellbeing: BENEFIT_COLORS.wellbeing.chartColor,
  financial: BENEFIT_COLORS.financial.chartColor,
  learning: BENEFIT_COLORS.learning.chartColor,
  bonus: BENEFIT_COLORS.rewards.chartColor,
  equity: BENEFIT_COLORS.equity.chartColor,
  leave: BENEFIT_COLORS.timeoff.chartColor,
  
  // Performance indicators
  excellent: 'hsl(152, 70%, 42%)',  // Emerald
  good: 'hsl(172, 66%, 42%)',       // Teal
  average: 'hsl(38, 92%, 52%)',     // Amber
  poor: 'hsl(345, 75%, 55%)',       // Rose
  
  // Region colors for benchmarking
  regions: {
    uae: 'hsl(172, 66%, 42%)',      // Teal
    gcc: 'hsl(200, 85%, 55%)',      // Sky
    mena: 'hsl(265, 70%, 58%)',     // Violet
    global: 'hsl(230, 70%, 58%)',   // Indigo
  },
  
  // Industry colors
  industries: {
    technology: 'hsl(265, 70%, 58%)',  // Violet
    finance: 'hsl(152, 70%, 42%)',     // Emerald
    healthcare: 'hsl(345, 75%, 55%)',  // Rose
    manufacturing: 'hsl(38, 92%, 52%)', // Amber
    retail: 'hsl(200, 85%, 55%)',      // Sky
    energy: 'hsl(28, 90%, 52%)',       // Orange
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
