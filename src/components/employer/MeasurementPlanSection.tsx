/**
 * Measurement Plan Section
 * 
 * Component for defining success metrics, baseline/target values,
 * and tracking windows for action items.
 */

import { useState, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { 
  Target, 
  Calendar as CalendarIcon, 
  AlertTriangle, 
  Info,
  TrendingUp,
  Search,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { METRIC_DEFINITIONS, getMetricsByCategory } from '@/lib/metrics/definitions';
import type { MeasurementPlan } from '@/lib/actions/actionTypes';

interface MeasurementPlanSectionProps {
  plan: MeasurementPlan | null;
  onChange: (plan: MeasurementPlan | null) => void;
  linkedCategories?: string[];
  confidence: 'high' | 'medium' | 'low';
  className?: string;
}

export function MeasurementPlanSection({
  plan,
  onChange,
  linkedCategories = [],
  confidence,
  className,
}: MeasurementPlanSectionProps) {
  const [metricSearch, setMetricSearch] = useState('');
  const [showMetricPicker, setShowMetricPicker] = useState(false);

  // Get metrics that might be relevant based on linked categories
  const suggestedMetrics = useMemo(() => {
    const allMetrics = Object.values(METRIC_DEFINITIONS);
    
    // If linked categories exist, prioritize matching metrics
    if (linkedCategories.length > 0) {
      const categoryLower = linkedCategories.map(c => c.toLowerCase());
      return allMetrics.filter(m => 
        categoryLower.some(cat => 
          m.name.toLowerCase().includes(cat) ||
          m.key.toLowerCase().includes(cat) ||
          m.category.toLowerCase().includes(cat)
        )
      );
    }
    
    return allMetrics.slice(0, 5);
  }, [linkedCategories]);

  // Filter all metrics by search
  const filteredMetrics = useMemo(() => {
    const allMetrics = Object.values(METRIC_DEFINITIONS);
    if (!metricSearch) return allMetrics;
    
    const searchLower = metricSearch.toLowerCase();
    return allMetrics.filter(m => 
      m.name.toLowerCase().includes(searchLower) ||
      m.key.toLowerCase().includes(searchLower) ||
      m.description.toLowerCase().includes(searchLower)
    );
  }, [metricSearch]);

  const handleSelectMetric = (metricKey: string) => {
    const metric = METRIC_DEFINITIONS[metricKey];
    if (!metric) return;

    const unitMap: Record<string, MeasurementPlan['unit']> = {
      currency: 'currency',
      percent: 'percent',
      days: 'days',
      count: 'count',
      ratio: 'ratio',
    };
    onChange({
      metricKey: metric.key,
      metricName: metric.name,
      baselineValue: null,
      baselineDate: new Date(),
      targetValue: null,
      targetDate: null,
      unit: unitMap[metric.unit] || 'count',
      isMeasurable: true,
    });
    setShowMetricPicker(false);
    setMetricSearch('');
  };

  const handleMarkNotMeasurable = (reason: string) => {
    onChange({
      metricKey: '',
      metricName: '',
      baselineValue: null,
      baselineDate: null,
      targetValue: null,
      targetDate: null,
      unit: 'count',
      isMeasurable: false,
      notMeasurableReason: reason,
    });
  };

  const handleClear = () => {
    onChange(null);
  };

  // Not measurable state
  if (plan && !plan.isMeasurable) {
    return (
      <Card className={cn('border-warning/30 bg-warning/5', className)}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Not Currently Measurable
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={handleClear}>
              Change
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{plan.notMeasurableReason}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Connect additional data sources to enable measurement.
          </p>
        </CardContent>
      </Card>
    );
  }

  // No measurement plan selected yet
  if (!plan) {
    return (
      <Card className={cn('border-dashed', className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            Measurement Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Suggested metrics */}
          {suggestedMetrics.length > 0 && (
            <div>
              <Label className="text-xs text-muted-foreground">Suggested metrics</Label>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {suggestedMetrics.slice(0, 4).map(metric => (
                  <Badge
                    key={metric.key}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/10 transition-colors"
                    onClick={() => handleSelectMetric(metric.key)}
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {metric.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Metric picker */}
          <div>
            <Label className="text-xs text-muted-foreground">Or search all metrics</Label>
            <div className="relative mt-1.5">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search metrics..."
                value={metricSearch}
                onChange={(e) => {
                  setMetricSearch(e.target.value);
                  setShowMetricPicker(true);
                }}
                onFocus={() => setShowMetricPicker(true)}
                className="pl-9"
              />
              {showMetricPicker && metricSearch && (
                <div className="absolute z-50 w-full mt-1 max-h-48 overflow-y-auto bg-popover border rounded-md shadow-lg">
                  {filteredMetrics.length === 0 ? (
                    <div className="p-3 text-sm text-muted-foreground">No metrics found</div>
                  ) : (
                    filteredMetrics.map(metric => (
                      <button
                        key={metric.key}
                        className="w-full px-3 py-2 text-left hover:bg-muted text-sm flex items-start gap-2"
                        onClick={() => handleSelectMetric(metric.key)}
                      >
                        <TrendingUp className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                        <div>
                          <p className="font-medium">{metric.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {metric.description}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Not measurable option */}
          <div className="pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
              onClick={() => handleMarkNotMeasurable('Insufficient data available to measure impact')}
            >
              <AlertTriangle className="h-3 w-3 mr-1" />
              Mark as not currently measurable
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Measurement plan with metric selected
  return (
    <Card className={cn('border-accent/20 bg-accent/5', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="h-4 w-4 text-accent" />
            Measurement Plan
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn(
              'text-xs',
              confidence === 'high' ? 'bg-success/10 text-success' :
              confidence === 'medium' ? 'bg-warning/10 text-warning' : 
              'bg-muted text-muted-foreground'
            )}>
              {confidence === 'high' ? 'Measurable' : confidence === 'medium' ? 'Trackable' : 'Limited data'}
            </Badge>
            <Button variant="ghost" size="sm" onClick={handleClear}>
              Change
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selected metric */}
        <div className="p-3 rounded-lg bg-background border">
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-sm">{plan.metricName}</span>
            <Badge variant="secondary" className="text-xs">{plan.unit}</Badge>
          </div>
          {METRIC_DEFINITIONS[plan.metricKey]?.formula && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Info className="h-3 w-3" />
              {METRIC_DEFINITIONS[plan.metricKey].formula}
            </p>
          )}
        </div>

        {/* Baseline & Target */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Baseline Value</Label>
            <Input
              type="number"
              placeholder="Current value"
              value={plan.baselineValue ?? ''}
              onChange={(e) => onChange({
                ...plan,
                baselineValue: e.target.value ? parseFloat(e.target.value) : null,
              })}
            />
            <p className="text-xs text-muted-foreground">
              As of {plan.baselineDate ? format(plan.baselineDate, 'MMM d, yyyy') : 'today'}
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Target Value</Label>
            <Input
              type="number"
              placeholder="Goal value"
              value={plan.targetValue ?? ''}
              onChange={(e) => onChange({
                ...plan,
                targetValue: e.target.value ? parseFloat(e.target.value) : null,
              })}
            />
          </div>
        </div>

        {/* Target Date */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Tracking Window End</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !plan.targetDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {plan.targetDate ? format(plan.targetDate, 'PPP') : 'Select measurement end date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={plan.targetDate ?? undefined}
                onSelect={(date) => onChange({
                  ...plan,
                  targetDate: date ?? null,
                })}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Summary */}
        {plan.baselineValue !== null && plan.targetValue !== null && (
          <div className="p-3 rounded-lg bg-success/10 border border-success/20">
            <p className="text-sm font-medium text-success flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {plan.targetValue > plan.baselineValue 
                ? `+${(plan.targetValue - plan.baselineValue).toFixed(1)}` 
                : (plan.targetValue - plan.baselineValue).toFixed(1)
              } {plan.unit === 'currency' ? 'AED' : plan.unit === 'percent' ? '%' : plan.unit}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Expected improvement from baseline
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
