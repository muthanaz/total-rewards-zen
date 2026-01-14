import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { CalendarDays, ChevronDown, TrendingUp, TrendingDown } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, subYears } from 'date-fns';

export type PeriodType = 'MTD' | 'QTD' | 'YTD' | 'Custom';
export type ComparisonType = 'period' | 'year' | 'none';

interface PeriodSelectorProps {
  onPeriodChange?: (period: PeriodType, dateRange: { start: Date; end: Date }) => void;
  onComparisonChange?: (comparison: ComparisonType) => void;
  showComparison?: boolean;
  compact?: boolean;
}

export function PeriodSelector({ 
  onPeriodChange, 
  onComparisonChange,
  showComparison = true,
  compact = false 
}: PeriodSelectorProps) {
  const { direction } = useLanguage();
  const isRTL = direction === 'rtl';
  
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('YTD');
  const [comparison, setComparison] = useState<ComparisonType>('year');
  const [customRange, setCustomRange] = useState<{ start?: Date; end?: Date }>({});
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const periods: { id: PeriodType; label: string; labelAr: string }[] = [
    { id: 'MTD', label: 'MTD', labelAr: 'الشهر' },
    { id: 'QTD', label: 'QTD', labelAr: 'الربع' },
    { id: 'YTD', label: 'YTD', labelAr: 'السنة' },
    { id: 'Custom', label: 'Custom', labelAr: 'مخصص' },
  ];

  const getDateRange = (period: PeriodType): { start: Date; end: Date } => {
    const now = new Date();
    switch (period) {
      case 'MTD':
        return { start: startOfMonth(now), end: now };
      case 'QTD':
        return { start: startOfQuarter(now), end: now };
      case 'YTD':
        return { start: startOfYear(now), end: now };
      case 'Custom':
        return { 
          start: customRange.start || startOfYear(now), 
          end: customRange.end || now 
        };
      default:
        return { start: startOfYear(now), end: now };
    }
  };

  const handlePeriodSelect = (period: PeriodType) => {
    setSelectedPeriod(period);
    if (period === 'Custom') {
      setIsCalendarOpen(true);
    } else {
      const range = getDateRange(period);
      onPeriodChange?.(period, range);
    }
  };

  const handleComparisonToggle = (type: ComparisonType) => {
    const newComparison = comparison === type ? 'none' : type;
    setComparison(newComparison);
    onComparisonChange?.(newComparison);
  };

  const currentRange = getDateRange(selectedPeriod);

  return (
    <div className={cn(
      "flex flex-wrap items-center gap-3",
      isRTL && "flex-row-reverse"
    )}>
      {/* Period Buttons */}
      <div className={cn(
        "flex items-center gap-1 p-1 rounded-lg bg-muted/50 border border-border/50",
        isRTL && "flex-row-reverse"
      )}>
        {periods.map((period) => (
          <Button
            key={period.id}
            variant={selectedPeriod === period.id ? "default" : "ghost"}
            size="sm"
            onClick={() => handlePeriodSelect(period.id)}
            className={cn(
              "h-7 px-3 text-xs font-medium transition-all",
              selectedPeriod === period.id 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "hover:bg-background/80"
            )}
          >
            {isRTL ? period.labelAr : period.label}
          </Button>
        ))}

        {/* Custom Date Picker */}
        {selectedPeriod === 'Custom' && (
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 px-2">
                <CalendarDays className="w-3.5 h-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={{
                  from: customRange.start,
                  to: customRange.end
                }}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    setCustomRange({ start: range.from, end: range.to });
                    onPeriodChange?.('Custom', { start: range.from, end: range.to });
                    setIsCalendarOpen(false);
                  }
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Date Range Display */}
      {!compact && (
        <Badge variant="outline" className="text-xs font-normal bg-background/50">
          <CalendarDays className="w-3 h-3 mr-1.5" />
          {format(currentRange.start, 'MMM d')} - {format(currentRange.end, 'MMM d, yyyy')}
        </Badge>
      )}

      {/* Comparison Toggle */}
      {showComparison && (
        <div className={cn(
          "flex items-center gap-3 pl-3 border-l border-border/50",
          isRTL && "flex-row-reverse pl-0 pr-3 border-l-0 border-r"
        )}>
          <button
            onClick={() => handleComparisonToggle('period')}
            className={cn(
              "flex items-center gap-1.5 text-xs px-2 py-1 rounded-md transition-all",
              comparison === 'period' 
                ? "bg-accent/10 text-accent font-medium" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <TrendingUp className="w-3 h-3" />
            {isRTL ? "مقابل الفترة السابقة" : "vs Last Period"}
          </button>
          <button
            onClick={() => handleComparisonToggle('year')}
            className={cn(
              "flex items-center gap-1.5 text-xs px-2 py-1 rounded-md transition-all",
              comparison === 'year' 
                ? "bg-accent/10 text-accent font-medium" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <TrendingDown className="w-3 h-3" />
            {isRTL ? "مقابل العام الماضي" : "vs Last Year"}
          </button>
        </div>
      )}
    </div>
  );
}
