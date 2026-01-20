import { ReactNode, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  X, 
  Download, 
  ExternalLink, 
  ChevronRight,
  type LucideIcon 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DrillDownLevel {
  id: string;
  label: string;
  icon?: LucideIcon;
}

interface DrillDownSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  badge?: {
    label: string;
    variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  };
  // Drilldown level navigation
  levels?: DrillDownLevel[];
  activeLevel?: string;
  onLevelChange?: (levelId: string) => void;
  // Summary section at top
  summary?: ReactNode;
  // Main content
  children: ReactNode;
  // Footer actions
  actions?: {
    primary?: {
      label: string;
      onClick: () => void;
      icon?: LucideIcon;
    };
    secondary?: {
      label: string;
      onClick: () => void;
      icon?: LucideIcon;
    };
    export?: {
      label?: string;
      onClick: () => void;
    };
  };
  // Size
  size?: 'default' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  default: 'w-full sm:max-w-lg',
  lg: 'w-full sm:max-w-2xl',
  xl: 'w-full sm:max-w-4xl',
};

export function DrillDownSheet({
  open,
  onOpenChange,
  title,
  subtitle,
  icon: Icon,
  badge,
  levels,
  activeLevel,
  onLevelChange,
  summary,
  children,
  actions,
  size = 'lg',
  className,
}: DrillDownSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        className={cn(
          sizeClasses[size],
          'flex flex-col p-0',
          className
        )}
      >
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 shrink-0">
          <div className="flex items-start gap-3">
            {Icon && (
              <div className="p-2 rounded-lg bg-accent/10 shrink-0">
                <Icon className="w-5 h-5 text-accent" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <SheetTitle className="text-lg font-display">{title}</SheetTitle>
                {badge && (
                  <Badge variant={badge.variant || 'secondary'}>
                    {badge.label}
                  </Badge>
                )}
              </div>
              {subtitle && (
                <SheetDescription className="mt-1">{subtitle}</SheetDescription>
              )}
            </div>
          </div>
        </SheetHeader>

        {/* Level Navigation */}
        {levels && levels.length > 0 && (
          <div className="px-6 pb-4 shrink-0">
            <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-lg w-fit">
              {levels.map((level) => {
                const LevelIcon = level.icon;
                const isActive = activeLevel === level.id;
                return (
                  <Button
                    key={level.id}
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onLevelChange?.(level.id)}
                    className="gap-1.5"
                  >
                    {LevelIcon && <LevelIcon className="w-4 h-4" />}
                    {level.label}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Summary Section */}
        {summary && (
          <>
            <div className="px-6 pb-4 shrink-0">
              {summary}
            </div>
            <Separator />
          </>
        )}

        {/* Main Content - Scrollable */}
        <ScrollArea className="flex-1 px-6">
          <div className="py-4">
            {children}
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        {actions && (
          <>
            <Separator />
            <div className="p-4 shrink-0 flex items-center justify-between gap-3 bg-muted/30">
              <div>
                {actions.export && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={actions.export.onClick}
                    className="gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    {actions.export.label || 'Export'}
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                {actions.secondary && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={actions.secondary.onClick}
                    className="gap-1.5"
                  >
                    {actions.secondary.icon && <actions.secondary.icon className="w-4 h-4" />}
                    {actions.secondary.label}
                  </Button>
                )}
                {actions.primary && (
                  <Button 
                    size="sm"
                    onClick={actions.primary.onClick}
                    className="gap-1.5"
                  >
                    {actions.primary.icon && <actions.primary.icon className="w-4 h-4" />}
                    {actions.primary.label}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

// Convenience component for summary grids
interface DrillDownSummaryGridProps {
  items: Array<{
    label: string;
    value: string | number;
    sublabel?: string;
    tooltip?: ReactNode;
  }>;
  columns?: 2 | 3 | 4;
}

export function DrillDownSummaryGrid({ items, columns = 3 }: DrillDownSummaryGridProps) {
  return (
    <div className={cn(
      'grid gap-4',
      columns === 2 && 'grid-cols-2',
      columns === 3 && 'grid-cols-3',
      columns === 4 && 'grid-cols-4',
    )}>
      {items.map((item, idx) => (
        <div 
          key={idx}
          className="text-center p-4 bg-muted/50 rounded-lg"
        >
          <div className="flex items-center justify-center gap-1 mb-1">
            <p className="text-sm text-muted-foreground">{item.label}</p>
            {item.tooltip}
          </div>
          <p className="text-lg font-bold">{item.value}</p>
          {item.sublabel && (
            <p className="text-xs text-muted-foreground mt-0.5">{item.sublabel}</p>
          )}
        </div>
      ))}
    </div>
  );
}
