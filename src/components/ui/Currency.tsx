import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DirhamSymbolIcon } from '@/components/icons/DirhamSymbolIcon';
import { cn, formatCurrencyNumber } from '@/lib/utils';

export interface CurrencyProps {
  /** The amount to display */
  amount: number | null | undefined;
  /** Show "AED" ISO code as a secondary label (for clarity). */
  showCode?: boolean;
  /** Show the Dirham symbol icon (default: true). */
  showSymbol?: boolean;
  /** Use abbreviated format for large numbers (K/M) */
  abbreviate?: boolean;
  /** Force specific decimal places */
  decimals?: number;
  /** Size variant */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Additional className */
  className?: string;
}

const SIZE_CLASSES = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-2xl font-bold',
};

/**
 * Currency
 * System-wide Dirham display: symbol + formatted amount (Western digits enforced).
 * 
 * Usage:
 *   <Currency amount={45000} />              // → د.إ 45K
 *   <Currency amount={1234} abbreviate={false} /> // → د.إ 1,234
 *   <Currency amount={null} />               // → —
 */
export function Currency({
  amount,
  showCode = false,
  showSymbol = true,
  abbreviate = true,
  decimals,
  size = 'md',
  className,
}: CurrencyProps) {
  // Handle null/undefined
  if (amount === null || amount === undefined || isNaN(amount)) {
    return <span className={cn('text-muted-foreground', SIZE_CLASSES[size], className)}>—</span>;
  }

  // Format the number without currency symbol
  const value = formatCurrencyNumber(amount, { abbreviate, decimals });

  const content = (
    <span className={cn('inline-flex items-baseline gap-0.5 whitespace-nowrap tabular-nums', SIZE_CLASSES[size], className)}>
      {showSymbol && <DirhamSymbolIcon className="opacity-90 shrink-0" />}
      <span>{value}</span>
      {showCode && (
        <span className="text-muted-foreground text-[0.75em] ms-0.5">AED</span>
      )}
    </span>
  );

  // Hover hint for ISO code clarity (when showCode=false)
  if (showCode) return content;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent className="text-xs">AED {formatCurrencyNumber(amount, { abbreviate: false })}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * CurrencyCompact - For chart labels and tight spaces
 */
export function CurrencyCompact({ amount, className }: { amount: number | null | undefined; className?: string }) {
  return <Currency amount={amount} abbreviate size="xs" className={className} />;
}

/**
 * CurrencyFull - For forms and detailed displays
 */
export function CurrencyFull({ amount, className }: { amount: number | null | undefined; className?: string }) {
  return <Currency amount={amount} abbreviate={false} showCode className={className} />;
}

export default Currency;
