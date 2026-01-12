import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, Legend } from 'recharts';

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
  showLegend?: boolean;
  onPointClick?: (data: DataPoint, index: number) => void;
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
  showGrid = true,
  showLegend = true,
  onPointClick
}: AnimatedLineChartProps) {
  const ChartComponent = showArea ? AreaChart : LineChart;

  // Custom legend
  const renderLegend = (props: any) => {
    const items = [
      { label: primaryLabel, color: 'hsl(var(--accent))', type: 'solid' },
      ...(showSecondary ? [{ label: secondaryLabel, color: 'hsl(var(--muted-foreground))', type: 'dashed' }] : [])
    ];
    
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-6 h-0.5 rounded-full" 
              style={{ 
                backgroundColor: item.color,
                borderStyle: item.type === 'dashed' ? 'dashed' : 'solid'
              }} 
            />
            <span className="text-xs text-muted-foreground font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div style={{ height: showLegend ? height + 30 : height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent 
          data={data}
          margin={{ top: 20, right: 20, left: 10, bottom: 10 }}
        >
          <defs>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.35} />
              <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="lineStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(var(--accent))" />
              <stop offset="100%" stopColor="hsl(174 60% 55%)" />
            </linearGradient>
            <filter id="lineShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="hsl(var(--accent))" floodOpacity="0.35"/>
            </filter>
          </defs>
          
          {showGrid && (
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(var(--border))"
              strokeOpacity={0.6}
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
            tickCount={5}
            width={45}
          />
          
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
            itemStyle={{ padding: '2px 0' }}
            cursor={{ stroke: 'hsl(var(--accent))', strokeWidth: 1.5, strokeDasharray: '4 4' }}
          />

          {showLegend && showSecondary && (
            <Legend content={renderLegend} />
          )}
          
          {showArea ? (
            <>
              <Area
                type="monotone"
                dataKey="value"
                name={primaryLabel}
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
                  strokeWidth: 3,
                  r: 7,
                  filter: 'url(#lineShadow)',
                  cursor: onPointClick ? 'pointer' : 'default'
                }}
                onClick={(e: any) => onPointClick && e && onPointClick(e, e.index)}
              />
              {showSecondary && (
                <Area
                  type="monotone"
                  dataKey="secondaryValue"
                  name={secondaryLabel}
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={2}
                  strokeDasharray="6 4"
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
                name={primaryLabel}
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
                  strokeWidth: 3,
                  r: 7
                }}
              />
              {showSecondary && (
                <Line
                  type="monotone"
                  dataKey="secondaryValue"
                  name={secondaryLabel}
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  animationDuration={1200}
                  animationEasing="ease-out"
                  dot={false}
                />
              )}
            </>
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
}
