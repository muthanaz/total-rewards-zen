import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ size = 'md', className, fullScreen = false }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const logoSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const spinner = (
    <div className={cn("relative", sizeClasses[size], className)}>
      {/* Outer spinning ring */}
      <div className="absolute inset-0 rounded-xl border-2 border-accent/20 animate-pulse" />
      <div className="absolute inset-0 rounded-xl border-2 border-transparent border-t-accent animate-spin" />
      
      {/* Logo in center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-3/4 h-3/4 rounded-lg bg-gradient-accent flex items-center justify-center shadow-glow">
          <span className={cn("text-primary font-bold", logoSizes[size])}>b</span>
        </div>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gradient-hero flex flex-col items-center justify-center gap-4">
        {spinner}
        <p className="text-primary-foreground/70 text-sm animate-pulse">Loading...</p>
      </div>
    );
  }

  return spinner;
}
