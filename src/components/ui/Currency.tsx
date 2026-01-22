import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn, formatCurrencyNumber, CURRENCY_LABEL } from '@/lib/utils';

export interface CurrencyProps {
  /** The amount to display */
  amount: number | null | undefined;
  /** Use abbreviated format for large numbers (K/M) */
  abbreviate?: boolean;
  /** Force specific decimal places */
  decimals?: number;
  /** Size variant */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Additional className */
  className?: string;
  /** Show full value in tooltip (default: true) */
  showTooltip?: boolean;
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
 * System-wide AED currency display component.
 * 
 * IMPORTANT: Uses "AED" as the ONLY currency label across the platform.
 * Never uses د.إ, Dirham symbols, or any other representation.
 * 
 * Usage:
 *   <Currency amount={45000} />              // → AED 45K
 *   <Currency amount={1234} abbreviate={false} /> // → AED 1,234
 *   <Currency amount={null} />               // → —
 */
export function Currency({
  amount,
  abbreviate = true,
  decimals,
  size = 'md',
  className,
  showTooltip = true,
}: CurrencyProps) {
  // Handle null/undefined
  if (amount === null || amount === undefined || isNaN(amount)) {
    return <span className={cn('text-muted-foreground', SIZE_CLASSES[size], className)}>—</span>;
  }

  // Format the number without currency prefix
  const value = formatCurrencyNumber(amount, { abbreviate, decimals });

  const content = (
    <span className={cn('inline-flex items-baseline gap-1 whitespace-nowrap tabular-nums', SIZE_CLASSES[size], className)}>
      <span className="font-medium">{CURRENCY_LABEL}</span>
      <span>{value}</span>
    </span>
  );

  // Show full value tooltip for abbreviated numbers
  if (showTooltip && abbreviate && (amount >= 10000 || amount <= -10000)) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent className="text-xs tabular-nums">
            {CURRENCY_LABEL} {formatCurrencyNumber(amount, { abbreviate: false })}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}

/**
 * CurrencyCompact - For chart labels and tight spaces
 */
export function CurrencyCompact({ amount, className }: { amount: number | null | undefined; className?: string }) {
  return <Currency amount={amount} abbreviate size="xs" showTooltip={false} className={className} />;
}

/**
 * CurrencyFull - For forms and detailed displays
 */
export function CurrencyFull({ amount, className }: { amount: number | null | undefined; className?: string }) {
  return <Currency amount={amount} abbreviate={false} showTooltip={false} className={className} />;
}

export default Currency;
