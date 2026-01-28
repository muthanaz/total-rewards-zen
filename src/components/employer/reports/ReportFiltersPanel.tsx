/**
 * Report Filters Panel Component
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
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
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  ReportDefinition,
  ReportFilters,
  TimeRangeOption,
  TIME_RANGE_OPTIONS,
} from './types';
import { MOCK_SEGMENTS, MOCK_GRADES } from './mockData';

interface ReportFiltersPanelProps {
  report: ReportDefinition;
  filters: ReportFilters;
  onChange: (filters: ReportFilters) => void;
}

export function ReportFiltersPanel({
  report,
  filters,
  onChange,
}: ReportFiltersPanelProps) {
  const [customStartOpen, setCustomStartOpen] = useState(false);
  const [customEndOpen, setCustomEndOpen] = useState(false);

  const handleTimeRangeChange = (value: TimeRangeOption) => {
    onChange({
      ...filters,
      timeRange: value,
      customStartDate: undefined,
      customEndDate: undefined,
    });
  };

  const handleSegmentToggle = (segmentId: string) => {
    const current = filters.segments || [];
    const updated = current.includes(segmentId)
      ? current.filter((s) => s !== segmentId)
      : [...current, segmentId];
    onChange({ ...filters, segments: updated });
  };

  const handleGradeToggle = (gradeId: string) => {
    const current = filters.grades || [];
    const updated = current.includes(gradeId)
      ? current.filter((g) => g !== gradeId)
      : [...current, gradeId];
    onChange({ ...filters, grades: updated });
  };

  const clearFilters = () => {
    onChange({
      timeRange: 'ytd',
      segments: [],
      departments: [],
      grades: [],
    });
  };

  const activeFilterCount =
    (filters.segments?.length || 0) +
    (filters.grades?.length || 0) +
    (filters.timeRange !== 'ytd' ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Report Filters</h4>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs text-muted-foreground"
            onClick={clearFilters}
          >
            <X className="w-3 h-3 mr-1" />
            Clear ({activeFilterCount})
          </Button>
        )}
      </div>

      {/* Time Range */}
      {report.supportsTimeRange && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Time Range</Label>
          <Select
            value={filters.timeRange}
            onValueChange={(v) => handleTimeRangeChange(v as TimeRangeOption)}
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_RANGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Custom Date Range */}
          {filters.timeRange === 'custom' && (
            <div className="flex gap-2 mt-2">
              <Popover open={customStartOpen} onOpenChange={setCustomStartOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      'flex-1 justify-start text-xs font-normal',
                      !filters.customStartDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="w-3 h-3 mr-2" />
                    {filters.customStartDate
                      ? format(filters.customStartDate, 'MMM d, yyyy')
                      : 'Start date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.customStartDate}
                    onSelect={(date) => {
                      onChange({ ...filters, customStartDate: date });
                      setCustomStartOpen(false);
                    }}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>

              <Popover open={customEndOpen} onOpenChange={setCustomEndOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      'flex-1 justify-start text-xs font-normal',
                      !filters.customEndDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="w-3 h-3 mr-2" />
                    {filters.customEndDate
                      ? format(filters.customEndDate, 'MMM d, yyyy')
                      : 'End date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.customEndDate}
                    onSelect={(date) => {
                      onChange({ ...filters, customEndDate: date });
                      setCustomEndOpen(false);
                    }}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>
      )}

      {/* Segments Filter */}
      {report.supportsSegmentFilter && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Departments</Label>
          <div className="grid grid-cols-2 gap-2">
            {MOCK_SEGMENTS.map((segment) => (
              <div
                key={segment.id}
                className="flex items-center space-x-2"
              >
                <Checkbox
                  id={`segment-${segment.id}`}
                  checked={filters.segments?.includes(segment.id)}
                  onCheckedChange={() => handleSegmentToggle(segment.id)}
                />
                <label
                  htmlFor={`segment-${segment.id}`}
                  className="text-xs cursor-pointer"
                >
                  {segment.name}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grades Filter */}
      {report.supportsSegmentFilter && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Grades</Label>
          <div className="flex flex-wrap gap-2">
            {MOCK_GRADES.map((grade) => (
              <Badge
                key={grade.id}
                variant={filters.grades?.includes(grade.id) ? 'default' : 'outline'}
                className="cursor-pointer text-xs"
                onClick={() => handleGradeToggle(grade.id)}
              >
                {grade.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {activeFilterCount > 0 && (
        <div className="pt-3 border-t border-border/50">
          <div className="flex flex-wrap gap-1">
            {filters.timeRange !== 'ytd' && (
              <Badge variant="secondary" className="text-[10px]">
                {TIME_RANGE_OPTIONS.find((o) => o.value === filters.timeRange)?.label}
              </Badge>
            )}
            {filters.segments?.map((s) => (
              <Badge key={s} variant="secondary" className="text-[10px]">
                {MOCK_SEGMENTS.find((seg) => seg.id === s)?.name}
              </Badge>
            ))}
            {filters.grades?.map((g) => (
              <Badge key={g} variant="secondary" className="text-[10px]">
                {g}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
