import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ShieldCheck, ShieldAlert, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type ConfidenceLevel = 'exact' | 'estimated' | 'projected';

interface DataConfidenceChipProps {
  level: ConfidenceLevel;
  label?: string;
  reason?: string;
  className?: string;
}

const CONFIDENCE_CONFIG: Record<ConfidenceLevel, { 
  label: string; 
  description: string; 
  className: string; 
  Icon: typeof ShieldCheck;
}> = {
  exact: {
    label: 'Exact',
    description: 'This value is based on actual recorded data from your HR system.',
    className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    Icon: ShieldCheck,
  },
  estimated: {
    label: 'Estimated',
    description: 'This value is projected based on historical patterns and may vary.',
    className: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    Icon: ShieldAlert,
  },
  projected: {
    label: 'Projected',
    description: 'This is a future projection based on current data and assumptions.',
    className: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
    Icon: Info,
  },
};

export function DataConfidenceChip({ level, label, reason, className }: DataConfidenceChipProps) {
  const config = CONFIDENCE_CONFIG[level];
  const Icon = config.Icon;

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={cn(
              "gap-1 cursor-help text-[10px] font-normal",
              config.className,
              className
            )}
          >
            <Icon className="w-3 h-3" />
            {label || config.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" align="center" className="max-w-xs">
          <p className="text-xs">{reason || config.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Inline disclaimer for sections that need context
interface DataDisclaimerProps {
  children: React.ReactNode;
  className?: string;
}

export function DataDisclaimer({ children, className }: DataDisclaimerProps) {
  return (
    <div className={cn(
      "flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border/50 text-xs text-muted-foreground",
      className
    )}>
      <Info className="w-4 h-4 shrink-0 mt-0.5" />
      <div>{children}</div>
    </div>
  );
}
