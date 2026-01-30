/**
 * SpendFiltersBar - Sticky filters for Spend & Forecast
 * 
 * Filters:
 * - Time range (YTD/Quarter/Month)
 * - Segment filters (Grade, Dept, Location)
 * - Benefit pillar/category filter
 */

import { useState } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Calendar, 
  Building2, 
  Users, 
  MapPin,
  Layers,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type TimeRange = 'ytd' | 'fy' | 'month' | 'quarter' | 'custom';

export interface SpendFilters {
  timeRange: TimeRange;
  grades: string[];
  departments: string[];
  locations: string[];
  benefitPillars: string[];
}

interface SpendFiltersBarProps {
  filters: SpendFilters;
  onFiltersChange: (filters: SpendFilters) => void;
  className?: string;
}

// Filter options
const GRADE_OPTIONS = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7'];
const DEPARTMENT_OPTIONS = ['Engineering', 'Sales', 'Marketing', 'Operations', 'HR', 'Finance'];
const LOCATION_OPTIONS = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Remote'];
const PILLAR_OPTIONS = ['Housing', 'Education', 'Health', 'Transport', 'Wellbeing', 'Financial'];

// Multi-select filter component
function MultiSelectFilter({
  label,
  icon: Icon,
  options,
  selected,
  onSelectionChange,
}: {
  label: string;
  icon: React.ElementType;
  options: string[];
  selected: string[];
  onSelectionChange: (selected: string[]) => void;
}) {
  const hasSelection = selected.length > 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={cn(
            "h-8 gap-1.5 text-xs",
            hasSelection && "border-accent text-accent"
          )}
        >
          <Icon className="w-3.5 h-3.5" />
          {label}
          {hasSelection && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
              {selected.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2 bg-popover" align="start">
        <div className="space-y-1">
          {options.map((option) => (
            <label
              key={option}
              className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent/10 cursor-pointer text-sm"
            >
              <Checkbox
                checked={selected.includes(option)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onSelectionChange([...selected, option]);
                  } else {
                    onSelectionChange(selected.filter((s) => s !== option));
                  }
                }}
              />
              {option}
            </label>
          ))}
        </div>
        {hasSelection && (
          <div className="pt-2 mt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-7 text-xs text-muted-foreground"
              onClick={() => onSelectionChange([])}
            >
              Clear selection
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

export function SpendFiltersBar({ 
  filters, 
  onFiltersChange,
  className,
}: SpendFiltersBarProps) {
  const activeFilterCount = 
    (filters.grades.length > 0 ? 1 : 0) +
    (filters.departments.length > 0 ? 1 : 0) +
    (filters.locations.length > 0 ? 1 : 0) +
    (filters.benefitPillars.length > 0 ? 1 : 0);

  const updateFilter = <K extends keyof SpendFilters>(
    key: K, 
    value: SpendFilters[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      timeRange: filters.timeRange,
      grades: [],
      departments: [],
      locations: [],
      benefitPillars: [],
    });
  };

  return (
    <div className={cn(
      "sticky top-0 z-20 -mx-6 px-6 py-3 bg-background/95 backdrop-blur-sm border-b flex items-center gap-3 flex-wrap",
      className
    )}>
      {/* 1. Period Selector (YTD/FY/MTD) - First in consistent order */}
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-muted-foreground" />
        <Select
          value={filters.timeRange}
          onValueChange={(value) => updateFilter('timeRange', value as TimeRange)}
        >
          <SelectTrigger className="h-8 w-[100px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ytd">YTD</SelectItem>
            <SelectItem value="fy">Full Year</SelectItem>
            <SelectItem value="month">MTD</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="h-6 w-px bg-border" />

      {/* 2. Grade Filter */}
      <MultiSelectFilter
        label="Grade"
        icon={Users}
        options={GRADE_OPTIONS}
        selected={filters.grades}
        onSelectionChange={(selected) => updateFilter('grades', selected)}
      />

      {/* 3. Department Filter */}
      <MultiSelectFilter
        label="Department"
        icon={Building2}
        options={DEPARTMENT_OPTIONS}
        selected={filters.departments}
        onSelectionChange={(selected) => updateFilter('departments', selected)}
      />

      {/* 4. Location Filter */}
      <MultiSelectFilter
        label="Location"
        icon={MapPin}
        options={LOCATION_OPTIONS}
        selected={filters.locations}
        onSelectionChange={(selected) => updateFilter('locations', selected)}
      />

      {/* 5. Benefit Pillar Filter - Last in consistent order */}
      <MultiSelectFilter
        label="Benefit Pillar"
        icon={Layers}
        options={PILLAR_OPTIONS}
        selected={filters.benefitPillars}
        onSelectionChange={(selected) => updateFilter('benefitPillars', selected)}
      />

      {/* Clear All */}
      {activeFilterCount > 0 && (
        <>
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground gap-1"
            onClick={clearAllFilters}
          >
            <X className="w-3 h-3" />
            Clear {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}
          </Button>
        </>
      )}
    </div>
  );
}
