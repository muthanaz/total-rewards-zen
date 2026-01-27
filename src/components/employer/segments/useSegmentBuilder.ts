/**
 * Segment Builder Hook
 * 
 * Manages filter state and computes live segment metrics.
 */

import { useState, useMemo, useCallback } from 'react';
import { SegmentFilters, SegmentMetrics, SavedSegment, MockEmployee, SALARY_MIN, SALARY_MAX } from './types';
import { MOCK_EMPLOYEES, AI_WATCHLIST_SEGMENTS } from './mockData';

const DEFAULT_FILTERS: SegmentFilters = {
  departments: [],
  nationalities: [],
  grades: [],
  salaryRange: [SALARY_MIN, SALARY_MAX],
  tenure: null,
};

export function useSegmentBuilder() {
  const [filters, setFilters] = useState<SegmentFilters>(DEFAULT_FILTERS);
  const [savedSegments, setSavedSegments] = useState<SavedSegment[]>([]);
  const [selectedWatchlistId, setSelectedWatchlistId] = useState<string | null>(null);

  // Filter employees based on current filters
  const filteredEmployees = useMemo(() => {
    return MOCK_EMPLOYEES.filter((emp) => {
      // Department filter
      if (filters.departments.length > 0 && !filters.departments.includes(emp.department)) {
        return false;
      }
      
      // Nationality filter
      if (filters.nationalities.length > 0 && !filters.nationalities.includes(emp.nationality)) {
        return false;
      }
      
      // Grade filter
      if (filters.grades.length > 0 && !filters.grades.includes(emp.grade)) {
        return false;
      }
      
      // Salary range filter
      if (emp.salary < filters.salaryRange[0] || emp.salary > filters.salaryRange[1]) {
        return false;
      }
      
      // Tenure filter
      if (filters.tenure && emp.tenure !== filters.tenure) {
        return false;
      }
      
      return true;
    });
  }, [filters]);

  // Compute metrics for filtered employees
  const metrics: SegmentMetrics = useMemo(() => {
    if (filteredEmployees.length === 0) {
      return {
        matches: 0,
        totalSpend: 0,
        utilizationRate: 0,
        riskScore: 'low' as const,
        happyCount: 0,
        frustratedCount: 0,
        benefitMix: [],
        topNeeds: [],
      };
    }

    const totalSpend = filteredEmployees.reduce((sum, emp) => sum + emp.totalSpend, 0);
    const avgUtilization = filteredEmployees.reduce((sum, emp) => sum + emp.utilizationRate, 0) / filteredEmployees.length;
    
    const happyCount = filteredEmployees.filter(emp => emp.satisfaction === 'happy').length;
    const frustratedCount = filteredEmployees.filter(emp => emp.satisfaction === 'frustrated').length;
    
    // Calculate risk score based on frustrated ratio
    const frustratedRatio = frustratedCount / filteredEmployees.length;
    const riskScore = frustratedRatio > 0.3 ? 'high' : frustratedRatio > 0.15 ? 'medium' : 'low';
    
    // Aggregate benefit mix
    const benefitAggregates: Record<string, { total: number; amount: number }> = {};
    filteredEmployees.forEach(emp => {
      emp.topBenefits.forEach(b => {
        if (!benefitAggregates[b.name]) {
          benefitAggregates[b.name] = { total: 0, amount: 0 };
        }
        benefitAggregates[b.name].total += b.percentage;
        benefitAggregates[b.name].amount += emp.totalSpend * (b.percentage / 100);
      });
    });
    
    const benefitMix = Object.entries(benefitAggregates)
      .map(([name, { total, amount }]) => ({
        name,
        percentage: Math.round(total / filteredEmployees.length),
        amount: Math.round(amount),
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 6);
    
    // Aggregate top needs
    const needsCount: Record<string, number> = {};
    filteredEmployees.forEach(emp => {
      emp.topNeeds.forEach(need => {
        needsCount[need] = (needsCount[need] || 0) + 1;
      });
    });
    
    const topNeeds = Object.entries(needsCount)
      .map(([need, count]) => ({ need, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    return {
      matches: filteredEmployees.length,
      totalSpend,
      utilizationRate: Math.round(avgUtilization),
      riskScore,
      happyCount,
      frustratedCount,
      benefitMix,
      topNeeds,
    };
  }, [filteredEmployees]);

  // Generate dynamic title based on filters
  const dynamicTitle = useMemo(() => {
    const parts: string[] = [];
    
    if (filters.nationalities.length === 1) {
      parts.push(filters.nationalities[0]);
    } else if (filters.nationalities.length > 1) {
      parts.push('Mixed Nationality');
    }
    
    if (filters.departments.length === 1) {
      parts.push(`in ${filters.departments[0]} Dept`);
    } else if (filters.departments.length > 1) {
      parts.push(`in ${filters.departments.length} Depts`);
    }
    
    if (filters.grades.length > 0) {
      if (filters.grades.length === 1) {
        parts.push(`(${filters.grades[0]})`);
      } else {
        parts.push(`(${filters.grades.length} Grades)`);
      }
    }
    
    if (filters.tenure) {
      parts.push(`| ${filters.tenure} tenure`);
    }
    
    return parts.length > 0 ? `Analysis: ${parts.join(' ')}` : 'Analysis: All Employees';
  }, [filters]);

  // Update individual filter
  const updateFilter = useCallback(<K extends keyof SegmentFilters>(
    key: K,
    value: SegmentFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setSelectedWatchlistId(null); // Clear watchlist selection when manually filtering
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSelectedWatchlistId(null);
  }, []);

  // Apply watchlist segment filters
  const applyWatchlistSegment = useCallback((segmentId: string) => {
    const segment = AI_WATCHLIST_SEGMENTS.find(s => s.id === segmentId);
    if (segment) {
      setFilters(segment.filters);
      setSelectedWatchlistId(segmentId);
    }
  }, []);

  // Save current filters as new segment
  const saveSegment = useCallback((name: string) => {
    const newSegment: SavedSegment = {
      id: `custom-${Date.now()}`,
      name,
      filters: { ...filters },
      isAI: false,
      icon: 'Bookmark',
      matchCount: metrics.matches,
      riskScore: metrics.riskScore,
    };
    setSavedSegments(prev => [...prev, newSegment]);
    return newSegment;
  }, [filters, metrics]);

  // Check if filters are modified from default
  const hasActiveFilters = useMemo(() => {
    return (
      filters.departments.length > 0 ||
      filters.nationalities.length > 0 ||
      filters.grades.length > 0 ||
      filters.salaryRange[0] !== SALARY_MIN ||
      filters.salaryRange[1] !== SALARY_MAX ||
      filters.tenure !== null
    );
  }, [filters]);

  return {
    filters,
    updateFilter,
    resetFilters,
    metrics,
    filteredEmployees,
    dynamicTitle,
    hasActiveFilters,
    savedSegments,
    saveSegment,
    aiWatchlist: AI_WATCHLIST_SEGMENTS,
    selectedWatchlistId,
    applyWatchlistSegment,
  };
}
