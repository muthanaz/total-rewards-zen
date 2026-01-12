import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';

interface DataPoint {
  subject: string;
  value: number;
  fullMark?: number;
  secondaryValue?: number;
}

interface AnimatedRadarChartProps {
  data: DataPoint[];
  height?: number;
  showSecondary?: boolean;
  primaryLabel?: string;
  secondaryLabel?: string;
  primaryColor?: string;
  secondaryColor?: string;
  showLegend?: boolean;
  onPointClick?: (data: DataPoint, index: number) => void;
}

export function AnimatedRadarChart({
  data,
  height = 300,
  showSecondary = false,
  primaryLabel = 'Value',
  secondaryLabel = 'Benchmark',
  primaryColor = 'hsl(174 60% 45%)',
  secondaryColor = 'hsl(220 14% 70%)',
  showLegend = true,
  onPointClick
}: AnimatedRadarChartProps) {
  const maxValue = Math.max(...data.map(d => Math.max(d.value, d.secondaryValue || 0, d.fullMark || 100)));
  
  return (
    <div className="space-y-3">
      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="72%" data={data}>
            <defs>
              <linearGradient id="radarPrimary" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={primaryColor} stopOpacity={0.85} />
                <stop offset="100%" stopColor={primaryColor} stopOpacity={0.35} />
              </linearGradient>
              <linearGradient id="radarSecondary" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={secondaryColor} stopOpacity={0.5} />
                <stop offset="100%" stopColor={secondaryColor} stopOpacity={0.15} />
              </linearGradient>
              <filter id="radarGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={primaryColor} floodOpacity="0.4"/>
              </filter>
            </defs>
            
            <PolarGrid 
              stroke="hsl(var(--border))" 
              strokeOpacity={0.6}
              gridType="polygon"
            />
            
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ 
                fill: 'hsl(var(--muted-foreground))', 
                fontSize: 11,
                fontWeight: 500
              }}
              tickLine={false}
            />
            
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, maxValue]}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              tickCount={4}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            
            {showSecondary && (
              <Radar
                name={secondaryLabel}
                dataKey="secondaryValue"
                stroke={secondaryColor}
                strokeWidth={2}
                strokeDasharray="4 4"
                fill="url(#radarSecondary)"
                fillOpacity={0.4}
                animationDuration={1200}
                animationEasing="ease-out"
              />
            )}
            
            <Radar
              name={primaryLabel}
              dataKey="value"
              stroke={primaryColor}
              strokeWidth={2.5}
              fill="url(#radarPrimary)"
              fillOpacity={0.6}
              dot={{ 
                fill: 'hsl(var(--background))', 
                stroke: primaryColor, 
                strokeWidth: 2, 
                r: 4 
              }}
              activeDot={{ 
                r: 6, 
                stroke: primaryColor, 
                strokeWidth: 2, 
                fill: 'hsl(var(--background))',
                filter: 'url(#radarGlow)',
                cursor: onPointClick ? 'pointer' : 'default'
              }}
              animationDuration={1000}
              animationEasing="ease-out"
            />
            
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '10px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                padding: '12px 16px'
              }}
              labelStyle={{ fontWeight: 600, color: 'hsl(var(--foreground))', marginBottom: 6 }}
              formatter={(value: number, name: string) => [`${value}%`, name]}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Custom Legend */}
      {showLegend && (
        <div className="flex flex-wrap justify-center gap-6">
          <div className="flex items-center gap-2">
            <div 
              className="w-4 h-1 rounded-full" 
              style={{ backgroundColor: primaryColor }}
            />
            <span className="text-xs text-muted-foreground font-medium">{primaryLabel}</span>
          </div>
          {showSecondary && (
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-0.5 rounded-full border-t-2 border-dashed" 
                style={{ borderColor: secondaryColor }}
              />
              <span className="text-xs text-muted-foreground font-medium">{secondaryLabel}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
