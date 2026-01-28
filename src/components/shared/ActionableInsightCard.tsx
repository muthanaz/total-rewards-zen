/**
 * Actionable Insight Card
 * 
 * Golden Standard component for insights and anomalies.
 * Enforces: ONE primary CTA + optional secondary CTA.
 * CTAs must route to exact operational page or open a sheet/modal.
 */

import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LucideIcon,
  ArrowRight,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  Zap,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

// Insight type determines icon and styling
export type InsightType = 
  | 'opportunity'    // Green - potential gains
  | 'risk'           // Red - requires attention
  | 'warning'        // Amber - approaching threshold
  | 'anomaly'        // Purple - unusual pattern
  | 'recommendation' // Blue - suggested action
  | 'success';       // Green - positive outcome

export interface InsightCTA {
  label: string;
  /** Route to navigate to */
  href?: string;
  /** Action to perform (opens modal/sheet) */
  onClick?: () => void;
  /** External link */
  external?: boolean;
}

export interface ActionableInsightCardProps {
  /** Insight type determines styling */
  type: InsightType;
  /** Short headline (max ~60 chars) */
  title: string;
  /** Supporting detail (1-2 sentences) */
  description: string;
  /** Optional metric to highlight */
  metric?: {
    value: string | number;
    label: string;
    trend?: 'up' | 'down' | 'flat';
  };
  /** Primary CTA - REQUIRED */
  primaryAction: InsightCTA;
  /** Optional secondary CTA */
  secondaryAction?: InsightCTA;
  /** Optional custom icon override */
  icon?: LucideIcon;
  /** Optional badge text */
  badge?: string;
  /** Urgency indicator */
  urgency?: 'high' | 'medium' | 'low';
  /** Additional className */
  className?: string;
  /** Compact mode for dense layouts */
  compact?: boolean;
}

// Type-based styling
const TYPE_CONFIG: Record<InsightType, {
  icon: LucideIcon;
  iconClass: string;
  badgeClass: string;
  borderClass: string;
  bgClass: string;
}> = {
  opportunity: {
    icon: TrendingUp,
    iconClass: 'text-success',
    badgeClass: 'bg-success/10 text-success border-success/30',
    borderClass: 'border-success/20',
    bgClass: 'bg-success/5',
  },
  risk: {
    icon: AlertCircle,
    iconClass: 'text-destructive',
    badgeClass: 'bg-destructive/10 text-destructive border-destructive/30',
    borderClass: 'border-destructive/20',
    bgClass: 'bg-destructive/5',
  },
  warning: {
    icon: AlertTriangle,
    iconClass: 'text-warning',
    badgeClass: 'bg-warning/10 text-warning border-warning/30',
    borderClass: 'border-warning/20',
    bgClass: 'bg-warning/5',
  },
  anomaly: {
    icon: Zap,
    iconClass: 'text-accent',
    badgeClass: 'bg-accent/10 text-accent border-accent/30',
    borderClass: 'border-accent/20',
    bgClass: 'bg-accent/5',
  },
  recommendation: {
    icon: Lightbulb,
    iconClass: 'text-info',
    badgeClass: 'bg-info/10 text-info border-info/30',
    borderClass: 'border-info/20',
    bgClass: 'bg-info/5',
  },
  success: {
    icon: CheckCircle2,
    iconClass: 'text-success',
    badgeClass: 'bg-success/10 text-success border-success/30',
    borderClass: 'border-success/20',
    bgClass: 'bg-success/5',
  },
};

const URGENCY_BADGE: Record<'high' | 'medium' | 'low', {
  label: string;
  className: string;
}> = {
  high: {
    label: 'Urgent',
    className: 'bg-destructive/10 text-destructive border-destructive/30',
  },
  medium: {
    label: 'Important',
    className: 'bg-warning/10 text-warning border-warning/30',
  },
  low: {
    label: 'Low Priority',
    className: 'bg-muted text-muted-foreground border-muted',
  },
};

export function ActionableInsightCard({
  type,
  title,
  description,
  metric,
  primaryAction,
  secondaryAction,
  icon,
  badge,
  urgency,
  className,
  compact = false,
}: ActionableInsightCardProps) {
  const config = TYPE_CONFIG[type];
  const Icon = icon || config.icon;
  const TrendIcon = metric?.trend === 'up' ? TrendingUp : metric?.trend === 'down' ? TrendingDown : null;

  const renderCTA = (action: InsightCTA, variant: 'default' | 'outline' | 'ghost') => {
    const buttonContent = (
      <Button 
        variant={variant} 
        size={compact ? 'sm' : 'default'}
        className={cn(
          'gap-1.5',
          variant === 'default' && 'shadow-sm'
        )}
        onClick={action.onClick}
      >
        {action.label}
        {action.href && <ArrowRight className="w-4 h-4" />}
      </Button>
    );

    if (action.href) {
      if (action.external) {
        return (
          <a href={action.href} target="_blank" rel="noopener noreferrer">
            {buttonContent}
          </a>
        );
      }
      return <Link to={action.href}>{buttonContent}</Link>;
    }

    return buttonContent;
  };

  return (
    <Card className={cn(
      'border transition-all duration-200',
      config.borderClass,
      className
    )}>
      <CardContent className={cn(
        compact ? 'p-4' : 'p-5'
      )}>
        <div className="flex gap-4">
          {/* Icon */}
          <div className={cn(
            'shrink-0 rounded-xl flex items-center justify-center',
            compact ? 'w-10 h-10' : 'w-12 h-12',
            config.bgClass
          )}>
            <Icon className={cn(
              config.iconClass,
              compact ? 'w-5 h-5' : 'w-6 h-6'
            )} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header with badges */}
            <div className="flex items-start gap-2 mb-1">
              <h3 className={cn(
                'font-semibold line-clamp-2',
                compact ? 'text-sm' : 'text-base'
              )}>
                {title}
              </h3>
              <div className="flex items-center gap-1.5 shrink-0">
                {urgency && (
                  <Badge 
                    variant="outline" 
                    className={cn('text-[10px] px-1.5 py-0', URGENCY_BADGE[urgency].className)}
                  >
                    {URGENCY_BADGE[urgency].label}
                  </Badge>
                )}
                {badge && (
                  <Badge 
                    variant="outline" 
                    className={cn('text-[10px] px-1.5 py-0', config.badgeClass)}
                  >
                    {badge}
                  </Badge>
                )}
              </div>
            </div>

            {/* Description */}
            <p className={cn(
              'text-muted-foreground line-clamp-2 mb-3',
              compact ? 'text-xs' : 'text-sm'
            )}>
              {description}
            </p>

            {/* Metric highlight (optional) */}
            {metric && (
              <div className="flex items-center gap-2 mb-3">
                <span className={cn(
                  'font-bold tabular-nums',
                  compact ? 'text-lg' : 'text-xl'
                )}>
                  {metric.value}
                </span>
                <span className="text-xs text-muted-foreground">{metric.label}</span>
                {TrendIcon && (
                  <TrendIcon className={cn(
                    'w-4 h-4',
                    metric.trend === 'up' ? 'text-success' : 'text-destructive'
                  )} />
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              {renderCTA(primaryAction, 'default')}
              {secondaryAction && renderCTA(secondaryAction, 'outline')}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * InsightList
 * 
 * Vertical list of insights with consistent spacing
 */
export interface InsightListProps {
  children: ReactNode;
  className?: string;
}

export function InsightList({ children, className }: InsightListProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {children}
    </div>
  );
}

/**
 * InsightGrid
 * 
 * Grid layout for insights (2-3 columns)
 */
export interface InsightGridProps {
  children: ReactNode;
  columns?: 2 | 3;
  className?: string;
}

export function InsightGrid({ children, columns = 2, className }: InsightGridProps) {
  return (
    <div className={cn(
      'grid gap-4',
      columns === 2 ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      className
    )}>
      {children}
    </div>
  );
}

export default ActionableInsightCard;
