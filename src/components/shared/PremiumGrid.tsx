/**
 * Premium Grid & Layout Primitives
 * 
 * Golden Standard UI components enforcing:
 * - 8px grid spacing
 * - Generous whitespace
 * - Consistent card heights
 * - 3-5 KPIs per row
 * - Typography scale (H1/H2/body/caption)
 */

import { ReactNode, forwardRef } from 'react';
import { cn } from '@/lib/utils';

// ============================================
// SPACING CONSTANTS (8px grid)
// ============================================
export const SPACING = {
  xs: 'gap-1',      // 4px
  sm: 'gap-2',      // 8px
  md: 'gap-4',      // 16px
  lg: 'gap-6',      // 24px
  xl: 'gap-8',      // 32px
  '2xl': 'gap-10',  // 40px
} as const;

// ============================================
// TYPOGRAPHY SCALE
// ============================================

interface TypographyProps {
  children: ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

/** Display heading - Page titles, hero sections */
export function DisplayHeading({ children, className, as: Component = 'h1' }: TypographyProps) {
  return (
    <Component className={cn(
      'text-3xl lg:text-4xl font-display font-bold tracking-tight',
      className
    )}>
      {children}
    </Component>
  );
}

/** H1 - Main page heading */
export function H1({ children, className, as: Component = 'h1' }: TypographyProps) {
  return (
    <Component className={cn(
      'text-2xl lg:text-3xl font-display font-bold tracking-tight',
      className
    )}>
      {children}
    </Component>
  );
}

/** H2 - Section headings */
export function H2({ children, className, as: Component = 'h2' }: TypographyProps) {
  return (
    <Component className={cn(
      'text-xl lg:text-2xl font-semibold tracking-tight',
      className
    )}>
      {children}
    </Component>
  );
}

/** H3 - Card titles, subsections */
export function H3({ children, className, as: Component = 'h3' }: TypographyProps) {
  return (
    <Component className={cn(
      'text-lg font-semibold',
      className
    )}>
      {children}
    </Component>
  );
}

/** H4 - Small headings, labels */
export function H4({ children, className, as: Component = 'h4' }: TypographyProps) {
  return (
    <Component className={cn(
      'text-base font-medium',
      className
    )}>
      {children}
    </Component>
  );
}

/** Body text */
export function Body({ children, className, as: Component = 'p' }: TypographyProps) {
  return (
    <Component className={cn(
      'text-sm text-muted-foreground',
      className
    )}>
      {children}
    </Component>
  );
}

/** Caption - Small helper text */
export function Caption({ children, className, as: Component = 'span' }: TypographyProps) {
  return (
    <Component className={cn(
      'text-xs text-muted-foreground',
      className
    )}>
      {children}
    </Component>
  );
}

/** Label - Form labels, badges */
export function Label({ children, className, as: Component = 'span' }: TypographyProps) {
  return (
    <Component className={cn(
      'text-[10px] font-medium uppercase tracking-wide text-muted-foreground',
      className
    )}>
      {children}
    </Component>
  );
}

/** Metric Value - Large numbers with tabular-nums */
export function MetricValue({ children, className, as: Component = 'span' }: TypographyProps & { size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  return (
    <Component className={cn(
      'font-bold tabular-nums tracking-tight',
      className
    )}>
      {children}
    </Component>
  );
}

// ============================================
// GRID LAYOUTS
// ============================================

interface GridProps {
  children: ReactNode;
  className?: string;
}

/** KPI Grid - 3-5 cards per row with consistent heights */
export interface KPIGridProps extends GridProps {
  columns?: 3 | 4 | 5;
}

export const KPIGrid = forwardRef<HTMLDivElement, KPIGridProps>(
  ({ children, columns = 4, className }, ref) => {
    const colClasses = {
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-2 lg:grid-cols-4',
      5: 'grid-cols-2 lg:grid-cols-5',
    };

    return (
      <div 
        ref={ref}
        className={cn(
          'grid gap-4 lg:gap-6',
          colClasses[columns],
          // Ensure consistent card heights
          '[&>*]:min-h-[140px]',
          className
        )}
      >
        {children}
      </div>
    );
  }
);
KPIGrid.displayName = 'KPIGrid';

/** Content Grid - 2-3 column layouts for content sections */
export interface ContentGridProps extends GridProps {
  columns?: 2 | 3;
  /** Ratio for asymmetric layouts (e.g., '2:1', '1:2') */
  ratio?: '1:1' | '2:1' | '1:2' | '3:1' | '1:3';
}

export function ContentGrid({ children, columns = 2, ratio, className }: ContentGridProps) {
  let gridClass = 'grid-cols-1 lg:grid-cols-2';
  
  if (columns === 3) {
    gridClass = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
  }
  
  if (ratio) {
    const ratioClasses: Record<string, string> = {
      '1:1': 'lg:grid-cols-2',
      '2:1': 'lg:grid-cols-[2fr_1fr]',
      '1:2': 'lg:grid-cols-[1fr_2fr]',
      '3:1': 'lg:grid-cols-[3fr_1fr]',
      '1:3': 'lg:grid-cols-[1fr_3fr]',
    };
    gridClass = `grid-cols-1 ${ratioClasses[ratio]}`;
  }

  return (
    <div className={cn('grid gap-6', gridClass, className)}>
      {children}
    </div>
  );
}

/** Stack - Vertical layout with consistent spacing */
export interface StackProps extends GridProps {
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export function Stack({ children, spacing = 'md', className }: StackProps) {
  const spacingClass = {
    xs: 'space-y-1',
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6',
    xl: 'space-y-8',
  };

  return (
    <div className={cn(spacingClass[spacing], className)}>
      {children}
    </div>
  );
}

/** Inline - Horizontal layout with consistent spacing */
export interface InlineProps extends GridProps {
  spacing?: 'xs' | 'sm' | 'md' | 'lg';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  wrap?: boolean;
}

export function Inline({ 
  children, 
  spacing = 'md', 
  align = 'center',
  justify = 'start',
  wrap = false,
  className 
}: InlineProps) {
  const spacingClass = {
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  const alignClass = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
    baseline: 'items-baseline',
  };

  const justifyClass = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
  };

  return (
    <div className={cn(
      'flex',
      spacingClass[spacing],
      alignClass[align],
      justifyClass[justify],
      wrap && 'flex-wrap',
      className
    )}>
      {children}
    </div>
  );
}

// ============================================
// SECTION WRAPPERS
// ============================================

/** PageSection - Consistent page section with heading and content */
export interface PageSectionProps extends GridProps {
  title?: string;
  description?: string;
  action?: ReactNode;
}

export function PageSection({ title, description, action, children, className }: PageSectionProps) {
  return (
    <section className={cn('space-y-4', className)}>
      {(title || description || action) && (
        <div className="flex items-start justify-between gap-4">
          <div>
            {title && <H2>{title}</H2>}
            {description && <Body className="mt-1">{description}</Body>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

/** CardSection - Content section within a card */
export interface CardSectionProps extends GridProps {
  title?: string;
  description?: string;
}

export function CardSection({ title, description, children, className }: CardSectionProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {(title || description) && (
        <div>
          {title && <H4>{title}</H4>}
          {description && <Caption className="mt-0.5">{description}</Caption>}
        </div>
      )}
      {children}
    </div>
  );
}

// ============================================
// SPACER UTILITIES
// ============================================

/** Spacer - Add consistent vertical space */
export function Spacer({ size = 'md' }: { size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' }) {
  const sizeClass = {
    xs: 'h-1',      // 4px
    sm: 'h-2',      // 8px
    md: 'h-4',      // 16px
    lg: 'h-6',      // 24px
    xl: 'h-8',      // 32px
    '2xl': 'h-10',  // 40px
  };

  return <div className={sizeClass[size]} aria-hidden />;
}

/** Divider - Visual separator */
export function Divider({ className }: { className?: string }) {
  return <hr className={cn('border-t border-border/50', className)} />;
}

export default {
  // Typography
  DisplayHeading,
  H1,
  H2,
  H3,
  H4,
  Body,
  Caption,
  Label,
  MetricValue,
  // Layouts
  KPIGrid,
  ContentGrid,
  Stack,
  Inline,
  // Sections
  PageSection,
  CardSection,
  // Utilities
  Spacer,
  Divider,
  SPACING,
};
