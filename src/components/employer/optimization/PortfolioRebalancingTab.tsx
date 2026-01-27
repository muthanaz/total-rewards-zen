/**
 * Portfolio Rebalancing Tab - The CEO View
 * 
 * Focus: Moving idle money to high-demand areas
 * Content: Consistently unutilized allowance pots
 * Action: "Evaluate Policy Shift"
 * Value Proposition: "Maximize Total Rewards Relevance" - Aligning spend with what employees actually use
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { 
  ArrowRight,
  Scale,
  TrendingUp,
  ArrowRightLeft,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { formatCurrencyAED, formatPercent, cn } from '@/lib/utils';
import { PortfolioRebalanceItem } from './types';

interface PortfolioRebalancingTabProps {
  items: PortfolioRebalanceItem[];
  totalReallocationPotential: number;
  onEvaluatePolicyShift: (item: PortfolioRebalanceItem) => void;
}

const demandConfig = {
  high: { label: 'High Demand', color: 'text-success', bgColor: 'bg-success/10' },
  medium: { label: 'Medium Demand', color: 'text-warning', bgColor: 'bg-warning/10' },
};

export function PortfolioRebalancingTab({ 
  items, 
  totalReallocationPotential,
  onEvaluatePolicyShift 
}: PortfolioRebalancingTabProps) {
  // Calculate aggregate stats
  const avgSourceUtilization = items.length > 0 
    ? items.reduce((sum, i) => sum + i.sourceUtilization, 0) / items.length 
    : 0;
  const highDemandTargets = items.filter(i => i.targetDemand === 'high').length;

  return (
    <div className="space-y-6">
      {/* Value Proposition Banner */}
      <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-accent/10">
              <Scale className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="font-semibold text-accent">Maximize Total Rewards Relevance</p>
              <p className="text-sm text-muted-foreground">
                Aligning benefits spend with what employees actually value and use
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-accent">
              {formatCurrencyAED(totalReallocationPotential, { abbreviate: true })}
            </p>
            <p className="text-xs text-muted-foreground">Reallocation Potential</p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <p className="text-sm text-muted-foreground mb-1">Impact Potential</p>
            <p className="text-2xl font-bold text-accent">
              {formatCurrencyAED(totalReallocationPotential, { abbreviate: true })}
            </p>
            <p className="text-xs text-muted-foreground">Better-aligned investment</p>
          </CardContent>
        </Card>
      </div>

      {/* Rebalancing Opportunities Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                Rebalancing Opportunities
                <InfoTooltip 
                  formula="Source budget × (1 - Utilization rate)" 
                  dataSource="Category spend analysis + Employee requests" 
                />
              </CardTitle>
              <CardDescription>
                Move funds from consistently underutilized categories to high-demand areas
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
            <div className="space-y-4">
              {items.map((item) => {
                const demand = demandConfig[item.targetDemand];

                return (
                  <div 
                    key={item.id} 
                    className="p-4 rounded-lg border hover:border-accent/30 transition-colors group"
                  >
                    {/* Flow Visualization */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        {/* Source */}
                        <div className="text-center">
                          <p className="font-medium">{item.sourceCategory}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={item.sourceUtilization} className="h-1.5 w-20" />
                            <span className="text-xs text-warning">
                              {formatPercent(item.sourceUtilization)} used
                            </span>
                          </div>
                        </div>

                        {/* Arrow */}
                        <div className="flex flex-col items-center px-4">
                          <ArrowRight className="h-5 w-5 text-accent" />
                          <span className="text-sm font-bold text-accent mt-1">
                            {formatCurrencyAED(item.reallocationAmount, { abbreviate: true })}
                          </span>
                        </div>

                        {/* Target */}
                        <div className="text-center">
                          <p className="font-medium">{item.suggestedTarget}</p>
                          <Badge 
                            variant="outline" 
                            className={cn("text-xs mt-1", demand.bgColor, demand.color)}
                          >
                            {demand.label}
                          </Badge>
                        </div>
                      </div>

                      {/* Action */}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onEvaluatePolicyShift(item)}
                        className="gap-1 opacity-70 group-hover:opacity-100"
                      >
                        Evaluate Policy Shift
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Rationale */}
                    <div className="flex items-start gap-2 p-2 rounded bg-muted/30">
                      <Sparkles className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                      <p className="text-sm text-muted-foreground">
                        <strong>Rationale:</strong> {item.rationale}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Strategic Note */}
      <Card className="border-accent/20 bg-accent/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Scale className="h-5 w-5 text-accent mt-0.5" />
            <div>
              <p className="font-medium text-sm">Strategic Consideration</p>
              <p className="text-sm text-muted-foreground mt-1">
                Portfolio rebalancing should be evaluated annually during policy review cycles. 
                Consider employee feedback surveys and market benchmarking before major shifts. 
                Changes typically require <strong>2-3 month implementation</strong> timelines.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
