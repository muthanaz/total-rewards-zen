/**
 * CauseBreakdownChart - Stacked Bar Chart showing Unrealized Value by 4 Causes
 * 
 * Displays: Awareness, Eligibility, Friction, Policy breakdown
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';
import { formatCurrencyAED, formatPercent, cn } from '@/lib/utils';
import { RecoveryCauseType } from './RecoverableValueInsights';

export interface CauseBreakdownData {
  cause: RecoveryCauseType;
  label: string;
  value: number;
  percent: number;
}

interface CauseBreakdownChartProps {
  data: CauseBreakdownData[];
  totalUnrealized: number;
  isDemo?: boolean;
}

const causeColors: Record<RecoveryCauseType, string> = {
  awareness: 'hsl(var(--info))',
  eligibility: 'hsl(280, 70%, 55%)', // Purple
  friction: 'hsl(var(--warning))',
  policy: 'hsl(var(--destructive))',
};

const causeLegendColors: Record<RecoveryCauseType, string> = {
  awareness: 'bg-info',
  eligibility: 'bg-purple-500',
  friction: 'bg-warning',
  policy: 'bg-destructive',
};

export function CauseBreakdownChart({ data, totalUnrealized, isDemo }: CauseBreakdownChartProps) {
  // Transform data for horizontal stacked bar
  const chartData = [{
    name: 'Unrealized Value',
    awareness: data.find(d => d.cause === 'awareness')?.value || 0,
    eligibility: data.find(d => d.cause === 'eligibility')?.value || 0,
    friction: data.find(d => d.cause === 'friction')?.value || 0,
    policy: data.find(d => d.cause === 'policy')?.value || 0,
  }];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg shadow-lg p-3">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-sm" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground capitalize">{entry.name}:</span>
              <span className="font-medium">{formatCurrencyAED(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              Cause Breakdown
              <InfoTooltip 
                formula="Unrealized Value segmented by root cause" 
                dataSource="Category root cause analysis" 
              />
            </CardTitle>
            <CardDescription>
              Unrealized value split by the 4 primary causes
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Total:</span>
            <span className="font-bold text-warning">{formatCurrencyAED(totalUnrealized)}</span>
            {isDemo && (
              <Badge variant="outline" className="text-xs">Demo</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stacked Bar Chart */}
        <div className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" hide />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="awareness" stackId="a" fill={causeColors.awareness} radius={[4, 0, 0, 4]} />
              <Bar dataKey="eligibility" stackId="a" fill={causeColors.eligibility} />
              <Bar dataKey="friction" stackId="a" fill={causeColors.friction} />
              <Bar dataKey="policy" stackId="a" fill={causeColors.policy} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend with Values */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {data.map((item) => (
            <div 
              key={item.cause}
              className="flex items-center gap-2 p-2 rounded-lg bg-muted/30"
            >
              <div className={cn("w-3 h-3 rounded-sm shrink-0", causeLegendColors[item.cause])} />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground capitalize">{item.label}</p>
                <div className="flex items-baseline gap-1">
                  <span className="font-semibold text-sm">
                    {formatCurrencyAED(item.value, { abbreviate: true })}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({formatPercent(item.percent)})
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
