/**
 * ConfidenceBadge
 * 
 * Displays the data confidence level (Real/Estimated/Proxy/Missing)
 * as a small badge next to metrics.
 */

import { Check, TrendingUp, AlertTriangle, HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ConfidenceLevel, getConfidenceDisplay } from '@/lib/metrics';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface ConfidenceBadgeProps {
  level: ConfidenceLevel;
  reason?: string;
  showLabel?: boolean;
  size?: 'sm' | 'default';
  className?: string;
}

const iconMap = {
  check: Check,
  trendingUp: TrendingUp,
  alertTriangle: AlertTriangle,
  helpCircle: HelpCircle,
};

export function ConfidenceBadge({
  level,
  reason,
  showLabel = true,
  size = 'sm',
  className,
}: ConfidenceBadgeProps) {
  const { language } = useLanguage();
  const display = getConfidenceDisplay(level);
  const Icon = iconMap[display.icon];
  const label = language === 'ar' ? display.labelAr : display.label;

  const badge = (
    <Badge
      variant="outline"
      className={cn(
        'gap-1 font-medium',
        display.bgColor,
        display.color,
        display.borderColor,
        size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5',
        className
      )}
    >
      <Icon className={cn(size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3')} />
      {showLabel && label}
    </Badge>
  );

  // If there's a reason, wrap in tooltip
  if (reason) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="text-xs">{reason}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return badge;
}

/**
 * Inline confidence indicator (dot only, for compact displays)
 */
export function ConfidenceDot({
  level,
  reason,
  className,
}: {
  level: ConfidenceLevel;
  reason?: string;
  className?: string;
}) {
  const display = getConfidenceDisplay(level);

  const dot = (
    <span
      className={cn(
        'inline-block w-2 h-2 rounded-full',
        level === 'measured' && 'bg-success',
        level === 'estimated' && 'bg-warning',
        level === 'proxy' && 'bg-muted-foreground',
        level === 'missing' && 'bg-destructive',
        className
      )}
      aria-label={display.label}
    />
  );

  if (reason) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{dot}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="text-xs font-medium">{display.label}</p>
          <p className="text-xs text-muted-foreground">{reason}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return dot;
}
