/**
 * Policy Impact Preview Component
 * 
 * Shows affected headcount, spend impact, and risk flags.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign,
  Target,
  ShieldAlert,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { cn, formatCurrencyAED } from '@/lib/utils';
import { PolicyImpactPreview, PolicyRiskFlag } from './types';

interface PolicyImpactPreviewCardProps {
  impact: PolicyImpactPreview;
}

export function PolicyImpactPreviewCard({ impact }: PolicyImpactPreviewCardProps) {
  const highRiskCount = impact.riskFlags.filter((f) => f.severity === 'high').length;
  const mediumRiskCount = impact.riskFlags.filter((f) => f.severity === 'medium').length;

  const getRiskIcon = (severity: PolicyRiskFlag['severity']) => {
    switch (severity) {
      case 'high':
        return <ShieldAlert className="w-4 h-4 text-destructive" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'low':
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getRiskBadgeColor = (severity: PolicyRiskFlag['severity']) => {
    switch (severity) {
      case 'high':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'low':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    }
  };

  return (
    <Card className="border-amber-500/30 bg-amber-500/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-600" />
            Policy Impact Preview
          </CardTitle>
          {highRiskCount > 0 && (
            <Badge className="bg-destructive/10 text-destructive border-destructive/20">
              {highRiskCount} High Risk
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 rounded-lg bg-background border">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs">Affected</span>
            </div>
            <p className="text-xl font-bold tabular-nums">
              {impact.affectedHeadcount}
            </p>
            <p className="text-xs text-muted-foreground">employees</p>
          </div>

          <div className="p-3 rounded-lg bg-background border">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs">Eligible</span>
            </div>
            <p className="text-xl font-bold tabular-nums">
              {impact.eligibleEmployees}
            </p>
            <p className="text-xs text-muted-foreground">
              {((impact.eligibleEmployees / impact.affectedHeadcount) * 100).toFixed(0)}% coverage
            </p>
          </div>

          <div className="p-3 rounded-lg bg-background border">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs">Est. Annual Spend</span>
            </div>
            <p className="text-xl font-bold tabular-nums">
              {formatCurrencyAED(impact.estimatedAnnualSpend)}
            </p>
            <p className="text-xs text-muted-foreground">
              Range: {formatCurrencyAED(impact.estimatedSpendRange.min)} - {formatCurrencyAED(impact.estimatedSpendRange.max)}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-background border">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs">Utilization</span>
            </div>
            <p className="text-xl font-bold tabular-nums">
              {impact.utilizationProjection}%
            </p>
            <Progress value={impact.utilizationProjection} className="h-1.5 mt-1" />
          </div>
        </div>

        {/* Budget Comparison */}
        <div className="p-4 rounded-lg bg-background border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Budget Allocation</span>
            <span className="text-sm font-bold tabular-nums">
              {formatCurrencyAED(impact.budgetAllocation)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Progress 
              value={(impact.estimatedAnnualSpend / impact.budgetAllocation) * 100} 
              className="h-2 flex-1" 
            />
            <span className="text-xs text-muted-foreground">
              {((impact.estimatedAnnualSpend / impact.budgetAllocation) * 100).toFixed(0)}%
            </span>
          </div>
          {impact.estimatedAnnualSpend > impact.budgetAllocation && (
            <p className="text-xs text-destructive mt-2 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Projected spend exceeds budget allocation
            </p>
          )}
        </div>

        {/* Risk Flags */}
        {impact.riskFlags.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Risk Flags
            </h4>
            <div className="space-y-2">
              {impact.riskFlags.map((flag) => (
                <div
                  key={flag.id}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-lg border',
                    flag.severity === 'high' && 'bg-destructive/5 border-destructive/20',
                    flag.severity === 'medium' && 'bg-amber-500/5 border-amber-500/20',
                    flag.severity === 'low' && 'bg-blue-500/5 border-blue-500/20'
                  )}
                >
                  {getRiskIcon(flag.severity)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{flag.title}</span>
                      <Badge variant="outline" className={cn('text-[10px]', getRiskBadgeColor(flag.severity))}>
                        {flag.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {flag.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Risks */}
        {impact.riskFlags.length === 0 && (
          <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-emerald-700">No Risk Flags Detected</p>
            <p className="text-xs text-muted-foreground">
              Policy configuration looks good
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
