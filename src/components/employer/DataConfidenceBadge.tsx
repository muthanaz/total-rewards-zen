import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Clock,
  Database,
  ArrowRight,
  ExternalLink,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { ConfidenceDetailsDrawer } from './ConfidenceDetailsDrawer';

export interface DataCoverageMetrics {
  employeeCoverage: number; // % of employees with complete profiles
  entitlementCoverage: number; // % of employees with entitlements
  policyCoverage: number; // % of policies uploaded
  claimsCoverage: number; // % of claims data available
  lastSyncTime?: Date;
  missingFields?: string[];
  estimatedFields?: string[];
}

interface DataConfidenceBadgeProps {
  metrics: DataCoverageMetrics;
  threshold?: number;
  className?: string;
  showDetails?: boolean;
  showViewDetails?: boolean; // Show "View details" link
}

export function DataConfidenceBadge({
  metrics,
  threshold = 70,
  className,
  showDetails = true,
  showViewDetails = true,
}: DataConfidenceBadgeProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;
  const [drawerOpen, setDrawerOpen] = useState(false);

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

  const getConfidenceLevel = () => {
    if (isHighConfidence) return { 
      label: t('Measured', 'قياس فعلي'), 
      description: t('Based on actual recorded data from integrated systems', 'بناءً على بيانات فعلية من الأنظمة المتكاملة'),
      color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      icon: ShieldCheck 
    };
    if (isMediumConfidence) return { 
      label: t('Estimated', 'تقديري'), 
      description: t('Projected value based on historical patterns', 'قيمة متوقعة بناءً على الأنماط التاريخية'),
      color: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      icon: ShieldAlert 
    };
    return { 
      label: t('Proxy', 'مُستَدَل'), 
      description: t('Derived from related data sources; actual value may vary', 'مشتق من مصادر بيانات ذات صلة؛ قد تختلف القيمة الفعلية'),
      color: 'bg-red-500/10 text-red-600 border-red-500/20',
      icon: AlertTriangle 
    };
  };

  const confidence = getConfidenceLevel();
  const ConfidenceIcon = confidence.icon;

  const formatLastSync = (date?: Date) => {
    if (!date) return t('Never synced', 'لم تتم المزامنة');
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return t('Just now', 'الآن');
    if (diffHours < 24) return t(`${diffHours}h ago`, `منذ ${diffHours} ساعة`);
    return t(`${diffDays}d ago`, `منذ ${diffDays} يوم`);
  };

  const CoverageRow = ({ 
    label, 
    value, 
    threshold: rowThreshold = 70 
  }: { 
    label: string; 
    value: number; 
    threshold?: number;
  }) => (
    <div className={cn("flex items-center justify-between py-1", isRTL && "flex-row-reverse")}>
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className={cn("flex items-center gap-1.5", isRTL && "flex-row-reverse")}>
        <span className={cn(
          "text-xs font-medium",
          value >= 85 ? "text-emerald-600" :
          value >= rowThreshold ? "text-amber-600" : "text-red-600"
        )}>
          {value}%
        </span>
        {value >= rowThreshold ? (
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
        ) : (
          <XCircle className="w-3 h-3 text-red-500" />
        )}
      </div>
    </div>
  );

  return (
    <>
      <TooltipProvider>
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className={cn(
                "gap-1.5 cursor-help transition-colors",
                confidence.color,
                className
              )}
              onClick={(e) => {
                e.preventDefault();
                setDrawerOpen(true);
              }}
            >
              <ConfidenceIcon className="w-3.5 h-3.5" />
              <span className="font-medium">{overallCoverage}%</span>
              {showDetails && (
                <span className="text-[10px] opacity-75">{confidence.label}</span>
              )}
            </Badge>
          </TooltipTrigger>
          <TooltipContent 
            side="bottom" 
            align="end" 
            className="w-80 p-0"
          >
            <div className="p-3 space-y-3">
              {/* Explanation header */}
              <div className={cn("flex items-start gap-2 pb-2 border-b", isRTL && "flex-row-reverse")}>
                <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  {t(
                    'Based on data completeness, freshness, and mapping coverage across your integrated systems.',
                    'بناءً على اكتمال البيانات وحداثتها وتغطية التعيين عبر الأنظمة المتكاملة.'
                  )}
                </p>
              </div>

              <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                <h4 className="font-semibold text-sm">
                  {t('Data Coverage', 'تغطية البيانات')}
                </h4>
                <div className={cn("flex items-center gap-1 text-xs text-muted-foreground", isRTL && "flex-row-reverse")}>
                  <Clock className="w-3 h-3" />
                  {formatLastSync(metrics.lastSyncTime)}
                </div>
              </div>

              <div className="space-y-0.5 border-t pt-2">
                <CoverageRow 
                  label={t('Employee Profiles', 'ملفات الموظفين')} 
                  value={metrics.employeeCoverage} 
                />
                <CoverageRow 
                  label={t('Benefit Entitlements', 'استحقاقات المزايا')} 
                  value={metrics.entitlementCoverage} 
                />
                <CoverageRow 
                  label={t('Policy Documents', 'وثائق السياسات')} 
                  value={metrics.policyCoverage} 
                />
                <CoverageRow 
                  label={t('Claims Data', 'بيانات المطالبات')} 
                  value={metrics.claimsCoverage} 
                />
              </div>

              {metrics.missingFields && metrics.missingFields.length > 0 && (
                <div className="border-t pt-2">
                  <p className="text-xs font-medium text-red-600 mb-1">
                    {t('Missing:', 'مفقود:')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {metrics.missingFields.slice(0, 3).join(', ')}
                    {metrics.missingFields.length > 3 && ` +${metrics.missingFields.length - 3} more`}
                  </p>
                </div>
              )}

              {metrics.estimatedFields && metrics.estimatedFields.length > 0 && (
                <div className="border-t pt-2">
                  <p className="text-xs font-medium text-amber-600 mb-1">
                    {t('Estimated:', 'تقديري:')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {metrics.estimatedFields.slice(0, 3).join(', ')}
                  </p>
                </div>
              )}

              {/* View Details Link */}
              {showViewDetails && (
                <div className="border-t pt-2">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className={cn("w-full gap-1.5 text-xs text-primary hover:text-primary", isRTL && "flex-row-reverse")}
                    onClick={(e) => {
                      e.preventDefault();
                      setDrawerOpen(true);
                    }}
                  >
                    <ExternalLink className="w-3 h-3" />
                    {t('View full details', 'عرض التفاصيل الكاملة')}
                  </Button>
                </div>
              )}

              {isLowConfidence && (
                <Button 
                  asChild 
                  size="sm" 
                  variant="outline" 
                  className={cn("w-full mt-2 gap-1.5 text-xs", isRTL && "flex-row-reverse")}
                >
                  <Link to="/employer/integrations?tab=import">
                    <Database className="w-3 h-3" />
                    {t('Improve Data Coverage', 'تحسين تغطية البيانات')}
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </Button>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Confidence Details Drawer */}
      <ConfidenceDetailsDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        metrics={metrics}
        threshold={threshold}
      />
    </>
  );
}

// Hook to get mock coverage metrics (replace with real data later)
export function useDataCoverageMetrics(): DataCoverageMetrics {
  // This would eventually fetch from Supabase
  // For now, return demo data that varies slightly
  return {
    employeeCoverage: 87,
    entitlementCoverage: 72,
    policyCoverage: 65,
    claimsCoverage: 91,
    lastSyncTime: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    missingFields: ['Grade mapping', 'Department codes', 'Cost centers'],
    estimatedFields: ['Utilization trends', 'Peer benchmarks'],
  };
}
