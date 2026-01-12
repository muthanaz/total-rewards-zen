import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Download, FileSpreadsheet, FileText } from 'lucide-react';
import { format, subDays, subMonths, startOfMonth, endOfMonth, startOfYear } from 'date-fns';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';

interface DateRangeFilterProps {
  onRangeChange: (range: { from: Date; to: Date }) => void;
  onExport?: (format: 'csv' | 'pdf') => void;
  showExport?: boolean;
  className?: string;
  title?: string;
}

const presets = [
  { label: 'Last 7 days', getValue: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
  { label: 'Last 30 days', getValue: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
  { label: 'This month', getValue: () => ({ from: startOfMonth(new Date()), to: new Date() }) },
  { label: 'Last 3 months', getValue: () => ({ from: subMonths(new Date(), 3), to: new Date() }) },
  { label: 'Last 6 months', getValue: () => ({ from: subMonths(new Date(), 6), to: new Date() }) },
  { label: 'Year to date', getValue: () => ({ from: startOfYear(new Date()), to: new Date() }) },
];

export function DateRangeFilter({ 
  onRangeChange, 
  onExport, 
  showExport = true,
  className,
  title = "Filter by period"
}: DateRangeFilterProps) {
  const [date, setDate] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 6),
    to: new Date(),
  });
  const [preset, setPreset] = useState<string>('Last 6 months');

  const handlePresetChange = (value: string) => {
    setPreset(value);
    const presetConfig = presets.find(p => p.label === value);
    if (presetConfig) {
      const range = presetConfig.getValue();
      setDate(range);
      onRangeChange(range);
    }
  };

  const handleDateChange = (range: DateRange | undefined) => {
    setDate(range);
    setPreset('custom');
    if (range?.from && range?.to) {
      onRangeChange({ from: range.from, to: range.to });
    }
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {/* Section label */}
      <span className="text-xs font-medium text-muted-foreground hidden sm:inline">
        {title}:
      </span>
      
      {/* Preset Selector */}
      <Select value={preset} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-[140px] h-9 text-xs">
          <SelectValue placeholder="Select range" />
        </SelectTrigger>
        <SelectContent>
          {presets.map((p) => (
            <SelectItem key={p.label} value={p.label} className="text-xs">
              {p.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Custom Date Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-9 justify-start text-left font-normal text-xs gap-2",
              !date && "text-muted-foreground"
            )}
            title="Select custom date range"
          >
            <CalendarIcon className="h-3.5 w-3.5" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "MMM d")} - {format(date.to, "MMM d, yyyy")}
                </>
              ) : (
                format(date.from, "MMM d, yyyy")
              )
            ) : (
              <span>Custom dates</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>

      {/* Export Buttons with clear labels */}
      {showExport && onExport && (
        <div className="flex items-center gap-1 ml-auto">
          <span className="text-xs font-medium text-muted-foreground hidden sm:inline mr-1">
            Export:
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-xs gap-1.5"
            onClick={() => onExport('csv')}
            title="Download data as spreadsheet"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Spreadsheet</span>
            <span className="sm:hidden">CSV</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-xs gap-1.5"
            onClick={() => onExport('pdf')}
            title="Download as PDF report"
          >
            <FileText className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Report</span>
            <span className="sm:hidden">PDF</span>
          </Button>
        </div>
      )}
    </div>
  );
}
