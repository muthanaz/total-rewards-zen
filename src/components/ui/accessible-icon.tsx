/**
 * AccessibleIcon - Wrapper for icons to ensure proper accessibility
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

interface AccessibleIconProps {
  children: React.ReactNode;
  label: string;
  className?: string;
}

/**
 * Makes icons accessible by providing a screen reader label.
 * The icon is hidden from screen readers and the label is announced instead.
 */
export function AccessibleIcon({ children, label, className }: AccessibleIconProps) {
  return (
    <span className={cn("inline-flex", className)} role="img" aria-label={label}>
      <span aria-hidden="true">{children}</span>
    </span>
  );
}

/**
 * DecorativeIcon - For purely decorative icons that should be hidden from screen readers
 */
interface DecorativeIconProps {
  children: React.ReactNode;
  className?: string;
}

export function DecorativeIcon({ children, className }: DecorativeIconProps) {
  return (
    <span className={cn("inline-flex", className)} aria-hidden="true">
      {children}
    </span>
  );
}

/**
 * VisuallyHidden - Hides content visually but keeps it accessible to screen readers
 */
interface VisuallyHiddenProps {
  children: React.ReactNode;
  asChild?: boolean;
}

export function VisuallyHidden({ children }: VisuallyHiddenProps) {
  return (
    <span className="sr-only">
      {children}
    </span>
  );
}

export default AccessibleIcon;
