/**
 * Utilization Funnel
 * 
 * Visual funnel showing: Eligible → Submitted → Approved → Paid
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Progress } from '@/components/ui/progress';
import { ArrowDown, Layers } from 'lucide-react';
import { formatCurrencyAED, formatPercent, cn } from '@/lib/utils';

interface FunnelStage {
  id: string;
  label: string;
  value: number;
  count?: number;
  color: string;
}

interface UtilizationFunnelProps {
  stages: FunnelStage[];
  className?: string;
}

export function UtilizationFunnel({ stages, className }: UtilizationFunnelProps) {
  const maxValue = stages[0]?.value || 1;

  return (
    <Card className={cn('card-elevated', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" />
          Utilization Funnel
          <InfoTooltip 
            formula="Eligible → Submitted → Approved → Paid" 
            dataSource="benefit_entitlements + requests"
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-0">
        {stages.map((stage, index) => {
          const percentage = (stage.value / maxValue) * 100;
          const conversionFromPrevious = index > 0 
            ? Math.round((stage.value / stages[index - 1].value) * 100) 
            : 100;
          
          return (
            <div key={stage.id} className="relative">
              {index > 0 && (
                <div className="flex items-center justify-center py-1">
                  <ArrowDown className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground ml-1">
                    {conversionFromPrevious}% conversion
                  </span>
                </div>
              )}
              <div 
                className="relative py-3 px-4 rounded-lg transition-all"
                style={{ 
                  width: `${Math.max(percentage, 30)}%`,
                  marginLeft: `${(100 - Math.max(percentage, 30)) / 2}%`,
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
                    {formatCurrencyAED(stage.value)}
                  </span>
                </div>
                {stage.count !== undefined && (
                  <span className="text-xs text-muted-foreground">
                    {stage.count} claims
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// Default funnel data generator
export function generateFunnelData(data: {
  eligible: number;
  submitted: number;
  approved: number;
  paid: number;
  submittedCount?: number;
  approvedCount?: number;
  paidCount?: number;
}): FunnelStage[] {
  return [
    { id: 'eligible', label: 'Eligible', value: data.eligible, color: '--chart-1' },
    { id: 'submitted', label: 'Submitted', value: data.submitted, count: data.submittedCount, color: '--chart-2' },
    { id: 'approved', label: 'Approved', value: data.approved, count: data.approvedCount, color: '--chart-3' },
    { id: 'paid', label: 'Paid', value: data.paid, count: data.paidCount, color: '--success' },
  ];
}
