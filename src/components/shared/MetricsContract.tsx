/**
 * Metrics Contract Component
 * 
 * Golden Standard KPI display component enforcing:
 * - KPI title (short)
 * - Value (tabular-nums)
 * - Delta vs prior period
 * - Definition tooltip (1-2 lines, plain language)
 * - Expandable formula
 * - Source (DB function/hook name)
 * - Last updated timestamp
 * - Data Confidence badge (High/Med/Low)
 */

import { useState, ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
  ChevronDown,
  Clock,
  Database,
  Calculator,
  LucideIcon,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Confidence levels for data quality
export type DataConfidence = 'high' | 'medium' | 'low';

// Trend direction
export type TrendDirection = 'up' | 'down' | 'flat';

export interface MetricTrend {
  value: number;
  direction?: TrendDirection;
  label?: string;
  higherIsBetter?: boolean;
}

export interface MetricMetadata {
  definition: string;
  formula: string;
  source: string;
  lastUpdated?: Date | string;
  confidence: DataConfidence;
  confidenceReason?: string;
}

export interface MetricsContractProps {
  /** Short KPI title - can include tooltip components */
  title: string | ReactNode;
  /** Formatted value to display */
  value: string | number;
  /** Optional icon */
  icon?: LucideIcon;
  /** Icon background class */
  iconClassName?: string;
  /** Trend vs prior period */
  trend?: MetricTrend;
  /** Metadata (definition, formula, source, confidence) */
  metadata: MetricMetadata;
  /** Optional subtitle */
  subtitle?: string;
  /** Optional click handler for drilldown */
  onClick?: () => void;
  /** Optional link for navigation */
  href?: string;
  /** Custom footer content */
  footer?: ReactNode;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Card variant */
  variant?: 'default' | 'gradient' | 'outline';
  /** Additional className */
  className?: string;
}

// Confidence badge styling
const CONFIDENCE_STYLES: Record<DataConfidence, {
  badge: string;
  label: string;
}> = {
  high: {
    badge: 'bg-success/10 text-success border-success/30',
    label: 'High',
  },
  medium: {
    badge: 'bg-warning/10 text-warning border-warning/30',
    label: 'Medium',
  },
  low: {
    badge: 'bg-destructive/10 text-destructive border-destructive/30',
    label: 'Low',
  },
};

// Size configurations (following 8px grid) - with enforced min-heights
const SIZE_CONFIG = {
  sm: {
    card: 'p-4',
    value: 'text-xl lg:text-2xl',
    title: 'text-xs',
    icon: 'p-2',
    iconSize: 'w-4 h-4',
    minHeight: 'min-h-[120px]',
  },
  md: {
    card: 'p-5',
    value: 'text-2xl lg:text-3xl',
    title: 'text-sm',
    icon: 'p-2.5',
    iconSize: 'w-5 h-5',
    minHeight: 'min-h-[140px]',
  },
  lg: {
    card: 'p-6',
    value: 'text-3xl lg:text-4xl',
    title: 'text-sm',
    icon: 'p-3',
    iconSize: 'w-6 h-6',
    minHeight: 'min-h-[160px]',
  },
};

const VARIANT_STYLES = {
  default: 'bg-card border-border/50',
  gradient: 'bg-gradient-to-br from-card to-accent/5 border-border/50',
  outline: 'bg-transparent border-border',
};

export function MetricsContract({
  title,
  value,
  icon: Icon,
  iconClassName,
  trend,
  metadata,
  subtitle,
  onClick,
  href,
  footer,
  size = 'md',
  variant = 'default',
  className,
}: MetricsContractProps) {
  const [isFormulaOpen, setIsFormulaOpen] = useState(false);
  const sizeConfig = SIZE_CONFIG[size];
  const confidenceStyle = CONFIDENCE_STYLES[metadata.confidence];

  // Determine trend display
  const getTrendColor = () => {
    if (!trend) return '';
    if (trend.value === 0) return 'text-muted-foreground';
    const isPositive = trend.value > 0;
    const isGood = trend.higherIsBetter !== false ? isPositive : !isPositive;
    return isGood ? 'text-success' : 'text-destructive';
  };

  const TrendIcon = !trend ? null : 
    (trend.direction === 'up' || (trend.direction === undefined && trend.value > 0)) ? TrendingUp :
    (trend.direction === 'down' || (trend.direction === undefined && trend.value < 0)) ? TrendingDown : 
    Minus;

  // Format last updated
  const formatLastUpdated = (date: Date | string | undefined) => {
    if (!date) return 'Unknown';
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  const cardContent = (
    <Card
      className={cn(
        'border transition-all duration-200',
        VARIANT_STYLES[variant],
        sizeConfig.minHeight,
        (onClick || href) && 'cursor-pointer hover:shadow-md hover:border-accent/30',
        className
      )}
      onClick={onClick}
    >
      <CardContent className={sizeConfig.card}>
        {/* Header Row: Icon + Confidence Badge + Info Tooltip */}
        <div className="flex items-start justify-between mb-3">
          {Icon && (
            <div className={cn(
              'rounded-xl',
              sizeConfig.icon,
              iconClassName || 'bg-primary/10'
            )}>
              <Icon className={cn(sizeConfig.iconSize, iconClassName ? '' : 'text-primary')} />
            </div>
          )}
          <div className="flex items-center gap-1.5">
            {/* Confidence Badge */}
            <Badge 
              variant="outline" 
              className={cn('text-[10px] px-1.5 py-0', confidenceStyle.badge)}
            >
              {confidenceStyle.label}
            </Badge>

            {/* Info Tooltip with full metadata */}
            <TooltipProvider>
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 rounded-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Info className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent 
                  side="top" 
                  align="end"
                  className="max-w-xs p-3 space-y-2.5"
                >
                  {/* Definition */}
                  <p className="text-sm">{metadata.definition}</p>
                  
                  {/* Formula */}
                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Calculator className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Formula</span>
                    </div>
                    <code className="text-xs bg-muted/50 px-2 py-1 rounded block">
                      {metadata.formula}
                    </code>
                  </div>

                  {/* Source */}
                  <div className="flex items-center gap-1.5">
                    <Database className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Source: </span>
                    <span className="text-xs font-mono">{metadata.source}</span>
                  </div>

                  {/* Last Updated */}
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Updated: </span>
                    <span className="text-xs">{formatLastUpdated(metadata.lastUpdated)}</span>
                  </div>

                  {/* Confidence Reason */}
                  {metadata.confidenceReason && (
                    <div className="pt-2 border-t">
                      <p className="text-[10px] text-muted-foreground italic">
                        {metadata.confidenceReason}
                      </p>
                    </div>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Value */}
        <p className={cn(
          'font-bold tracking-tight tabular-nums',
          sizeConfig.value
        )}>
          {value}
        </p>

        {/* Title */}
        <p className={cn('text-muted-foreground mt-1', sizeConfig.title)}>
          {title}
        </p>

        {/* Trend */}
        {trend && (
          <div className="flex items-center gap-1.5 mt-2">
            {TrendIcon && <TrendIcon className={cn('w-4 h-4', getTrendColor())} />}
            <span className={cn('text-sm font-medium tabular-nums', getTrendColor())}>
              {trend.value > 0 ? '+' : ''}{trend.value}%
            </span>
            {trend.label && (
              <span className="text-xs text-muted-foreground">{trend.label}</span>
            )}
          </div>
        )}

        {/* Subtitle */}
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>
        )}

        {/* Footer */}
        {footer && (
          <div className="mt-3 pt-3 border-t border-border/50">
            {footer}
          </div>
        )}

        {/* Drilldown indicator */}
        {(onClick || href) && (
          <div className="mt-3 flex items-center gap-1 text-xs text-accent opacity-0 group-hover:opacity-100 transition-opacity">
            <span>View details</span>
            <ExternalLink className="w-3 h-3" />
          </div>
        )}
      </CardContent>
    </Card>
  );

  return href ? (
    <a href={href} className="block group">
      {cardContent}
    </a>
  ) : (
    <div className="group">
      {cardContent}
    </div>
  );
}

/**
 * MetricsContractGrid
 * 
 * A grid container that enforces 3-5 KPIs per row with consistent spacing
 */
export interface MetricsContractGridProps {
  children: ReactNode;
  columns?: 3 | 4 | 5;
  className?: string;
}

export function MetricsContractGrid({ 
  children, 
  columns = 4, 
  className 
}: MetricsContractGridProps) {
  const colClasses = {
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-2 lg:grid-cols-5',
  };

  return (
    <div className={cn(
      'grid gap-4 lg:gap-6', // 8px grid: 16px on mobile, 24px on desktop
      colClasses[columns],
      className
    )}>
      {children}
    </div>
  );
}

/**
 * MetricExpandableDetails
 * 
 * Expandable section for formula and additional details
 */
export interface MetricExpandableDetailsProps {
  formula: string;
  source: string;
  assumptions?: string[];
  className?: string;
}

export function MetricExpandableDetails({
  formula,
  source,
  assumptions,
  className,
}: MetricExpandableDetailsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <CollapsibleTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 text-xs text-muted-foreground gap-1 hover:text-foreground"
        >
          <span>How is this calculated?</span>
          <ChevronDown className={cn(
            'w-3 h-3 transition-transform',
            isOpen && 'rotate-180'
          )} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2 space-y-2">
        <div className="bg-muted/30 rounded-lg p-3 space-y-2">
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">
              Formula
            </p>
            <code className="text-xs">{formula}</code>
          </div>
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">
              Data Source
            </p>
            <span className="text-xs font-mono">{source}</span>
          </div>
          {assumptions && assumptions.length > 0 && (
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">
                Assumptions
              </p>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                {assumptions.map((a, i) => (
                  <li key={i}>• {a}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default MetricsContract;
