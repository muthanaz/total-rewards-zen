/**
 * Targets & Benchmarks Page
 * 
 * Configure organization-level KPI targets and data thresholds.
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Target,
  TrendingUp,
  BarChart2,
  Save,
  Percent,
  Clock,
  DollarSign,
} from 'lucide-react';
import { useOrgTargets } from '@/hooks/useOrgTargets';
import { useLanguage } from '@/contexts/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TARGET_DEFINITIONS = [
  { key: 'utilization_rate', label: 'Utilization Rate', labelAr: 'معدل الاستخدام', unit: 'percent', icon: Percent, defaultValue: 75 },
  { key: 'sla_compliance', label: 'SLA Compliance', labelAr: 'الالتزام بـ SLA', unit: 'percent', icon: Clock, defaultValue: 95 },
  { key: 'claim_approval_rate', label: 'Claim Approval Rate', labelAr: 'معدل الموافقة على المطالبات', unit: 'percent', icon: TrendingUp, defaultValue: 85 },
  { key: 'avg_processing_days', label: 'Avg Processing Time', labelAr: 'متوسط وقت المعالجة', unit: 'days', icon: Clock, defaultValue: 3 },
  { key: 'employee_satisfaction', label: 'Employee Satisfaction', labelAr: 'رضا الموظفين', unit: 'percent', icon: BarChart2, defaultValue: 80 },
  { key: 'cost_per_employee', label: 'Cost per Employee', labelAr: 'التكلفة لكل موظف', unit: 'aed', icon: DollarSign, defaultValue: 75000 },
] as const;

const THRESHOLD_DEFINITIONS = [
  { key: 'utilization_rate', label: 'Utilization Rate', minSample: 10, minCoverage: 80 },
  { key: 'satisfaction_score', label: 'Satisfaction Score', minSample: 30, minCoverage: 50 },
  { key: 'sla_compliance', label: 'SLA Compliance', minSample: 5, minCoverage: 90 },
  { key: 'claim_approval_rate', label: 'Claim Approval Rate', minSample: 10, minCoverage: 80 },
];

export default function TargetsPage() {
  const { direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const [editMode, setEditMode] = useState(false);
  
  const { 
    targets, 
    thresholds,
    isLoading, 
    updateTarget,
    updateThreshold,
    isSaving,
  } = useOrgTargets();

  const [localTargets, setLocalTargets] = useState<Record<string, number>>({});
  const [localThresholds, setLocalThresholds] = useState<Record<string, { minSample: number; minCoverage: number }>>({});

  const handleSaveTargets = () => {
    Object.entries(localTargets).forEach(([key, value]) => {
      updateTarget.mutate({ metric_key: key, target_value: value });
    });
    setEditMode(false);
  };

  const getUnitSuffix = (unit: string) => {
    switch (unit) {
      case 'percent': return '%';
      case 'days': return isRTL ? ' يوم' : ' days';
      case 'aed': return ' AED';
      default: return '';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Target className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {isRTL ? 'الأهداف والمعايير' : 'Targets & Benchmarks'}
            </h1>
            <p className="text-muted-foreground">
              {isRTL 
                ? 'تحديد أهداف مؤشرات الأداء الرئيسية وعتبات جودة البيانات'
                : 'Set KPI targets and data quality thresholds'
              }
            </p>
          </div>
        </div>
        
        {!editMode ? (
          <Button onClick={() => setEditMode(true)} variant="outline" className="gap-2">
            {isRTL ? 'تعديل الأهداف' : 'Edit Targets'}
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditMode(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleSaveTargets} disabled={isSaving} className="gap-2">
              <Save className="w-4 h-4" />
              {isRTL ? 'حفظ' : 'Save'}
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="targets">
        <TabsList>
          <TabsTrigger value="targets" className="gap-2">
            <Target className="w-4 h-4" />
            {isRTL ? 'الأهداف' : 'Targets'}
          </TabsTrigger>
          <TabsTrigger value="thresholds" className="gap-2">
            <BarChart2 className="w-4 h-4" />
            {isRTL ? 'عتبات البيانات' : 'Data Thresholds'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="targets" className="mt-6">
          {/* KPI Targets */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {isRTL ? 'أهداف مؤشرات الأداء الرئيسية' : 'KPI Targets'}
              </CardTitle>
              <CardDescription>
                {isRTL 
                  ? 'تحديد الأهداف السنوية لمقاييس الأداء الرئيسية'
                  : 'Set annual targets for key performance metrics'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {TARGET_DEFINITIONS.map((def) => {
                    const Icon = def.icon;
                    const savedTarget = targets?.find(t => t.metric_key === def.key);
                    const currentValue = localTargets[def.key] ?? savedTarget?.target_value ?? def.defaultValue;
                    
                    return (
                      <Card key={def.key} className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Icon className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {isRTL ? def.labelAr : def.label}
                              </p>
                              <Badge variant="secondary" className="text-xs">
                                {getUnitSuffix(def.unit)}
                              </Badge>
                            </div>
                          </div>
                          
                          {editMode ? (
                            <Input
                              type="number"
                              value={currentValue}
                              onChange={(e) => setLocalTargets(prev => ({
                                ...prev,
                                [def.key]: parseFloat(e.target.value) || 0,
                              }))}
                              className="mt-2"
                            />
                          ) : (
                            <p className="text-2xl font-semibold">
                              {currentValue.toLocaleString()}{getUnitSuffix(def.unit)}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="thresholds" className="mt-6">
          {/* Data Thresholds */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {isRTL ? 'عتبات جودة البيانات' : 'Data Quality Thresholds'}
              </CardTitle>
              <CardDescription>
                {isRTL 
                  ? 'تحديد الحد الأدنى من العينات والتغطية لتقارير موثوقة'
                  : 'Set minimum sample sizes and coverage for reliable reporting'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {THRESHOLD_DEFINITIONS.map((def) => {
                  const savedThreshold = thresholds?.find(t => t.metric_key === def.key);
                  
                  return (
                    <div key={def.key} className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
                      <div className="flex-1">
                        <p className="font-medium">{def.label}</p>
                        <p className="text-sm text-muted-foreground">
                          {isRTL 
                            ? `الحد الأدنى للعينة: ${savedThreshold?.min_sample_size || def.minSample}`
                            : `Min sample: ${savedThreshold?.min_sample_size || def.minSample}`
                          }
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {isRTL ? 'تغطية' : 'Coverage'}
                        </p>
                        <p className="font-semibold">
                          {savedThreshold?.min_coverage_percent || def.minCoverage}%
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
