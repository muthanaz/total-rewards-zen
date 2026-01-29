/**
 * PolicyInsightKPIGrid - Uses StandardKpiCard for consistent 4-row structure
 */

import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StandardKpiCard } from '@/components/ui/StandardKpiCard';
import { StandardCardGrid } from '@/components/ui/StandardCard';

interface PolicyKPI {
  label: string;
  value: number;
  target: number;
  previousValue: number;
  unit: '%' | 'days' | 'count';
  higherIsBetter: boolean;
  definition: {
    formula: string;
    dataSource: string;
  };
}

const policyKPIs: PolicyKPI[] = [
  { 
    label: 'Avg Policy Clarity', 
    value: 74, 
    target: 85, 
    previousValue: 71,
    unit: '%',
    higherIsBetter: true,
    definition: {
      formula: 'Avg. readability score from policy documents',
      dataSource: 'Policy analysis engine',
    },
  },
  { 
    label: 'Questions Resolved', 
    value: 89, 
    target: 95, 
    previousValue: 85,
    unit: '%',
    higherIsBetter: true,
    definition: {
      formula: '(Resolved Tickets / Total Tickets) × 100',
      dataSource: 'HR ticketing system',
    },
  },
  { 
    label: 'Employee Satisfaction', 
    value: 78, 
    target: 85, 
    previousValue: 76,
    unit: '%',
    higherIsBetter: true,
    definition: {
      formula: 'Avg. satisfaction rating from pulse surveys',
      dataSource: 'Employee feedback surveys',
    },
  },
  { 
    label: 'Policy Compliance', 
    value: 96, 
    target: 98, 
    previousValue: 97,
    unit: '%',
    higherIsBetter: true,
    definition: {
      formula: '(Compliant Claims / Total Claims) × 100',
      dataSource: 'Claims audit system',
    },
  },
];

export function PolicyInsightKPIGrid() {
  const getStatusColor = (value: number, target: number) => {
    const ratio = value / target;
    if (ratio >= 1) return 'text-success';
    if (ratio >= 0.9) return 'text-amber-600';
    return 'text-destructive';
  };

  const getDelta = (current: number, previous: number) => {
    return current - previous;
  };

  const getDeltaIcon = (delta: number, higherIsBetter: boolean) => {
    if (delta === 0) return <Minus className="h-3.5 w-3.5" />;
    if (delta > 0) {
      return higherIsBetter 
        ? <TrendingUp className="h-3.5 w-3.5 text-success" />
        : <TrendingUp className="h-3.5 w-3.5 text-destructive" />;
    }
    return higherIsBetter 
      ? <TrendingDown className="h-3.5 w-3.5 text-destructive" />
      : <TrendingDown className="h-3.5 w-3.5 text-success" />;
  };

  const getDeltaColor = (delta: number, higherIsBetter: boolean) => {
    if (delta === 0) return 'text-muted-foreground';
    const isGood = higherIsBetter ? delta > 0 : delta < 0;
    return isGood ? 'text-success' : 'text-destructive';
  };

  return (
    <StandardCardGrid variant="executive" columns={4}>
      {policyKPIs.map((kpi) => {
        const delta = getDelta(kpi.value, kpi.previousValue);
        
        return (
          <StandardKpiCard
            key={kpi.label}
            label={kpi.label}
            value={`${kpi.value}${kpi.unit}`}
            tooltip={kpi.definition.formula}
            delta={delta}
            deltaLabel="vs last month"
            higherIsBetter={kpi.higherIsBetter}
            scope={`Target: ${kpi.target}${kpi.unit}`}
            variant="executive"
          />
        );
      })}
    </StandardCardGrid>
  );
}
