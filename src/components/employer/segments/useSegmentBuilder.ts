/**
 * Segment Builder Hook
 * 
 * Manages filter state and computes live segment metrics.
 * Uses OBJECTIVE BEHAVIORAL DATA - Budget Usage & Participation Rate.
 */

import { useState, useMemo, useCallback } from 'react';
import { SegmentFilters, SegmentMetrics, SavedSegment, BehavioralGapType, SALARY_MIN, SALARY_MAX } from './types';
import { MOCK_EMPLOYEES, AI_WATCHLIST_SEGMENTS } from './mockData';

const DEFAULT_FILTERS: SegmentFilters = {
  departments: [],
  nationalities: [],
  grades: [],
  salaryRange: [SALARY_MIN, SALARY_MAX],
  tenure: null,
  utilizationRange: null,
  riskLevel: null,
  benefitType: null,
};

/**
 * Determine behavioral gap type based on participation vs budget usage
 */
function calculateBehavioralGap(participationRate: number, budgetUsage: number): {
  type: BehavioralGapType;
  insight: string;
} {
  const highParticipation = participationRate >= 60;
  const highBudgetUsage = budgetUsage >= 60;
  
  if (highParticipation && !highBudgetUsage) {
    return {
      type: 'high-engagement-low-cost',
      insight: 'Highly valued perk with minimal financial load. Consider expanding this benefit category.',
    };
  }
  
  if (!highParticipation && highBudgetUsage) {
    return {
      type: 'concentrated-spend',
      insight: 'Benefit value limited to few individuals. Review equity and consider awareness campaigns.',
    };
  }
  
  if (highParticipation && highBudgetUsage) {
    return {
      type: 'balanced',
      insight: 'Well-balanced benefit with high value realization across the workforce.',
    };
  }
  
  return {
    type: 'low-engagement',
    insight: 'Low adoption and utilization. Investigate barriers: awareness, process friction, or relevance.',
  };
}

/**
 * Compute risk level for an employee
 */
function getEmployeeRiskLevel(emp: typeof MOCK_EMPLOYEES[0]): 'at-risk' | 'watch' | 'healthy' {
  const utilizationPct = emp.budgetAllocated > 0 
    ? Math.round((emp.amountSpent / emp.budgetAllocated) * 100) 
    : 0;
  
  if (utilizationPct === 0) return 'at-risk';
  if (utilizationPct < 30) return 'watch';
  return 'healthy';
}

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
      
      // Utilization range filter
      if (filters.utilizationRange) {
        const utilizationPct = emp.budgetAllocated > 0 
          ? Math.round((emp.amountSpent / emp.budgetAllocated) * 100) 
          : 0;
        if (utilizationPct < filters.utilizationRange[0] || utilizationPct > filters.utilizationRange[1]) {
          return false;
        }
      }
      
      // Risk level filter
      if (filters.riskLevel) {
        const riskLevel = getEmployeeRiskLevel(emp);
        if (riskLevel !== filters.riskLevel) {
          return false;
        }
      }
      
      // Benefit type filter (from drill-down)
      if (filters.benefitType) {
        const hasBenefit = emp.topBenefits.some(b => b.name === filters.benefitType);
        if (!hasBenefit) {
          return false;
        }
      }
      
      return true;
    });
  }, [filters]);

  // Compute metrics for filtered employees (OBJECTIVE BEHAVIORAL DATA)
  const metrics: SegmentMetrics = useMemo(() => {
    if (filteredEmployees.length === 0) {
      return {
        matches: 0,
        totalSpend: 0,
        totalBudget: 0,
        budgetUsage: 0,
        participationRate: 0,
        participatingCount: 0,
        behavioralGap: 'low-engagement' as const,
        behavioralGapInsight: 'No employees match current filters.',
        benefitMix: [],
        topNeeds: [],
      };
    }

    // Calculate objective metrics
    const totalSpend = filteredEmployees.reduce((sum, emp) => sum + emp.amountSpent, 0);
    const totalBudget = filteredEmployees.reduce((sum, emp) => sum + emp.budgetAllocated, 0);
    const participatingCount = filteredEmployees.filter(emp => emp.hasMadeClaim).length;
    
    // Budget Usage: (Total Spent / Total Budget) %
    const budgetUsage = totalBudget > 0 ? Math.round((totalSpend / totalBudget) * 100) : 0;
    
    // Participation Rate: % of eligible who made at least 1 claim
    const participationRate = Math.round((participatingCount / filteredEmployees.length) * 100);
    
    // Calculate behavioral gap
    const { type: behavioralGap, insight: behavioralGapInsight } = calculateBehavioralGap(
      participationRate, 
      budgetUsage
    );
    
    // Aggregate benefit mix
    const benefitAggregates: Record<string, { total: number; amount: number }> = {};
    filteredEmployees.forEach(emp => {
      emp.topBenefits.forEach(b => {
        if (!benefitAggregates[b.name]) {
          benefitAggregates[b.name] = { total: 0, amount: 0 };
        }
        benefitAggregates[b.name].total += b.percentage;
        benefitAggregates[b.name].amount += emp.amountSpent * (b.percentage / 100);
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
      totalBudget,
      budgetUsage,
      participationRate,
      participatingCount,
      behavioralGap,
      behavioralGapInsight,
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
    
    if (filters.benefitType) {
      parts.push(`| ${filters.benefitType} users`);
    }
    
    if (filters.riskLevel) {
      parts.push(`| ${filters.riskLevel} risk`);
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
      setFilters(segment.filters as SegmentFilters);
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
      behavioralGap: metrics.behavioralGap,
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
      filters.tenure !== null ||
      filters.utilizationRange !== null ||
      filters.riskLevel !== null ||
      filters.benefitType !== null
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
