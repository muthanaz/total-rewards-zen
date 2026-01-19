import { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  badge?: {
    label: string;
    icon?: LucideIcon;
    variant?: 'default' | 'accent' | 'success' | 'warning';
  };
  actions?: ReactNode;
  className?: string;
}

const badgeVariants = {
  default: 'bg-muted text-muted-foreground border-border',
  accent: 'bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30',
  success: 'bg-success/10 text-success border-success/30',
  warning: 'bg-warning/10 text-warning border-warning/30',
};

export function PageHeader({
  title,
  description,
  icon: Icon,
  iconClassName,
  badge,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col md:flex-row md:items-center justify-between gap-4', className)}>
      <div className="flex items-start gap-3">
        {Icon && (
          <div className={cn(
            "p-2 rounded-xl bg-gradient-to-br shadow-lg shrink-0",
            iconClassName || "from-accent to-accent/80 shadow-accent/25"
          )}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-3 flex-wrap">
            {title}
            {badge && (
              <Badge 
                variant="outline" 
                className={cn("w-fit", badgeVariants[badge.variant || 'default'])}
              >
                {badge.icon && <badge.icon className="w-3.5 h-3.5 mr-1.5" />}
                {badge.label}
              </Badge>
            )}
          </h1>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
