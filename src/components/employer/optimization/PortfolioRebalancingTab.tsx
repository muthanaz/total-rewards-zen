/**
 * Portfolio Rebalancing Tab - The CEO View
 * 
 * Focus: Shift budget across pillars based on utilization/need
 * Outputs: Proposed reallocation map, Employee impact estimate, Policy changes
 * Action: "Simulate" (primary) + "Create Action" / "Open Policy"
 * Value Proposition: "Align Spend with Employee Needs"
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { 
  ArrowRightLeft,
  Scale,
} from 'lucide-react';
import { formatCurrencyAED, formatPercent, cn } from '@/lib/utils';
import { PortfolioRebalanceItem } from './types';
import { OptimizationRecommendationCard, OptimizationRecommendation } from './OptimizationRecommendationCard';
import { TabDefinitionBanner } from './TabDefinitionBanner';

interface PortfolioRebalancingTabProps {
  items: PortfolioRebalanceItem[];
  totalReallocationMin: number;
  totalReallocationMax: number;
  onSimulate: (item: PortfolioRebalanceItem) => void;
  onCreateAction: (item: PortfolioRebalanceItem) => void;
  onOpenPolicy?: (policyId: string) => void;
  onEvaluatePolicyShift?: (item: PortfolioRebalanceItem) => void; // Legacy support
}

// Transform PortfolioRebalanceItem to OptimizationRecommendation
function toRecommendation(item: PortfolioRebalanceItem): OptimizationRecommendation {
  return {
    id: item.id,
    title: item.title,
    category: `${item.sourceCategory} → ${item.suggestedTarget}`,
    impactMin: item.reallocationAmountMin,
    impactMax: item.reallocationAmountMax,
    confidence: item.targetDemand === 'high' ? 'high' : 'medium',
    mechanism: item.mechanism,
    riskDownside: item.riskDownside,
    type: 'portfolio_rebalancing',
    rootCause: `${formatPercent(item.sourceUtilization)} utilized`,
    affectedHeadcount: item.employeeImpactEstimate,
    relatedPolicyId: item.policyChangesRequired?.[0],
  };
}

export function PortfolioRebalancingTab({ 
  items, 
  totalReallocationMin,
  totalReallocationMax,
  onSimulate,
  onCreateAction,
  onOpenPolicy,
  onEvaluatePolicyShift,
}: PortfolioRebalancingTabProps) {
  // Calculate aggregate stats
  const avgSourceUtilization = items.length > 0 
    ? items.reduce((sum, i) => sum + i.sourceUtilization, 0) / items.length 
    : 0;
  const highDemandTargets = items.filter(i => i.targetDemand === 'high').length;
  const totalEmployeeImpact = items.reduce((sum, i) => sum + (i.employeeImpactEstimate || 0), 0);

  const handleSimulate = (rec: OptimizationRecommendation) => {
    const item = items.find(i => i.id === rec.id);
    if (item) onSimulate(item);
  };

  const handleCreateAction = (rec: OptimizationRecommendation) => {
    const item = items.find(i => i.id === rec.id);
    if (item) onCreateAction(item);
  };

  return (
    <div className="space-y-6">
      {/* Tab Definition Banner */}
      <TabDefinitionBanner tab="portfolio_rebalancing" />

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Underutilized Budgets</p>
            <p className="text-2xl font-bold">{items.length}</p>
            <p className="text-xs text-muted-foreground">
              Avg. {formatPercent(avgSourceUtilization)} utilization
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">High-Demand Targets</p>
            <p className="text-2xl font-bold text-success">{highDemandTargets}</p>
            <p className="text-xs text-muted-foreground">Categories with unmet demand</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Employees Impacted</p>
            <p className="text-2xl font-bold">{totalEmployeeImpact}</p>
            <p className="text-xs text-muted-foreground">Across all shifts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Reallocation Potential</p>
            <p className="text-xl font-bold text-accent">
              {formatCurrencyAED(totalReallocationMin, { abbreviate: true })}
              <span className="text-sm font-normal text-muted-foreground">
                {' – '}{formatCurrencyAED(totalReallocationMax, { abbreviate: true })}
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations Grid */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                Rebalancing Opportunities
                <InfoTooltip 
                  formula="Source budget × (1 - Utilization rate)" 
                  dataSource="Category spend + Employee requests" 
                />
              </CardTitle>
              <CardDescription>
                Move funds from underutilized to high-demand areas. Click "Simulate" to model shifts.
              </CardDescription>
            </div>
            <Badge variant="secondary" className="gap-1">
              <ArrowRightLeft className="h-3 w-3" />
              {items.length} shifts recommended
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Scale className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p>Portfolio is well-balanced - no reallocation needed</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {items.map((item) => (
                <OptimizationRecommendationCard
                  key={item.id}
                  recommendation={toRecommendation(item)}
                  onSimulate={handleSimulate}
                  onCreateAction={handleCreateAction}
                  onOpenPolicy={onOpenPolicy}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
