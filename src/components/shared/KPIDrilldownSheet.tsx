/**
 * KPI Drilldown Sheet
 * 
 * A comprehensive drilldown component for KPI cards that displays:
 * 1. Trend chart (7/30/90 days)
 * 2. Breakdown tabs: Category / Department / Grade / Location
 * 3. Top drivers list
 * 4. Action buttons: Create Recommendation, View Related Items, Export
 * 
 * Supports deep linking via URL params for direct access.
 */

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  ExternalLink,
  Lightbulb,
  ArrowRight,
  Building2,
  Users,
  Layers,
  MapPin,
  type LucideIcon,
  ChevronRight,
  Zap,
  Eye,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrencyAED, formatPercent, formatInteger } from '@/lib/utils';
import { toast } from 'sonner';

// ============================================================================
// TYPES
// ============================================================================

export interface KPIMetricData {
  key: string;
  name: string;
  value: number | string;
  formattedValue: string;
  unit: 'currency' | 'percent' | 'number' | 'days';
  trend?: {
    value: number;
    higherIsBetter?: boolean;
    period: string;
  };
  icon?: LucideIcon;
  formula?: string;
  dataSource?: string;
}

export interface TrendDataPoint {
  date: string;
  value: number;
  previousValue?: number;
}

export interface BreakdownItem {
  name: string;
  value: number;
  previousValue?: number;
  percent?: number;
  count?: number;
  trend?: number;
}

export interface TopDriver {
  name: string;
  impact: number;
  direction: 'up' | 'down' | 'neutral';
  description: string;
  actionLabel?: string;
  actionLink?: string;
}

interface KPIDrilldownSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  metric: KPIMetricData | null;
  // Trend data
  trendData?: TrendDataPoint[];
  // Breakdown data by dimension
  breakdowns?: {
    category?: BreakdownItem[];
    department?: BreakdownItem[];
    grade?: BreakdownItem[];
    location?: BreakdownItem[];
  };
  // Top drivers
  topDrivers?: TopDriver[];
  // Actions
  onCreateRecommendation?: () => void;
  onViewRelated?: () => void;
  onExport?: () => void;
  // Navigation
  relatedLinks?: Array<{
    label: string;
    href: string;
    icon?: LucideIcon;
  }>;
  // Loading state
  isLoading?: boolean;
}

// ============================================================================
// MOCK DATA GENERATOR
// ============================================================================

function generateTrendData(days: number, baseValue: number): TrendDataPoint[] {
  const data: TrendDataPoint[] = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const variance = (Math.random() - 0.5) * 0.2;
    const value = baseValue * (1 + variance);
    const previousValue = baseValue * (1 + variance - 0.05);
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Math.round(value),
      previousValue: Math.round(previousValue),
    });
  }
  
  return data;
}

function generateBreakdownData(dimension: string): BreakdownItem[] {
  const dimensions: Record<string, string[]> = {
    category: ['Health', 'Housing', 'Transport', 'Learning', 'Wellbeing', 'Schooling'],
    department: ['Engineering', 'Sales', 'Marketing', 'Operations', 'HR', 'Finance'],
    grade: ['Senior', 'Mid-Level', 'Junior', 'Executive', 'Entry'],
    location: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Remote', 'Ajman'],
  };
  
  const items = dimensions[dimension] || dimensions.category;
  let remaining = 100;
  
  return items.map((name, idx) => {
    const percent = idx === items.length - 1 
      ? remaining 
      : Math.floor(Math.random() * (remaining / 2)) + 5;
    remaining -= percent;
    
    return {
      name,
      value: Math.round(percent * 50000),
      previousValue: Math.round(percent * 48000),
      percent,
      count: Math.floor(Math.random() * 50) + 10,
      trend: Math.round((Math.random() - 0.5) * 20),
    };
  }).sort((a, b) => b.percent - a.percent);
}

const DEFAULT_TOP_DRIVERS: TopDriver[] = [
  {
    name: 'Housing allowance increase',
    impact: 15,
    direction: 'up',
    description: 'Grade A housing rates increased 12% YoY',
    actionLabel: 'View housing policy',
    actionLink: '/employer/policies',
  },
  {
    name: 'New hire onboarding',
    impact: 8,
    direction: 'up',
    description: '23 new employees added entitlements',
    actionLabel: 'View segments',
    actionLink: '/employer/segments',
  },
  {
    name: 'School fee season',
    impact: 12,
    direction: 'up',
    description: 'Annual school fee claims processing',
    actionLabel: 'View claims queue',
    actionLink: '/employer/claims',
  },
  {
    name: 'Underutilized wellness',
    impact: -5,
    direction: 'down',
    description: 'Wellbeing benefits at 34% utilization',
    actionLabel: 'Create recommendation',
    actionLink: '/employer/recommendations',
  },
];

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface TrendChartProps {
  data: TrendDataPoint[];
  timeframe: '7d' | '30d' | '90d';
  onTimeframeChange: (tf: '7d' | '30d' | '90d') => void;
  unit: 'currency' | 'percent' | 'number' | 'days';
}

function TrendChart({ data, timeframe, onTimeframeChange, unit }: TrendChartProps) {
  const formatValue = (value: number) => {
    if (unit === 'currency') return formatCurrencyAED(value, { abbreviate: true });
    if (unit === 'percent') return `${value}%`;
    if (unit === 'days') return `${value}d`;
    return formatInteger(value);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Trend Over Time</CardTitle>
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5">
            {(['7d', '30d', '90d'] as const).map((tf) => (
              <Button
                key={tf}
                variant={timeframe === tf ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => onTimeframeChange(tf)}
              >
                {tf}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10 }} 
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 10 }} 
                tickLine={false}
                axisLine={false}
                tickFormatter={formatValue}
                className="text-muted-foreground"
              />
              <Tooltip 
                formatter={(value: number) => [formatValue(value), 'Value']}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

interface BreakdownTableProps {
  data: BreakdownItem[];
  dimension: string;
  unit: 'currency' | 'percent' | 'number' | 'days';
}

function BreakdownTable({ data, dimension, unit }: BreakdownTableProps) {
  const formatValue = (value: number) => {
    if (unit === 'currency') return formatCurrencyAED(value, { abbreviate: true });
    if (unit === 'percent') return `${value}%`;
    return formatInteger(value);
  };

  return (
    <div className="space-y-3">
      {data.map((item, idx) => (
        <div 
          key={item.name}
          className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
              {idx + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{item.name}</p>
              {item.count !== undefined && (
                <p className="text-xs text-muted-foreground">{item.count} employees</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-mono font-medium text-sm">{formatValue(item.value)}</p>
              {item.percent !== undefined && (
                <p className="text-xs text-muted-foreground">{item.percent}%</p>
              )}
            </div>
            {item.trend !== undefined && (
              <div className={cn(
                'flex items-center gap-1 text-xs font-medium',
                item.trend > 0 ? 'text-success' : item.trend < 0 ? 'text-destructive' : 'text-muted-foreground'
              )}>
                {item.trend > 0 ? <TrendingUp className="w-3 h-3" /> : item.trend < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                {item.trend > 0 ? '+' : ''}{item.trend}%
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

interface TopDriversListProps {
  drivers: TopDriver[];
}

function TopDriversList({ drivers }: TopDriversListProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          Top Drivers
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {drivers.map((driver, idx) => (
          <div 
            key={idx}
            className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg"
          >
            <div className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
              driver.direction === 'up' ? 'bg-success/10 text-success' : 
              driver.direction === 'down' ? 'bg-destructive/10 text-destructive' : 
              'bg-muted text-muted-foreground'
            )}>
              {driver.direction === 'up' ? <TrendingUp className="w-4 h-4" /> : 
               driver.direction === 'down' ? <TrendingDown className="w-4 h-4" /> : 
               <Minus className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm">{driver.name}</p>
                <Badge variant="outline" className={cn(
                  'text-xs',
                  driver.direction === 'up' ? 'border-success/30 text-success' : 
                  driver.direction === 'down' ? 'border-destructive/30 text-destructive' : ''
                )}>
                  {driver.impact > 0 ? '+' : ''}{driver.impact}%
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{driver.description}</p>
              {driver.actionLabel && (
                <Button 
                  variant="link" 
                  size="sm" 
                  className="h-auto p-0 mt-1 text-xs gap-1"
                  onClick={() => toast.info(`Navigate to: ${driver.actionLink}`)}
                >
                  {driver.actionLabel}
                  <ChevronRight className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function KPIDrilldownSheet({
  open,
  onOpenChange,
  metric,
  trendData,
  breakdowns,
  topDrivers = DEFAULT_TOP_DRIVERS,
  onCreateRecommendation,
  onViewRelated,
  onExport,
  relatedLinks,
  isLoading,
}: KPIDrilldownSheetProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const [breakdownTab, setBreakdownTab] = useState<'category' | 'department' | 'grade' | 'location'>('category');

  // Sync with URL params for deep linking
  useEffect(() => {
    const urlMetric = searchParams.get('drilldown');
    if (urlMetric && !open && metric?.key === urlMetric) {
      onOpenChange(true);
    }
  }, [searchParams, metric, open, onOpenChange]);

  // Update URL when opening/closing
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && metric) {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        next.set('drilldown', metric.key);
        return next;
      });
    } else {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        next.delete('drilldown');
        return next;
      });
    }
    onOpenChange(isOpen);
  };

  // Generate mock data if not provided
  const chartData = useMemo(() => {
    if (trendData) return trendData;
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    const baseValue = typeof metric?.value === 'number' ? metric.value : 50000;
    return generateTrendData(days, baseValue);
  }, [trendData, timeframe, metric]);

  const breakdownData = useMemo(() => {
    if (breakdowns?.[breakdownTab]) return breakdowns[breakdownTab];
    return generateBreakdownData(breakdownTab);
  }, [breakdowns, breakdownTab]);

  if (!metric) return null;

  const Icon = metric.icon;
  const TrendIcon = !metric.trend ? null : metric.trend.value > 0 ? TrendingUp : metric.trend.value < 0 ? TrendingDown : Minus;
  const trendColor = !metric.trend ? '' : 
    metric.trend.higherIsBetter !== false 
      ? (metric.trend.value > 0 ? 'text-success' : 'text-destructive')
      : (metric.trend.value < 0 ? 'text-success' : 'text-destructive');

  const handleExport = () => {
    if (onExport) {
      onExport();
    } else {
      toast.success(`Exporting ${metric.name} data...`);
    }
  };

  const handleCreateRecommendation = () => {
    if (onCreateRecommendation) {
      onCreateRecommendation();
    } else {
      toast.info('Recommendation creation coming soon');
    }
  };

  const handleViewRelated = () => {
    if (onViewRelated) {
      onViewRelated();
    } else {
      toast.info('View related items');
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
            {/* Header */}
            <SheetHeader className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    {Icon && (
                      <div className="p-2.5 rounded-xl bg-primary/10">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                    )}
                    <div>
                      <SheetTitle className="text-xl font-display">
                        {metric.name}
                      </SheetTitle>
                      <SheetDescription className="mt-0.5">
                        Detailed analysis and breakdown
                      </SheetDescription>
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Value Summary */}
              <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Value</p>
                      <p className="text-3xl font-bold tracking-tight">{metric.formattedValue}</p>
                    </div>
                    {metric.trend && (
                      <div className={cn('flex items-center gap-1.5', trendColor)}>
                        {TrendIcon && <TrendIcon className="w-5 h-5" />}
                        <div>
                          <p className="text-lg font-bold">
                            {metric.trend.value > 0 ? '+' : ''}{metric.trend.value}%
                          </p>
                          <p className="text-xs text-muted-foreground">{metric.trend.period}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  {metric.formula && (
                    <div className="mt-3 pt-3 border-t border-primary/10">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Formula:</span> {metric.formula}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </SheetHeader>

            <Separator />

            {/* Trend Chart */}
            <TrendChart 
              data={chartData} 
              timeframe={timeframe} 
              onTimeframeChange={setTimeframe}
              unit={metric.unit}
            />

            {/* Breakdown Tabs */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Breakdown Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={breakdownTab} onValueChange={(v) => setBreakdownTab(v as typeof breakdownTab)}>
                  <TabsList className="w-full justify-start mb-4">
                    <TabsTrigger value="category" className="gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      Category
                    </TabsTrigger>
                    <TabsTrigger value="department" className="gap-1.5">
                      <Building2 className="w-3.5 h-3.5" />
                      Department
                    </TabsTrigger>
                    <TabsTrigger value="grade" className="gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      Grade
                    </TabsTrigger>
                    <TabsTrigger value="location" className="gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      Location
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="category">
                    <BreakdownTable data={breakdownData || []} dimension="category" unit={metric.unit} />
                  </TabsContent>
                  <TabsContent value="department">
                    <BreakdownTable data={breakdownData || []} dimension="department" unit={metric.unit} />
                  </TabsContent>
                  <TabsContent value="grade">
                    <BreakdownTable data={breakdownData || []} dimension="grade" unit={metric.unit} />
                  </TabsContent>
                  <TabsContent value="location">
                    <BreakdownTable data={breakdownData || []} dimension="location" unit={metric.unit} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Top Drivers */}
            <TopDriversList drivers={topDrivers} />

            {/* Related Links */}
            {relatedLinks && relatedLinks.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Related Views</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {relatedLinks.map((link, idx) => {
                    const LinkIcon = link.icon || ExternalLink;
                    return (
                      <Button
                        key={idx}
                        variant="ghost"
                        className="w-full justify-between"
                        onClick={() => toast.info(`Navigate to: ${link.href}`)}
                      >
                        <span className="flex items-center gap-2">
                          <LinkIcon className="w-4 h-4" />
                          {link.label}
                        </span>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Actions Footer */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t">
              <Button variant="ghost" size="sm" onClick={handleExport} className="gap-1.5">
                <Download className="w-4 h-4" />
                Export
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleViewRelated} className="gap-1.5">
                  <Eye className="w-4 h-4" />
                  View Related
                </Button>
                <Button size="sm" onClick={handleCreateRecommendation} className="gap-1.5">
                  <Zap className="w-4 h-4" />
                  Create Recommendation
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

// ============================================================================
// HOOK FOR MANAGING DRILLDOWN STATE
// ============================================================================

export function useKPIDrilldown() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedMetric, setSelectedMetric] = useState<KPIMetricData | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Check URL for drilldown param on mount
  useEffect(() => {
    const drilldownKey = searchParams.get('drilldown');
    if (drilldownKey && !isOpen) {
      // This would trigger opening if metric is found
      // Parent component should set the metric based on this key
    }
  }, [searchParams, isOpen]);

  const openDrilldown = (metric: KPIMetricData) => {
    setSelectedMetric(metric);
    setIsOpen(true);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('drilldown', metric.key);
      return next;
    });
  };

  const closeDrilldown = () => {
    setIsOpen(false);
    setSelectedMetric(null);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.delete('drilldown');
      return next;
    });
  };

  return {
    selectedMetric,
    isOpen,
    openDrilldown,
    closeDrilldown,
    setIsOpen,
    drilldownKey: searchParams.get('drilldown'),
  };
}
