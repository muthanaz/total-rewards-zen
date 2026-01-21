import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
  // Always use 'en-US' to guarantee Western digits
  return new Intl.NumberFormat('en-US', options).format(value);
}

// ============= FORMATTING UTILITIES =============

export interface CurrencyFormatOptions {
  abbreviate?: boolean;       // Use K/M abbreviations (default: true for values >= 10,000)
  decimals?: number;          // Force specific decimal places
  showCurrency?: boolean;     // Show "AED" prefix (default: true)
}

/**
 * Format a number as AED currency with consistent abbreviation rules:
 * - >= 1,000,000: Use M with 1-2 decimals (e.g., "AED 6.15M")
 * - >= 10,000: Use K with 0-1 decimals (e.g., "AED 45.2K")
 * - < 10,000: Full number with commas (e.g., "AED 1,234")
 * 
 * ALWAYS outputs Western digits (0-9), never Arabic-Indic.
 */
export function formatCurrencyAED(
  value: number | null | undefined,
  options: CurrencyFormatOptions = {}
): string {
  const { abbreviate = true, decimals, showCurrency = true } = options;
  
  if (value === null || value === undefined || isNaN(value)) {
    return showCurrency ? 'AED 0' : '0';
  }

  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  const prefix = showCurrency ? 'AED ' : '';

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
 * Format a date to always use Western digits.
 * @param date - Date object or string
 * @param options - Intl.DateTimeFormatOptions
 */
export function formatDateWestern(
  date: Date | string | null | undefined,
  options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }
): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  // Use 'en-US' to ensure Western digits
  return new Intl.DateTimeFormat('en-US', options).format(d);
}

/**
 * Format a date with time, always using Western digits.
 */
export function formatDateTimeWestern(
  date: Date | string | null | undefined
): string {
  return formatDateWestern(date, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
