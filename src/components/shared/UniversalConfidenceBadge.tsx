/**
 * Universal Confidence Badge
 * 
 * A unified badge component used everywhere to show data confidence.
 * Enforces consistent styling across all portals.
 */

import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle,
  Info,
  Clock,
} from 'lucide-react';
import { 
  DataProvenance, 
  ConfidenceLevel, 
  CONFIDENCE_LABELS,
  SOURCE_TYPE_LABELS,
  getFreshnessLabel,
} from '@/lib/dataProvenance';
import { cn } from '@/lib/utils';

// Semantic color tokens (not raw colors)
const CONFIDENCE_STYLES: Record<ConfidenceLevel, {
  badge: string;
  icon: typeof ShieldCheck;
  iconClass: string;
}> = {
  high: {
    badge: 'bg-success/10 text-success border-success/30',
    icon: ShieldCheck,
    iconClass: 'text-success',
  },
  medium: {
    badge: 'bg-warning/10 text-warning border-warning/30',
    icon: ShieldAlert,
    iconClass: 'text-warning',
  },
  low: {
    badge: 'bg-destructive/10 text-destructive border-destructive/30',
    icon: AlertTriangle,
    iconClass: 'text-destructive',
  },
};

// Display labels
const CONFIDENCE_DISPLAY_LABELS: Record<ConfidenceLevel, {
  short: string;
  full: string;
  description: string;
}> = {
  high: {
    short: 'Verified',
    full: 'High Confidence',
    description: 'Based on actual recorded data from integrated systems',
  },
  medium: {
    short: 'Estimated',
    full: 'Medium Confidence',
    description: 'Projected value based on historical patterns',
  },
  low: {
    short: 'Provisional',
    full: 'Low Confidence',
    description: 'Derived from related data; actual value may vary significantly',
  },
};

interface UniversalConfidenceBadgeProps {
  /** Confidence level */
  confidence: ConfidenceLevel;
  /** Optional provenance for full tooltip */
  provenance?: DataProvenance;
  /** Size variant */
  size?: 'sm' | 'md';
  /** Show tooltip with details */
  showTooltip?: boolean;
  /** Display mode: 'badge' | 'dot' | 'label' */
  mode?: 'badge' | 'dot' | 'label';
  /** Custom className */
  className?: string;
}

export function UniversalConfidenceBadge({
  confidence,
  provenance,
  size = 'sm',
  showTooltip = true,
  mode = 'badge',
  className,
}: UniversalConfidenceBadgeProps) {
  const styles = CONFIDENCE_STYLES[confidence];
  const labels = CONFIDENCE_DISPLAY_LABELS[confidence];
  const Icon = styles.icon;

  // Dot mode - minimal indicator
  if (mode === 'dot') {
    const dotContent = (
      <div 
        className={cn(
          'rounded-full',
          size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5',
          confidence === 'high' && 'bg-success',
          confidence === 'medium' && 'bg-warning',
          confidence === 'low' && 'bg-destructive',
          className
        )}
      />
    );

    if (!showTooltip) return dotContent;

    return (
      <TooltipProvider>
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>{dotContent}</TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            {labels.full}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Label mode - text only
  if (mode === 'label') {
    return (
      <span className={cn(
        'text-xs font-medium',
        styles.iconClass,
        className
      )}>
        {labels.short}
      </span>
    );
  }

  // Badge mode (default)
  const badgeContent = (
    <Badge 
      variant="outline" 
      className={cn(
        'gap-1 cursor-help',
        size === 'sm' ? 'text-[10px] px-1.5 py-0' : 'text-xs px-2 py-0.5',
        styles.badge,
        className
      )}
    >
      <Icon className={cn(
        styles.iconClass,
        size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'
      )} />
      {labels.short}
    </Badge>
  );

  if (!showTooltip) return badgeContent;

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>{badgeContent}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Icon className={cn('w-4 h-4', styles.iconClass)} />
              <span className="font-medium">{labels.full}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {labels.description}
            </p>
            {provenance && (
              <div className="pt-2 border-t space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Source</span>
                  <span>{provenance.source_label || SOURCE_TYPE_LABELS[provenance.source_type]}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Updated</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {getFreshnessLabel(provenance)}
                  </span>
                </div>
                {provenance.assumptions && provenance.assumptions.length > 0 && (
                  <div className="pt-1.5 border-t">
                    <p className="text-[10px] text-muted-foreground mb-1">Assumptions:</p>
                    <ul className="text-[10px] text-muted-foreground/80 space-y-0.5">
                      {provenance.assumptions.slice(0, 3).map((a, i) => (
                        <li key={i}>• {a}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Inline confidence indicator for use within text
 */
interface InlineConfidenceProps {
  confidence: ConfidenceLevel;
  className?: string;
}

export function InlineConfidence({ confidence, className }: InlineConfidenceProps) {
  const styles = CONFIDENCE_STYLES[confidence];
  const labels = CONFIDENCE_DISPLAY_LABELS[confidence];
  const Icon = styles.icon;

  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      <Icon className={cn('w-3 h-3', styles.iconClass)} />
      <span className={cn('text-xs', styles.iconClass)}>{labels.short}</span>
    </span>
  );
}

/**
 * Quick utility to get confidence level from a numeric score
 */
export function getConfidenceFromScore(score: number): ConfidenceLevel {
  if (score >= 85) return 'high';
  if (score >= 70) return 'medium';
  return 'low';
}
