/**
 * Sensitive Data Display Components
 * 
 * Components for displaying sensitive data with proper masking and privacy controls.
 * Used for salary, Emirates ID, passport numbers, etc.
 */

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Lock, Shield, AlertTriangle } from 'lucide-react';
import { cn, CURRENCY_LABEL } from '@/lib/utils';
import { usePrivacy } from '@/components/ui/privacy-toggle';

// =============================================================================
// TYPES
// =============================================================================

export type SensitiveDataType = 'salary' | 'emirates_id' | 'passport' | 'bank_account' | 'ssn' | 'other';

interface SensitiveDisplayProps {
  value: string | number | null | undefined;
  type: SensitiveDataType;
  /** Allow user to toggle visibility */
  allowReveal?: boolean;
  /** Use global privacy context instead of local state */
  useGlobalPrivacy?: boolean;
  /** Custom mask character */
  maskChar?: string;
  /** Show "Not provided" for null values */
  showNotProvided?: boolean;
  /** Currency for salary display */
  currency?: string;
  className?: string;
}

// =============================================================================
// MASKING UTILITIES
// =============================================================================

/**
 * Mask a value based on its type
 */
export function maskValue(
  value: string | number | null | undefined,
  type: SensitiveDataType,
  maskChar: string = '•'
): string {
  if (value === null || value === undefined || value === '') {
    return 'Not provided';
  }

  const stringValue = String(value);

  switch (type) {
    case 'salary':
      // Show currency symbol but mask amount
      return `${maskChar.repeat(6)}`;

    case 'emirates_id':
      // Show format hint: 784-****-*******-*
      if (stringValue.length >= 15) {
        return `784-${maskChar.repeat(4)}-${maskChar.repeat(7)}-${maskChar}`;
      }
      return maskChar.repeat(15);

    case 'passport':
      // Show last 2 characters only
      if (stringValue.length >= 3) {
        return `${maskChar.repeat(stringValue.length - 2)}${stringValue.slice(-2)}`;
      }
      return maskChar.repeat(9);

    case 'bank_account':
      // Show last 4 digits
      if (stringValue.length >= 4) {
        return `${maskChar.repeat(stringValue.length - 4)}${stringValue.slice(-4)}`;
      }
      return maskChar.repeat(12);

    case 'ssn':
      // Show XXX-XX-XXXX format
      return `${maskChar.repeat(3)}-${maskChar.repeat(2)}-${maskChar.repeat(4)}`;

    default:
      return maskChar.repeat(Math.min(stringValue.length, 10));
  }
}

/**
 * Format a value for display (unmasked)
 */
export function formatSensitiveValue(
  value: string | number | null | undefined,
  type: SensitiveDataType,
  currency: string = CURRENCY_LABEL
): string {
  if (value === null || value === undefined || value === '') {
    return 'Not provided';
  }

  switch (type) {
    case 'salary':
      const numValue = typeof value === 'number' ? value : parseFloat(String(value));
      if (isNaN(numValue)) return String(value);
      return `${numValue.toLocaleString()} ${currency}`;

    default:
      return String(value);
  }
}

// =============================================================================
// COMPONENTS
// =============================================================================

/**
 * Display sensitive data with masking and optional reveal toggle
 */
export function SensitiveDataDisplay({
  value,
  type,
  allowReveal = true,
  useGlobalPrivacy = false,
  maskChar = '•',
  showNotProvided = true,
  currency = CURRENCY_LABEL,
  className,
}: SensitiveDisplayProps) {
  const [localRevealed, setLocalRevealed] = useState(false);
  const privacyContext = usePrivacy();

  // Determine if value should be revealed
  const isRevealed = useGlobalPrivacy 
    ? (type === 'salary' ? !privacyContext.salaryHidden : localRevealed)
    : localRevealed;

  const hasValue = value !== null && value !== undefined && value !== '';

  // Display value
  const displayValue = useMemo(() => {
    if (!hasValue && showNotProvided) {
      return 'Not provided';
    }
    if (!hasValue) {
      return null;
    }
    if (isRevealed) {
      return formatSensitiveValue(value, type, currency);
    }
    return maskValue(value, type, maskChar);
  }, [value, type, isRevealed, hasValue, showNotProvided, currency, maskChar]);

  if (!hasValue && !showNotProvided) {
    return null;
  }

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <span className={cn(
        'font-mono',
        !isRevealed && hasValue && 'text-muted-foreground select-none'
      )}>
        {displayValue}
      </span>
      
      {hasValue && allowReveal && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => {
                  if (useGlobalPrivacy && type === 'salary') {
                    privacyContext.toggleSalaryVisibility();
                  } else {
                    setLocalRevealed(!localRevealed);
                  }
                }}
              >
                {isRevealed ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isRevealed ? 'Hide' : 'Reveal'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}

/**
 * Salary display with privacy toggle integration
 */
export function SalaryDisplay({
  amount,
  currency = CURRENCY_LABEL,
  showToggle = true,
  className,
}: {
  amount: number | string | null | undefined;
  currency?: string;
  showToggle?: boolean;
  className?: string;
}) {
  const { salaryHidden, toggleSalaryVisibility } = usePrivacy();
  const hasValue = amount !== null && amount !== undefined && amount !== '';

  if (!hasValue) {
    return (
      <span className={cn('text-muted-foreground', className)}>
        Not provided
      </span>
    );
  }

  const numAmount = typeof amount === 'number' ? amount : parseFloat(String(amount));
  const formattedAmount = isNaN(numAmount) 
    ? String(amount) 
    : `${numAmount.toLocaleString()} ${currency}`;

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <span className={cn(
        'font-semibold tabular-nums transition-all duration-200',
        salaryHidden && 'blur-[6px] select-none'
      )}>
        {formattedAmount}
      </span>
      
      {showToggle && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={toggleSalaryVisibility}
        >
          {salaryHidden ? (
            <Eye className="h-3.5 w-3.5" />
          ) : (
            <EyeOff className="h-3.5 w-3.5" />
          )}
        </Button>
      )}
    </div>
  );
}

/**
 * Badge showing data is masked/protected
 */
export function ProtectedDataBadge({
  label = 'Protected',
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <Badge 
      variant="outline" 
      className={cn('gap-1 text-xs border-emerald-300 text-emerald-700 dark:text-emerald-400', className)}
    >
      <Shield className="h-3 w-3" />
      {label}
    </Badge>
  );
}

/**
 * Warning badge for plaintext sensitive data (admin view)
 */
export function PlaintextWarningBadge({ className }: { className?: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={cn('gap-1 text-xs border-amber-300 text-amber-700 dark:text-amber-400', className)}
          >
            <AlertTriangle className="h-3 w-3" />
            Legacy
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>This data is stored in legacy format. Will be migrated to encrypted storage.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Demo mode indicator - shows that sensitive data is not collected
 */
export function DemoModeDataNotice({ className }: { className?: string }) {
  return (
    <div className={cn(
      'flex items-center gap-2 p-2 rounded bg-muted/50 border border-dashed text-sm text-muted-foreground',
      className
    )}>
      <Lock className="h-4 w-4" />
      <span>Sensitive data not collected in demo mode</span>
    </div>
  );
}
