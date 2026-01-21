/**
 * Segment Charts
 * 
 * Charts for segment drilldown view showing spend, utilization, and unused by category.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrencyAED, formatPercent } from '@/lib/utils';
import { SegmentDimension } from '@/hooks/useSegmentData';

interface SegmentChartsProps {
  dimension: SegmentDimension;
}

// Generate chart data from dimension values
function generateChartsData(dimension: SegmentDimension) {
  const spendData = dimension.values.map(v => {
    const allocated = v.unusedEntitlement / (1 - v.utilizationRate / 100 || 0.01);
    const spent = allocated - v.unusedEntitlement;
    return {
      name: v.name,
      spent,
      allocated,
    };
  }).sort((a, b) => b.spent - a.spent);
  
  const utilizationData = dimension.values.map(v => ({
    name: v.name,
    rate: v.utilizationRate,
  })).sort((a, b) => b.rate - a.rate);
  
  const unusedData = dimension.values.map(v => ({
    name: v.name,
    unused: v.unusedEntitlement,
  })).sort((a, b) => b.unused - a.unused);
  
  return { spendData, utilizationData, unusedData };
}

const COLORS = {
  accent: 'hsl(var(--accent))',
  success: 'hsl(var(--success))',
  warning: 'hsl(38 92% 50%)',
  muted: 'hsl(var(--muted-foreground))',
};

export function SegmentCharts({ dimension }: SegmentChartsProps) {
  const { spendData, utilizationData, unusedData } = generateChartsData(dimension);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Spend by Segment */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            Spend by Segment
            <InfoTooltip formula="Allocated - Unused" dataSource="benefit_entitlements" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spendData} layout="vertical" margin={{ left: 0, right: 10 }}>
                <XAxis type="number" hide />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={80} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10 }} 
                />
                <Tooltip 
                  formatter={(value: number) => formatCurrencyAED(value)}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="spent" name="Spent" fill={COLORS.accent} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Utilization by Segment */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            Utilization by Segment
            <InfoTooltip formula="Spent / Allocated × 100" dataSource="benefit_entitlements" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={utilizationData} layout="vertical" margin={{ left: 0, right: 10 }}>
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={80} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10 }} 
                />
                <Tooltip 
                  formatter={(value: number) => formatPercent(value)}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="rate" name="Utilization" radius={[0, 4, 4, 0]}>
                  {utilizationData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.rate >= 80 ? COLORS.success : entry.rate >= 60 ? COLORS.accent : COLORS.warning} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Unused by Segment */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            Unused Entitlement
            <InfoTooltip formula="Allocated - Utilized" dataSource="benefit_entitlements" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={unusedData} layout="vertical" margin={{ left: 0, right: 10 }}>
                <XAxis type="number" hide />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={80} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10 }} 
                />
                <Tooltip 
                  formatter={(value: number) => formatCurrencyAED(value)}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="unused" name="Unused" fill={COLORS.warning} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
