/**
 * StandardCard - Base wrapper for consistent card styling across portals
 * 
 * Implements 12-column grid system with variant-specific gaps:
 * - Executive pages: gap-6 (24px)
 * - HR Ops pages: gap-4 (16px)
 * - Employee pages: gap-6 (24px)
 */

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type CardVariant = 'employee' | 'hr_ops' | 'executive';

export interface StandardCardProps {
  /** Portal variant for styling */
  variant?: CardVariant;
  /** Card title */
  title?: React.ReactNode;
  /** Title icon */
  icon?: React.ReactNode;
  /** Scope label (small text beside title) */
  scopeLabel?: string;
  /** Additional header actions (right side) */
  headerAction?: React.ReactNode;
  /** Card content */
  children: React.ReactNode;
  /** Footer content */
  footer?: React.ReactNode;
  /** Additional className */
  className?: string;
  /** Content className */
  contentClassName?: string;
  /** Enforce equal height in grid */
  equalHeight?: boolean;
  /** Click handler */
  onClick?: () => void;
}

// Minimum height per variant to ensure card rhythm
const MIN_HEIGHTS = {
  employee: 'min-h-[140px]',
  hr_ops: 'min-h-[120px]',
  executive: 'min-h-[140px]',
};

export function StandardCard({
  variant = 'executive',
  title,
  icon,
  scopeLabel,
  headerAction,
  children,
  footer,
  className,
  contentClassName,
  equalHeight = true,
  onClick,
}: StandardCardProps) {
  const minHeight = equalHeight ? MIN_HEIGHTS[variant] : '';

  return (
    <Card
      className={cn(
        'border-border/50 transition-all duration-200 flex flex-col',
        minHeight,
        onClick && 'cursor-pointer hover:shadow-md hover:border-accent/30',
        className
      )}
      onClick={onClick}
    >
      {title && (
        <CardHeader className="pb-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {icon}
              <CardTitle className="text-base font-semibold">{title}</CardTitle>
              {scopeLabel && (
                <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  {scopeLabel}
                </span>
              )}
            </div>
            {headerAction}
          </div>
        </CardHeader>
      )}
      <CardContent className={cn('flex-1', contentClassName)}>
        {children}
      </CardContent>
      {footer && (
        <CardFooter className="pt-0 flex-shrink-0">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}

/**
 * StandardCardGrid - Grid container with variant-specific gaps
 * 
 * Uses 12-column grid system:
 * - Executive: gap-6 (24px)
 * - HR Ops: gap-4 (16px)
 * - Employee: gap-6 (24px)
 */
export interface StandardCardGridProps {
  /** Portal variant for gap sizing */
  variant?: CardVariant;
  /** Number of columns */
  columns?: 1 | 2 | 3 | 4 | 6 | 12;
  /** Custom grid span pattern (e.g., [6, 6] for half-half) */
  spans?: number[];
  /** Children - either StandardCards or custom content */
  children: React.ReactNode;
  /** Additional className */
  className?: string;
}

const GAP_STYLES = {
  employee: 'gap-6',
  hr_ops: 'gap-4',
  executive: 'gap-6',
};

const COLUMN_CLASSES = {
  1: 'grid-cols-12',
  2: 'grid-cols-12',
  3: 'grid-cols-12',
  4: 'grid-cols-12',
  6: 'grid-cols-12',
  12: 'grid-cols-12',
};

export function StandardCardGrid({
  variant = 'executive',
  columns = 4,
  spans,
  children,
  className,
}: StandardCardGridProps) {
  const gapClass = GAP_STYLES[variant];

  // If spans provided, wrap children with col-span classes
  if (spans && React.Children.count(children) > 0) {
    const childrenArray = React.Children.toArray(children);
    return (
      <div className={cn('grid grid-cols-12', gapClass, className)}>
        {childrenArray.map((child, index) => {
          const span = spans[index % spans.length] || 12 / columns;
          // Map spans to responsive breakpoints
          const spanClass = getResponsiveSpanClass(span, columns);
          return (
            <div key={index} className={spanClass}>
              {child}
            </div>
          );
        })}
      </div>
    );
  }

  // Default: use auto-columns based on column count
  const autoColClass = getAutoColumnClass(columns);

  return (
    <div className={cn('grid', autoColClass, gapClass, className)}>
      {children}
    </div>
  );
}

// Helper to get responsive column classes based on span
function getResponsiveSpanClass(span: number, columns: number): string {
  const base = `col-span-12`; // Mobile: full width
  
  // Map common spans to responsive classes
  const mdSpan = Math.min(span * 2, 12); // Tablet: double span or full
  const lgSpan = span; // Desktop: exact span
  
  return `${base} md:col-span-${mdSpan} lg:col-span-${lgSpan}`;
}

// Helper to get auto-column classes
function getAutoColumnClass(columns: number): string {
  switch (columns) {
    case 1:
      return 'grid-cols-1';
    case 2:
      return 'grid-cols-1 md:grid-cols-2';
    case 3:
      return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    case 4:
      return 'grid-cols-2 lg:grid-cols-4';
    case 6:
      return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6';
    default:
      return 'grid-cols-12';
  }
}

export default StandardCard;
