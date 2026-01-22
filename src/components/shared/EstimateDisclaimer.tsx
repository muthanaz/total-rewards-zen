/**
 * Estimate Disclaimer Component
 * 
 * Standardized disclaimer for any estimated or indicative values.
 * Part of the Trust Layer for client-defensible data.
 */

import * as React from 'react';
import { AlertCircle, Info, Calculator, HelpCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export type DisclaimerVariant = 'alert' | 'banner' | 'badge' | 'inline' | 'tooltip';
export type DisclaimerTone = 'info' | 'warning' | 'neutral';

export interface EstimateDisclaimerProps {
  /** Display variant */
  variant?: DisclaimerVariant;
  /** Visual tone */
  tone?: DisclaimerTone;
  /** Custom message (overrides default) */
  message?: string;
  /** Additional context about assumptions */
  assumptions?: string[];
  /** Show "Estimated" label prominently */
  showLabel?: boolean;
  /** For tooltip variant: the trigger element */
  children?: React.ReactNode;
  className?: string;
}

// ============================================================================
// DEFAULT MESSAGES
// ============================================================================

export const DEFAULT_ESTIMATE_MESSAGE = 
  'Indicative only — final eligibility depends on policy rules and submitted documents.';

export const DEFAULT_ESTIMATE_SHORT = 
  'Indicative value — subject to policy verification.';

export const DISCLAIMER_MESSAGES = {
  utilization: 'Based on approved claims to date. Pending claims not included.',
  entitlement: 'Subject to eligibility verification and policy limits.',
  forecast: 'Projection based on current trends. Actual results may vary.',
  benchmark: 'Industry benchmark data. Your organization may differ.',
  calculation: 'Calculated based on available data. Manual overrides may apply.',
} as const;

// ============================================================================
// COMPONENT
// ============================================================================

export function EstimateDisclaimer({
  variant = 'inline',
  tone = 'info',
  message = DEFAULT_ESTIMATE_MESSAGE,
  assumptions,
  showLabel = false,
  children,
  className,
}: EstimateDisclaimerProps) {
  // Icon based on tone
  const Icon = tone === 'warning' ? AlertCircle : tone === 'info' ? Info : Calculator;
  
  // Color classes based on tone
  const toneColors = {
    info: {
      bg: 'bg-blue-500/10',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-500/20',
    },
    warning: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-500/20',
    },
    neutral: {
      bg: 'bg-muted',
      text: 'text-muted-foreground',
      border: 'border-border',
    },
  };
  const colors = toneColors[tone];

  // Full content for detailed variants
  const fullContent = (
    <>
      <p>{message}</p>
      {assumptions && assumptions.length > 0 && (
        <ul className="mt-2 space-y-1 text-xs">
          {assumptions.map((a, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <span className="shrink-0">•</span>
              <span>{a}</span>
            </li>
          ))}
        </ul>
      )}
    </>
  );

  // Alert variant (full-width banner)
  if (variant === 'alert') {
    return (
      <Alert className={cn(colors.bg, colors.border, className)}>
        <Icon className={cn('h-4 w-4', colors.text)} />
        {showLabel && (
          <AlertTitle className={colors.text}>Estimated Value</AlertTitle>
        )}
        <AlertDescription className="text-sm">
          {fullContent}
        </AlertDescription>
      </Alert>
    );
  }

  // Banner variant (compact horizontal)
  if (variant === 'banner') {
    return (
      <div className={cn(
        'flex items-start gap-2 p-3 rounded-lg text-sm',
        colors.bg,
        colors.border,
        'border',
        className
      )}>
        <Icon className={cn('h-4 w-4 mt-0.5 shrink-0', colors.text)} />
        <div className="flex-1 min-w-0">
          {showLabel && (
            <span className={cn('font-medium mr-2', colors.text)}>Estimated</span>
          )}
          <span className="text-muted-foreground">{message}</span>
        </div>
      </div>
    );
  }

  // Badge variant (inline label)
  if (variant === 'badge') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className={cn(
                'text-xs gap-1 cursor-help',
                colors.bg,
                colors.text,
                colors.border,
                className
              )}
            >
              <Calculator className="h-3 w-3" />
              Estimated
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="text-xs">{message}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Tooltip variant (wraps children)
  if (variant === 'tooltip') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {children || (
              <span className={cn('cursor-help', className)}>
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground inline-block ml-1" />
              </span>
            )}
          </TooltipTrigger>
          <TooltipContent className="max-w-xs p-3">
            <div className="space-y-2 text-xs">
              {showLabel && (
                <div className="flex items-center gap-1.5 font-medium">
                  <Calculator className="h-3.5 w-3.5" />
                  Estimated Value
                </div>
              )}
              {fullContent}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Inline variant (default)
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 text-xs',
      colors.text,
      className
    )}>
      <Icon className="h-3 w-3 shrink-0" />
      {showLabel && <span className="font-medium">Estimated:</span>}
      <span className="text-muted-foreground">{message}</span>
    </span>
  );
}

// ============================================================================
// PRESET DISCLAIMERS
// ============================================================================

export function UtilizationDisclaimer(props: Omit<EstimateDisclaimerProps, 'message'>) {
  return <EstimateDisclaimer message={DISCLAIMER_MESSAGES.utilization} {...props} />;
}

export function EntitlementDisclaimer(props: Omit<EstimateDisclaimerProps, 'message'>) {
  return <EstimateDisclaimer message={DISCLAIMER_MESSAGES.entitlement} {...props} />;
}

export function ForecastDisclaimer(props: Omit<EstimateDisclaimerProps, 'message'>) {
  return <EstimateDisclaimer message={DISCLAIMER_MESSAGES.forecast} tone="warning" {...props} />;
}

export function BenchmarkDisclaimer(props: Omit<EstimateDisclaimerProps, 'message'>) {
  return <EstimateDisclaimer message={DISCLAIMER_MESSAGES.benchmark} {...props} />;
}

export default EstimateDisclaimer;
