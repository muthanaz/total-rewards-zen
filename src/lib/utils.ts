import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
    // Full format with commas
    const formatted = decimals !== undefined
      ? absValue.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
      : absValue.toLocaleString('en-US');
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
    ? absValue.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : absValue.toLocaleString('en-US');
  return `${sign}${prefix}${formatted}`;
}

/**
 * Format a number as a percentage with consistent decimal places
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
 * Format a number as an integer with thousands separators
 * @param value - The numeric value
 */
export function formatInteger(
  value: number | null | undefined
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }
  return Math.round(value).toLocaleString('en-US');
}

/**
 * Format a number with smart abbreviation (no currency prefix)
 * Useful for generic counts or non-currency values
 */
export function formatNumber(
  value: number | null | undefined,
  options: { abbreviate?: boolean; decimals?: number } = {}
): string {
  return formatCurrencyAED(value, { ...options, showCurrency: false });
}
