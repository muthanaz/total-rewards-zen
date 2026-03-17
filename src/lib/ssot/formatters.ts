/**
 * SSOT Formatters - Single Source of Truth for all formatting
 * 
 * RULES ENFORCED:
 * - Currency: "AED" prefix + comma thousands + compact K/M formatting
 * - Digits: Western digits only (0-9), never Arabic-Indic (٠-٩)
 * - Dates: "21 Jan 2026" format
 * - Percentages: 1 decimal default (e.g., "81.5%")
 * - Empty/Null: "—" dash, not "0" unless 0 is meaningful
 * 
 * This module re-exports and extends the core utils formatters
 * to ensure all SSOT consumers use consistent formatting.
 */

// Re-export all core formatters from utils
export {
  // Currency
  formatCurrencyAED,
  formatCurrencyNumber,
  formatRangeAED,
  formatMoney,
  formatCurrencyArabic,
  CURRENCY_LABEL,
  
  // Numbers
  formatPercent,
  formatInteger,
  formatNumber,
  formatDecimal,
  formatNullable,
  
  // Dates
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatTime,
  formatDateISO,
  
  // Charts
  formatChartTick,
  formatChartTooltip,
  formatChartLabel,
  formatChartCurrencyAxis,
  formatTableCurrency,
  
  // Utilities
  toWesternDigits,
  cn,
} from '@/lib/utils';

// ============= SSOT-SPECIFIC FORMATTERS =============

/**
 * Format a metric value with appropriate formatting based on unit type
 */
export function formatMetricValue(
  value: number | null | undefined,
  unit: 'currency' | 'percent' | 'count' | 'days' | 'ratio'
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }

  switch (unit) {
    case 'currency':
      return `AED ${value >= 1000000 ? (value / 1000000).toFixed(1) + 'M' : value >= 1000 ? (value / 1000).toFixed(0) + 'K' : value.toFixed(0)}`;
    
    case 'percent':
      return `${value.toFixed(1)}%`;
    
    case 'count':
      return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
    
    case 'days':
      return `${value.toFixed(1)} days`;
    
    case 'ratio':
      return `${value.toFixed(2)}x`;
    
    default:
      return String(value);
  }
}

/**
 * Format delta/change values with sign prefix
 */
export function formatDelta(
  value: number | null | undefined,
  unit: 'currency' | 'percent' | 'count' = 'percent'
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }

  const sign = value > 0 ? '+' : '';
  
  switch (unit) {
    case 'currency':
      const absVal = Math.abs(value);
      return `${sign}AED ${absVal >= 1000000 ? (absVal / 1000000).toFixed(1) + 'M' : absVal >= 1000 ? (absVal / 1000).toFixed(0) + 'K' : absVal.toFixed(0)}`;
    
    case 'percent':
      return `${sign}${value.toFixed(1)}%`;
    
    case 'count':
      return `${sign}${new Intl.NumberFormat('en-US').format(value)}`;
    
    default:
      return `${sign}${value}`;
  }
}

/**
 * Format a confidence level to human-readable text
 */
export function formatConfidenceLevel(
  level: 'high' | 'medium' | 'low' | 'undefined'
): string {
  switch (level) {
    case 'high':
      return 'High confidence';
    case 'medium':
      return 'Medium confidence';
    case 'low':
      return 'Low confidence';
    case 'undefined':
      return 'Definition pending';
    default:
      return 'Unknown';
  }
}

/**
 * Format a date for "last updated" displays
 * Returns relative time for recent, absolute for older
 */
export function formatLastUpdated(date: Date | string | null | undefined): string {
  if (!date) return '—';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';
  
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  
  if (diffMins < 5) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  
  // Fall back to absolute date
  const { formatDate } = require('@/lib/utils');
  return formatDate(d);
}
