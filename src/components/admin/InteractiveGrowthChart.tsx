/**
 * InteractiveGrowthChart
 * 
 * Platform growth chart with toggleable series (Organizations / Employees / GMV).
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Building2, Users, DollarSign } from 'lucide-react';
import { cn, DIRHAM_SYMBOL } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from 'recharts';

interface DataPoint {
  name: string;
  organizations: number;
  employees: number;
  gmv: number;
}

interface InteractiveGrowthChartProps {
  data: DataPoint[];
}

type SeriesKey = 'organizations' | 'employees' | 'gmv';

const seriesConfig: Record<SeriesKey, { 
  label: string; 
  labelAr: string; 
  color: string; 
  icon: typeof Building2;
  format: (v: number) => string;
}> = {
  organizations: { 
    label: 'Organizations', 
    labelAr: 'المنظمات', 
    color: 'hsl(var(--primary))',
    icon: Building2,
    format: (v) => `${v}`,
  },
  employees: { 
    label: 'Employees', 
    labelAr: 'الموظفون', 
    color: 'hsl(var(--accent))',
    icon: Users,
    format: (v) => `${(v / 1000).toFixed(1)}K`,
  },
  gmv: { 
    label: `GMV (${DIRHAM_SYMBOL})`, 
    labelAr: `القيمة (${DIRHAM_SYMBOL})`, 
    color: 'hsl(var(--success))',
    icon: DollarSign,
    format: (v) => `${DIRHAM_SYMBOL} ${v.toFixed(1)}M`,
  },
};

export function InteractiveGrowthChart({ data }: InteractiveGrowthChartProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const [activeSeries, setActiveSeries] = useState<Set<SeriesKey>>(new Set(['organizations', 'gmv']));

  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const toggleSeries = (key: SeriesKey) => {
    const newSet = new Set(activeSeries);
    if (newSet.has(key)) {
      if (newSet.size > 1) {
        newSet.delete(key);
      }
    } else {
      newSet.add(key);
    }
    setActiveSeries(newSet);
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="pb-2">
        <div className={cn("flex items-center justify-between flex-wrap gap-2", isRTL && "flex-row-reverse")}>
          <div>
            <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <TrendingUp className="w-5 h-5 text-primary" />
              {t('Platform Growth', 'نمو المنصة')}
            </CardTitle>
            <CardDescription className="mt-1">
              {t('Monthly platform growth metrics', 'مقاييس نمو المنصة الشهرية')}
            </CardDescription>
          </div>
          <div className={cn("flex items-center gap-1.5", isRTL && "flex-row-reverse")}>
            {(Object.keys(seriesConfig) as SeriesKey[]).map((key) => {
              const config = seriesConfig[key];
              const Icon = config.icon;
              const isActive = activeSeries.has(key);
              
              return (
                <Button
                  key={key}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "h-8 text-xs",
                    isActive && "shadow-sm"
                  )}
                  style={isActive ? { backgroundColor: config.color, borderColor: config.color } : {}}
                  onClick={() => toggleSeries(key)}
                >
                  <Icon className="w-3 h-3 me-1" />
                  {language === 'ar' ? config.labelAr : config.label}
                </Button>
              );
            })}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 10 }}>
              <defs>
                {(Object.keys(seriesConfig) as SeriesKey[]).map((key) => (
                  <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={seriesConfig[key].color} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={seriesConfig[key].color} stopOpacity={0.02} />
                  </linearGradient>
                ))}
              </defs>
              
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))"
                strokeOpacity={0.6}
                vertical={false}
              />
              
              <XAxis 
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                dy={10}
              />
              
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                dx={-10}
                tickCount={5}
                width={45}
              />
              
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '10px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                  padding: '12px 16px'
                }}
                labelStyle={{ fontWeight: 600, marginBottom: 6 }}
              />

              {activeSeries.has('organizations') && (
                <Area
                  type="monotone"
                  dataKey="organizations"
                  name={language === 'ar' ? seriesConfig.organizations.labelAr : seriesConfig.organizations.label}
                  stroke={seriesConfig.organizations.color}
                  strokeWidth={2}
                  fill={`url(#gradient-organizations)`}
                  dot={{ fill: 'hsl(var(--background))', stroke: seriesConfig.organizations.color, strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5 }}
                />
              )}

              {activeSeries.has('employees') && (
                <Area
                  type="monotone"
                  dataKey="employees"
                  name={language === 'ar' ? seriesConfig.employees.labelAr : seriesConfig.employees.label}
                  stroke={seriesConfig.employees.color}
                  strokeWidth={2}
                  fill={`url(#gradient-employees)`}
                  dot={{ fill: 'hsl(var(--background))', stroke: seriesConfig.employees.color, strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5 }}
                />
              )}

              {activeSeries.has('gmv') && (
                <Area
                  type="monotone"
                  dataKey="gmv"
                  name={language === 'ar' ? seriesConfig.gmv.labelAr : seriesConfig.gmv.label}
                  stroke={seriesConfig.gmv.color}
                  strokeWidth={2}
                  fill={`url(#gradient-gmv)`}
                  dot={{ fill: 'hsl(var(--background))', stroke: seriesConfig.gmv.color, strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5 }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
