import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ReactNode } from 'react';

interface DataPoint {
  name: string;
  value: number;
  color: string;
}

interface AnimatedDonutChartProps {
  data: DataPoint[];
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  formatValue?: (value: number) => string;
  centerContent?: ReactNode;
  showLegend?: boolean;
}

export function AnimatedDonutChart({
  data,
  height = 220,
  innerRadius = 60,
  outerRadius = 85,
  formatValue = (v) => v.toLocaleString(),
  centerContent,
  showLegend = true
}: AnimatedDonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <div className="space-y-4">
      <div style={{ height }} className="relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              {data.map((entry, index) => (
                <linearGradient key={`gradient-${index}`} id={`donutGradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                  <stop offset="100%" stopColor={entry.color} stopOpacity={0.7} />
                </linearGradient>
              ))}
              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15"/>
              </filter>
            </defs>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={3}
              dataKey="value"
              animationDuration={1000}
              animationEasing="ease-out"
              stroke="none"
              filter="url(#shadow)"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`url(#donutGradient-${index})`}
                  style={{ 
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease-out'
                  }}
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number, name: string) => [formatValue(value), name]}
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                padding: '10px 14px'
              }}
              labelStyle={{ fontWeight: 600, color: 'hsl(var(--foreground))' }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center content */}
        {centerContent && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {centerContent}
          </div>
        )}
      </div>
      
      {/* Legend */}
      {showLegend && (
        <div className="flex flex-wrap justify-center gap-4 px-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2 group cursor-pointer">
              <div 
                className="w-3 h-3 rounded-full shadow-sm transition-transform group-hover:scale-110" 
                style={{ backgroundColor: item.color }}
              />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">{item.name}</span>
                <span className="text-sm font-semibold">{formatValue(item.value)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
