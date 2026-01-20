import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Clock,
  Database,
  ArrowRight,
  RefreshCw,
  FileWarning,
  Link2,
  AlertCircle,
  Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { DataCoverageMetrics } from './DataConfidenceBadge';

interface ConfidenceDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  metrics: DataCoverageMetrics;
  threshold?: number;
}

interface StaleSource {
  name: string;
  lastSync: Date;
  status: 'stale' | 'warning' | 'fresh';
}

// Mock stale sources data
const getStaleSourcesData = (): StaleSource[] => [
  { name: 'HRIS (Oracle HCM)', lastSync: new Date(Date.now() - 1000 * 60 * 60 * 4), status: 'fresh' },
  { name: 'Payroll System', lastSync: new Date(Date.now() - 1000 * 60 * 60 * 26), status: 'warning' },
  { name: 'Benefits Platform', lastSync: new Date(Date.now() - 1000 * 60 * 60 * 72), status: 'stale' },
  { name: 'Claims Portal', lastSync: new Date(Date.now() - 1000 * 60 * 60 * 2), status: 'fresh' },
];

export function ConfidenceDetailsDrawer({
  open,
  onOpenChange,
  metrics,
  threshold = 70,
}: ConfidenceDetailsDrawerProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const staleSources = getStaleSourcesData();

  // Calculate overall coverage
  const overallCoverage = Math.round(
    (metrics.employeeCoverage + 
     metrics.entitlementCoverage + 
     metrics.policyCoverage + 
     metrics.claimsCoverage) / 4
  );

  const isHighConfidence = overallCoverage >= 85;
  const isMediumConfidence = overallCoverage >= threshold && overallCoverage < 85;
  const isLowConfidence = overallCoverage < threshold;

  const getConfidenceConfig = () => {
    if (isHighConfidence) return { 
      label: t('Measured', 'قياس فعلي'),
      status: t('High Confidence', 'ثقة عالية'),
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-500/10',
      icon: ShieldCheck,
    };
    if (isMediumConfidence) return { 
      label: t('Estimated', 'تقديري'),
      status: t('Medium Confidence', 'ثقة متوسطة'),
      color: 'text-amber-600',
      bgColor: 'bg-amber-500/10',
      icon: ShieldAlert,
    };
    return { 
      label: t('Proxy', 'مُستَدَل'),
      status: t('Low Confidence', 'ثقة منخفضة'),
      color: 'text-red-600',
      bgColor: 'bg-red-500/10',
      icon: AlertTriangle,
    };
  };

  const confidence = getConfidenceConfig();
  const ConfidenceIcon = confidence.icon;

  const formatLastSync = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return t('Just now', 'الآن');
    if (diffHours < 24) return t(`${diffHours}h ago`, `منذ ${diffHours} ساعة`);
    return t(`${diffDays}d ago`, `منذ ${diffDays} يوم`);
  };

  const getSourceStatusColor = (status: StaleSource['status']) => {
    switch (status) {
      case 'fresh': return 'text-emerald-600';
      case 'warning': return 'text-amber-600';
      case 'stale': return 'text-red-600';
    }
  };

  const getSourceStatusIcon = (status: StaleSource['status']) => {
    switch (status) {
      case 'fresh': return CheckCircle2;
      case 'warning': return Clock;
      case 'stale': return AlertCircle;
    }
  };

  // Recommended next steps based on metrics
  const getRecommendedSteps = () => {
    const steps: { title: string; description: string; action: string; link: string; priority: 'high' | 'medium' | 'low' }[] = [];
    
    if (metrics.employeeCoverage < threshold) {
      steps.push({
        title: t('Complete Employee Profiles', 'إكمال ملفات الموظفين'),
        description: t('Import missing employee data to improve analytics accuracy', 'استيراد بيانات الموظفين المفقودة لتحسين دقة التحليلات'),
        action: t('Import Roster', 'استيراد القائمة'),
        link: '/employer/integrations?tab=import&type=roster',
        priority: 'high',
      });
    }
    
    if (metrics.entitlementCoverage < threshold) {
      steps.push({
        title: t('Map Benefit Entitlements', 'تعيين استحقاقات المزايا'),
        description: t('Connect employee grades to benefit entitlements', 'ربط درجات الموظفين باستحقاقات المزايا'),
        action: t('Configure Mapping', 'تكوين التعيين'),
        link: '/employer/integrations?tab=mapping',
        priority: 'high',
      });
    }
    
    if (metrics.policyCoverage < threshold) {
      steps.push({
        title: t('Upload Policy Documents', 'تحميل وثائق السياسات'),
        description: t('Add policy versions for complete compliance tracking', 'إضافة إصدارات السياسات لتتبع الامتثال الكامل'),
        action: t('Manage Policies', 'إدارة السياسات'),
        link: '/employer/policies',
        priority: 'medium',
      });
    }
    
    const staleCount = staleSources.filter(s => s.status === 'stale').length;
    if (staleCount > 0) {
      steps.push({
        title: t('Refresh Stale Connections', 'تحديث الاتصالات القديمة'),
        description: t(`${staleCount} data source(s) haven't synced in over 48 hours`, `${staleCount} مصدر(مصادر) بيانات لم تتم مزامنتها منذ أكثر من 48 ساعة`),
        action: t('View Integrations', 'عرض التكاملات'),
        link: '/employer/integrations',
        priority: 'medium',
      });
    }

    return steps;
  };

  const recommendedSteps = getRecommendedSteps();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={cn("sm:max-w-lg overflow-y-auto", isRTL && "text-right")}>
        <SheetHeader>
          <SheetTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <ConfidenceIcon className={cn("h-5 w-5", confidence.color)} />
            {t('Data Confidence Details', 'تفاصيل ثقة البيانات')}
          </SheetTitle>
          <SheetDescription>
            {t(
              'Based on data completeness, freshness, and mapping coverage.',
              'بناءً على اكتمال البيانات وحداثتها وتغطية التعيين.'
            )}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Overall Score */}
          <div className={cn("p-4 rounded-lg border", confidence.bgColor)}>
            <div className={cn("flex items-center justify-between mb-3", isRTL && "flex-row-reverse")}>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t('Overall Confidence', 'الثقة الإجمالية')}
                </p>
                <div className={cn("flex items-center gap-2 mt-1", isRTL && "flex-row-reverse")}>
                  <span className={cn("text-3xl font-bold", confidence.color)}>
                    {overallCoverage}%
                  </span>
                  <Badge variant="outline" className={cn("text-xs", confidence.color)}>
                    {confidence.status}
                  </Badge>
                </div>
              </div>
              <ConfidenceIcon className={cn("h-12 w-12 opacity-20", confidence.color)} />
            </div>
            <Progress value={overallCoverage} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {t(
                'Metrics with ≥85% coverage are measured. 70-84% are estimated. Below 70% are proxy values.',
                'المقاييس بتغطية ≥85% مقاسة. 70-84% تقديرية. أقل من 70% قيم مستدلة.'
              )}
            </p>
          </div>

          {/* Coverage Breakdown */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              {t('Coverage Breakdown', 'تفصيل التغطية')}
            </h4>
            <div className="space-y-3">
              {[
                { label: t('Employee Profiles', 'ملفات الموظفين'), value: metrics.employeeCoverage },
                { label: t('Benefit Entitlements', 'استحقاقات المزايا'), value: metrics.entitlementCoverage },
                { label: t('Policy Documents', 'وثائق السياسات'), value: metrics.policyCoverage },
                { label: t('Claims Data', 'بيانات المطالبات'), value: metrics.claimsCoverage },
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className={cn("flex items-center justify-between text-sm", isRTL && "flex-row-reverse")}>
                    <span className="text-muted-foreground">{item.label}</span>
                    <div className={cn("flex items-center gap-1.5", isRTL && "flex-row-reverse")}>
                      <span className={cn(
                        "font-medium",
                        item.value >= 85 ? "text-emerald-600" :
                        item.value >= threshold ? "text-amber-600" : "text-red-600"
                      )}>
                        {item.value}%
                      </span>
                      {item.value >= threshold ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  <Progress 
                    value={item.value} 
                    className={cn(
                      "h-1.5",
                      item.value >= 85 ? "[&>div]:bg-emerald-500" :
                      item.value >= threshold ? "[&>div]:bg-amber-500" : "[&>div]:bg-red-500"
                    )} 
                  />
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Missing Fields */}
          {metrics.missingFields && metrics.missingFields.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-red-600">
                <FileWarning className="h-4 w-4" />
                {t('Missing Fields', 'الحقول المفقودة')}
              </h4>
              <div className="flex flex-wrap gap-2">
                {metrics.missingFields.map((field, idx) => (
                  <Badge key={idx} variant="outline" className="bg-red-500/5 text-red-600 border-red-500/20">
                    {field}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Estimated Fields */}
          {metrics.estimatedFields && metrics.estimatedFields.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-amber-600">
                <ShieldAlert className="h-4 w-4" />
                {t('Estimated Values', 'القيم التقديرية')}
              </h4>
              <div className="flex flex-wrap gap-2">
                {metrics.estimatedFields.map((field, idx) => (
                  <Badge key={idx} variant="outline" className="bg-amber-500/5 text-amber-600 border-amber-500/20">
                    {field}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Data Sources & Sync Status */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Link2 className="h-4 w-4 text-muted-foreground" />
              {t('Data Sources', 'مصادر البيانات')}
            </h4>
            <div className="space-y-2">
              {staleSources.map((source, idx) => {
                const StatusIcon = getSourceStatusIcon(source.status);
                return (
                  <div 
                    key={idx} 
                    className={cn(
                      "flex items-center justify-between p-2 rounded-lg bg-muted/30",
                      isRTL && "flex-row-reverse"
                    )}
                  >
                    <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                      <StatusIcon className={cn("w-4 h-4", getSourceStatusColor(source.status))} />
                      <span className="text-sm">{source.name}</span>
                    </div>
                    <div className={cn("flex items-center gap-2 text-xs text-muted-foreground", isRTL && "flex-row-reverse")}>
                      <Clock className="w-3 h-3" />
                      {formatLastSync(source.lastSync)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Recommended Next Steps */}
          {recommendedSteps.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                {t('Recommended Next Steps', 'الخطوات التالية الموصى بها')}
              </h4>
              <div className="space-y-3">
                {recommendedSteps.map((step, idx) => (
                  <div 
                    key={idx} 
                    className={cn(
                      "p-3 rounded-lg border",
                      step.priority === 'high' ? "border-red-500/30 bg-red-500/5" :
                      step.priority === 'medium' ? "border-amber-500/30 bg-amber-500/5" :
                      "border-border bg-muted/30"
                    )}
                  >
                    <div className={cn("flex items-start justify-between gap-3", isRTL && "flex-row-reverse")}>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{step.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[10px] shrink-0",
                          step.priority === 'high' ? "text-red-600" : "text-amber-600"
                        )}
                      >
                        {step.priority === 'high' ? t('High', 'عالي') : t('Medium', 'متوسط')}
                      </Badge>
                    </div>
                    <Button 
                      asChild 
                      size="sm" 
                      variant="outline" 
                      className={cn("mt-2 gap-1.5 text-xs w-full", isRTL && "flex-row-reverse")}
                    >
                      <Link to={step.link}>
                        {step.action}
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <SheetFooter className="flex-col sm:flex-row gap-2">
          <Button asChild variant="outline" className="gap-2 flex-1">
            <Link to="/employer/integrations">
              <RefreshCw className="w-4 h-4" />
              {t('Manage Integrations', 'إدارة التكاملات')}
            </Link>
          </Button>
          <Button asChild className="gap-2 flex-1">
            <Link to="/employer/integrations?tab=import">
              <Database className="w-4 h-4" />
              {t('Import Data', 'استيراد البيانات')}
            </Link>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
