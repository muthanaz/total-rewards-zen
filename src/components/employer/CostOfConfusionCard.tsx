/**
 * Cost of Confusion Card
 * 
 * Quantifies the financial loss from policy friction:
 * - Unrealized value due to confusion
 * - HR time spent on questions
 * - Rejected claims from misunderstanding
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  AlertCircle, 
  DollarSign, 
  Clock, 
  XCircle,
  Info,
  TrendingDown,
} from 'lucide-react';
import { cn, formatCurrencyAED } from '@/lib/utils';

interface CostBreakdown {
  category: string;
  amount: number;
  percentOfTotal: number;
  description: string;
}

interface CostOfConfusionCardProps {
  totalCost: number;
  breakdown: CostBreakdown[];
  monthlyChange?: number;
  className?: string;
}

export function CostOfConfusionCard({ 
  totalCost, 
  breakdown, 
  monthlyChange = -8.2,
  className 
}: CostOfConfusionCardProps) {
  const isImproving = monthlyChange < 0;

  return (
    <Card className={cn("card-elevated border-warning/20", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              Cost of Confusion
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs p-3 space-y-2">
                  <p className="text-xs">
                    Financial impact of policy confusion: unrealized benefits, 
                    HR time answering questions, and rejected claims.
                  </p>
                  <div className="border-t pt-2">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Formula</p>
                    <p className="text-xs font-mono bg-muted/50 px-2 py-1 rounded mt-0.5">
                      Unrealized + (HR Hours × Hourly Rate) + Rejection Costs
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Data Source</p>
                    <p className="text-xs">HR ticketing + requests + policy analysis</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Monthly financial impact from policy friction</p>
          </div>
          <Badge 
            variant="outline" 
            className={cn(
              "gap-1",
              isImproving 
                ? "bg-success/10 text-success border-success/30" 
                : "bg-destructive/10 text-destructive border-destructive/30"
            )}
          >
            <TrendingDown className={cn("h-3 w-3", !isImproving && "rotate-180")} />
            {monthlyChange > 0 ? '+' : ''}{monthlyChange}% vs last month
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total cost */}
        <div className="text-center py-3 bg-warning/5 rounded-lg">
          <p className="text-3xl font-bold text-warning">
            {formatCurrencyAED(totalCost, { abbreviate: true })}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Total monthly cost of confusion</p>
        </div>

        {/* Breakdown */}
        <div className="space-y-3">
          {breakdown.map((item) => (
            <div key={item.category} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {item.category.includes('Unrealized') && <DollarSign className="h-4 w-4 text-warning" />}
                  {item.category.includes('HR Time') && <Clock className="h-4 w-4 text-info" />}
                  {item.category.includes('Rejected') && <XCircle className="h-4 w-4 text-destructive" />}
                  <span className="font-medium">{item.category}</span>
                </div>
                <span className="font-bold">{formatCurrencyAED(item.amount, { abbreviate: true })}</span>
              </div>
              <Progress value={item.percentOfTotal} className="h-1.5" />
              <p className="text-[10px] text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
