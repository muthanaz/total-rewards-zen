import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// =============================================================================
// BNFT FORMATTING SPEC v1.0
// =============================================================================
// RULES:
// - All numeric values use Western digits (0-9), never Arabic-Indic (٠-٩)
// - Currency: "AED 1,234" or "AED 12.5K" / "AED 1.25M" for compact
// - Percent: "81.5%" (1 decimal default)
// - Dates: "21 Jan 2026" format consistently across all portals
// - Empty/Null: Show "—" dash, not "0" unless 0 is meaningful
// - Ranges: "AED 2,000–3,500" (en-dash)
// - Tables: Right-align numeric columns
// =============================================================================

// ============= WESTERN DIGITS ENFORCEMENT =============

/**
 * Arabic-Indic to Western digit mapping
 * ٠١٢٣٤٥٦٧٨٩ → 0123456789
 */
const ARABIC_INDIC_DIGITS: Record<string, string> = {
  '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
  '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
};

/**
 * Normalize any Arabic-Indic digits (٠-٩) to Western digits (0-9).
 * Use as defense-in-depth on any display surface.
 */
export function toWesternDigits(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  return str.replace(/[٠-٩]/g, (digit) => ARABIC_INDIC_DIGITS[digit] || digit);
}

/**
 * Safe number formatting that always outputs Western digits.
 * Uses 'en-US' locale to ensure 0-9 output regardless of browser settings.
 */
function safeLocaleFormat(
  value: number,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat('en-US', options).format(value);
}

// ============= NULL/EMPTY HANDLING =============

/**
 * Format nullable values - returns "—" for null/undefined
 * Only use explicit 0 when 0 is a meaningful value
 */
export function formatNullable<T>(
  value: T | null | undefined,
  formatter: (val: T) => string,
  placeholder: string = '—'
): string {
  if (value === null || value === undefined) return placeholder;
  if (typeof value === 'number' && isNaN(value)) return placeholder;
  return formatter(value);
}

// ============= CURRENCY FORMATTING =============

/**
 * Currency prefix for UAE Dirham - ALWAYS "AED" per platform standard.
 * This is the ONLY currency label used across the entire platform.
 * 
 * CRITICAL: Never use "د.إ", "درهم", or any other currency representation.
 * AED is the standard for both English AND Arabic UI.
 */
export const CURRENCY_LABEL = 'AED';

/**
 * @deprecated Use CURRENCY_LABEL instead. Kept for backward compatibility only.
 */
export const DIRHAM_SYMBOL = 'AED';

/**
 * Formats a currency value for Arabic UI using AED label and Western digits.
 * Use this in Arabic translations instead of "درهم".
 * 
 * @example formatCurrencyArabic(45000) // "45,000 AED"
 */
export function formatCurrencyArabic(value: number | null | undefined): string {
  if (value === null || value === undefined) return '— AED';
  // Force Western digits using en-US locale
  return `${value.toLocaleString('en-US')} AED`;
}

export interface CurrencyFormatOptions {
  abbreviate?: boolean;       // Use K/M abbreviations (default: true for values >= 10,000)
  decimals?: number;          // Force specific decimal places
  showCurrency?: boolean;     // Show currency label (default: true)
}

/**
 * Format a number as AED currency:
 * - >= 1,000,000: Use M with 1-2 decimals (e.g., "AED 6.15M")
 * - >= 10,000: Use K with 0-1 decimals (e.g., "AED 45.2K")
 * - < 10,000: Full number with commas (e.g., "AED 1,234")
 * 
 * ALWAYS outputs Western digits (0-9), never Arabic-Indic.
 * ALWAYS uses "AED" as the currency label (never د.إ or Dirham symbols).
 */
export function formatCurrencyAED(
  value: number | null | undefined,
  options: CurrencyFormatOptions = {}
): string {
  const { abbreviate = true, decimals, showCurrency = true } = options;
  
  if (value === null || value === undefined || isNaN(value)) {
    return showCurrency ? `${CURRENCY_LABEL} 0` : '0';
  }

  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  const prefix = showCurrency ? `${CURRENCY_LABEL} ` : '';

  if (!abbreviate) {
    // Full format with commas - use en-US for Western digits
    const formatted = decimals !== undefined
      ? safeLocaleFormat(absValue, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
      : safeLocaleFormat(absValue);
    return `${sign}${prefix}${formatted}`;
  }

  // Abbreviation logic
  if (absValue >= 1_000_000) {
    // Millions: 1-2 decimals based on precision needed
    const millions = absValue / 1_000_000;
    const decimalPlaces = decimals ?? (millions >= 10 ? 1 : 2);
    return `${sign}${prefix}${millions.toFixed(decimalPlaces)}M`;
  }
  
  if (absValue >= 10_000) {
    // Thousands: 0-1 decimals
    const thousands = absValue / 1_000;
    const decimalPlaces = decimals ?? (thousands >= 100 ? 0 : 1);
    return `${sign}${prefix}${thousands.toFixed(decimalPlaces)}K`;
  }

  // Small values: full number with commas
  const formatted = decimals !== undefined
    ? safeLocaleFormat(absValue, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : safeLocaleFormat(absValue);
  return `${sign}${prefix}${formatted}`;
}

/**
 * Format a number for currency display WITHOUT the symbol.
 * Useful when the "AED" prefix is displayed separately.
 * 
 * @example
 * formatCurrencyNumber(45000) // → "45K"
 * formatCurrencyNumber(45000, { abbreviate: false }) // → "45,000"
 */
export function formatCurrencyNumber(
  value: number | null | undefined,
  options: Omit<CurrencyFormatOptions, 'showCurrency'> = {}
): string {
  return formatCurrencyAED(value, { ...options, showCurrency: false });
}

/**
 * Alias for formatCurrencyAED for backward compatibility and semantic clarity.
 * Use this in new code for better readability.
 */
export const formatMoney = formatCurrencyAED;

/**
 * Format a currency range with en-dash
 * e.g., "AED 2,000–3,500"
 */
export function formatRangeAED(
  min: number | null | undefined,
  max: number | null | undefined,
  options: CurrencyFormatOptions = {}
): string {
  const minStr = formatCurrencyAED(min, { ...options, abbreviate: false });
  const maxVal = max !== null && max !== undefined ? formatCurrencyAED(max, { ...options, abbreviate: false, showCurrency: false }) : null;
  
  if (!maxVal) return minStr;
  return `${minStr}–${maxVal}`;
}

// ============= PERCENTAGE FORMATTING =============

/**
 * Format a number as a percentage with consistent decimal places.
 * ALWAYS outputs Western digits (0-9).
 * @param value - The percentage value (e.g., 81.834)
 * @param decimals - Number of decimal places (default: 1)
 */
export function formatPercent(
  value: number | null | undefined,
  decimals: number = 1
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }
  return `${value.toFixed(decimals)}%`;
}

// ============= NUMBER FORMATTING =============

/**
 * Format a number as an integer with thousands separators.
 * ALWAYS outputs Western digits (0-9).
 * @param value - The numeric value
 */
export function formatInteger(
  value: number | null | undefined
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }
  return safeLocaleFormat(Math.round(value), { maximumFractionDigits: 0 });
}

/**
 * Format a number with smart abbreviation (no currency prefix).
 * ALWAYS outputs Western digits (0-9).
 * Useful for generic counts or non-currency values.
 */
export function formatNumber(
  value: number | null | undefined,
  options: { abbreviate?: boolean; decimals?: number } = {}
): string {
  return formatCurrencyAED(value, { ...options, showCurrency: false });
}

/**
 * Format decimal number with specified precision
 */
export function formatDecimal(
  value: number | null | undefined,
  decimals: number = 2
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }
  return value.toFixed(decimals);
}

// ============= DATE FORMATTING =============
// Standard format: "21 Jan 2026" - consistent across all portals
// ALWAYS uses Western digits even in Arabic UI

const MONTH_NAMES_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Format a date to standard display format: "21 Jan 2026"
 * ALWAYS uses Western digits (0-9), even in Arabic UI.
 */
export function formatDate(
  date: Date | string | null | undefined
): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';
  
  const day = d.getDate();
  const month = MONTH_NAMES_EN[d.getMonth()];
  const year = d.getFullYear();
  
  return `${day} ${month} ${year}`;
}

/**
 * Format a date with time: "21 Jan 2026, 14:30"
 * ALWAYS uses Western digits.
 */
export function formatDateTime(
  date: Date | string | null | undefined
): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';
  
  const dateStr = formatDate(d);
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  
  return `${dateStr}, ${hours}:${minutes}`;
}

/**
 * Format relative time: "2h ago", "3d ago", "Just now"
 * ALWAYS uses Western digits.
 */
export function formatRelativeTime(
  date: Date | string | null | undefined,
  options: { language?: 'en' | 'ar' } = {}
): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';
  
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  const isAr = options.language === 'ar';
  
  if (diffMins < 1) return isAr ? 'الآن' : 'Just now';
  if (diffMins < 60) return isAr ? `${diffMins} دقيقة` : `${diffMins}m ago`;
  if (diffHours < 24) return isAr ? `${diffHours} ساعة` : `${diffHours}h ago`;
  if (diffDays === 1) return isAr ? 'أمس' : 'Yesterday';
  if (diffDays < 7) return isAr ? `${diffDays} أيام` : `${diffDays}d ago`;
  
  return formatDate(d);
}

/**
 * Format time only: "14:30"
 * ALWAYS uses Western digits.
 */
export function formatTime(
  date: Date | string | null | undefined
): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';
  
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  
  return `${hours}:${minutes}`;
}

/**
 * Format ISO date: "2026-01-21"
 * ALWAYS uses Western digits.
 */
export function formatDateISO(
  date: Date | string | null | undefined
): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';
  
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

// ============= CHART FORMATTERS =============
// Use these in Recharts tickFormatter, tooltip formatters, etc.
// NOTE: All formatters use "AED" as the only currency label

/**
 * Format value for chart tick display (compact, number only)
 * For Y-axis labels on currency charts
 */
export function formatChartTick(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}K`;
  return String(Math.round(value));
}

/**
 * Format value for chart tooltip (full format with AED prefix)
 */
export function formatChartTooltip(
  value: number,
  type: 'currency' | 'number' | 'percent' = 'number'
): string {
  switch (type) {
    case 'currency':
      return formatCurrencyAED(value, { abbreviate: false });
    case 'percent':
      return formatPercent(value);
    default:
      return formatInteger(value);
  }
}

/**
 * Format value for chart labels (compact currency with AED)
 */
export function formatChartLabel(value: number): string {
  return formatCurrencyAED(value, { abbreviate: true });
}

/**
 * Format currency for chart Y-axis (number only, no prefix)
 * Use with axis label that shows "AED"
 */
export function formatChartCurrencyAxis(value: number): string {
  return formatCurrencyNumber(value, { abbreviate: true });
}

/**
 * Format for data table cells (full currency with AED)
 */
export function formatTableCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return formatCurrencyAED(value, { abbreviate: false });
}
