import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';

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
  gradientId = 'barGradient'
}: AnimatedBarChartProps) {
  const isVertical = layout === 'vertical';
  
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data} 
          layout={layout}
          margin={{ top: 20, right: 30, left: isVertical ? 100 : 10, bottom: 10 }}
          barGap={8}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.9} />
              <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0.6} />
            </linearGradient>
            <linearGradient id={`${gradientId}-secondary`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.3} />
              <stop offset="100%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.15} />
            </linearGradient>
          </defs>
          
          {isVertical ? (
            <>
              <XAxis 
                type="number" 
                tickFormatter={formatValue}
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={90}
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 12, fontWeight: 500 }}
              />
            </>
          ) : (
            <>
              <XAxis 
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              />
              <YAxis 
                tickFormatter={formatValue}
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              />
            </>
          )}
          
          <Tooltip 
            formatter={(value: number, name: string) => [formatValue(value), name === 'value' ? primaryLabel : secondaryLabel]}
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))', 
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              padding: '10px 14px'
            }}
            labelStyle={{ fontWeight: 600, marginBottom: 4, color: 'hsl(var(--foreground))' }}
            itemStyle={{ color: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            cursor={{ fill: 'hsl(var(--accent)/0.05)' }}
          />
          
          {showSecondary && (
            <Bar 
              dataKey="secondaryValue" 
              name={secondaryLabel}
              fill={`url(#${gradientId}-secondary)`}
              radius={isVertical ? [0, 6, 6, 0] : [6, 6, 0, 0]}
              animationDuration={800}
              animationEasing="ease-out"
            />
          )}
          
          <Bar 
            dataKey="value" 
            name={primaryLabel}
            fill={`url(#${gradientId})`}
            radius={isVertical ? [0, 6, 6, 0] : [6, 6, 0, 0]}
            animationDuration={1000}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.fill || `url(#${gradientId})`}
              />
            ))}
            {showLabels && (
              <LabelList 
                dataKey="value" 
                position={isVertical ? 'right' : 'top'}
                formatter={formatValue}
                style={{ fill: 'hsl(var(--foreground))', fontSize: 11, fontWeight: 500 }}
              />
            )}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
