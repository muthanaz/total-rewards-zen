import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DataPoint {
  name: string;
  [key: string]: string | number;
}

interface StackConfig {
  key: string;
  label: string;
  color: string;
}

interface StackedAreaChartProps {
  data: DataPoint[];
  stacks: StackConfig[];
  height?: number;
  formatValue?: (value: number) => string;
  showGrid?: boolean;
  yDomain?: [number, number];
}

export function StackedAreaChart({
  data,
  stacks,
  height = 300,
  formatValue = (v) => v.toLocaleString(),
  showGrid = true,
  yDomain
}: StackedAreaChartProps) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
        >
          <defs>
            {stacks.map((stack, index) => (
              <linearGradient key={stack.key} id={`stackGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={stack.color} stopOpacity={0.8} />
                <stop offset="100%" stopColor={stack.color} stopOpacity={0.2} />
              </linearGradient>
            ))}
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
            dy={8}
          />
          
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            tickFormatter={formatValue}
            domain={yDomain}
            width={50}
          />
          
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              padding: '12px 16px'
            }}
            labelStyle={{ fontWeight: 600, color: 'hsl(var(--foreground))', marginBottom: 8 }}
            formatter={(value: number, name: string) => {
              const stack = stacks.find(s => s.key === name);
              return [formatValue(value), stack?.label || name];
            }}
            cursor={{ stroke: 'hsl(var(--accent))', strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          
          <Legend 
            wrapperStyle={{ paddingTop: 16 }}
            formatter={(value) => {
              const stack = stacks.find(s => s.key === value);
              return <span className="text-xs text-muted-foreground ml-1">{stack?.label || value}</span>;
            }}
            iconType="circle"
            iconSize={8}
          />
          
          {stacks.map((stack, index) => (
            <Area
              key={stack.key}
              type="monotone"
              dataKey={stack.key}
              stackId="1"
              stroke={stack.color}
              strokeWidth={2}
              fill={`url(#stackGradient-${index})`}
              animationDuration={1000 + index * 200}
              animationEasing="ease-out"
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
