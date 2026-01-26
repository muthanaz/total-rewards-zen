import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PolicyKPI {
  label: string;
  value: number;
  target: number;
  previousValue: number;
  unit: '%' | 'days' | 'count';
  higherIsBetter: boolean;
}

const policyKPIs: PolicyKPI[] = [
  { 
    label: 'Avg Policy Clarity', 
    value: 74, 
    target: 85, 
    previousValue: 71,
    unit: '%',
    higherIsBetter: true
  },
  { 
    label: 'Questions Resolved', 
    value: 89, 
    target: 95, 
    previousValue: 85,
    unit: '%',
    higherIsBetter: true
  },
  { 
    label: 'Employee Satisfaction', 
    value: 78, 
    target: 85, 
    previousValue: 76,
    unit: '%',
    higherIsBetter: true
  },
  { 
    label: 'Policy Compliance', 
    value: 96, 
    target: 98, 
    previousValue: 97,
    unit: '%',
    higherIsBetter: true
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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {policyKPIs.map((kpi, index) => {
        const delta = getDelta(kpi.value, kpi.previousValue);
        const deltaColor = getDeltaColor(delta, kpi.higherIsBetter);
        
        return (
          <Card key={index} className="card-elevated">
            <CardContent className="pt-5 pb-4">
              {/* Label + Target */}
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm text-muted-foreground font-medium">{kpi.label}</p>
                <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  Target: {kpi.target}{kpi.unit}
                </span>
              </div>

              {/* Value */}
              <p className={cn(
                "text-2xl lg:text-3xl font-bold",
                getStatusColor(kpi.value, kpi.target)
              )}>
                {kpi.value}{kpi.unit}
              </p>

              {/* Progress bar */}
              <Progress 
                value={(kpi.value / kpi.target) * 100} 
                className="h-1.5 mt-2 mb-2" 
              />

              {/* Delta indicator */}
              <div className={cn("flex items-center gap-1 text-sm", deltaColor)}>
                {getDeltaIcon(delta, kpi.higherIsBetter)}
                <span className="font-medium">
                  {delta > 0 ? '+' : ''}{delta}{kpi.unit}
                </span>
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
