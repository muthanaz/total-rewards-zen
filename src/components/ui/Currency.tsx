import * as React from 'react';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DirhamSymbolIcon } from '@/components/icons/DirhamSymbolIcon';
import { cn, formatCurrencyAED } from '@/lib/utils';

export interface CurrencyProps {
  amount: number;
  /** Show "AED" ISO code as a secondary label (for clarity). */
  showCode?: boolean;
  /** Show the Dirham symbol icon (default: true). */
  showSymbol?: boolean;
  className?: string;
}

/**
 * Currency
 * System-wide Dirham display: symbol + formatted amount (Western digits enforced).
 */
export function Currency({
  amount,
  showCode = false,
  showSymbol = true,
  className,
}: CurrencyProps) {
  // Use existing numeric formatting rules, but suppress the currency code.
  const value = formatCurrencyAED(amount, { showCurrency: false });

  const content = (
    <span className={cn('inline-flex items-baseline gap-1 whitespace-nowrap', className)}>
      {showSymbol ? <DirhamSymbolIcon className="opacity-90" /> : null}
      <span>{value}</span>
      {showCode ? (
        <span className="text-muted-foreground text-[0.75em]">AED</span>
      ) : null}
    </span>
  );

  // Hover hint (even when showCode=false) to preserve ISO clarity without clutter.
  if (showCode) return content;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent>AED</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
