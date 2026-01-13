import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList, Legend } from 'recharts';
import { cn } from '@/lib/utils';

interface DataPoint {
  name: string;
  value: number;
  secondaryValue?: number;
  fill?: string;
}

interface AnimatedBarChartProps {
  data: DataPoint[];
  layout?: 'horizontal' | 'vertical';
  showSecondary?: boolean;
  primaryLabel?: string;
  secondaryLabel?: string;
  formatValue?: (value: number) => string;
  height?: number;
  showLabels?: boolean;
  gradientId?: string;
  showLegend?: boolean;
  onBarClick?: (data: DataPoint, index: number) => void;
  interactive?: boolean;
}

export function AnimatedBarChart({
  data,
  layout = 'horizontal',
  showSecondary = false,
  primaryLabel = 'Value',
  secondaryLabel = 'Secondary',
  formatValue = (v) => v.toLocaleString(),
  height = 280,
  showLabels = false,
  gradientId = 'barGradient',
  showLegend = true,
  onBarClick,
  interactive = true
}: AnimatedBarChartProps) {
  const isVertical = layout === 'vertical';
  
  const handleClick = (data: any, index: number) => {
    if (onBarClick && data) {
      onBarClick(data, index);
    }
  };

  // Custom legend with better styling
  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={`legend-${index}`} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-sm" 
              style={{ backgroundColor: entry.color.includes('url') ? 'hsl(var(--accent))' : entry.color }} 
            />
            <span className="text-xs text-muted-foreground font-medium">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div style={{ height: showLegend ? height + 40 : height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data} 
          layout={layout}
          margin={{ top: 20, right: 30, left: isVertical ? 110 : 10, bottom: showLegend ? 10 : 10 }}
          barGap={4}
          barCategoryGap="20%"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2={isVertical ? "1" : "0"} y2={isVertical ? "0" : "1"}>
              <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={1} />
              <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0.7} />
            </linearGradient>
            <linearGradient id={`${gradientId}-secondary`} x1="0" y1="0" x2={isVertical ? "1" : "0"} y2={isVertical ? "0" : "1"}>
              <stop offset="0%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.4} />
              <stop offset="100%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.2} />
            </linearGradient>
          </defs>
          
          {isVertical ? (
            <>
              <XAxis 
                type="number" 
                tickFormatter={formatValue}
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                tickCount={4}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={70}
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 11, fontWeight: 500 }}
              />
            </>
          ) : (
            <>
              <XAxis 
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                interval={0}
                height={25}
              />
              <YAxis 
                tickFormatter={formatValue}
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                tickCount={4}
                width={40}
              />
            </>
          )}
          
          <Tooltip 
            formatter={(value: number, name: string) => [formatValue(value), name === 'value' ? primaryLabel : secondaryLabel]}
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))', 
              border: '1px solid hsl(var(--border))',
              borderRadius: '10px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
              padding: '12px 16px'
            }}
            labelStyle={{ fontWeight: 600, marginBottom: 6, color: 'hsl(var(--foreground))', fontSize: 13 }}
            itemStyle={{ color: 'hsl(var(--muted-foreground))', fontSize: 12, padding: '2px 0' }}
            cursor={{ fill: 'hsl(var(--accent)/0.08)', radius: 4 }}
          />
          
          {showLegend && showSecondary && (
            <Legend content={renderLegend} />
          )}
          
          {showSecondary && (
            <Bar 
              dataKey="secondaryValue" 
              name={secondaryLabel}
              fill={`url(#${gradientId}-secondary)`}
              radius={isVertical ? [0, 4, 4, 0] : [4, 4, 0, 0]}
              animationDuration={800}
              animationEasing="ease-out"
              maxBarSize={isVertical ? 24 : 40}
            />
          )}
          
          <Bar 
            dataKey="value" 
            name={primaryLabel}
            fill={`url(#${gradientId})`}
            radius={isVertical ? [0, 6, 6, 0] : [6, 6, 0, 0]}
            animationDuration={1000}
            animationEasing="ease-out"
            maxBarSize={isVertical ? 24 : 40}
            onClick={interactive ? handleClick : undefined}
            className={cn(interactive && onBarClick && "cursor-pointer")}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.fill || `url(#${gradientId})`}
                className={cn(interactive && onBarClick && "hover:opacity-80 transition-opacity")}
              />
            ))}
            {showLabels && (
              <LabelList 
                dataKey="value" 
                position={isVertical ? 'right' : 'top'}
                formatter={formatValue}
                style={{ fill: 'hsl(var(--foreground))', fontSize: 11, fontWeight: 500 }}
                offset={8}
              />
            )}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
