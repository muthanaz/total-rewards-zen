/**
 * Dashboard Grid Layout Components
 * 
 * Shared layout patterns for consistent spacing and alignment across dashboards.
 * Uses a 12-column grid system with standardized gaps and padding.
 */

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * DashboardContainer
 * 
 * Top-level page container with consistent padding
 */
interface DashboardContainerProps {
  children: ReactNode;
  className?: string;
}

export function DashboardContainer({ children, className }: DashboardContainerProps) {
  return (
    <div className={cn('p-4 lg:p-8', className)}>
      {children}
    </div>
  );
}

/**
 * DashboardSection
 * 
 * A section with optional title and consistent bottom spacing
 */
interface DashboardSectionProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

export function DashboardSection({ children, title, className }: DashboardSectionProps) {
  return (
    <div className={cn('mb-6', className)}>
      {title && (
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}

/**
 * DashboardGrid12
 * 
 * Full 12-column grid for complex layouts
 */
interface DashboardGrid12Props {
  children: ReactNode;
  className?: string;
}

export function DashboardGrid12({ children, className }: DashboardGrid12Props) {
  return (
    <div className={cn('grid grid-cols-12 gap-4 lg:gap-6', className)}>
      {children}
    </div>
  );
}

/**
 * DashboardGridCol
 * 
 * Column span wrapper for 12-column grid
 */
interface DashboardGridColProps {
  children: ReactNode;
  span?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  spanMd?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  spanLg?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  className?: string;
}

const colSpanClasses: Record<number, string> = {
  1: 'col-span-1',
  2: 'col-span-2',
  3: 'col-span-3',
  4: 'col-span-4',
  5: 'col-span-5',
  6: 'col-span-6',
  7: 'col-span-7',
  8: 'col-span-8',
  9: 'col-span-9',
  10: 'col-span-10',
  11: 'col-span-11',
  12: 'col-span-12',
};

const colSpanMdClasses: Record<number, string> = {
  1: 'md:col-span-1',
  2: 'md:col-span-2',
  3: 'md:col-span-3',
  4: 'md:col-span-4',
  5: 'md:col-span-5',
  6: 'md:col-span-6',
  7: 'md:col-span-7',
  8: 'md:col-span-8',
  9: 'md:col-span-9',
  10: 'md:col-span-10',
  11: 'md:col-span-11',
  12: 'md:col-span-12',
};

const colSpanLgClasses: Record<number, string> = {
  1: 'lg:col-span-1',
  2: 'lg:col-span-2',
  3: 'lg:col-span-3',
  4: 'lg:col-span-4',
  5: 'lg:col-span-5',
  6: 'lg:col-span-6',
  7: 'lg:col-span-7',
  8: 'lg:col-span-8',
  9: 'lg:col-span-9',
  10: 'lg:col-span-10',
  11: 'lg:col-span-11',
  12: 'lg:col-span-12',
};

export function DashboardGridCol({ 
  children, 
  span = 12, 
  spanMd,
  spanLg,
  className 
}: DashboardGridColProps) {
  return (
    <div className={cn(
      colSpanClasses[span],
      spanMd && colSpanMdClasses[spanMd],
      spanLg && colSpanLgClasses[spanLg],
      className
    )}>
      {children}
    </div>
  );
}

/**
 * KPICardGrid
 * 
 * Optimized grid for KPI cards with consistent height enforcement
 */
interface KPICardGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4 | 5;
  equalHeight?: boolean;
  className?: string;
}

export function KPICardGrid({ 
  children, 
  columns = 4,
  equalHeight = true,
  className 
}: KPICardGridProps) {
  const colClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-2 lg:grid-cols-5',
  };

  return (
    <div className={cn(
      'grid gap-4 lg:gap-6',
      colClasses[columns],
      equalHeight && '[&>*]:flex [&>*]:flex-col',
      className
    )}>
      {children}
    </div>
  );
}

/**
 * ListCardGrid
 * 
 * Grid for side-by-side list cards (e.g., Top Drivers)
 */
interface ListCardGridProps {
  children: ReactNode;
  columns?: 1 | 2;
  className?: string;
}

export function ListCardGrid({ 
  children, 
  columns = 2,
  className 
}: ListCardGridProps) {
  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 lg:grid-cols-2',
  };

  return (
    <div className={cn(
      'grid gap-4 lg:gap-6',
      colClasses[columns],
      // Ensure equal heights for side-by-side cards
      '[&>*]:flex [&>*]:flex-col',
      className
    )}>
      {children}
    </div>
  );
}

/**
 * ActionCardGrid
 * 
 * Grid for action/decision cards with consistent row rhythm
 */
interface ActionCardGridProps {
  children: ReactNode;
  className?: string;
}

export function ActionCardGrid({ children, className }: ActionCardGridProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {children}
    </div>
  );
}

/**
 * Standard card height values for consistency
 */
export const CARD_HEIGHTS = {
  kpi: 'min-h-[140px]', // KPI cards
  kpiCompact: 'min-h-[120px]', // Compact KPI cards
  listRow: 'h-[72px]', // Individual list item rows
  actionRow: 'min-h-[72px]', // Action item rows
} as const;

/**
 * Standard row count for list cards
 */
export const LIST_CARD_ROWS = 5;
