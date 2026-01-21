/**
 * Admin Portal Formatting Utilities
 * Language + Formatting Spec v1.0
 * 
 * Rules:
 * - Currency: Always AED, compact (K/M) for cards, full for tables
 * - Numbers: Compact for cards, full with separators for tables
 * - Time: Relative for lists, absolute with tooltip showing timezone
 * - Western digits in both English and Arabic
 */

import { format, formatDistanceToNow, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';

// ============= CURRENCY FORMATTING =============

/**
 * Format currency for card display (compact)
 * e.g., AED 15K, AED 1.5M
 */
export function formatCurrencyCompact(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return 'AED 0';
  }

  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (absValue >= 1_000_000) {
    const millions = absValue / 1_000_000;
    return `${sign}AED ${millions >= 10 ? millions.toFixed(1) : millions.toFixed(2)}M`;
  }
  
  if (absValue >= 1_000) {
    const thousands = absValue / 1_000;
    return `${sign}AED ${thousands >= 100 ? Math.round(thousands) : thousands.toFixed(1)}K`;
  }

  return `${sign}AED ${absValue.toLocaleString('en-US')}`;
}

/**
 * Format currency for table display (full)
 * e.g., AED 15,000.00
 */
export function formatCurrencyFull(value: number | null | undefined, decimals: number = 0): string {
  if (value === null || value === undefined || isNaN(value)) {
    return 'AED 0';
  }

  return `AED ${value.toLocaleString('en-US', { 
    minimumFractionDigits: decimals, 
    maximumFractionDigits: decimals 
  })}`;
}

// ============= NUMBER FORMATTING =============

/**
 * Format number for card display (compact)
 * e.g., 12.5K, 1.2M
 */
export function formatNumberCompact(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }

  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (absValue >= 1_000_000) {
    const millions = absValue / 1_000_000;
    return `${sign}${millions >= 10 ? millions.toFixed(1) : millions.toFixed(2)}M`;
  }
  
  if (absValue >= 1_000) {
    const thousands = absValue / 1_000;
    return `${sign}${thousands >= 100 ? Math.round(thousands) : thousands.toFixed(1)}K`;
  }

  return `${sign}${Math.round(absValue).toLocaleString('en-US')}`;
}

/**
 * Format number for table display (full with separators)
 * e.g., 12,450
 */
export function formatNumberFull(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }

  return Math.round(value).toLocaleString('en-US');
}

/**
 * Format percentage
 * e.g., 85.5%
 */
export function formatPercentage(value: number | null | undefined, decimals: number = 1): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }

  return `${value.toFixed(decimals)}%`;
}

// ============= TIME FORMATTING =============

/**
 * Format time for list display (relative)
 * e.g., "15 minutes ago", "2 hours ago", "Yesterday"
 */
export function formatTimeRelative(date: Date | string | null | undefined, language: 'en' | 'ar' = 'en'): string {
  if (!date) {
    return language === 'ar' ? '—' : '—';
  }

  const d = typeof date === 'string' ? new Date(date) : date;
  
  const minutes = differenceInMinutes(new Date(), d);
  const hours = differenceInHours(new Date(), d);
  const days = differenceInDays(new Date(), d);

  if (minutes < 1) {
    return language === 'ar' ? 'الآن' : 'Just now';
  }
  
  if (minutes < 60) {
    return language === 'ar' 
      ? `${minutes} دقيقة مضت`
      : `${minutes}m ago`;
  }
  
  if (hours < 24) {
    return language === 'ar' 
      ? `${hours} ساعة مضت`
      : `${hours}h ago`;
  }
  
  if (days === 1) {
    return language === 'ar' ? 'أمس' : 'Yesterday';
  }
  
  if (days < 7) {
    return language === 'ar' 
      ? `${days} أيام مضت`
      : `${days}d ago`;
  }

  return format(d, 'MMM d, yyyy');
}

/**
 * Format time for display with absolute time
 * Returns: { display: "15m ago", absolute: "Jan 21, 2025, 10:30 AM UTC" }
 */
export function formatTimeWithTooltip(date: Date | string | null | undefined, language: 'en' | 'ar' = 'en'): {
  display: string;
  absolute: string;
} {
  if (!date) {
    return { display: '—', absolute: '—' };
  }

  const d = typeof date === 'string' ? new Date(date) : date;

  return {
    display: formatTimeRelative(d, language),
    absolute: format(d, 'MMM d, yyyy, h:mm a') + ' UTC',
  };
}

/**
 * Format date only (no time)
 * e.g., "Jan 21, 2025"
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) {
    return '—';
  }

  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMM d, yyyy');
}

/**
 * Format date for table display (ISO-like but readable)
 * e.g., "2025-01-21"
 */
export function formatDateISO(date: Date | string | null | undefined): string {
  if (!date) {
    return '—';
  }

  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'yyyy-MM-dd');
}

/**
 * Format duration in human-readable form
 * e.g., "4m 32s", "2h 15m"
 */
export function formatDuration(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || isNaN(seconds)) {
    return '—';
  }

  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }

  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  }

  const hours = Math.floor(seconds / 3600);
  const mins = Math.round((seconds % 3600) / 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Format duration from milliseconds
 */
export function formatDurationMs(ms: number | null | undefined): string {
  if (ms === null || ms === undefined || isNaN(ms)) {
    return '—';
  }
  return formatDuration(ms / 1000);
}

// ============= RECORD COUNT FORMATTING =============

/**
 * Format record count for display
 * e.g., "12.5K records", "1,234 records"
 */
export function formatRecordCount(count: number | null | undefined, language: 'en' | 'ar' = 'en'): string {
  if (count === null || count === undefined || isNaN(count)) {
    return language === 'ar' ? '0 سجلات' : '0 records';
  }

  const formatted = count >= 1000 
    ? formatNumberCompact(count)
    : formatNumberFull(count);

  return language === 'ar' 
    ? `${formatted} سجلات`
    : `${formatted} records`;
}

// ============= SLA FORMATTING =============

/**
 * Format SLA status with color indicator
 */
export function formatSLAStatus(dueDate: Date | string | null | undefined): {
  text: string;
  status: 'ok' | 'warning' | 'breach';
  color: string;
} {
  if (!dueDate) {
    return { text: '—', status: 'ok', color: 'text-muted-foreground' };
  }

  const d = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  const hoursRemaining = differenceInHours(d, new Date());

  if (hoursRemaining < 0) {
    const hoursOverdue = Math.abs(hoursRemaining);
    return {
      text: hoursOverdue > 24 ? `${Math.floor(hoursOverdue / 24)}d overdue` : `${hoursOverdue}h overdue`,
      status: 'breach',
      color: 'text-destructive',
    };
  }

  if (hoursRemaining <= 4) {
    return {
      text: `${hoursRemaining}h remaining`,
      status: 'warning',
      color: 'text-warning',
    };
  }

  if (hoursRemaining <= 24) {
    return {
      text: `${hoursRemaining}h remaining`,
      status: 'ok',
      color: 'text-success',
    };
  }

  const daysRemaining = Math.floor(hoursRemaining / 24);
  return {
    text: `${daysRemaining}d remaining`,
    status: 'ok',
    color: 'text-success',
  };
}
