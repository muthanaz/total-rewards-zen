import { ReactNode, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { ChevronRight, ChevronDown, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconClassName?: string;
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
  iconClassName,
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
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <Card className={cn('border-border/50 shadow-sm', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div 
            className={cn(
              "flex items-center gap-3",
              collapsible && "cursor-pointer"
            )}
            onClick={collapsible ? () => setIsCollapsed(!isCollapsed) : undefined}
          >
            {Icon && (
              <div className={cn(
                "p-2 rounded-xl shrink-0",
                iconClassName || "bg-accent/10"
              )}>
                <Icon className={cn("w-4 h-4", iconClassName ? '' : "text-accent")} />
              </div>
            )}
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-display font-semibold">{title}</CardTitle>
                {tooltip && (
                  <InfoTooltip 
                    formula={tooltip.formula}
                    dataSource={tooltip.dataSource}
                    notes={tooltip.notes}
                  />
                )}
                {badge}
                {collapsible && (
                  isCollapsed ? (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )
                )}
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
      {!isCollapsed && (
        <CardContent className={cn(
          noPadding ? 'p-0' : 'pt-0',
          contentClassName
        )}>
          {children}
        </CardContent>
      )}
    </Card>
  );
}

// Compact variant for dashboard grids
interface CompactSectionCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  trend?: {
    value: number;
    label?: string;
    higherIsBetter?: boolean;
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
  iconClassName,
  trend,
  tooltip,
  onClick,
  className,
}: CompactSectionCardProps) {
  const getTrendColor = () => {
    if (!trend) return '';
    if (trend.value === 0) return 'text-muted-foreground';
    const isPositive = trend.value > 0;
    const isGood = trend.higherIsBetter !== false ? isPositive : !isPositive;
    return isGood ? 'text-success' : 'text-destructive';
  };

  return (
    <Card 
      className={cn(
        'border-border/50 shadow-sm transition-all duration-200',
        onClick && 'cursor-pointer hover:border-accent/40 hover:shadow-md',
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            {Icon && (
              <div className={cn("p-1.5 rounded-lg", iconClassName || "bg-muted")}>
                <Icon className={cn("w-4 h-4", iconClassName ? '' : "text-muted-foreground")} />
              </div>
            )}
            <span className="text-sm text-muted-foreground">{title}</span>
            {tooltip && (
              <InfoTooltip 
                formula={tooltip.formula}
                dataSource={tooltip.dataSource}
              />
            )}
          </div>
          {trend && (
            <span className={cn("text-xs font-medium", getTrendColor())}>
              {trend.value > 0 ? '+' : ''}{trend.value}%
              {trend.label && <span className="text-muted-foreground ml-1">{trend.label}</span>}
            </span>
          )}
        </div>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}
