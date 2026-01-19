import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type PeriodType = 'MTD' | 'QTD' | 'YTD' | 'custom';

interface PeriodSelectorProps {
  value: PeriodType;
  onChange: (period: PeriodType) => void;
  className?: string;
}

export function PeriodSelector({ value, onChange, className }: PeriodSelectorProps) {
  const periods: { value: PeriodType; label: string }[] = [
    { value: 'MTD', label: 'MTD' },
    { value: 'QTD', label: 'QTD' },
    { value: 'YTD', label: 'YTD' },
  ];

  return (
    <div className={cn("flex items-center p-0.5 bg-muted/50 rounded-lg", className)}>
      {periods.map((period) => (
        <Button
          key={period.value}
          variant="ghost"
          size="sm"
          onClick={() => onChange(period.value)}
          className={cn(
            "h-7 px-3 text-xs font-medium rounded-md transition-all",
            value === period.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-transparent"
          )}
        >
          {period.label}
        </Button>
      ))}
    </div>
  );
}

// Get date range based on period
export function getPeriodDateRange(period: PeriodType): { start: Date; end: Date } {
  const now = new Date();
  const end = new Date(now);
  let start = new Date(now);

  switch (period) {
    case 'MTD':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'QTD':
      const currentQuarter = Math.floor(now.getMonth() / 3);
      start = new Date(now.getFullYear(), currentQuarter * 3, 1);
      break;
    case 'YTD':
      start = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      start = new Date(now.getFullYear(), 0, 1);
  }

  return { start, end };
}

// Format period label for display
export function formatPeriodLabel(period: PeriodType): string {
  const { start, end } = getPeriodDateRange(period);
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  
  return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
}
