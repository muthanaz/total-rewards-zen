import { ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Database, ArrowRight, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { DataCoverageMetrics } from './DataConfidenceBadge';

interface PageConfidenceGateProps {
  children: ReactNode;
  metrics: DataCoverageMetrics;
  threshold?: number;
  pageName?: string;
  className?: string;
  showBannerOnly?: boolean; // If true, always show children but with warning banner
}

export function PageConfidenceGate({
  children,
  metrics,
  threshold = 70,
  pageName,
  className,
  showBannerOnly = true, // Default to showing content with warning
}: PageConfidenceGateProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  // Calculate overall coverage
  const overallCoverage = Math.round(
    (metrics.employeeCoverage + 
     metrics.entitlementCoverage + 
     metrics.policyCoverage + 
     metrics.claimsCoverage) / 4
  );

  const isLowConfidence = overallCoverage < threshold;
  const isCriticallyLow = overallCoverage < 50;

  // Determine what's most lacking
  const getLowCoverageAreas = () => {
    const areas: string[] = [];
    if (metrics.employeeCoverage < threshold) areas.push(t('employee profiles', 'ملفات الموظفين'));
    if (metrics.entitlementCoverage < threshold) areas.push(t('entitlements', 'الاستحقاقات'));
    if (metrics.policyCoverage < threshold) areas.push(t('policies', 'السياسات'));
    if (metrics.claimsCoverage < threshold) areas.push(t('claims data', 'بيانات المطالبات'));
    return areas;
  };

  const lowAreas = getLowCoverageAreas();

  if (!isLowConfidence) {
    return <>{children}</>;
  }

  const WarningBanner = () => (
    <Alert 
      variant="destructive" 
      className={cn(
        "mb-4 border-amber-500/50 bg-amber-500/5",
        isCriticallyLow && "border-red-500/50 bg-red-500/5",
        isRTL && "text-right"
      )}
    >
      <AlertTriangle className={cn(
        "h-4 w-4",
        isCriticallyLow ? "text-red-500" : "text-amber-500"
      )} />
      <AlertTitle className={cn(
        "text-sm font-semibold",
        isCriticallyLow ? "text-red-700 dark:text-red-400" : "text-amber-700 dark:text-amber-400"
      )}>
        {isCriticallyLow 
          ? t('Limited Data Available', 'بيانات محدودة متاحة')
          : t('Insights May Be Incomplete', 'قد تكون الرؤى غير مكتملة')
        }
      </AlertTitle>
      <AlertDescription className="mt-1.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">{overallCoverage}% {t('data coverage', 'تغطية البيانات')}</span>
            {lowAreas.length > 0 && (
              <span className="ml-1">
                — {t('Low coverage in:', 'تغطية منخفضة في:')} {lowAreas.slice(0, 2).join(', ')}
                {lowAreas.length > 2 && ` +${lowAreas.length - 2}`}
              </span>
            )}
          </div>
          <Button 
            asChild 
            size="sm" 
            variant={isCriticallyLow ? "destructive" : "outline"}
            className="gap-1.5 text-xs shrink-0"
          >
            <Link to="/employer/integrations?tab=import">
              <Database className="w-3 h-3" />
              {t('Import Data', 'استيراد البيانات')}
              <ArrowRight className="w-3 h-3" />
            </Link>
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );

  if (showBannerOnly) {
    return (
      <div className={className}>
        <WarningBanner />
        {children}
      </div>
    );
  }

  // Full block mode (rarely used, but available)
  return (
    <div className={cn("space-y-4", className)}>
      <WarningBanner />
      <div className="relative">
        <div className={cn(
          "transition-opacity",
          isCriticallyLow ? "opacity-50 pointer-events-none" : "opacity-75"
        )}>
          {children}
        </div>
        {isCriticallyLow && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[1px] rounded-lg">
            <div className="text-center p-6 max-w-md">
              <Info className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
              <h3 className="font-semibold mb-2">
                {t('More Data Needed', 'مطلوب المزيد من البيانات')}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t(
                  'Import your organization data to unlock full analytics capabilities.',
                  'قم باستيراد بيانات مؤسستك لفتح إمكانيات التحليلات الكاملة.'
                )}
              </p>
              <Button asChild className="gap-2">
                <Link to="/employer/integrations?tab=import">
                  <Database className="w-4 h-4" />
                  {t('Get Started', 'ابدأ الآن')}
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
