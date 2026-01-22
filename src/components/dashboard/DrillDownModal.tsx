import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus, Users, DollarSign } from 'lucide-react';
import { AnimatedBarChart, AnimatedLineChart, ProgressBarList } from '@/components/charts';
import { formatCurrencyAED } from '@/lib/utils';

interface DrillDownData {
  title: string;
  category: string;
  totalValue: number;
  utilized: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  breakdown: Array<{ name: string; value: number; secondaryValue?: number }>;
  employees?: number;
  description?: string;
}

interface DrillDownModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: DrillDownData | null;
  formatValue?: (value: number) => string;
}

export function DrillDownModal({ 
  open, 
  onOpenChange, 
  data,
  formatValue = (v) => formatCurrencyAED(v, { abbreviate: false })
}: DrillDownModalProps) {
  if (!data) return null;

  const utilizationPercent = Math.round((data.utilized / data.totalValue) * 100);
  const TrendIcon = data.trend === 'up' ? TrendingUp : data.trend === 'down' ? TrendingDown : Minus;
  const trendColor = data.trend === 'up' ? 'text-emerald-500' : data.trend === 'down' ? 'text-rose-500' : 'text-muted-foreground';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-xl font-display">{data.title}</DialogTitle>
              <DialogDescription className="mt-1">{data.description || `Detailed breakdown for ${data.category}`}</DialogDescription>
            </div>
            <Badge variant="secondary" className="shrink-0">{data.category}</Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="bg-accent/5 border-accent/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-xs">Total Value</span>
                </div>
                <p className="text-lg font-bold">{formatValue(data.totalValue)}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-accent/5 border-accent/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <TrendIcon className={`w-4 h-4 ${trendColor}`} />
                  <span className="text-xs">Trend</span>
                </div>
                <p className={`text-lg font-bold ${trendColor}`}>
                  {data.trend === 'up' ? '+' : data.trend === 'down' ? '-' : ''}{data.trendValue}%
                </p>
              </CardContent>
            </Card>

            {data.employees && (
              <Card className="bg-accent/5 border-accent/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Users className="w-4 h-4" />
                    <span className="text-xs">Employees</span>
                  </div>
                  <p className="text-lg font-bold">{data.employees}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Utilization Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Utilization</span>
              <span className="font-semibold">{utilizationPercent}%</span>
            </div>
            <Progress value={utilizationPercent} className="h-3 [&>div]:bg-accent" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Utilized: {formatValue(data.utilized)}</span>
              <span>Available: {formatValue(data.totalValue - data.utilized)}</span>
            </div>
          </div>

          {/* Breakdown Chart */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Breakdown by Sub-category</h4>
            <AnimatedBarChart
              data={data.breakdown}
              layout="vertical"
              showSecondary={data.breakdown[0]?.secondaryValue !== undefined}
              primaryLabel="Current"
              secondaryLabel="Previous"
              formatValue={(v) => `AED ${(v / 1000).toFixed(0)}K`}
              height={Math.max(160, data.breakdown.length * 45)}
              gradientId="drilldown"
            />
          </div>

          {/* Key Insights */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Key Insights</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-xs text-muted-foreground">Top Performer</p>
                <p className="text-sm font-medium text-emerald-600 mt-1">
                  {data.breakdown[0]?.name || 'N/A'}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <p className="text-xs text-muted-foreground">Needs Attention</p>
                <p className="text-sm font-medium text-amber-600 mt-1">
                  {data.breakdown[data.breakdown.length - 1]?.name || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
