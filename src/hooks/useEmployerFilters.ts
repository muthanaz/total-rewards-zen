import { useSearchParams } from 'react-router-dom';
import { useMemo, useCallback } from 'react';

export type PeriodType = 'this-month' | 'quarter' | 'ytd' | 'custom';

export interface EmployerFilters {
  period: PeriodType;
  department: string;
  grade: string;
  location: string;
  employmentType: string;
  customDateFrom?: string;
  customDateTo?: string;
}

export interface EmployerFiltersState extends EmployerFilters {
  activeFilterCount: number;
  filterSummary: string[];
  hasActiveFilters: boolean;
}

const DEFAULT_FILTERS: EmployerFilters = {
  period: 'ytd',
  department: 'all',
  grade: 'all',
  location: 'all',
  employmentType: 'all',
};

// Filter options for dropdowns
export const FILTER_OPTIONS = {
  periods: [
    { value: 'this-month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'ytd', label: 'Year to Date' },
    { value: 'custom', label: 'Custom Range' },
  ],
  departments: [
    { value: 'all', label: 'All Departments' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'sales', label: 'Sales' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'operations', label: 'Operations' },
    { value: 'hr', label: 'Human Resources' },
    { value: 'finance', label: 'Finance' },
  ],
  grades: [
    { value: 'all', label: 'All Grades' },
    { value: 'L1', label: 'L1 - Entry' },
    { value: 'L2', label: 'L2 - Associate' },
    { value: 'L3', label: 'L3 - Senior' },
    { value: 'L4', label: 'L4 - Lead' },
    { value: 'L5', label: 'L5 - Manager' },
    { value: 'L6', label: 'L6 - Director' },
    { value: 'L7', label: 'L7 - Executive' },
  ],
  locations: [
    { value: 'all', label: 'All Locations' },
    { value: 'dubai', label: 'Dubai' },
    { value: 'abu-dhabi', label: 'Abu Dhabi' },
    { value: 'sharjah', label: 'Sharjah' },
    { value: 'remote', label: 'Remote' },
  ],
  employmentTypes: [
    { value: 'all', label: 'All Types' },
    { value: 'full-time', label: 'Full-Time' },
    { value: 'part-time', label: 'Part-Time' },
    { value: 'contract', label: 'Contract' },
  ],
};

export function useEmployerFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse current filters from URL
  const filters = useMemo<EmployerFilters>(() => ({
    period: (searchParams.get('period') as PeriodType) || DEFAULT_FILTERS.period,
    department: searchParams.get('department') || DEFAULT_FILTERS.department,
    grade: searchParams.get('grade') || DEFAULT_FILTERS.grade,
    location: searchParams.get('location') || DEFAULT_FILTERS.location,
    employmentType: searchParams.get('employmentType') || DEFAULT_FILTERS.employmentType,
    customDateFrom: searchParams.get('dateFrom') || undefined,
    customDateTo: searchParams.get('dateTo') || undefined,
  }), [searchParams]);

  // Calculate active filter count and summary
  const filtersState = useMemo<EmployerFiltersState>(() => {
    const summary: string[] = [];
    let count = 0;

    // Period is always shown but only counted if not default
    if (filters.period !== 'ytd') {
      const periodLabel = FILTER_OPTIONS.periods.find(p => p.value === filters.period)?.label;
      if (periodLabel) summary.push(periodLabel);
      count++;
    }

    if (filters.department !== 'all') {
      const label = FILTER_OPTIONS.departments.find(d => d.value === filters.department)?.label;
      if (label) summary.push(label);
      count++;
    }

    if (filters.grade !== 'all') {
      const label = FILTER_OPTIONS.grades.find(g => g.value === filters.grade)?.label;
      if (label) summary.push(label);
      count++;
    }

    if (filters.location !== 'all') {
      const label = FILTER_OPTIONS.locations.find(l => l.value === filters.location)?.label;
      if (label) summary.push(label);
      count++;
    }

    if (filters.employmentType !== 'all') {
      const label = FILTER_OPTIONS.employmentTypes.find(e => e.value === filters.employmentType)?.label;
      if (label) summary.push(label);
      count++;
    }

    return {
      ...filters,
      activeFilterCount: count,
      filterSummary: summary,
      hasActiveFilters: count > 0,
    };
  }, [filters]);

  // Update a single filter
  const setFilter = useCallback(<K extends keyof EmployerFilters>(
    key: K,
    value: EmployerFilters[K]
  ) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      
      if (value === DEFAULT_FILTERS[key] || value === 'all' || !value) {
        newParams.delete(key === 'customDateFrom' ? 'dateFrom' : key === 'customDateTo' ? 'dateTo' : key);
      } else {
        const paramKey = key === 'customDateFrom' ? 'dateFrom' : key === 'customDateTo' ? 'dateTo' : key;
        newParams.set(paramKey, value as string);
      }
      
      return newParams;
    }, { replace: true });
  }, [setSearchParams]);

  // Update multiple filters at once
  const setFilters = useCallback((updates: Partial<EmployerFilters>) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      
      Object.entries(updates).forEach(([key, value]) => {
        const paramKey = key === 'customDateFrom' ? 'dateFrom' : key === 'customDateTo' ? 'dateTo' : key;
        if (value === DEFAULT_FILTERS[key as keyof EmployerFilters] || value === 'all' || !value) {
          newParams.delete(paramKey);
        } else {
          newParams.set(paramKey, value as string);
        }
      });
      
      return newParams;
    }, { replace: true });
  }, [setSearchParams]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  return {
    filters: filtersState,
    setFilter,
    setFilters,
    clearFilters,
  };
}
