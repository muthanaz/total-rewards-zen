/**
 * Optimization Opportunities Table
 * 
 * Split table with two sections:
 * - Hard Savings (Cash Recovery): Returns money to budget
 * - Value Realization (Engagement): Increases utilization
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { 
  Eye, 
  Wallet, 
  Users, 
  TrendingUp,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { formatCurrencyAED, formatPercent, cn } from '@/lib/utils';

export interface OptimizationOpportunity {
  id: string;
  name: string;
  category: string;
  valueOpportunity: number;
  utilization: number;
  rootCause: string;
  rootCauseLabel: string;
  rootCauseColor: string;
  effort: 'low' | 'medium' | 'high';
  timeToImpact: string;
  type: 'hard_savings' | 'value_realization';
  confidence: 'high' | 'medium' | 'low';
}

interface OptimizationOpportunitiesTableProps {
  opportunities: OptimizationOpportunity[];
  onViewDetails: (opportunity: OptimizationOpportunity) => void;
  onTakeAction: (opportunity: OptimizationOpportunity) => void;
}

const confidenceBadgeStyles = {
  high: 'bg-success/10 text-success border-success/30',
  medium: 'bg-warning/10 text-warning border-warning/30',
  low: 'bg-destructive/10 text-destructive border-destructive/30',
};

const effortConfig = {
  low: { label: 'Low', className: 'bg-success/10 text-success border-success/30' },
  medium: { label: 'Medium', className: 'bg-warning/10 text-warning border-warning/30' },
  high: { label: 'High', className: 'bg-destructive/10 text-destructive border-destructive/30' },
};

function OpportunityTable({
  opportunities,
  onViewDetails,
  onTakeAction,
  emptyMessage,
}: {
  opportunities: OptimizationOpportunity[];
  onViewDetails: (opportunity: OptimizationOpportunity) => void;
  onTakeAction: (opportunity: OptimizationOpportunity) => void;
  emptyMessage: string;
}) {
  if (opportunities.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <AlertTriangle className="h-8 w-8 mx-auto mb-3 opacity-50" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead>Opportunity</TableHead>
            <TableHead className="text-right">Value Opportunity</TableHead>
            <TableHead className="text-right">Utilization</TableHead>
            <TableHead>Root Cause</TableHead>
            <TableHead>Effort</TableHead>
            <TableHead>Time to Impact</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {opportunities.map((opp) => {
            const effort = effortConfig[opp.effort];
            
            return (
              <TableRow 
                key={opp.id} 
                className="hover:bg-muted/30 cursor-pointer group"
                onClick={() => onViewDetails(opp)}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{opp.name}</span>
                    <Badge variant="outline" className={cn("text-[10px]", confidenceBadgeStyles[opp.confidence])}>
                      {opp.confidence}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">{opp.category}</span>
                </TableCell>
                <TableCell className="text-right font-medium text-success">
                  {formatCurrencyAED(opp.valueOpportunity, { abbreviate: true })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className={cn(
                      opp.utilization >= 75 ? 'text-success' :
                      opp.utilization >= 50 ? 'text-foreground' :
                      'text-warning'
                    )}>
                      {formatPercent(opp.utilization)}
                    </span>
                    <Progress value={opp.utilization} className="h-1 w-12" />
                  </div>
                </TableCell>
                <TableCell>
                  <span className={cn("text-sm", opp.rootCauseColor)}>
                    {opp.rootCauseLabel}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("text-xs", effort.className)}>
                    {effort.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">{opp.timeToImpact}</span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails(opp);
                      }}
                      className="gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTakeAction(opp);
                      }}
                      className="gap-1 opacity-70 group-hover:opacity-100"
                    >
                      Take action
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export function OptimizationOpportunitiesTable({
  opportunities,
  onViewDetails,
  onTakeAction,
}: OptimizationOpportunitiesTableProps) {
  const hardSavings = opportunities.filter(o => o.type === 'hard_savings');
  const valueRealization = opportunities.filter(o => o.type === 'value_realization');

  const hardSavingsTotal = hardSavings.reduce((sum, o) => sum + o.valueOpportunity, 0);
  const valueRealizationTotal = valueRealization.reduce((sum, o) => sum + o.valueOpportunity, 0);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              Optimization Opportunities
              <InfoTooltip 
                formula="Entitled Value - Claimed Amount by type" 
                dataSource="benefit_entitlements + requests" 
              />
            </CardTitle>
            <CardDescription>
              Opportunities split by impact type for targeted action
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="gap-1">
              <Wallet className="h-3 w-3" />
              {formatCurrencyAED(hardSavingsTotal, { abbreviate: true })} Hard Savings
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Users className="h-3 w-3" />
              {formatCurrencyAED(valueRealizationTotal, { abbreviate: true })} Engagement
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="hard_savings">
          <TabsList className="mb-4">
            <TabsTrigger value="hard_savings" className="gap-2">
              <Wallet className="h-4 w-4" />
              Hard Savings (Cash Recovery)
              <Badge variant="secondary" className="ml-1 text-xs">{hardSavings.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="value_realization" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Value Realization (Engagement)
              <Badge variant="secondary" className="ml-1 text-xs">{valueRealization.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hard_savings">
            <div className="mb-4 p-3 rounded-lg bg-success/5 border border-success/20">
              <div className="flex items-center gap-2 text-success">
                <Wallet className="h-4 w-4" />
                <span className="font-medium text-sm">Hard Savings return funds directly to budget</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Examples: Duplicate insurance coverage, vendor overcharges, unused allocations
              </p>
            </div>
            <OpportunityTable 
              opportunities={hardSavings}
              onViewDetails={onViewDetails}
              onTakeAction={onTakeAction}
              emptyMessage="No hard savings opportunities identified"
            />
          </TabsContent>

          <TabsContent value="value_realization">
            <div className="mb-4 p-3 rounded-lg bg-info/5 border border-info/20">
              <div className="flex items-center gap-2 text-info">
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium text-sm">Value Realization increases employee engagement</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Examples: L&D awareness campaigns, wellness program promotion, benefit education
              </p>
            </div>
            <OpportunityTable 
              opportunities={valueRealization}
              onViewDetails={onViewDetails}
              onTakeAction={onTakeAction}
              emptyMessage="No value realization opportunities identified"
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
