import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface DataPoint {
  name: string;
  value: number;
  secondaryValue?: number;
}

interface AnimatedLineChartProps {
  data: DataPoint[];
  showArea?: boolean;
  showSecondary?: boolean;
  primaryLabel?: string;
  secondaryLabel?: string;
  formatValue?: (value: number) => string;
  height?: number;
  yDomain?: [number, number];
  showGrid?: boolean;
}

export function AnimatedLineChart({
  data,
  showArea = true,
  showSecondary = false,
  primaryLabel = 'Value',
  secondaryLabel = 'Secondary',
  formatValue = (v) => `${v}`,
  height = 280,
  yDomain,
  showGrid = true
}: AnimatedLineChartProps) {
  const ChartComponent = showArea ? AreaChart : LineChart;
  
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent 
          data={data}
          margin={{ top: 20, right: 20, left: 10, bottom: 10 }}
        >
          <defs>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="lineStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(var(--accent))" />
              <stop offset="100%" stopColor="hsl(174 60% 55%)" />
            </linearGradient>
            <filter id="lineShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="hsl(var(--accent))" floodOpacity="0.3"/>
            </filter>
          </defs>
          
          {showGrid && (
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(var(--border))"
              strokeOpacity={0.5}
              vertical={false}
            />
          )}
          
          <XAxis 
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            dy={10}
          />
          
          <YAxis 
            domain={yDomain}
            tickFormatter={formatValue}
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            dx={-10}
          />
          
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
            cursor={{ stroke: 'hsl(var(--accent))', strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          
          {showArea ? (
            <>
              <Area
                type="monotone"
                dataKey="value"
                stroke="url(#lineStroke)"
                strokeWidth={3}
                fill="url(#lineGradient)"
                animationDuration={1200}
                animationEasing="ease-out"
                dot={{ 
                  fill: 'hsl(var(--background))', 
                  stroke: 'hsl(var(--accent))', 
                  strokeWidth: 2,
                  r: 4
                }}
                activeDot={{ 
                  fill: 'hsl(var(--accent))', 
                  stroke: 'hsl(var(--background))', 
                  strokeWidth: 2,
                  r: 6,
                  filter: 'url(#lineShadow)'
                }}
              />
              {showSecondary && (
                <Area
                  type="monotone"
                  dataKey="secondaryValue"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fill="transparent"
                  animationDuration={1200}
                  animationEasing="ease-out"
                  dot={false}
                />
              )}
            </>
          ) : (
            <>
              <Line
                type="monotone"
                dataKey="value"
                stroke="url(#lineStroke)"
                strokeWidth={3}
                animationDuration={1200}
                animationEasing="ease-out"
                dot={{ 
                  fill: 'hsl(var(--background))', 
                  stroke: 'hsl(var(--accent))', 
                  strokeWidth: 2,
                  r: 4
                }}
                activeDot={{ 
                  fill: 'hsl(var(--accent))', 
                  stroke: 'hsl(var(--background))', 
                  strokeWidth: 2,
                  r: 6
                }}
              />
            </>
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
}
