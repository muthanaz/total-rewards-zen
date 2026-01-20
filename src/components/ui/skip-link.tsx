/**
 * SkipLink - Accessibility component for keyboard users to skip navigation
 */

import { cn } from '@/lib/utils';

interface SkipLinkProps {
  targetId?: string;
  className?: string;
}

export function SkipLink({ 
  targetId = 'main-content',
  className 
}: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className={cn(
        "skip-link",
        "sr-only focus:not-sr-only",
        "fixed top-0 left-4 z-[100]",
        "px-4 py-2 bg-primary text-primary-foreground rounded-b-md",
        "focus:outline-none focus:ring-2 focus:ring-ring",
        "transition-transform -translate-y-full focus:translate-y-0",
        className
      )}
    >
      Skip to main content
    </a>
  );
}

/**
 * MainContent - Wrapper for main content area with proper landmark
 */
interface MainContentProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
}

export function MainContent({
  children,
  id = 'main-content',
  className
}: MainContentProps) {
  return (
    <main 
      id={id}
      tabIndex={-1}
      className={cn("focus:outline-none", className)}
      role="main"
    >
      {children}
    </main>
  );
}

export default SkipLink;
