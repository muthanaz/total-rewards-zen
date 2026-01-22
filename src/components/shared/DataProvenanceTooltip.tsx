/**
 * Data Provenance Tooltip
 * 
 * Shows "Source • Last updated • Assumptions" for any displayed value.
 * Part of the Trust Layer for client-defensible data.
 */

import * as React from 'react';
import { Info, Clock, Database, FileText, Calculator, RefreshCw, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils';
import {
  DataProvenance,
  DataSourceType,
  ConfidenceLevel,
  SOURCE_TYPE_LABELS,
  CONFIDENCE_LABELS,
  CONFIDENCE_COLORS,
  getFreshnessLabel,
  isDataStale,
} from '@/lib/dataProvenance';

// ============================================================================
// TYPES
// ============================================================================

export interface DataProvenanceTooltipProps {
  provenance: DataProvenance;
  /** Trigger element - defaults to info icon */
  children?: React.ReactNode;
  /** Use popover instead of tooltip for more detail */
  mode?: 'tooltip' | 'popover';
  /** Show inline badge instead of icon */
  variant?: 'icon' | 'badge' | 'inline';
  className?: string;
}

// ============================================================================
// ICONS BY SOURCE TYPE
// ============================================================================

const SOURCE_ICONS: Record<DataSourceType, React.ComponentType<{ className?: string }>> = {
  policy: FileText,
  payroll: Database,
  manual: Info,
  estimate: Calculator,
  integration: RefreshCw,
  system: Calculator,
};

// ============================================================================
// COMPONENT
// ============================================================================

export function DataProvenanceTooltip({
  provenance,
  children,
  mode = 'tooltip',
  variant = 'icon',
  className,
}: DataProvenanceTooltipProps) {
  const SourceIcon = SOURCE_ICONS[provenance.source_type];
  const confidenceColors = CONFIDENCE_COLORS[provenance.confidence_level];
  const isStale = isDataStale(provenance);
  
  // Default trigger
  const defaultTrigger = variant === 'badge' ? (
    <Badge 
      variant="outline" 
      className={cn(
        'text-xs gap-1 cursor-help',
        confidenceColors.bg,
        confidenceColors.text,
        confidenceColors.border
      )}
    >
      <SourceIcon className="h-3 w-3" />
      {provenance.is_estimate ? 'Estimated' : SOURCE_TYPE_LABELS[provenance.source_type]}
    </Badge>
  ) : variant === 'inline' ? (
    <span className={cn(
      'inline-flex items-center gap-1 text-xs text-muted-foreground cursor-help',
      className
    )}>
      <SourceIcon className="h-3 w-3" />
      <span>{getFreshnessLabel(provenance)}</span>
    </span>
  ) : (
    <Info className={cn(
      'h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-help transition-colors',
      className
    )} />
  );

  const trigger = children || defaultTrigger;

  const content = (
    <div className="space-y-2 text-xs max-w-xs">
      {/* Source */}
      <div className="flex items-center gap-2">
        <SourceIcon className="h-3.5 w-3.5 shrink-0" />
        <span className="font-medium">
          {provenance.source_label || SOURCE_TYPE_LABELS[provenance.source_type]}
        </span>
        {provenance.source_ref && provenance.source_type !== 'policy' && (
          <span className="text-muted-foreground">({provenance.source_ref})</span>
        )}
      </div>

      {/* Last Updated */}
      <div className="flex items-center gap-2">
        <Clock className={cn('h-3.5 w-3.5 shrink-0', isStale && 'text-amber-500')} />
        <span>
          Updated: {getFreshnessLabel(provenance)}
          {isStale && <span className="text-amber-500 ml-1">(stale)</span>}
        </span>
      </div>

      {/* Confidence */}
      <div className="flex items-center gap-2">
        <div className={cn(
          'h-2 w-2 rounded-full shrink-0',
          provenance.confidence_level === 'high' && 'bg-emerald-500',
          provenance.confidence_level === 'medium' && 'bg-amber-500',
          provenance.confidence_level === 'low' && 'bg-red-500'
        )} />
        <span>{CONFIDENCE_LABELS[provenance.confidence_level]}</span>
      </div>

      {/* Assumptions */}
      {provenance.assumptions && provenance.assumptions.length > 0 && (
        <div className="pt-1 border-t">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground" />
            <div>
              <span className="font-medium">Assumptions:</span>
              <ul className="mt-1 space-y-0.5 text-muted-foreground">
                {provenance.assumptions.map((assumption, i) => (
                  <li key={i}>• {assumption}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Estimate Warning */}
      {provenance.is_estimate && (
        <div className="pt-1 border-t">
          <p className="text-muted-foreground italic">
            Indicative only — final values depend on policy rules.
          </p>
        </div>
      )}
    </div>
  );

  if (mode === 'popover') {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <span className="cursor-help">{trigger}</span>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="start">
          {content}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-help">{trigger}</span>
        </TooltipTrigger>
        <TooltipContent side="top" className="p-3">
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ============================================================================
// SIMPLE INLINE VERSION
// ============================================================================

export interface ProvenanceInlineProps {
  sourceType: DataSourceType;
  lastUpdated?: string | Date;
  confidence?: ConfidenceLevel;
  className?: string;
}

/**
 * Compact inline provenance display: "Policy • 2h ago"
 */
export function ProvenanceInline({
  sourceType,
  lastUpdated,
  confidence = 'high',
  className,
}: ProvenanceInlineProps) {
  const SourceIcon = SOURCE_ICONS[sourceType];
  const freshness = lastUpdated 
    ? formatRelativeTime(lastUpdated) 
    : 'Unknown';

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 text-xs text-muted-foreground',
      className
    )}>
      <SourceIcon className="h-3 w-3" />
      <span>{SOURCE_TYPE_LABELS[sourceType]}</span>
      <span>•</span>
      <span>{freshness}</span>
      {confidence !== 'high' && (
        <>
          <span>•</span>
          <span className={cn(
            confidence === 'medium' && 'text-amber-600',
            confidence === 'low' && 'text-red-600'
          )}>
            {CONFIDENCE_LABELS[confidence]}
          </span>
        </>
      )}
    </span>
  );
}

export default DataProvenanceTooltip;
