/**
 * Premium UI Primitives v4.0
 * 
 * Standardized, accessible, RTL-ready components.
 * Use these instead of raw HTML elements.
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2, AlertCircle, CheckCircle2, Info, AlertTriangle, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============= SECTION HEADER =============

const sectionHeaderVariants = cva(
  'flex items-center justify-between gap-4',
  {
    variants: {
      size: {
        sm: 'mb-3',
        md: 'mb-4',
        lg: 'mb-6',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

interface SectionHeaderProps extends VariantProps<typeof sectionHeaderVariants> {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({ 
  title, 
  description, 
  icon: Icon, 
  action, 
  size,
  className 
}: SectionHeaderProps) {
  return (
    <div className={cn(sectionHeaderVariants({ size }), className)}>
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <div className="p-2 rounded-xl bg-accent/10 shrink-0">
            <Icon className="w-5 h-5 text-accent" />
          </div>
        )}
        <div className="min-w-0">
          <h3 className="text-lg font-semibold tracking-tight truncate">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground truncate">{description}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// ============= STAT DISPLAY =============

const statVariants = cva(
  'font-bold tracking-tight tabular-nums',
  {
    variants: {
      size: {
        xs: 'text-lg',
        sm: 'text-xl',
        md: 'text-2xl',
        lg: 'text-3xl',
        xl: 'text-4xl lg:text-5xl',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

interface StatDisplayProps extends VariantProps<typeof statVariants> {
  value: string | number;
  label?: string;
  trend?: { value: number; direction: 'up' | 'down' | 'neutral' };
  className?: string;
}

export function StatDisplay({ value, label, trend, size, className }: StatDisplayProps) {
  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-baseline gap-2">
        <span className={statVariants({ size })}>{value}</span>
        {trend && (
          <span className={cn(
            'text-sm font-medium',
            trend.direction === 'up' && 'text-success',
            trend.direction === 'down' && 'text-destructive',
            trend.direction === 'neutral' && 'text-muted-foreground'
          )}>
            {trend.direction === 'up' && '↑'}
            {trend.direction === 'down' && '↓'}
            {trend.value}%
          </span>
        )}
      </div>
      {label && <p className="text-sm text-muted-foreground">{label}</p>}
    </div>
  );
}

// ============= LOADING SPINNER =============

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export function LoadingSpinner({ size = 'md', label, className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      <Loader2 className={cn('animate-spin text-accent', sizeClasses[size])} />
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
    </div>
  );
}

// ============= PAGE LOADING =============

export function PageLoading({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <LoadingSpinner size="lg" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

// ============= INLINE MESSAGE =============

const inlineMessageVariants = cva(
  'flex items-start gap-3 p-4 rounded-lg border text-sm',
  {
    variants: {
      variant: {
        info: 'bg-info/5 border-info/20 text-info',
        success: 'bg-success/5 border-success/20 text-success',
        warning: 'bg-warning/5 border-warning/20 text-warning',
        error: 'bg-destructive/5 border-destructive/20 text-destructive',
        muted: 'bg-muted/50 border-border text-muted-foreground',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
);

interface InlineMessageProps extends VariantProps<typeof inlineMessageVariants> {
  title?: string;
  children: React.ReactNode;
  icon?: LucideIcon;
  className?: string;
}

export function InlineMessage({ 
  variant, 
  title, 
  children, 
  icon,
  className 
}: InlineMessageProps) {
  const icons: Record<string, LucideIcon> = {
    info: Info,
    success: CheckCircle2,
    warning: AlertTriangle,
    error: AlertCircle,
    muted: Info,
  };
  
  const Icon = icon || icons[variant || 'info'];

  return (
    <div className={cn(inlineMessageVariants({ variant }), className)}>
      <Icon className="w-5 h-5 shrink-0 mt-0.5" />
      <div className="space-y-1 min-w-0">
        {title && <p className="font-medium">{title}</p>}
        <div className="text-sm opacity-90">{children}</div>
      </div>
    </div>
  );
}

// ============= DIVIDER =============

interface DividerProps {
  label?: string;
  className?: string;
}

export function Divider({ label, className }: DividerProps) {
  if (label) {
    return (
      <div className={cn('flex items-center gap-4', className)}>
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>
    );
  }
  
  return <div className={cn('h-px bg-border', className)} />;
}

// ============= EMPTY PLACEHOLDER =============

interface EmptyPlaceholderProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyPlaceholder({ 
  icon: Icon, 
  title, 
  description, 
  action,
  className 
}: EmptyPlaceholderProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-12 px-6 text-center',
      className
    )}>
      {Icon && (
        <div className="p-4 rounded-2xl bg-muted mb-4">
          <Icon className="w-8 h-8 text-muted-foreground" />
        </div>
      )}
      <h4 className="text-lg font-semibold mb-1">{title}</h4>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}

// ============= DATA ROW =============

interface DataRowProps {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  className?: string;
}

export function DataRow({ label, value, icon: Icon, className }: DataRowProps) {
  return (
    <div className={cn('flex items-center justify-between py-2', className)}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {Icon && <Icon className="w-4 h-4" />}
        <span>{label}</span>
      </div>
      <div className="text-sm font-medium text-end">{value ?? '—'}</div>
    </div>
  );
}

// ============= INLINE STATUS =============

const statusVariants = cva(
  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
  {
    variants: {
      status: {
        success: 'bg-success/10 text-success border-success/20',
        warning: 'bg-warning/10 text-warning border-warning/20',
        error: 'bg-destructive/10 text-destructive border-destructive/20',
        info: 'bg-info/10 text-info border-info/20',
        muted: 'bg-muted text-muted-foreground border-border',
        accent: 'bg-accent/10 text-accent border-accent/20',
      },
    },
    defaultVariants: {
      status: 'muted',
    },
  }
);

interface InlineStatusProps extends VariantProps<typeof statusVariants> {
  label: string;
  icon?: LucideIcon;
  className?: string;
}

export function InlineStatus({ status, label, icon: Icon, className }: InlineStatusProps) {
  return (
    <span className={cn(statusVariants({ status }), className)}>
      {Icon && <Icon className="w-3 h-3" />}
      {label}
    </span>
  );
}

// ============= ICON BOX =============

const iconBoxVariants = cva(
  'flex items-center justify-center shrink-0',
  {
    variants: {
      size: {
        xs: 'w-6 h-6 rounded-md',
        sm: 'w-8 h-8 rounded-lg',
        md: 'w-10 h-10 rounded-xl',
        lg: 'w-12 h-12 rounded-xl',
        xl: 'w-14 h-14 rounded-2xl',
      },
      variant: {
        accent: 'bg-accent/10 text-accent',
        success: 'bg-success/10 text-success',
        warning: 'bg-warning/10 text-warning',
        error: 'bg-destructive/10 text-destructive',
        info: 'bg-info/10 text-info',
        muted: 'bg-muted text-muted-foreground',
        primary: 'bg-primary text-primary-foreground',
        gradient: 'bg-gradient-to-br from-accent to-accent/60 text-white',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'accent',
    },
  }
);

interface IconBoxProps extends VariantProps<typeof iconBoxVariants> {
  icon: LucideIcon;
  className?: string;
}

export function IconBox({ icon: Icon, size, variant, className }: IconBoxProps) {
  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-7 h-7',
  };

  return (
    <div className={cn(iconBoxVariants({ size, variant }), className)}>
      <Icon className={iconSizes[size || 'md']} />
    </div>
  );
}

// ============= SKELETON VARIANTS =============

export function TextSkeleton({ lines = 1, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i} 
          className={cn(
            'h-4 bg-muted rounded animate-pulse',
            i === lines - 1 && lines > 1 && 'w-3/4'
          )} 
        />
      ))}
    </div>
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('p-6 rounded-xl border bg-card space-y-4 animate-pulse', className)}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-muted" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-muted rounded w-1/3" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-muted rounded" />
        <div className="h-3 bg-muted rounded w-5/6" />
      </div>
    </div>
  );
}

export function MetricSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('p-5 rounded-xl border bg-card animate-pulse', className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="h-3 bg-muted rounded w-24" />
        <div className="w-8 h-8 rounded-lg bg-muted" />
      </div>
      <div className="h-8 bg-muted rounded w-20 mb-2" />
      <div className="h-3 bg-muted rounded w-16" />
    </div>
  );
}

export function TableRowSkeleton({ columns = 4, className }: { columns?: number; className?: string }) {
  return (
    <div className={cn('flex items-center gap-4 py-3 px-4 animate-pulse', className)}>
      {Array.from({ length: columns }).map((_, i) => (
        <div key={i} className="flex-1">
          <div className="h-4 bg-muted rounded w-3/4" />
        </div>
      ))}
    </div>
  );
}

// ============= CLICKABLE CARD =============

interface ClickableCardProps extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

export const ClickableCard = React.forwardRef<HTMLDivElement, ClickableCardProps>(
  ({ active, disabled, className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'p-4 rounded-xl border bg-card transition-all cursor-pointer',
        'hover:border-accent/50 hover:shadow-md',
        active && 'border-accent bg-accent/5 shadow-md',
        disabled && 'opacity-50 cursor-not-allowed hover:border-border hover:shadow-none',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
ClickableCard.displayName = 'ClickableCard';
