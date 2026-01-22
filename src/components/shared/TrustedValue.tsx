/**
 * TrustedValue Component
 * 
 * Displays a numeric value with built-in provenance and estimate disclaimers.
 * Unified component for the Trust Layer - use everywhere you show money/metrics.
 */

import * as React from 'react';
import { Currency } from '@/components/ui/Currency';
import { DataProvenanceTooltip } from '@/components/shared/DataProvenanceTooltip';
import { EstimateDisclaimer } from '@/components/shared/EstimateDisclaimer';
import { Badge } from '@/components/ui/badge';
import { cn, formatCurrencyAED, formatPercent, formatInteger } from '@/lib/utils';
import { 
  DataProvenance, 
  createSystemProvenance,
  CONFIDENCE_COLORS,
} from '@/lib/dataProvenance';

// ============================================================================
// TYPES
// ============================================================================

export type ValueType = 'currency' | 'percent' | 'number' | 'integer';

export interface TrustedValueProps {
  /** The value to display */
  value: number | null | undefined;
  /** How to format the value */
  type?: ValueType;
  /** Data provenance information */
  provenance?: DataProvenance;
  /** Mark as estimate (shows disclaimer) */
  isEstimate?: boolean;
  /** Show provenance indicator */
  showProvenance?: boolean;
  /** Show "Estimated" badge */
  showEstimateBadge?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Additional className */
  className?: string;
  /** Label to show above the value */
  label?: string;
  /** Sublabel/description below the value */
  sublabel?: string;
}

// ============================================================================
// SIZE CLASSES
// ============================================================================

const SIZE_CLASSES = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg font-medium',
  xl: 'text-2xl font-bold',
};

// ============================================================================
// COMPONENT
// ============================================================================

export function TrustedValue({
  value,
  type = 'currency',
  provenance,
  isEstimate = false,
  showProvenance = true,
  showEstimateBadge = true,
  size = 'md',
  className,
  label,
  sublabel,
}: TrustedValueProps) {
  // Default provenance if not provided
  const effectiveProvenance = provenance || createSystemProvenance();
  const effectiveIsEstimate = isEstimate || effectiveProvenance.is_estimate;

  // Format value based on type
  const formattedValue = React.useMemo(() => {
    if (value === null || value === undefined) return '—';
    
    switch (type) {
      case 'currency':
        // Return just the number for Currency component to handle
        return value;
      case 'percent':
        return formatPercent(value);
      case 'integer':
        return formatInteger(value);
      case 'number':
      default:
        return formatCurrencyAED(value, { showCurrency: false });
    }
  }, [value, type]);

  // Render the value
  const renderValue = () => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground">—</span>;
    }

    if (type === 'currency') {
      return <Currency amount={value} className={SIZE_CLASSES[size]} />;
    }

    return (
      <span className={cn(SIZE_CLASSES[size], className)}>
        {formattedValue}
      </span>
    );
  };

  return (
    <div className="inline-flex flex-col">
      {/* Label */}
      {label && (
        <span className="text-xs text-muted-foreground mb-0.5">{label}</span>
      )}

      {/* Value with indicators */}
      <div className="inline-flex items-center gap-1.5">
        {/* Main value */}
        {renderValue()}

        {/* Estimate badge */}
        {effectiveIsEstimate && showEstimateBadge && (
          <Badge 
            variant="outline" 
            className={cn(
              'text-[10px] px-1.5 py-0',
              'bg-amber-500/10 text-amber-600 border-amber-500/20'
            )}
          >
            Est.
          </Badge>
        )}

        {/* Provenance indicator */}
        {showProvenance && (
          <DataProvenanceTooltip 
            provenance={effectiveProvenance} 
            mode="tooltip"
          />
        )}
      </div>

      {/* Sublabel */}
      {sublabel && (
        <span className="text-xs text-muted-foreground mt-0.5">{sublabel}</span>
      )}

      {/* Estimate disclaimer for low confidence */}
      {effectiveIsEstimate && effectiveProvenance.confidence_level === 'low' && (
        <EstimateDisclaimer 
          variant="inline" 
          tone="warning"
          className="mt-1"
        />
      )}
    </div>
  );
}

// ============================================================================
// CONVENIENCE VARIANTS
// ============================================================================

export function TrustedCurrency(props: Omit<TrustedValueProps, 'type'>) {
  return <TrustedValue type="currency" {...props} />;
}

export function TrustedPercent(props: Omit<TrustedValueProps, 'type'>) {
  return <TrustedValue type="percent" {...props} />;
}

export function TrustedInteger(props: Omit<TrustedValueProps, 'type'>) {
  return <TrustedValue type="integer" {...props} />;
}

// ============================================================================
// CARD VARIANT (for dashboard metrics)
// ============================================================================

export interface TrustedMetricCardProps {
  label: string;
  value: number | null | undefined;
  type?: ValueType;
  provenance?: DataProvenance;
  isEstimate?: boolean;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'flat';
    label?: string;
  };
  icon?: React.ReactNode;
  className?: string;
}

export function TrustedMetricCard({
  label,
  value,
  type = 'currency',
  provenance,
  isEstimate,
  trend,
  icon,
  className,
}: TrustedMetricCardProps) {
  const effectiveProvenance = provenance || createSystemProvenance();

  return (
    <div className={cn(
      'p-4 rounded-lg border bg-card',
      className
    )}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        {icon}
      </div>
      
      <TrustedValue
        value={value}
        type={type}
        provenance={effectiveProvenance}
        isEstimate={isEstimate}
        size="xl"
        showProvenance
      />

      {trend && (
        <div className={cn(
          'mt-2 text-xs flex items-center gap-1',
          trend.direction === 'up' && 'text-emerald-600',
          trend.direction === 'down' && 'text-red-600',
          trend.direction === 'flat' && 'text-muted-foreground'
        )}>
          {trend.direction === 'up' && '↑'}
          {trend.direction === 'down' && '↓'}
          {trend.direction === 'flat' && '→'}
          <span>{Math.abs(trend.value)}%</span>
          {trend.label && <span className="text-muted-foreground">{trend.label}</span>}
        </div>
      )}
    </div>
  );
}

export default TrustedValue;
