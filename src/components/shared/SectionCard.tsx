import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { ChevronRight, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  tooltip?: {
    formula?: string;
    dataSource?: string;
    notes?: string;
  };
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  badge?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  noPadding?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export function SectionCard({
  title,
  description,
  icon: Icon,
  tooltip,
  action,
  badge,
  children,
  className,
  contentClassName,
  noPadding = false,
  collapsible = false,
  defaultCollapsed = false,
}: SectionCardProps) {
  return (
    <Card className={cn('border-border/50', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2 rounded-lg bg-accent/10 shrink-0">
                <Icon className="w-4 h-4 text-accent" />
              </div>
            )}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold">{title}</CardTitle>
                {tooltip && (
                  <InfoTooltip 
                    formula={tooltip.formula}
                    dataSource={tooltip.dataSource}
                    notes={tooltip.notes}
                  />
                )}
                {badge}
              </div>
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
          {action && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={action.onClick}
              className="shrink-0 gap-1.5 text-muted-foreground hover:text-foreground"
            >
              {action.icon && <action.icon className="w-4 h-4" />}
              {action.label}
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className={cn(
        noPadding ? 'p-0' : 'pt-0',
        contentClassName
      )}>
        {children}
      </CardContent>
    </Card>
  );
}

// Compact variant for dashboard grids
interface CompactSectionCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label?: string;
  };
  tooltip?: {
    formula?: string;
    dataSource?: string;
  };
  onClick?: () => void;
  className?: string;
}

export function CompactSectionCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  tooltip,
  onClick,
  className,
}: CompactSectionCardProps) {
  const TrendDisplay = trend && (
    <span className={cn(
      "text-xs font-medium",
      trend.value > 0 ? "text-success" : trend.value < 0 ? "text-destructive" : "text-muted-foreground"
    )}>
      {trend.value > 0 ? '+' : ''}{trend.value}%
      {trend.label && <span className="text-muted-foreground ml-1">{trend.label}</span>}
    </span>
  );

  return (
    <Card 
      className={cn(
        'border-border/50 transition-all',
        onClick && 'cursor-pointer hover:border-accent/50 hover:shadow-md',
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
            <span className="text-sm text-muted-foreground">{title}</span>
            {tooltip && (
              <InfoTooltip 
                formula={tooltip.formula}
                dataSource={tooltip.dataSource}
              />
            )}
          </div>
          {TrendDisplay}
        </div>
        <p className="text-2xl font-bold">{value}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}
