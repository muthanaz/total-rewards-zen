/**
 * Savings Funnel Component
 * 
 * Visual funnel showing the progression of optimization opportunities:
 * Stage 1: Identified (Total Value)
 * Stage 2: In Action Plan (Value being worked on)
 * Stage 3: Realized (Completed Actions)
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { ArrowDown, Filter } from 'lucide-react';
import { formatCurrencyAED, formatPercent, cn } from '@/lib/utils';

interface SavingsFunnelStage {
  id: string;
  label: string;
  value: number;
  color: string;
}

interface SavingsFunnelProps {
  identifiedValue: number;
  inActionPlanValue: number;
  realizedValue: number;
  className?: string;
}

export function SavingsFunnel({ 
  identifiedValue, 
  inActionPlanValue, 
  realizedValue,
  className 
}: SavingsFunnelProps) {
  const stages: SavingsFunnelStage[] = [
    { id: 'identified', label: 'Identified', value: identifiedValue, color: '--warning' },
    { id: 'in-action', label: 'In Action Plan', value: inActionPlanValue, color: '--info' },
    { id: 'realized', label: 'Realized', value: realizedValue, color: '--success' },
  ];

  const maxValue = stages[0]?.value || 1;

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Filter className="w-4 h-4 text-primary" />
          Recovery Funnel
          <InfoTooltip 
            formula="Identified → In Action Plan → Realized" 
            dataSource="optimization_opportunities + action_plan"
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-0">
        {stages.map((stage, index) => {
          const percentage = (stage.value / maxValue) * 100;
          const conversionFromPrevious = index > 0 && stages[index - 1].value > 0
            ? Math.round((stage.value / stages[index - 1].value) * 100) 
            : 100;
          
          return (
            <div key={stage.id} className="relative">
              {index > 0 && (
                <div className="flex items-center justify-center py-1.5">
                  <ArrowDown className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground ml-1">
                    {conversionFromPrevious}% conversion
                  </span>
                </div>
              )}
              <div 
                className="relative py-3 px-4 rounded-lg transition-all"
                style={{ 
                  width: `${Math.max(percentage, 40)}%`,
                  marginLeft: `${(100 - Math.max(percentage, 40)) / 2}%`,
                  backgroundColor: `hsl(var(${stage.color}) / 0.1)`,
                  borderLeft: `3px solid hsl(var(${stage.color}))`,
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{stage.label}</span>
                  <span 
                    className="text-sm font-bold tabular-nums"
                    style={{ color: `hsl(var(${stage.color}))` }}
                  >
                    {formatCurrencyAED(stage.value, { abbreviate: true })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Realized rate summary */}
        <div className="mt-4 pt-3 border-t text-center">
          <span className="text-xs text-muted-foreground">
            Realization Rate: {' '}
            <span className="font-semibold text-success">
              {identifiedValue > 0 ? formatPercent((realizedValue / identifiedValue) * 100) : '0%'}
            </span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
