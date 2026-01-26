/**
 * Data Coverage Thresholds Configuration
 * 
 * Allows configuring per-metric thresholds that determine:
 * - When insight is hidden
 * - When insight is shown but labeled "directional"
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { 
  Settings2, 
  Shield, 
  Database, 
  Clock, 
  Users,
  Save,
  RefreshCw,
  Info,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { useOrgTargets } from '@/hooks/useOrgTargets';
import { DEFAULT_THRESHOLDS, type DataConfidenceThreshold } from '@/lib/trustSystem';

interface DataCoverageThresholdsProps {
  className?: string;
}

const METRIC_LABELS: Record<string, { label: string; description: string }> = {
  utilization: {
    label: 'Utilization Analytics',
    description: 'Benefit utilization rates and trends',
  },
  claims_analytics: {
    label: 'Claims Analytics',
    description: 'Claims processing metrics and SLA tracking',
  },
  satisfaction: {
    label: 'Satisfaction Scores',
    description: 'Employee satisfaction and ESAT surveys',
  },
  financial: {
    label: 'Financial Metrics',
    description: 'Budget, spend, and cost analysis',
  },
  retention: {
    label: 'Retention Analytics',
    description: 'Turnover and retention insights',
  },
};

export function DataCoverageThresholds({ className }: DataCoverageThresholdsProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;
  
  const { thresholds, updateThreshold, isSaving } = useOrgTargets();
  
  const [editingThreshold, setEditingThreshold] = useState<DataConfidenceThreshold | null>(null);
  const [editValues, setEditValues] = useState({
    minSampleSize: 10,
    minCoveragePercent: 80,
    maxStaleDays: 7,
    degradedThreshold: 60,
  });
  
  // Merge DB thresholds with defaults
  const mergedThresholds = DEFAULT_THRESHOLDS.map(def => {
    const dbThreshold = thresholds?.find(t => t.metric_key === def.metricKey);
    if (dbThreshold) {
      return {
        metricKey: def.metricKey,
        minSampleSize: dbThreshold.min_sample_size,
        minCoveragePercent: dbThreshold.min_coverage_percent || def.minCoveragePercent,
        maxStaleDays: def.maxStaleDays, // Not in DB yet
        degradedThreshold: dbThreshold.confidence_degraded_threshold || def.degradedThreshold,
      };
    }
    return def;
  });
  
  const handleEdit = (threshold: DataConfidenceThreshold) => {
    setEditingThreshold(threshold);
    setEditValues({
      minSampleSize: threshold.minSampleSize,
      minCoveragePercent: threshold.minCoveragePercent,
      maxStaleDays: threshold.maxStaleDays,
      degradedThreshold: threshold.degradedThreshold,
    });
  };
  
  const handleSave = async () => {
    if (!editingThreshold) return;
    
    try {
      await updateThreshold.mutateAsync({
        metric_key: editingThreshold.metricKey,
        min_sample_size: editValues.minSampleSize,
        min_coverage_percent: editValues.minCoveragePercent,
      });
      setEditingThreshold(null);
      toast.success(t('Threshold updated', 'تم تحديث الحد'));
    } catch (error) {
      toast.error(t('Failed to update threshold', 'فشل تحديث الحد'));
    }
  };
  
  const handleResetToDefault = () => {
    if (!editingThreshold) return;
    const defaultThreshold = DEFAULT_THRESHOLDS.find(d => d.metricKey === editingThreshold.metricKey);
    if (defaultThreshold) {
      setEditValues({
        minSampleSize: defaultThreshold.minSampleSize,
        minCoveragePercent: defaultThreshold.minCoveragePercent,
        maxStaleDays: defaultThreshold.maxStaleDays,
        degradedThreshold: defaultThreshold.degradedThreshold,
      });
    }
  };
  
  return (
    <Card className={cn('card-elevated', className)}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          {t('Data Coverage Thresholds', 'حدود تغطية البيانات')}
        </CardTitle>
        <CardDescription>
          {t(
            'Configure when insights are hidden or labeled as directional based on data quality',
            'تكوين متى يتم إخفاء الرؤى أو تصنيفها كاتجاهية بناءً على جودة البيانات'
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>{t('Metric', 'المقياس')}</TableHead>
                <TableHead className="text-center w-[120px]">
                  <div className="flex items-center justify-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {t('Min Sample', 'الحد الأدنى')}
                  </div>
                </TableHead>
                <TableHead className="text-center w-[120px]">
                  <div className="flex items-center justify-center gap-1">
                    <Database className="h-3.5 w-3.5" />
                    {t('Min Coverage', 'التغطية')}
                  </div>
                </TableHead>
                <TableHead className="text-center w-[120px]">
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {t('Max Stale', 'أقصى قِدم')}
                  </div>
                </TableHead>
                <TableHead className="text-center w-[120px]">
                  <div className="flex items-center justify-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {t('Low Threshold', 'حد منخفض')}
                  </div>
                </TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mergedThresholds.map((threshold) => {
                const meta = METRIC_LABELS[threshold.metricKey];
                return (
                  <TableRow key={threshold.metricKey}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{meta?.label || threshold.metricKey}</p>
                        <p className="text-xs text-muted-foreground">{meta?.description}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="tabular-nums">
                        {threshold.minSampleSize}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="tabular-nums">
                        {threshold.minCoveragePercent}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="tabular-nums">
                        {threshold.maxStaleDays}d
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        variant="outline" 
                        className="tabular-nums bg-warning/10 text-warning border-warning/20"
                      >
                        {threshold.degradedThreshold}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleEdit(threshold)}
                          >
                            <Settings2 className="h-4 w-4" />
                          </Button>
                        </SheetTrigger>
                        <SheetContent side={isRTL ? 'left' : 'right'}>
                          <SheetHeader>
                            <SheetTitle>{meta?.label || threshold.metricKey}</SheetTitle>
                            <SheetDescription>
                              {t(
                                'Configure confidence thresholds for this metric',
                                'تكوين حدود الثقة لهذا المقياس'
                              )}
                            </SheetDescription>
                          </SheetHeader>
                          
                          <div className="py-6 space-y-6">
                            {/* Min Sample Size */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Label className="flex items-center gap-2">
                                  <Users className="h-4 w-4" />
                                  {t('Minimum Sample Size', 'الحد الأدنى لحجم العينة')}
                                </Label>
                                <span className="text-sm font-medium tabular-nums">
                                  {editValues.minSampleSize}
                                </span>
                              </div>
                              <Slider
                                value={[editValues.minSampleSize]}
                                onValueChange={([v]) => setEditValues(prev => ({ ...prev, minSampleSize: v }))}
                                min={1}
                                max={100}
                                step={1}
                              />
                              <p className="text-xs text-muted-foreground">
                                {t(
                                  'Minimum number of data points required for reliable insights',
                                  'الحد الأدنى لنقاط البيانات المطلوبة للرؤى الموثوقة'
                                )}
                              </p>
                            </div>
                            
                            {/* Min Coverage */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Label className="flex items-center gap-2">
                                  <Database className="h-4 w-4" />
                                  {t('Minimum Coverage', 'الحد الأدنى للتغطية')}
                                </Label>
                                <span className="text-sm font-medium tabular-nums">
                                  {editValues.minCoveragePercent}%
                                </span>
                              </div>
                              <Slider
                                value={[editValues.minCoveragePercent]}
                                onValueChange={([v]) => setEditValues(prev => ({ ...prev, minCoveragePercent: v }))}
                                min={10}
                                max={100}
                                step={5}
                              />
                              <p className="text-xs text-muted-foreground">
                                {t(
                                  'Below this coverage, insights are labeled as directional',
                                  'أقل من هذه التغطية، يتم تصنيف الرؤى كاتجاهية'
                                )}
                              </p>
                            </div>
                            
                            {/* Low Confidence Threshold */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Label className="flex items-center gap-2">
                                  <AlertTriangle className="h-4 w-4 text-warning" />
                                  {t('Low Confidence Threshold', 'حد الثقة المنخفضة')}
                                </Label>
                                <span className="text-sm font-medium tabular-nums text-warning">
                                  {editValues.degradedThreshold}%
                                </span>
                              </div>
                              <Slider
                                value={[editValues.degradedThreshold]}
                                onValueChange={([v]) => setEditValues(prev => ({ ...prev, degradedThreshold: v }))}
                                min={10}
                                max={80}
                                step={5}
                              />
                              <p className="text-xs text-muted-foreground">
                                {t(
                                  'Below this threshold, insights are hidden completely',
                                  'أقل من هذا الحد، يتم إخفاء الرؤى تماماً'
                                )}
                              </p>
                            </div>
                            
                            {/* Info callout */}
                            <div className="p-3 rounded-lg bg-muted/50 border border-muted-foreground/10">
                              <div className="flex items-start gap-2">
                                <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <div className="text-xs text-muted-foreground">
                                  <p className="font-medium mb-1">
                                    {t('How this affects insights:', 'كيف يؤثر هذا على الرؤى:')}
                                  </p>
                                  <ul className="space-y-1">
                                    <li>• ≥{editValues.minCoveragePercent}% → {t('Shown normally', 'تظهر بشكل طبيعي')}</li>
                                    <li>• {editValues.degradedThreshold}-{editValues.minCoveragePercent}% → {t('Labeled "Directional"', 'مصنف "اتجاهي"')}</li>
                                    <li>• &lt;{editValues.degradedThreshold}% → {t('Hidden', 'مخفي')}</li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <SheetFooter className="gap-2">
                            <Button 
                              variant="outline" 
                              onClick={handleResetToDefault}
                              className="gap-1.5"
                            >
                              <RefreshCw className="h-4 w-4" />
                              {t('Reset to Default', 'إعادة تعيين')}
                            </Button>
                            <Button 
                              onClick={handleSave}
                              disabled={isSaving}
                              className="gap-1.5"
                            >
                              <Save className="h-4 w-4" />
                              {t('Save Changes', 'حفظ التغييرات')}
                            </Button>
                          </SheetFooter>
                        </SheetContent>
                      </Sheet>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
