import { useState } from 'react';
import { format } from 'date-fns';
import { 
  Filter, 
  X, 
  CalendarIcon, 
  Building2, 
  Users, 
  MapPin, 
  Briefcase,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { 
  useEmployerFilters, 
  FILTER_OPTIONS, 
  PeriodType 
} from '@/hooks/useEmployerFilters';

interface EmployerGlobalFiltersBarProps {
  showEmploymentType?: boolean;
  className?: string;
  compact?: boolean;
}

export function EmployerGlobalFiltersBar({ 
  showEmploymentType = false,
  className,
  compact = false,
}: EmployerGlobalFiltersBarProps) {
  const { filters, setFilter, clearFilters } = useEmployerFilters();
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    filters.customDateFrom ? new Date(filters.customDateFrom) : undefined
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(
    filters.customDateTo ? new Date(filters.customDateTo) : undefined
  );

  const handlePeriodChange = (value: string) => {
    setFilter('period', value as PeriodType);
    if (value !== 'custom') {
      setFilter('customDateFrom', undefined);
      setFilter('customDateTo', undefined);
      setDateFrom(undefined);
      setDateTo(undefined);
    }
  };

  const handleDateFromChange = (date: Date | undefined) => {
    setDateFrom(date);
    setFilter('customDateFrom', date ? format(date, 'yyyy-MM-dd') : undefined);
  };

  const handleDateToChange = (date: Date | undefined) => {
    setDateTo(date);
    setFilter('customDateTo', date ? format(date, 'yyyy-MM-dd') : undefined);
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Main Filter Bar */}
      <div className={cn(
        "flex flex-wrap items-center gap-2 p-3 rounded-xl bg-muted/30 border border-border/50",
        compact && "p-2"
      )}>
        {/* Filter Icon */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Filter className="w-4 h-4" />
          {!compact && <span className="text-sm font-medium hidden sm:inline">Filters</span>}
        </div>

        <div className="h-4 w-px bg-border/50 hidden sm:block" />

        {/* Period Selector */}
        <Select value={filters.period} onValueChange={handlePeriodChange}>
          <SelectTrigger className={cn(
            "h-8 bg-background border-border/50",
            compact ? "w-[120px]" : "w-[140px]"
          )}>
            <CalendarIcon className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FILTER_OPTIONS.periods.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Custom Date Range (when period is custom) */}
        {filters.period === 'custom' && (
          <div className="flex items-center gap-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 px-2 text-xs"
                >
                  {dateFrom ? format(dateFrom, 'MMM d') : 'From'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={handleDateFromChange}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <span className="text-xs text-muted-foreground">→</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 px-2 text-xs"
                >
                  {dateTo ? format(dateTo, 'MMM d') : 'To'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={handleDateToChange}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* Department */}
        <Select value={filters.department} onValueChange={(v) => setFilter('department', v)}>
          <SelectTrigger className={cn(
            "h-8 bg-background border-border/50",
            compact ? "w-[130px]" : "w-[150px]"
          )}>
            <Building2 className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FILTER_OPTIONS.departments.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Grade */}
        <Select value={filters.grade} onValueChange={(v) => setFilter('grade', v)}>
          <SelectTrigger className={cn(
            "h-8 bg-background border-border/50",
            compact ? "w-[100px]" : "w-[120px]"
          )}>
            <Users className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FILTER_OPTIONS.grades.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Location */}
        <Select value={filters.location} onValueChange={(v) => setFilter('location', v)}>
          <SelectTrigger className={cn(
            "h-8 bg-background border-border/50",
            compact ? "w-[110px]" : "w-[130px]"
          )}>
            <MapPin className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FILTER_OPTIONS.locations.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Employment Type (optional) */}
        {showEmploymentType && (
          <Select value={filters.employmentType} onValueChange={(v) => setFilter('employmentType', v)}>
            <SelectTrigger className={cn(
              "h-8 bg-background border-border/50",
              compact ? "w-[100px]" : "w-[120px]"
            )}>
              <Briefcase className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FILTER_OPTIONS.employmentTypes.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Clear Filters */}
        {filters.hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="w-3.5 h-3.5 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filters Summary */}
      {filters.hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Filtered by:</span>
          {filters.filterSummary.map((filter, index) => (
            <Badge 
              key={index} 
              variant="secondary" 
              className="text-xs bg-primary/10 text-primary border-0"
            >
              {filter}
            </Badge>
          ))}
          <Badge 
            variant="outline" 
            className="text-xs text-muted-foreground cursor-pointer hover:bg-muted"
            onClick={clearFilters}
          >
            Clear all
          </Badge>
        </div>
      )}
    </div>
  );
}

// Compact summary pill for inline display
export function FilterSummaryPill({ className }: { className?: string }) {
  const { filters, clearFilters } = useEmployerFilters();

  if (!filters.hasActiveFilters) return null;

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <Badge 
        variant="secondary" 
        className="text-xs bg-primary/10 text-primary border-0 gap-1"
      >
        <Filter className="w-3 h-3" />
        {filters.activeFilterCount} filter{filters.activeFilterCount !== 1 ? 's' : ''} active
      </Badge>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={clearFilters}
        className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
      >
        <X className="w-3 h-3" />
      </Button>
    </div>
  );
}
