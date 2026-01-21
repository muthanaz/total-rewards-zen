/**
 * WaterfallChart Component
 * 
 * Visualizes the flow: Allocated → Entitled → Claimed → Unused
 * Each bar shows the cumulative breakdown with connecting lines
 */

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import { formatCurrencyAED } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface WaterfallDataPoint {
  name: string;
  allocated: number;
  entitled: number;
  claimed: number;
  unused?: number;
}

interface WaterfallChartProps {
  data: WaterfallDataPoint[];
  height?: number;
  showLegend?: boolean;
  onBarClick?: (category: string, stage: 'allocated' | 'entitled' | 'claimed' | 'unused') => void;
  orientation?: 'horizontal' | 'vertical';
}

// Semantic colors for waterfall stages
const STAGE_COLORS = {
  allocated: 'hsl(var(--muted-foreground))',
  entitled: 'hsl(var(--primary))',
  claimed: 'hsl(var(--success))',
  unused: 'hsl(var(--warning))',
};

const STAGE_LABELS = {
  allocated: 'Allocated',
  entitled: 'Entitled',
  claimed: 'Claimed',
  unused: 'Unused',
};

interface TransformedData {
  stage: string;
  stageKey: 'allocated' | 'entitled' | 'claimed' | 'unused';
  value: number;
  previousValue: number;
  delta: number;
  isPositive: boolean;
  color: string;
}

export function WaterfallChart({
  data,
  height = 300,
  showLegend = true,
  onBarClick,
  orientation = 'vertical',
}: WaterfallChartProps) {
  // Transform data for waterfall visualization
  const chartData = useMemo(() => {
    // Aggregate totals across all categories
    const totals = data.reduce(
      (acc, item) => ({
        allocated: acc.allocated + item.allocated,
        entitled: acc.entitled + item.entitled,
        claimed: acc.claimed + item.claimed,
        unused: acc.unused + (item.unused ?? (item.entitled - item.claimed)),
      }),
      { allocated: 0, entitled: 0, claimed: 0, unused: 0 }
    );

    // Create waterfall flow data
    const stages: TransformedData[] = [
      {
        stage: 'Budget Allocated',
        stageKey: 'allocated',
        value: totals.allocated,
        previousValue: 0,
        delta: totals.allocated,
        isPositive: true,
        color: STAGE_COLORS.allocated,
      },
      {
        stage: 'Entitled Value',
        stageKey: 'entitled',
        value: totals.entitled,
        previousValue: totals.allocated,
        delta: totals.entitled - totals.allocated,
        isPositive: totals.entitled >= totals.allocated,
        color: STAGE_COLORS.entitled,
      },
      {
        stage: 'Claimed',
        stageKey: 'claimed',
        value: totals.claimed,
        previousValue: totals.entitled,
        delta: totals.claimed - totals.entitled,
        isPositive: false, // Claimed is always a reduction from entitled
        color: STAGE_COLORS.claimed,
      },
      {
        stage: 'Unused',
        stageKey: 'unused',
        value: totals.unused,
        previousValue: totals.claimed,
        delta: totals.unused,
        isPositive: false,
        color: STAGE_COLORS.unused,
      },
    ];

    return stages;
  }, [data]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    
    const data = payload[0].payload as TransformedData;
    
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium text-sm text-foreground">{data.stage}</p>
        <p className="text-lg font-bold text-foreground mt-1">
          {formatCurrencyAED(data.value)}
        </p>
        {data.delta !== data.value && (
          <p className={cn(
            'text-xs mt-1',
            data.isPositive ? 'text-success' : 'text-destructive'
          )}>
            {data.isPositive ? '+' : ''}{formatCurrencyAED(data.delta)} from previous
          </p>
        )}
      </div>
    );
  };

  const renderLegend = () => (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {Object.entries(STAGE_LABELS).map(([key, label]) => (
        <div key={key} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: STAGE_COLORS[key as keyof typeof STAGE_COLORS] }}
          />
          <span className="text-xs text-muted-foreground font-medium">{label}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ height: showLegend ? height + 40 : height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
          layout={orientation === 'horizontal' ? 'vertical' : 'horizontal'}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            strokeOpacity={0.5}
            vertical={orientation !== 'horizontal'}
            horizontal={orientation === 'horizontal'}
          />
          {orientation === 'horizontal' ? (
            <>
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
              />
              <YAxis
                type="category"
                dataKey="stage"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                width={110}
              />
            </>
          ) : (
            <>
              <XAxis
                dataKey="stage"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 11 }}
                interval={0}
                angle={-15}
                textAnchor="end"
                height={60}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
              />
            </>
          )}
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="value"
            radius={[4, 4, 0, 0]}
            cursor={onBarClick ? 'pointer' : 'default'}
            onClick={(data) => {
              if (onBarClick && data?.stageKey) {
                onBarClick('all', data.stageKey);
              }
            }}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {showLegend && renderLegend()}
    </div>
  );
}

// Category-based waterfall showing per-category breakdown
interface CategoryWaterfallProps {
  data: WaterfallDataPoint[];
  height?: number;
  onCategoryClick?: (category: string) => void;
}

export function CategoryWaterfallChart({
  data,
  height = 400,
  onCategoryClick,
}: CategoryWaterfallProps) {
  const chartData = useMemo(() => {
    return data.map((item) => ({
      name: item.name,
      allocated: item.allocated,
      entitled: item.entitled,
      claimed: item.claimed,
      unused: item.unused ?? (item.entitled - item.claimed),
      utilization: item.entitled > 0 ? ((item.claimed / item.entitled) * 100).toFixed(1) : 0,
    }));
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    
    const data = payload[0].payload;
    
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg min-w-[200px]">
        <p className="font-medium text-sm text-foreground mb-2">{label}</p>
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Allocated:</span>
            <span className="font-medium">{formatCurrencyAED(data.allocated)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Entitled:</span>
            <span className="font-medium text-primary">{formatCurrencyAED(data.entitled)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Claimed:</span>
            <span className="font-medium text-success">{formatCurrencyAED(data.claimed)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Unused:</span>
            <span className="font-medium text-warning">{formatCurrencyAED(data.unused)}</span>
          </div>
          <div className="pt-1 border-t border-border">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Utilization:</span>
              <span className="font-semibold">{data.utilization}%</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderLegend = () => (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: STAGE_COLORS.allocated }} />
        <span className="text-xs text-muted-foreground font-medium">Allocated</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: STAGE_COLORS.entitled }} />
        <span className="text-xs text-muted-foreground font-medium">Entitled</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: STAGE_COLORS.claimed }} />
        <span className="text-xs text-muted-foreground font-medium">Claimed</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: STAGE_COLORS.unused }} />
        <span className="text-xs text-muted-foreground font-medium">Unused</span>
      </div>
    </div>
  );

  return (
    <div style={{ height: height + 50 }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 20, left: 10, bottom: 30 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            strokeOpacity={0.5}
            vertical={false}
          />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--foreground))', fontSize: 11 }}
            interval={0}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="allocated"
            fill={STAGE_COLORS.allocated}
            radius={[4, 4, 0, 0]}
            cursor={onCategoryClick ? 'pointer' : 'default'}
            onClick={(data) => onCategoryClick?.(data.name)}
          />
          <Bar
            dataKey="entitled"
            fill={STAGE_COLORS.entitled}
            radius={[4, 4, 0, 0]}
            cursor={onCategoryClick ? 'pointer' : 'default'}
            onClick={(data) => onCategoryClick?.(data.name)}
          />
          <Bar
            dataKey="claimed"
            fill={STAGE_COLORS.claimed}
            radius={[4, 4, 0, 0]}
            cursor={onCategoryClick ? 'pointer' : 'default'}
            onClick={(data) => onCategoryClick?.(data.name)}
          />
          <Bar
            dataKey="unused"
            fill={STAGE_COLORS.unused}
            radius={[4, 4, 0, 0]}
            cursor={onCategoryClick ? 'pointer' : 'default'}
            onClick={(data) => onCategoryClick?.(data.name)}
          />
        </BarChart>
      </ResponsiveContainer>
      {renderLegend()}
    </div>
  );
}

export default WaterfallChart;
