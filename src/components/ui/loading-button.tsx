/**
 * Loading Button Component
 * 
 * A button with inline loading feedback for async actions.
 * Shows a spinner and optional loading text during operations.
 */

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ loading = false, loadingText, children, disabled, className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'relative',
          loading && 'cursor-not-allowed',
          className
        )}
        {...props}
      >
        {loading && (
          <Loader2 className="w-4 h-4 me-2 animate-spin" />
        )}
        <span className={cn(loading && loadingText && 'sr-only')}>
          {children}
        </span>
        {loading && loadingText && (
          <span>{loadingText}</span>
        )}
      </Button>
    );
  }
);

LoadingButton.displayName = 'LoadingButton';

// Async button that automatically handles loading state
export function AsyncButton({
  onClick,
  children,
  loadingText,
  ...props
}: Omit<LoadingButtonProps, 'loading'> & {
  onClick: () => Promise<void>;
}) {
  const [loading, setLoading] = React.useState(false);

  const handleClick = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      await onClick();
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoadingButton
      loading={loading}
      loadingText={loadingText}
      onClick={handleClick}
      {...props}
    >
      {children}
    </LoadingButton>
  );
}
