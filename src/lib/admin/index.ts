/**
 * Admin Portal Shared Library
 * Language + Formatting Spec v1.0
 * 
 * WESTERN DIGITS ONLY: All formatting functions output 0-9, never Arabic-Indic (٠-٩)
 */

// Export all constants and enums
export * from './constants';

// Export i18n utilities
export * from './i18n';

// Export formatting utilities
export * from './formatting';

// Explicit re-export of key function for convenience
export { ensureWesternDigits, formatChartValue, formatChartTick } from './formatting';
