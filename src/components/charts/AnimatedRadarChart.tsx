import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';

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
}

export function AnimatedRadarChart({
  data,
  height = 300,
  showSecondary = false,
  primaryLabel = 'Value',
  secondaryLabel = 'Benchmark',
  primaryColor = 'hsl(174 60% 45%)',
  secondaryColor = 'hsl(220 14% 70%)'
}: AnimatedRadarChartProps) {
  const maxValue = Math.max(...data.map(d => Math.max(d.value, d.secondaryValue || 0, d.fullMark || 100)));
  
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <defs>
            <linearGradient id="radarPrimary" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={primaryColor} stopOpacity={0.8} />
              <stop offset="100%" stopColor={primaryColor} stopOpacity={0.3} />
            </linearGradient>
            <linearGradient id="radarSecondary" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={secondaryColor} stopOpacity={0.6} />
              <stop offset="100%" stopColor={secondaryColor} stopOpacity={0.2} />
            </linearGradient>
          </defs>
          
          <PolarGrid 
            stroke="hsl(var(--border))" 
            strokeOpacity={0.5}
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
            tickCount={5}
            axisLine={false}
          />
          
          {showSecondary && (
            <Radar
              name={secondaryLabel}
              dataKey="secondaryValue"
              stroke={secondaryColor}
              strokeWidth={2}
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
            fillOpacity={0.5}
            dot={{ fill: primaryColor, strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6, stroke: primaryColor, strokeWidth: 2, fill: 'hsl(var(--card))' }}
            animationDuration={1000}
            animationEasing="ease-out"
          />
          
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              padding: '10px 14px'
            }}
            labelStyle={{ fontWeight: 600, color: 'hsl(var(--foreground))', marginBottom: 4 }}
            formatter={(value: number) => [`${value}%`, '']}
          />
          
          {showSecondary && (
            <Legend 
              wrapperStyle={{ paddingTop: 16 }}
              formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
            />
          )}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
