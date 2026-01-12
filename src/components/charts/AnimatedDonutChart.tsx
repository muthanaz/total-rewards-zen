import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from 'recharts';
import { ReactNode, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

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
  onSliceClick?: (data: DataPoint, index: number) => void;
  interactive?: boolean;
}

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 2}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }}
      />
    </g>
  );
};

export function AnimatedDonutChart({
  data,
  height = 220,
  innerRadius = 60,
  outerRadius = 85,
  formatValue = (v) => v.toLocaleString(),
  centerContent,
  showLegend = true,
  onSliceClick,
  interactive = true
}: AnimatedDonutChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const onPieEnter = useCallback((_: any, index: number) => {
    if (interactive) {
      setActiveIndex(index);
    }
  }, [interactive]);

  const onPieLeave = useCallback(() => {
    setActiveIndex(undefined);
  }, []);

  const handleClick = (data: DataPoint, index: number) => {
    if (onSliceClick) {
      onSliceClick(data, index);
    }
  };
  
  return (
    <div className="space-y-4">
      <div style={{ height }} className="relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              {data.map((entry, index) => (
                <linearGradient key={`gradient-${index}`} id={`donutGradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                  <stop offset="100%" stopColor={entry.color} stopOpacity={0.75} />
                </linearGradient>
              ))}
              <filter id="donutShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.12"/>
              </filter>
            </defs>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={4}
              dataKey="value"
              animationDuration={1000}
              animationEasing="ease-out"
              stroke="hsl(var(--background))"
              strokeWidth={2}
              activeIndex={activeIndex}
              activeShape={interactive ? renderActiveShape : undefined}
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
              onClick={(_, index) => handleClick(data[index], index)}
              className={cn(interactive && onSliceClick && "cursor-pointer")}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`url(#donutGradient-${index})`}
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number, name: string) => {
                const percentage = ((value / total) * 100).toFixed(1);
                return [`${formatValue(value)} (${percentage}%)`, name];
              }}
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '10px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                padding: '12px 16px'
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
      
      {/* Enhanced Legend */}
      {showLegend && (
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 px-2">
          {data.map((item, index) => {
            const percentage = ((item.value / total) * 100).toFixed(1);
            return (
              <div 
                key={index} 
                className={cn(
                  "flex items-center gap-2.5 group transition-opacity",
                  interactive && "cursor-pointer hover:opacity-80",
                  activeIndex !== undefined && activeIndex !== index && "opacity-50"
                )}
                onMouseEnter={() => interactive && setActiveIndex(index)}
                onMouseLeave={() => interactive && setActiveIndex(undefined)}
                onClick={() => handleClick(item, index)}
              >
                <div 
                  className="w-3 h-3 rounded-full shadow-sm ring-2 ring-background" 
                  style={{ backgroundColor: item.color }}
                />
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-semibold text-foreground">{formatValue(item.value)}</span>
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                  <span className="text-xs text-muted-foreground/70">({percentage}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
